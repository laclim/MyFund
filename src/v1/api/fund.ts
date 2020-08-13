import Router, { NextFunction, Response, Request } from "express";
import { trycatch, validateRequest } from "../utility";
import { DataResponse } from "../response";
import { Status } from "../../error";
import { Fund, updateFund, createFund, IFund, getFundDB } from "../model/fund";
import { fundSchema, investFundSchema } from "../validation.ts/user";
import { ObjectID } from "mongodb";

interface fundRequest {
  amount: number;
}

interface investFundRequest {
  quote: string;
  amount: number;
  price: number;

  description: string;
}

export const addFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusList = new Status();

  const { amount } = await validateRequest(fundSchema, req.body as fundRequest);
  const user = req.headers.userId as string;
  let fund: IFund | null;
  fund = await updateFund(user, amount);

  if (!fund) {
    fund = await createFund(user, amount);
  }

  const data = { fund };
  DataResponse(res, statusList.getStatusList(), data);
};

export const getFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusList = new Status();
  const userId = req.params.id;
  const fund = await getFundDB(userId);
  DataResponse(res, statusList.getStatusList(), fund);
};
export const investFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { description, quote } = await validateRequest(
    investFundSchema,
    req.body as investFundRequest
  );
};
