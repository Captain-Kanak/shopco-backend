export type SortOrder = "asc" | "desc";

export type SearchStringMode = "insensitive" | "default";

export interface PrismaFindManyArgs {
  skip?: number;
  take?: number;
  where?: PrismaWhereConditions;
  orderBy?: Record<string, SortOrder | unknown>;
  select?: Record<string, boolean | unknown>;
  include?: Record<string, boolean | unknown>;
  [key: string]: string | unknown;
}

export interface PrismaCountArgs {
  where?: PrismaWhereConditions;
  [key: string]: string | unknown;
}

export interface PrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: string | unknown;
}

export interface PrismaModelDelegate<T> {
  findMany(args?: PrismaFindManyArgs): Promise<T[]>;
  count(args?: PrismaCountArgs): Promise<number>;
}

export interface PrismaSearchString {
  contains?: string;
  mode?: SearchStringMode;
  startsWith?: string;
  endsWith?: string;
  not?: string | PrismaSearchString;
  in?: string[];
  notIn?: string[];
}

export interface PrismaNumberFilter {
  equals?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  not?: number | PrismaNumberFilter;
  in?: number[];
  notIn?: number[];
}

export interface QueryBuilderParams {
  page?: string;
  limit?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  selectFields?: string;
  includeFields?: string;
  [key: string]: string | unknown;
}

export interface QueryBuilderConfig {
  searchableFields: string[];
  filterableFields: string[];
  selectableFields: string[];
  includableFields: string[];
  sortableFields: string[];
  numericFields?: string[];
}

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryBuilderResult<T> {
  data: T[];
  meta: PaginationMeta;
}
