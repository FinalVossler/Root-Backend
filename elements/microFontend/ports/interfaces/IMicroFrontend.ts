import IMicroFrontendComponent from "../../../microFontendComponent/ports/interfaces/IMicroFrontendComponent";

export default interface IMicroFrontend {
  _id: string;
  name: string;
  remoteEntry: string;
  components: (IMicroFrontendComponent | string)[];

  createdAt: string;
  updatedAt: string;
}
