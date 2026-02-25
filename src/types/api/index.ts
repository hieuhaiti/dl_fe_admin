export interface ApiResponse<T = any> {
  message: string;
  status: number;
  data?: T;
  errors?: string[];
  options?: Record<string, any>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
