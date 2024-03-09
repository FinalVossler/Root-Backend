import { decode, sign, verify } from "jsonwebtoken";

import ITokenHandler from "../elements/user/ports/interfaces/ITokenHandler";

const adaptJsonWebTokenHandler = <T extends Object>(): ITokenHandler<T> => {
  return {
    decode: (token) => decode(token) as T,
    sign: (toSign: T, secret: string, options) =>
      sign(toSign, secret, { expiresIn: options.expiresIn }),
    verify: (token: string, secret: string) => verify(token, secret),
  };
};

export default adaptJsonWebTokenHandler;
