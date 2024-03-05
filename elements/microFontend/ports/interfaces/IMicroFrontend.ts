import { IMicroFrontendComponent } from "../../../microFontendComponent/microFrontendComponent.model";

export default interface IMicroFrontend {
  _id: string;
  name: string;
  remoteEntry: string;
  components: (IMicroFrontendComponent | string)[];

  createdAt: string;
  updatedAt: string;
}
