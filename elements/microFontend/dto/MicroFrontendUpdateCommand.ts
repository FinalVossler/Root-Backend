type MicroFrontendUpdateCommand = {
  _id: string;
  name: string;
  remoteEntry: string;
  components: {
    _id?: string;
    name: string;
  }[];
};

export default MicroFrontendUpdateCommand;
