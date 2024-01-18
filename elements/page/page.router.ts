import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IPage } from "./page.model";
import pageService from "./page.service";
import roleService from "../role/role.service";
import mongoose from "mongoose";
import {
  IPageCreateCommand,
  IPageReadDto,
  IPageUpdateCommand,
  PermissionEnum,
} from "roottypes";
import { pageToReadDto } from "./page.toReadDto";

const router = express.Router();

router.get(
  "/",
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<IPageReadDto[]>>
  ) => {
    const pages: IPage[] = await pageService.get();

    return res.status(200).json({
      data: pages.map((p) => pageToReadDto(p)),
      success: true,
    });
  }
);

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IPageCreateCommand, any>,
    res: Response<ResponseDto<IPageReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreatePage,
    });

    const command: IPageCreateCommand = req.body;

    const page: IPage = await pageService.create(command);

    return res.status(200).json({
      data: pageToReadDto(page),
      success: true,
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IPageUpdateCommand, any>,
    res: Response<ResponseDto<IPageReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.UpdatePage,
    });

    const command: IPageUpdateCommand = req.body;

    const page: IPage = await pageService.update(command);

    return res.status(200).json({
      data: pageToReadDto(page),
      success: true,
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeletePage,
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
