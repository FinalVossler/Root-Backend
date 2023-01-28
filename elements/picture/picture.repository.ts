import Picture, { IPicture } from "./picture.model";

const pictureRepository = {
  create: async (picture: IPicture): Promise<IPicture> => {
    const newPicture: IPicture = (await Picture.create(picture)) as IPicture;

    return newPicture;
  },
};

export default pictureRepository;
