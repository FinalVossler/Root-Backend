import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import superAdminProtectMiddleware from "../../middleware/superAdminProtectMiddleware";
import protectMiddleware from "../../middleware/protectMiddleware";
import { SuperRole } from "../user/user.model";
import PageCreateCommand from "./dto/PageCreateCommand";
import PageReadDto, { toReadDto } from "./dto/PageReadDto";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import { IPage } from "./page.model";
import pageService from "./page.service";

const router = express.Router();

router.get(
  "/",
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<PageReadDto[]>>
  ) => {
    const pages: IPage[] = await pageService.get();

    return res.status(200).json({
      data: pages.map((p) => toReadDto(p)),
      success: true,
    });
  }
);

router.post(
  "/",
  protectMiddleware,
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, PageCreateCommand, any>,
    res: Response<ResponseDto<PageReadDto>>
  ) => {
    if (req.user.superRole !== SuperRole.SuperAdmin) {
      throw new Error(
        "Trying to create a page with a user who isn't an admin. That's not possible"
      );
    }

    const command: PageCreateCommand = req.body;

    const page: IPage = await pageService.create(command);

    return res.status(200).json({
      data: toReadDto(page),
      success: true,
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, PageUpdateCommand, any>,
    res: Response<ResponseDto<PageReadDto>>
  ) => {
    if (req.user.superRole !== SuperRole.SuperAdmin) {
      throw new Error(
        "Trying to update a page with a user who isn't an admin. That's not possible"
      );
    }

    const command: PageUpdateCommand = req.body;

    const page: IPage = await pageService.update(command);

    return res.status(200).json({
      data: toReadDto(page),
      success: true,
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, { pageId: string }>,
    res: Response<ResponseDto<void>>
  ) => {
    if (req.user.superRole !== SuperRole.SuperAdmin)
      throw new Error("Unauthorized");

    const pageId: string = req.query.pageId;

    await pageService.delete(pageId);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

export default router;
