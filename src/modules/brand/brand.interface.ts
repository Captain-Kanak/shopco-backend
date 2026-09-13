export interface CreateBrand {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface UpdateBrand {
  name?: string;
  slug?: string;
  logo?: string;
  description?: string;
}
