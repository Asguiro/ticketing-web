export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
  path?: string;
  timestamp?: string;
  errors?: ApiFieldError[];
};
