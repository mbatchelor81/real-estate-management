export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  total?: number;
}
