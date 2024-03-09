import { compare, genSalt, hash } from "bcrypt";

import IPasswordHandler from "../elements/user/ports/interfaces/IPasswordHandler";

const adaptBcrypt = (): IPasswordHandler => {
  return {
    compare: async (submittedPassword: string, hashedPassword: string) =>
      await compare(submittedPassword, hashedPassword),
    genSalt: async (complexity: number) => await genSalt(complexity),
    hash: async (password: string, salt: string) => await hash(password, salt),
  };
};

export default adaptBcrypt;
