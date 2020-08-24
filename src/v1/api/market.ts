import { NextFunction, Request, Response } from "express";
import { parse } from "@fast-csv/parse";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { DataResponse } from "../response";
import { Status, ErrorStatus } from "../../error";
import { IMarket, IPriceSchema, MarketDB } from "../model/market";
import moment from "moment";
import { calcPortfolioProfit } from "../../crawlPrice";
import { validateRequest } from "../utility";
import { updateMarketSchema } from "../validation.ts/user";

const marketDB = new MarketDB();
export const createMarket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const file = req.file;
  const { marketCode, type, quote } = req.body;

  let price: IPriceSchema[] = [];

  const isExist = await marketDB.checkMarketID(marketCode);
  let doc;
  if (isExist) {
    status.addStatus(ErrorStatus.MARKET_CODE_EXIST);
  } else if (file) {
    const readAndWriteToCol = () =>
      new Promise((resolve: any, reject: any) => {
        fs.createReadStream(path.resolve(file.path))
          .pipe(csv.parse({ headers: true }))
          .on("error", (error) => console.error(error))
          .on("data", (row) => {
            const closingPrice = row[" Close/Last"].replace(/\$/g, "");
            const data = {
              date: row["Date"],

              closingPrice: parseFloat(closingPrice),
            };
            price.push(data);
          })
          .on("end", async (rowCount: number) => {
            console.log(`Parsed ${rowCount} rows`);
            try {
              doc = await marketDB.createMarket({ marketCode, type, price });
              resolve(doc);
            } catch (error) {
              reject(error);
              status.addStatus(ErrorStatus.INVALID_MARKET_COL);
            }
          });
      });
    await readAndWriteToCol(); // run syncronize
  } else if (!file) {
    doc = await marketDB.createMarket({ marketCode, type, quote });
  }

  if (status.getStatusList().length) {
    DataResponse(res, status.getStatusList());
  } else {
    DataResponse(res, status.getStatusList(), doc);
  }
};

// test
export const updateMarketPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const marketCode = req.params.marketCode;
  const status = new Status();
  const { active, quote, type } = await validateRequest(
    updateMarketSchema,
    req.body
  );

  const doc = await marketDB.updateMarketDetails({
    marketCode,
    active,
    quote,
    type,
  });
  DataResponse(res, status.getStatusList(), doc);
};

export const getMarket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const id = req.params.id;
  const doc = await marketDB.getMarket(id);
  // doc?.price?.reverse();
  DataResponse(res, status.getStatusList(), doc);
};

export const getMarkets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  let marketCodes = req.query.marketCodes;
  marketCodes = (marketCodes as string).split(",");
  const doc = await marketDB.getMarkets(marketCodes);
  // doc?.price?.reverse();
  DataResponse(res, status.getStatusList(), doc);
};

export const updatePortfolioHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const doc = await calcPortfolioProfit();
  DataResponse(res, status.getStatusList());
};
