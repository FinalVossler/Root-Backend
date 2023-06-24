type PageCreateCommand = {
  title: string;
  posts: string[];
  showInHeader: boolean;
  showInSideMenu: boolean;
  language: string;
};

export default PageCreateCommand;
