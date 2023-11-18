type PageUpdateCommand = {
  _id: string;
  title: string;
  slug?: string;
  posts: string[];
  showInHeader: boolean;
  showInSideMenu: boolean;
  language: string;
};

export default PageUpdateCommand;
