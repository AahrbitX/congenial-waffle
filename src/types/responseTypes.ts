export interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}
