import Router, { NextFunction, Response, Request } from "express";
import { trycatch, validateRequest } from "../utility";
import { DataResponse } from "../response";
import { Status, ErrorStatus } from "../../error";
import { Fund, IFund, FundDB } from "../model/fund";
import { fundSchema, investSchema } from "../validation.ts/user";
import { ObjectID } from "mongodb";
import {
  ITradeHistory,
  TradeHistory,
  TradeHistoryDB,
  ITradeType,
} from "../model/tradeHistory";
import { PortfolioDB } from "../model/portfolio";
import { MarketDB } from "../model/market";
import {
  HistoryPortfolioDB,
  IHistoryPortfolioDetails,
} from "../model/historyPortfolio";

interface fundRequest {
  amount: number;
}

const fundDB = new FundDB();
const tradeHistortryDB = new TradeHistoryDB();
const portfolioDB = new PortfolioDB();
export const addFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusList = new Status();

  const { amount } = await validateRequest(fundSchema, req.body as fundRequest);
  const user = req.headers.userId as string;

  const fund = await fundDB.topUp(user, amount);

  DataResponse(res, statusList.getStatusList(), fund);
};

export const getFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data = {};
  const statusList = new Status();
  const fundId = req.params.id;
  const fund = await fundDB.getFund(fundId);
  console.log(process.env.NODE_ENV);
  if (fund) {
    data = { ...data, fund };

    DataResponse(res, statusList.getStatusList(), fund);
  } else {
    statusList.addStatus(ErrorStatus.NO_RECORD_FOUND);
    DataResponse(res, statusList.getStatusList());
  }
};

export const getFunds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data: any[] = [];
  const statusList = new Status();
  const historyPortfolioDB = new HistoryPortfolioDB();
  const fundList = await fundDB.getFundList();
  await Promise.all(
    fundList.map(async (el, i) => {
      const lastDayGain = await historyPortfolioDB.getLastGain(el.portfolio);

      data.push({ ...el.toJSON(), lastDayGain });
    })
  );

  if (fundList) {
    DataResponse(res, statusList.getStatusList(), data);
  } else {
    statusList.addStatus(ErrorStatus.NO_RECORD_FOUND);
    DataResponse(res, statusList.getStatusList());
  }
};

export const getPortfolioHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const portfolioID = req.params.portfolioID;
  let month: any = req.query.month || "";

  const statusList = new Status();
  const historyPortfolioDB = new HistoryPortfolioDB();
  const data = await historyPortfolioDB.getAllPortfolioHistoryDetails(
    portfolioID,
    parseInt(month)
  );
  DataResponse(res, statusList.getStatusList(), data);
};

export const investFund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = new Status();
  const { market, tradedPrice, tradedAt, type, volume } = await validateRequest(
    investSchema,
    req.body
  );
  const amount = +(volume * tradedPrice).toFixed(4);
  const user = req.headers.userId;
  let doc,
    valid = false;
  const portfolioId = await fundDB.getPortfolioId(user);
  const marketDB = new MarketDB();
  const isMarketExist = await marketDB.isMarketExist(market);
  if (!isMarketExist) {
    status.addStatus(ErrorStatus.MARKET_NOT_CODE_EXIST);
  } else {
    valid = true;
  }
  if (valid) {
    let fundId = null;
    if (type === ITradeType.BUY && valid) {
      const isInvestValid = await fundDB.isInvestValid(user, amount);
      if (isInvestValid) {
        const addPortfolioMarket = await portfolioDB.addPortfolioAmount({
          id: portfolioId,
          tradedPrice,
          market,
          volume,
          amount,
        });
        const fund = await fundDB.updateAmount({ user, addedAmount: -amount });
        if (fund && addPortfolioMarket) {
          fundId = fund._id;
        }
      } else {
        status.addStatus(ErrorStatus.INVEST_NOT_VALID);
      }
    } else {
      const isSellValid = await portfolioDB.sellPortfolioAmount({
        id: portfolioId,
        market,
        amount,
        // tradedPrice,
        volume,
      });

      if (isSellValid) {
        const fund = await fundDB.updateAmount({ user, addedAmount: amount });
        if (fund) {
          fundId = fund._id;
        }
      } else {
        status.addStatus(ErrorStatus.PORTFOLIO_AMOUNT_NOT_MATCH);
      }
    }

    if (fundId) {
      await tradeHistortryDB.trade({
        user,
        volume,
        amount,
        market,
        tradedPrice,
        type,
        fundId: fundId,
      });
    }
  }

  DataResponse(res, status.getStatusList(), doc);
};
