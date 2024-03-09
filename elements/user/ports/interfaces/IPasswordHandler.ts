interface IPasswordHandler {
  hash: (password: string, salt: string) => Promise<string>;
  genSalt: (complexity: number) => Promise<string>;
  compare: (submittedPassword, hashedPassword) => Promise<boolean>;
}

export default IPasswordHandler;
