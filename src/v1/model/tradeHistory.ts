import { IUser } from "./user";
import { Schema, model, Document, Model } from "mongoose";
import { IMarket } from "./market";
import { IFund } from "./fund";

export enum ITradeType {
  SELL = "SELL",
  BUY = "BUY",
}

export interface ITradeHistory extends Document {
  user: IUser["_id"];
  type: ITradeType;
  market: IMarket["_id"];
  amount: number;
  volume: number;
  tradedPrice: number;
  tradedAt?: Date;
}

// interface ITradeHistoryBuy extends Document {
//   user: IUser["_id"];
//   type: ITradeType.BUY;
//   market: IMarket["_id"];
//   amount: number;
//   tradedPrice: number;
//   tradedAt?: Date;
// }

// interface ITradeHistorySell extends Document {
//   user: IUser["_id"];
//   type: ITradeType.SELL;
//   market: IMarket["_id"];
//   //   profitPercentage: number;
//   //   profitAmount: number;
//   amount: number;
//   tradedPrice: number;
//   tradedAt?: Date;
// }

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    market: { type: String, ref: "Market", required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    // profitPercentage: Number,
    // profitAmount: Number,
    volume: { type: Number, required: true },
    amount: { type: Number, required: true },
    tradedPrice: { type: Number, required: true },
    tradedAt: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

export const TradeHistory = model<ITradeHistory>(
  "TradeHistory",
  schema,
  "TradeHistory"
);

export class TradeHistoryDB {
  db: Model<ITradeHistory, {}>;
  constructor() {
    this.db = TradeHistory;
  }

  async trade({
    user,
    market,
    volume,
    tradedPrice,
    amount,
    tradedAt,
    type,
  }: {
    user: IUser["_id"];
    market: IMarket["_id"];
    volume: number;
    tradedPrice: number;
    amount: number;
    tradedAt?: Date;
    type: ITradeType;
    fundId: IFund["_id"];
  }) {
    const doc = await TradeHistory.create({
      user,
      type,
      market,
      amount,
      volume,
      tradedPrice,
      tradedAt,
    });
    return doc;
  }

  //   async sell(
  //     user: IUser["_id"],
  //     market: IMarket["_id"],
  //     tradedPrice: number,
  //     amount: number,
  //     tradedAt?: Date
  //   ) {
  //     const doc = await TradeHistory.create({
  //       user,
  //       type: ITradeType.SELL,
  //       market,
  //       amount,
  //       tradedPrice,
  //       tradedAt,
  //     });
  //     return doc;
  //   }
}
