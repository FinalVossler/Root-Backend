import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import PageCreateCommand from "./dto/PageCreateCommand";
import PageReadDto, { toReadDto } from "./dto/PageReadDto";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import { IPage } from "./page.model";
import pageService from "./page.service";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";
import mongoose from "mongoose";

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
  async (
    req: ConnectedRequest<any, any, PageCreateCommand, any>,
    res: Response<ResponseDto<PageReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreatePage,
    });

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
  async (
    req: ConnectedRequest<any, any, PageUpdateCommand, any>,
    res: Response<ResponseDto<PageReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.UpdatePage,
    });

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
    req: ConnectedRequest<any, any, mongoose.Types.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeletePage,
    });

    const pagesIds = req.body;

    await pageService.deleteByIds(pagesIds.map((pageId) => pageId.toString()));

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

export default router;
