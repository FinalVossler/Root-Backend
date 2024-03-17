import IFile from "../../../file/ports/interfaces/IFile";
import IUser from "../../../user/ports/interfaces/IUser";

interface ITestsPreparationService {
  clean: (currentUser: IUser) => Promise<void>;
  createFile: (url: string, currentUser: IUser) => Promise<IFile>;
  prepareMarketMaven: (currentUser: IUser) => Promise<void>;
  perpareEcommerce: (currentUser: IUser) => Promise<void>;
}

export default ITestsPreparationService;
