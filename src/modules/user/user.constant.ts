const searchableFields: string[] = ["name", "email", "phone"];

const filterableFields: string[] = ["role", "status", "emailVerified"];

const selectableFields: string[] = [
  "id",
  "name",
  "email",
  "emailVerified",
  "image",
  "phone",
  "address",
  "dateOfBirth",
  "role",
  "status",
  "createdAt",
  "updatedAt",
  "deletedAt",
];

const includableFields: string[] = ["carts", "orders", "payments"];

const sortableFields: string[] = ["name", "email", "createdAt", "updatedAt"];

export const userConstant = {
  searchableFields,
  filterableFields,
  selectableFields,
  includableFields,
  sortableFields,
};
