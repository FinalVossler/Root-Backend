type MicroFrontendUpdateCommand = {
  _id: string;
  name: string;
  remoteEntry: string;
  components: string[];
};

export default MicroFrontendUpdateCommand;
