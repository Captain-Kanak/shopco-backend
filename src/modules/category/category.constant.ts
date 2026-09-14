const searchableFields: string[] = ["name", "slug"];

const filterableFields: string[] = ["parentId"];

const selectableFields: string[] = [
  "id",
  "name",
  "slug",
  "description",
  "parentId",
  "createdAt",
  "updatedAt",
];

const includableFields: string[] = ["parent", "children", "productCategories"];

const sortableFields: string[] = ["name", "createdAt", "updatedAt"];

export const categoryConstant = {
  searchableFields,
  filterableFields,
  selectableFields,
  includableFields,
  sortableFields,
};
