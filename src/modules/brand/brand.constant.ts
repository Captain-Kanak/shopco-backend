const searchableFields: string[] = ["name"];

const filterableFields: string[] = [];

const selectableFields: string[] = [
  "id",
  "name",
  "slug",
  "logo",
  "description",
  "createdAt",
  "updatedAt",
];

const includableFields: string[] = ["products"];

const sortableFields: string[] = ["name", "createdAt", "updatedAt"];

export const brandConstant = {
  searchableFields,
  filterableFields,
  selectableFields,
  includableFields,
  sortableFields,
};
