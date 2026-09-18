const searchableFields: string[] = ["title", "description"];

const filterableFields: string[] = ["status", "brandId"];

const selectableFields: string[] = [
  "id",
  "title",
  "slug",
  "description",
  "discountPercentage",
  "status",
  "brandId",
  "createdAt",
  "updatedAt",
];

const includableFields: string[] = [
  "brand",
  "productCategories",
  "variants",
  "images",
];

const sortableFields: string[] = ["title", "createdAt", "updatedAt"];

const numericFields: string[] = ["discountPercentage"];

export const productConstant = {
  searchableFields,
  filterableFields,
  selectableFields,
  includableFields,
  sortableFields,
  numericFields,
};
