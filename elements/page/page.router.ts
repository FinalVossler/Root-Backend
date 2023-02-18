import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { Role } from "../user/user.model";
import PageCreateCommand from "./dto/PageCreateCommand";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import { IPage } from "./page.model";
import pageService from "./page.service";

const router = express.Router();

router.get(
  "/",
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<IPage[]>>
  ) => {
    const pages: IPage[] = await pageService.get();

    return res.status(200).json({
      data: pages,
      success: true,
    });
  }
);

router.post(
  "/",
  async (
    req: ConnectedRequest<any, any, PageCreateCommand, any>,
    res: Response<ResponseDto<IPage>>
  ) => {
    if (req.user.role !== Role.Admin) {
      throw new Error(
        "Trying to create a page with a user who isn't an admin. That's not possible"
      );
    }

    const command: PageCreateCommand = req.body;

    const page: IPage = await pageService.create(command);

    return res.status(200).json({
      data: page,
      success: true,
    });
  }
);

router.put(
  "/",
  async (
    req: ConnectedRequest<any, any, PageUpdateCommand, any>,
    res: Response<ResponseDto<IPage>>
  ) => {
    if (req.user.role !== Role.Admin) {
      throw new Error(
        "Trying to update a page with a user who isn't an admin. That's not possible"
      );
    }

    const command: PageUpdateCommand = req.body;

    const page: IPage = await pageService.update(command);

    return res.status(200).json({
      data: page,
      success: true,
    });
  }
);

export default router;
