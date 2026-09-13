export interface CreateBrand {
  name: string;
  logo?: string;
  description?: string;
}

export interface UpdateBrand {
  name?: string;
  logo?: string;
  description?: string;
}
