import {
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaNumberFilter,
  PrismaSearchString,
  PrismaWhereConditions,
  QueryBuilderConfig,
  QueryBuilderParams,
  QueryBuilderResult,
  SortOrder,
} from "./query-builder.interface.js";

export class QueryBuilder<T, TWhereInput, TInclude> {
  private findManyArgs: PrismaFindManyArgs;
  private countArgs: PrismaCountArgs;

  constructor(
    private readonly model: PrismaModelDelegate<T>,
    private readonly queryParams: QueryBuilderParams,
    private readonly config: QueryBuilderConfig,
  ) {
    const applySoftDelete = this.config.softDelete !== false;

    this.findManyArgs = applySoftDelete ? { where: { deletedAt: null } } : {};
    this.countArgs = applySoftDelete ? { where: { deletedAt: null } } : {};
  }

  pagination(): this {
    this.findManyArgs.skip = this.skip;
    this.findManyArgs.take = this.limit;

    return this;
  }

  sort(): this {
    if (this.sortBy.includes(".")) {
      const fieldParts = this.sortBy.split(".").map((field) => field.trim());

      if (fieldParts.length === 2) {
        const [parentField, nestedField] = fieldParts;

        this.findManyArgs.orderBy = {
          [parentField]: {
            [nestedField]: this.sortOrder,
          },
        };

        return this;
      } else if (fieldParts.length === 3) {
        const [parentField, nestedField1, nestedField2] = fieldParts;

        this.findManyArgs.orderBy = {
          [parentField]: {
            [nestedField1]: {
              [nestedField2]: this.sortOrder,
            },
          },
        };

        return this;
      }
    }

    this.findManyArgs.orderBy = {
      [this.sortBy]: this.sortOrder,
    };

    return this;
  }

  where(conditions: TWhereInput): this {
    this.findManyArgs.where = this._mergeWhere(
      this.findManyArgs.where as PrismaWhereConditions,
      conditions as Record<string, unknown>,
    );

    this.countArgs.where = this._mergeWhere(
      this.countArgs.where as PrismaWhereConditions,
      conditions as Record<string, unknown>,
    );

    return this;
  }

  search(): this {
    const { searchableFields } = this.config;

    if (this.searchTerm && searchableFields.length > 0) {
      const searchString: PrismaSearchString = {
        contains: this.searchTerm,
        mode: "insensitive",
      };

      const searchConditions: Record<string, unknown>[] = searchableFields.map(
        (key) => {
          if (key.includes(".")) {
            const fieldParts = key.split(".").map((field) => field.trim());

            if (fieldParts.length === 2) {
              const [parentField, nestedField] = fieldParts;

              return {
                [parentField]: {
                  [nestedField]: searchString,
                },
              };
            } else if (fieldParts.length === 3) {
              const [parentField, nestedField1, nestedField2] = fieldParts;

              return {
                [parentField]: {
                  some: {
                    [nestedField1]: {
                      [nestedField2]: searchString,
                    },
                  },
                },
              };
            }
          }

          return {
            [key]: searchString,
          };
        },
      );

      this.findManyArgs.where = {
        ...this.findManyArgs.where,
        OR: searchConditions,
      };
      this.countArgs.where = {
        ...this.countArgs.where,
        OR: searchConditions,
      };
    }

    return this;
  }

  filter(): this {
    const { filterableFields } = this.config;
    const excludedFields = [
      "page",
      "limit",
      "searchTerm",
      "sortBy",
      "sortOrder",
      "selectFields",
      "includeFields",
    ];

    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedFields.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });

    Object.keys(filterParams).forEach((field) => {
      const value = filterParams[field];

      if (!value) {
        return;
      }

      if (!filterableFields.includes(field)) {
        return;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        this.findManyArgs.where = {
          ...this.findManyArgs.where,
          [field]: this._parseRangeFilter(
            value as Record<string, string | number>,
            field,
          ),
        };

        this.countArgs.where = {
          ...this.countArgs.where,
          [field]: this._parseRangeFilter(
            value as Record<string, string | number>,
            field,
          ),
        };

        return;
      }

      if (field.includes(".")) {
        const fieldParts = field.split(".").map((part) => part.trim());

        if (fieldParts.length === 2) {
          const [parentField, nestedField] = fieldParts;

          this.findManyArgs.where = {
            ...this.findManyArgs.where,
            [parentField]: {
              some: { [nestedField]: this._parseFilterValue(value, field) },
            },
          };

          this.countArgs.where = {
            ...this.countArgs.where,
            [parentField]: {
              some: { [nestedField]: this._parseFilterValue(value, field) },
            },
          };

          return;
        } else if (fieldParts.length === 3) {
          const [parentField, nestedField1, nestedField2] = fieldParts;

          this.findManyArgs.where = {
            ...this.findManyArgs.where,
            [parentField]: {
              some: {
                [nestedField1]: {
                  [nestedField2]: this._parseFilterValue(value, field),
                },
              },
            },
          };

          this.countArgs.where = {
            ...this.countArgs.where,
            [parentField]: {
              some: {
                [nestedField1]: {
                  [nestedField2]: this._parseFilterValue(value, field),
                },
              },
            },
          };

          return;
        }
      }

      this.findManyArgs.where = {
        ...this.findManyArgs.where,
        [field]: this._parseFilterValue(value, field),
      };

      this.countArgs.where = {
        ...this.countArgs.where,
        [field]: this._parseFilterValue(value, field),
      };
    });

    return this;
  }

  select(): this {
    const { selectFields } = this.queryParams;
    const { selectableFields } = this.config;
    const fieldsArray = selectFields?.split(",").map((field) => field.trim());

    if (fieldsArray?.length) {
      delete this.queryParams.includeFields;
    }

    fieldsArray?.forEach((field) => {
      if (selectableFields && !selectableFields.includes(field)) {
        return;
      }

      if (field.includes(".")) {
        const fieldParts = field.split(".").map((f) => f.trim());

        if (fieldParts.length === 2) {
          const [parentField, nestedField] = fieldParts;
          this.findManyArgs.select = {
            ...this.findManyArgs.select,
            [parentField]: {
              select: {
                ...(this.findManyArgs.select?.[parentField] as any)?.select,
                [nestedField]: true,
              },
            },
          };
          return;
        } else if (fieldParts.length === 3) {
          const [parentField, nestedField1, nestedField2] = fieldParts;
          this.findManyArgs.select = {
            ...this.findManyArgs.select,
            [parentField]: {
              select: {
                ...(this.findManyArgs.select?.[parentField] as any)?.select,
                [nestedField1]: { select: { [nestedField2]: true } },
              },
            },
          };
          return;
        }
      }

      this.findManyArgs.select = {
        ...this.findManyArgs.select,
        [field]: true,
      };
    });

    if (this.findManyArgs.select) {
      this.findManyArgs.select = {
        ...this.findManyArgs.select,
        id: true,
      };
    }

    return this;
  }

  include(relations: TInclude): this {
    if (this.queryParams.selectFields) {
      return this;
    }

    this.findManyArgs.include = {
      ...this.findManyArgs.include,
      ...relations,
    };

    const { includableFields } = this.config;
    const { includeFields } = this.queryParams;
    const includesArray = includeFields
      ?.split(",")
      .map((include) => include.trim());

    includesArray?.forEach((include) => {
      if (!includableFields.includes(include)) {
        return;
      }

      this.findManyArgs.include = {
        ...this.findManyArgs.include,
        [include]: true,
      };
    });

    return this;
  }

  async execute(): Promise<QueryBuilderResult<T>> {
    const [data, total] = await Promise.all([
      this.model.findMany(this.findManyArgs as PrismaFindManyArgs),
      this.model.count(this.countArgs as PrismaCountArgs),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / this.limit);

    return {
      data,
      meta: {
        currentPage: this.page,
        limit: this.limit,
        total,
        totalPages,
      },
    };
  }

  private get page(): number {
    return Math.max(1, Number(this.queryParams.page) || 1);
  }

  private get limit(): number {
    const MAX_LIMIT = 100;
    const requested = Math.max(1, Number(this.queryParams.limit) || 10);

    return Math.min(requested, MAX_LIMIT);
  }

  private get skip(): number {
    return (this.page - 1) * this.limit;
  }

  private get sortBy(): string {
    const requested = this.queryParams.sortBy?.trim();

    if (requested && this.config.sortableFields.includes(requested)) {
      return requested;
    }

    return "createdAt";
  }

  private get sortOrder(): SortOrder {
    const order = this.queryParams.sortOrder?.trim();
    return order === "asc" ? "asc" : "desc";
  }

  private get searchTerm(): string | undefined {
    return this.queryParams.searchTerm?.trim();
  }

  private _mergeWhere(
    target: PrismaWhereConditions,
    source: Record<string, unknown>,
  ): PrismaWhereConditions {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (
          result[key] &&
          typeof result[key] === "object" &&
          !Array.isArray(result[key])
        ) {
          result[key] = this._mergeWhere(
            result[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>,
          );
          continue;
        }
      }

      result[key] = source[key];
    }

    return result;
  }

  private _parseRangeFilter(
    value: Record<string, string | number>,
    field?: string,
  ): PrismaNumberFilter | PrismaSearchString {
    const isNumericField = field && this.config.numericFields?.includes(field);
    const rangeQuery: Record<string, unknown> = {};

    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];

      const parsedValue: number | string =
        isNumericField &&
        typeof operatorValue === "string" &&
        !isNaN(Number(operatorValue))
          ? Number(operatorValue)
          : operatorValue;

      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
          rangeQuery[operator] = parsedValue;
          break;

        default:
          break;
      }
    });

    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }

  private _parseFilterValue(value: unknown, field?: string): unknown {
    if (value === "true") return true;
    if (value === "false") return false;

    const isNumericField = field && this.config.numericFields?.includes(field);

    if (
      isNumericField &&
      typeof value === "string" &&
      value !== "" &&
      !isNaN(Number(value))
    ) {
      return Number(value);
    }

    if (Array.isArray(value)) {
      return {
        in: value.map((item) => this._parseFilterValue(item, field)),
      };
    }

    return value;
  }
}
