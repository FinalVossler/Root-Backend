type ResponseDto<T> = {
  success: boolean;
  data: T | null;
};

export default ResponseDto;
