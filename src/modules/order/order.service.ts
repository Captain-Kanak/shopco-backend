import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@prisma/client";
import { CancelOrder, CreateOrder } from "./order.interface.js";
import { orderConstant } from "./order.constant.js";
import { QueryBuilderParams } from "../../query-builder/query-builder.interface.js";
import { QueryBuilder } from "../../query-builder/query-builder.js";
import { generateOrderNumber } from "../../utils/generate-order-number.js";

const addOrder = async (
  userId: string,
  payload: CreateOrder,
): Promise<Order> => {
  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
      variant: {
        include: { attributes: true, product: true },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new AppError("Your cart is empty", status.BAD_REQUEST);
  }

  for (const item of cartItems) {
    const { variant } = item;

    if (
      variant.deletedAt ||
      variant.product.deletedAt ||
      variant.product.status !== ProductStatus.ACTIVE
    ) {
      throw new AppError(
        `"${variant.product.title}" is no longer available and must be removed from your cart`,
        status.CONFLICT,
      );
    }

    if (variant.stock < item.quantity) {
      throw new AppError(
        `Only ${variant.stock} unit(s) of "${variant.product.title}" available — please update your cart`,
        status.CONFLICT,
      );
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );

  const orderNumber = generateOrderNumber();

  return prisma.$transaction(async (tx) => {
    for (const item of cartItems) {
      const result = await tx.productVariant.updateMany({
        where: { id: item.variantId, version: item.variant.version },
        data: {
          stock: { decrement: item.quantity },
          version: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new AppError(
          `"${item.variant.product.title}" was just updated by someone else — please try checking out again`,
          status.CONFLICT,
        );
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        recipientName: payload.recipientName,
        shippingAddressLine: payload.shippingAddressLine,
        shippingCity: payload.shippingCity,
        shippingDistrict: payload.shippingDistrict,
        shippingPostalCode: payload.shippingPostalCode,
        phone: payload.phone,
        totalAmount,
        userId,
        orderItems: {
          create: cartItems.map((item) => ({
            sku: item.variant.sku,
            productTitle: item.variant.product.title,
            unitPrice: item.variant.price,
            discountPercentage: item.variant.product.discountPercentage,
            quantity: item.quantity,
            variantId: item.variantId,
            orderItemAttributes: {
              create: item.variant.attributes.map((attr) => ({
                name: attr.name,
                value: attr.value,
              })),
            },
          })),
        },
      },
      include: { orderItems: { include: { orderItemAttributes: true } } },
    });

    await tx.cart.deleteMany({
      where: { id: { in: cartItems.map((item) => item.id) } },
    });

    return order;
  });
};

const getOrders = async (
  query: QueryBuilderParams,
  userId: string,
  isAdmin: boolean,
) => {
  const queryBuilder = new QueryBuilder<
    Order,
    Prisma.OrderWhereInput,
    Prisma.OrderInclude
  >(prisma.order, query, {
    searchableFields: orderConstant.searchableFields,
    filterableFields: isAdmin
      ? orderConstant.filterableFields
      : orderConstant.filterableFields.filter((f) => f !== "userId"),
    selectableFields: orderConstant.selectableFields,
    includableFields: orderConstant.includableFields,
    sortableFields: orderConstant.sortableFields,
    numericFields: orderConstant.numericFields,
  });

  const forcedWhere = isAdmin ? {} : { userId };

  return queryBuilder
    .pagination()
    .sort()
    .where(forcedWhere)
    .search()
    .filter()
    .select()
    .include({})
    .execute();
};

const getOrderById = async (
  orderId: string,
  userId: string,
  isAdmin: boolean,
): Promise<Order> => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deletedAt: null,
      ...(!isAdmin && { userId }),
    },
    include: {
      orderItems: { include: { orderItemAttributes: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  return order;
};

const cancelOrder = async (
  orderId: string,
  userId: string,
  payload: CancelOrder,
): Promise<Order> => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, deletedAt: null },
    include: { orderItems: true },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new AppError("Only pending orders can be cancelled", status.CONFLICT);
  }

  return prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity },
            version: { increment: 1 },
          },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: payload.cancelReason,
      },
    });
  });
};

const updateOrderStatus = async (
  orderId: string,
  payload: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order> => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
    include: { orderItems: true },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  const timestampUpdates: Record<string, Date> = {};

  if (payload.orderStatus === OrderStatus.SHIPPED && !order.shippedAt) {
    timestampUpdates.shippedAt = new Date();
  }

  if (payload.orderStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
    timestampUpdates.deliveredAt = new Date();
  }

  if (payload.paymentStatus === PaymentStatus.PAID && !order.paidAt) {
    timestampUpdates.paidAt = new Date();
  }

  if (
    payload.orderStatus === OrderStatus.CANCELLED &&
    order.orderStatus !== OrderStatus.CANCELLED
  ) {
    return prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
              version: { increment: 1 },
            },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          ...payload,
          ...timestampUpdates,
          cancelledAt: new Date(),
          cancelReason: "Cancelled by admin",
        },
      });
    });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { ...payload, ...timestampUpdates },
  });
};

const deleteOrderById = async (orderId: string): Promise<Order> => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { deletedAt: new Date() },
  });
};

export const orderService = {
  addOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  deleteOrderById,
};
