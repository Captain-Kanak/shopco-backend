export interface CreateCategory {
  name: string;
  parentId?: string;
  description?: string;
}

export interface UpdateCategory {
  name?: string;
  parentId?: string;
  description?: string;
}
