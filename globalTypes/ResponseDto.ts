type ResponseDto<T> = {
  success: boolean;
  data: T;
};

export default ResponseDto;
