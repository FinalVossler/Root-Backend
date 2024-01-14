import MicroFrontendComponentCreateCommand from "../../microFontendComponent/dto/MicroFrontendComponentCreateCommand";

type MicroFrontendCreateCommand = {
  name: string;
  remoteEntry: string;
  components: MicroFrontendComponentCreateCommand[];
};

export default MicroFrontendCreateCommand;
