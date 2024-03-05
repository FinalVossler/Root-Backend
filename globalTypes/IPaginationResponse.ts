type IPaginationResponse<T> = {
  data: T[];
  total: number;
};

export default IPaginationResponse;
