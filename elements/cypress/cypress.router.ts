import express, { Response } from "express";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IUser } from "../user/user.model";
import cypressService from "./cypress.service";

const router = express.Router();

router.post(
  "/prepare",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const currentUser: IUser = req.user;

    await cypressService.prepare(currentUser);

    res.status(200).json({
      data: null,
      success: true,
    });
  }
);

export default router;
