interface ITokenHandler<T> {
  verify: (token: string, secret: string) => void | never;
  sign: (toSign: T, secret: string, options: { expiresIn: string }) => string;
  decode: (token: string) => T;
}

export default ITokenHandler;
