import IUser from "../../../../user/ports/interfaces/IUser";

export default interface IReaction {
  _id: string;
  user: IUser | string;
  reaction: ReactionEnum;

  createdAt: string;
  updatedAt: string;
}

export enum ReactionEnum {
  Love = "Love",
  Laugh = "Laugh",
  Shock = "Shock",
  Cry = "Cry",
  Angry = "Angry",
  OK = "OK",
}
