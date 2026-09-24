const searchableFields: string[] = ["orderNumber", "recipientName", "phone"];

const filterableFields: string[] = ["orderStatus", "paymentStatus", "userId"];

const selectableFields: string[] = [
  "id",
  "orderNumber",
  "recipientName",
  "shippingCity",
  "shippingDistrict",
  "phone",
  "totalAmount",
  "discountAmount",
  "shippingCost",
  "orderStatus",
  "paymentStatus",
  "paidAt",
  "shippedAt",
  "deliveredAt",
  "cancelledAt",
  "createdAt",
  "updatedAt",
];

const includableFields: string[] = ["orderItems", "payment", "user"];

const sortableFields: string[] = ["createdAt", "totalAmount", "orderStatus"];

const numericFields: string[] = [
  "totalAmount",
  "discountAmount",
  "shippingCost",
];

export const orderConstant = {
  searchableFields,
  filterableFields,
  selectableFields,
  includableFields,
  sortableFields,
  numericFields,
};
