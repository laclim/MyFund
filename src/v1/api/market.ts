import { NextFunction, Request, Response } from "express";
import { parse } from "@fast-csv/parse";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { DataResponse } from "../response";
import { Status, ErrorStatus } from "../../error";
import { IMarket, IPriceSchema, MarketDB } from "../model/market";

const marketDB = new MarketDB();
export const createMarket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const file = req.file;
  const { marketCode, type } = req.body;

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
              doc = await marketDB.createMarket(marketCode, type, price);
              resolve(doc);
            } catch (error) {
              reject(error);
              status.addStatus(ErrorStatus.INVALID_MARKET_COL);
            }
          });
      });
    await readAndWriteToCol(); // run syncronize
  } else if (!file) {
    doc = await marketDB.createMarket(marketCode, type);
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
  const status = new Status();
  const doc = await marketDB.updateMarketPrice("AAPL", [
    { date: new Date(), closingPrice: 23 },
  ]);
  DataResponse(res, status.getStatusList(), doc);
};

export const getMarket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const doc = await marketDB.getMarket("AAPL");
  // doc?.price?.reverse();
  DataResponse(res, status.getStatusList(), doc);
};
