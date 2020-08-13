import { IUser } from "./user";
import { Schema, model, Document, Model, Types } from "mongoose";
import { IMarket } from "./market";
import { type } from "os";

interface IMarketPortfolio {
  market: IMarket["_id"];
  amount: number;
  unrealizedProfit?: number;
}

interface IPortfolio extends Document {
  user: IUser["_id"];
  marketPortfolio?: [IMarketPortfolio];
}

const marketPortfolioSchema = new Schema(
  {
    market: { type: String, ref: "Market", required: true, unique: true },
    amount: Number,
    unrealizedProfit: Number,
  },
  { timestamps: true }
);
const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marketPortfolio: { type: [marketPortfolioSchema], default: [] },
    totalUnrealizedProfit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Portfolio = model<IPortfolio>("Portfolio", schema, "Portfolio");

export class PortfolioDB {
  db: Model<IPortfolio, {}>;

  constructor() {
    this.db = Portfolio;
  }

  async createPortfolio(user: IUser["_id"]) {
    const doc = await Portfolio.create({ user });
    return doc;
  }

  async isPortfolioMarketExist(id: IPortfolio["_id"], market: IMarket["_id"]) {
    const isExist = await Portfolio.exists({
      _id: id,
      marketPortfolio: { $elemMatch: { market } },
    });
    return isExist;
  }

  async addPortfolioAmount(
    id: IPortfolio["_id"],
    market: IMarket["_id"],
    amount: number
  ) {
    let doc;
    if (await this.isPortfolioMarketExist(id, market)) {
      doc = await Portfolio.findOneAndUpdate(
        { _id: id, marketPortfolio: { $elemMatch: { market } } },
        { $set: { "marketPortfolio.$.amount": amount } }
      );
    } else {
      doc = await Portfolio.findOneAndUpdate(
        { _id: id },
        { $push: { marketPortfolio: { market, amount } } }
      );
    }
    return doc;
  }
}
