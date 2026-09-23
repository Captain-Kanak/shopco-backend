import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Cart } from "@prisma/client";
import { AddToCart, UpdateCartQuantity } from "./cart.interface.js";

const addToCart = async (userId: string, payload: AddToCart): Promise<Cart> => {
  const { variantId, quantity = 1 } = payload;

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, deletedAt: null },
    include: { product: { select: { status: true, deletedAt: true } } },
  });

  if (
    !variant ||
    variant.product.deletedAt ||
    variant.product.status !== "ACTIVE"
  ) {
    throw new AppError("Product variant not found", status.NOT_FOUND);
  }

  if (variant.stock < quantity) {
    throw new AppError(
      `Only ${variant.stock} unit(s) available for this item`,
      status.CONFLICT,
    );
  }

  const existing = await prisma.cart.findUnique({
    where: { userId_variantId: { userId, variantId } },
  });

  if (existing) {
    const newQuantity = existing.quantity + quantity;

    if (variant.stock < newQuantity) {
      throw new AppError(
        `Only ${variant.stock} unit(s) available — you already have ${existing.quantity} in your cart`,
        status.CONFLICT,
      );
    }

    return prisma.cart.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  }

  return prisma.cart.create({
    data: { userId, variantId, quantity },
  });
};

const getCarts = async (userId: string) => {
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: {
      variant: {
        include: {
          attributes: true,
          images: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              deletedAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Surface stale cart entries explicitly rather than silently hiding or
  // deleting them — the customer should see "this item is no longer
  // available" at checkout time, not have it vanish without explanation.
  return carts.map((cart) => ({
    ...cart,
    isAvailable:
      !cart.variant.deletedAt &&
      !cart.variant.product.deletedAt &&
      cart.variant.product.status === "ACTIVE" &&
      cart.variant.stock >= cart.quantity,
  }));
};

const updateCartQuantity = async (
  userId: string,
  cartId: string,
  payload: UpdateCartQuantity,
): Promise<Cart> => {
  const cart = await prisma.cart.findFirst({
    where: { id: cartId, userId },
    include: { variant: true },
  });

  if (!cart) {
    throw new AppError("Cart item not found", status.NOT_FOUND);
  }

  if (cart.variant.stock < payload.quantity) {
    throw new AppError(
      `Only ${cart.variant.stock} unit(s) available for this item`,
      status.CONFLICT,
    );
  }

  return prisma.cart.update({
    where: { id: cartId },
    data: { quantity: payload.quantity },
  });
};

const removeFromCart = async (
  userId: string,
  cartId: string,
): Promise<Cart> => {
  const cart = await prisma.cart.findFirst({ where: { id: cartId, userId } });

  if (!cart) {
    throw new AppError("Cart item not found", status.NOT_FOUND);
  }

  return prisma.cart.delete({ where: { id: cartId } });
};

export const cartService = {
  addToCart,
  getCarts,
  updateCartQuantity,
  removeFromCart,
};
