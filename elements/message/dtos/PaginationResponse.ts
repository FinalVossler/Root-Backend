type PaginationResponse<T> = {
  data: T[];
  total: number;
};

export default PaginationResponse;
