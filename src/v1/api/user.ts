import Router, { NextFunction, Request, Response } from "express";
import { trycatch, validateRequest, generateToken } from "../utility";
import { userSchema, loginSchema } from "../validation.ts/user";
import { BadRequest, DataResponse } from "../response";
import { ErrorStatus, Status, IStatus } from "../../error";
import { User, IUser } from "../model/user";
import { FundDB } from "../model/fund";
import { PortfolioDB } from "../model/portfolio";

const fundDB = new FundDB();
const portfolioDB = new PortfolioDB();
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  await validateRequest(userSchema, req.body);

  const { email, password, name } = req.body;
  const user = await User.create({ email, password, name });
  if (user) {
    const portfolio = await portfolioDB.createPortfolio(user._id);
    await fundDB.createFund(user._id, 0, portfolio._id);
  }
  const data = { id: user.id };

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
    data = { user, token };
  } else status.addStatus(ErrorStatus.INVALID_CREDENTIALS);

  DataResponse(res, status.getStatusList(), data);
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();

  const userId = req.headers.userId;
  const doc = await User.findById(userId);

  DataResponse(res, status.getStatusList(), doc);
};
