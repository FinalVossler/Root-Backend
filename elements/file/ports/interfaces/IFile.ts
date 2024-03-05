export default interface IFile {
  _id?: string;
  url: string;
  uuid: string;
  isImage: boolean;
  name?: string | null;
  ownerId?: string;
}
