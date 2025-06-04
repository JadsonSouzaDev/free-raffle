export type PaginationRequest = {
  page: number;
  limit: number;
}

export type PaginationResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const DEFAULT_PAGINATION: PaginationRequest = {
  page: 1,
  limit: 5,
}