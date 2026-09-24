import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Order } from "@prisma/client";
import { CreateOrder } from "./order.interface.js";
import { randomBytes } from "crypto";

const generateOrderNumber = (): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `SHOPCO-${datePart}-${randomPart}`;
};

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

  // Validate every item BEFORE touching the database — fail the whole
  // checkout if anything is unavailable, rather than partially processing.
  for (const item of cartItems) {
    const { variant } = item;

    if (
      variant.deletedAt ||
      variant.product.deletedAt ||
      variant.product.status !== "ACTIVE"
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
    // Decrement stock with optimistic locking — if another checkout beat
    // us to it between the pre-check above and now, this throws, and the
    // whole transaction rolls back automatically.
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

export const orderService = {
  addOrder,
};
