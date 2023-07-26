type MicroFrontendCreateCommand = {
  name: string;
  remoteEntry: string;
  components: MicroFrontendCreateCommand[];
};

export default MicroFrontendCreateCommand;
