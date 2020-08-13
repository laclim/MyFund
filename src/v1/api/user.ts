import Router, { NextFunction, Request, Response } from "express";
import { trycatch, validateRequest, generateToken } from "../utility";
import { userSchema, loginSchema } from "../validation.ts/user";
import { BadRequest, DataResponse } from "../response";
import { ErrorStatus, Status, IStatus } from "../../error";
import { User, IUser } from "../model/user";

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  await validateRequest(userSchema, req.body);

  const { email, password, name } = req.body;
  const result = await User.create({ email, password, name });
  const data = { id: result.id };

  DataResponse(res, status.getStatusList(), data);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  let data;
  await validateRequest(loginSchema, req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    const token = generateToken(user.id);
    data = { token };
  } else status.addStatus(ErrorStatus.INVALID_CREDENTIALS);

  DataResponse(res, status.getStatusList(), data);
};
