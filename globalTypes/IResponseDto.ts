type IResponseDto<T> = {
  success: boolean;
  data: T | null;
};

export default IResponseDto;
