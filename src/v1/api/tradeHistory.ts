import { NextFunction, Request, Response } from "express";
import { parse } from "@fast-csv/parse";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { DataResponse } from "../response";
import { Status, ErrorStatus } from "../../error";
import { IMarket, IPriceSchema, MarketDB } from "../model/market";
import { TradeHistoryDB, ITradeHistory } from "../model/tradeHistory";
import { validateRequest } from "../utility";
import { tradeHistorySchema } from "../validation.ts/user";

const tradeHistoryDB = new TradeHistoryDB();

export const createTradeHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();

  const {
    market,
    tradedPrice,
    tradedAt,
    type,
    amount,
  } = req.body as ITradeHistory;
  // await validateRequest(tradeHistorySchema, req.body);
  // const user = req.headers.userId;
  // const doc = await tradeHistoryDB.buy({
  //   user,
  //   tradedPrice,
  //   market,
  //   amount,
  //   type,
  //   tradedAt,
  // });
  // if (doc) {
  //   DataResponse(res, status.getStatusList(), doc);
  // } else {
  // }
};
