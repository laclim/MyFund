import { IUser } from "./user";
import { Schema, model, Document, Model, Types } from "mongoose";
import { IMarket } from "./market";
import { timeStamp } from "console";

interface IMarketPortfolio {
  market: IMarket["_id"];
  // amount: number;
  volume: number;
  avgPrice: number;
}

export interface IPortfolio extends Document {
  user: IUser["_id"];
  marketPortfolio?: [IMarketPortfolio];
  // totalUnrealizedProfit?: number;
}

const marketPortfolioSchema = new Schema(
  {
    market: { type: String, ref: "Market", required: true, unique: true },
    // amount: Types.Decimal128,
    volume: Number,
    avgPrice: Number,
  },
  { timestamps: true }
);
const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marketPortfolio: { type: [marketPortfolioSchema], default: [] },
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

  async getPortfolio(user: IUser["_id"]) {
    const doc = await Portfolio.findOne({ user });
    return doc;
  }

  async isPortfolioMarketExist(
    id: IPortfolio["_id"],
    market: IMarket["_id"],
    volume?: number
  ) {
    let isExist: boolean;
    if (!volume) {
      isExist = await this.db.exists({
        _id: id,
        marketPortfolio: { $elemMatch: { market } },
      });
    } else {
      isExist = await this.db.exists({
        _id: id,
        marketPortfolio: { $elemMatch: { market, volume: { $gte: volume } } },
      });
    }

    return isExist;
  }

  async addPortfolioAmount({
    id,
    market,
    volume,
    amount,
    tradedPrice,
  }: {
    id: IPortfolio["_id"];
    market: IMarket["_id"];
    volume: number;
    amount: number;
    tradedPrice: number;
  }) {
    let doc;

    if (await this.isPortfolioMarketExist(id, market)) {
      const portfolioMarketData = await this.getPortfolioMarket(id, market);
      const currentVolume = portfolioMarketData?.volume;
      const currentAvgPrice = portfolioMarketData?.avgPrice;
      if (currentVolume && currentAvgPrice) {
        const newAvgPrice = +(
          (amount + currentVolume * currentAvgPrice) /
          (volume + currentVolume)
        ).toFixed(4);

        doc = await Portfolio.findOneAndUpdate(
          { _id: id, marketPortfolio: { $elemMatch: { market } } },
          {
            $inc: {
              "marketPortfolio.$.volume": volume,
            },
            $set: { "marketPortfolio.$.avgPrice": newAvgPrice },
          }
        );
      }
    } else {
      doc = await this.db.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            marketPortfolio: { market, volume, avgPrice: tradedPrice },
          },
        }
      );
    }
    return doc;
  }

  async getPortfolioMarket(id: IPortfolio["_id"], market: IMarket["_id"]) {
    const doc = await this.db.findOne(
      { _id: id, marketPortfolio: { $elemMatch: { market } } },
      { _id: 0, "marketPortfolio.$": 1 }
    );
    return doc?.marketPortfolio?.[0];
  }

  async sellPortfolioAmount({
    id,
    market,
    amount,
    volume,
  }: {
    id: IPortfolio["_id"];
    market: IMarket["_id"];
    amount: number;
    volume: number;
  }) {
    if (await this.isPortfolioMarketExist(id, market, volume)) {
      const portfolioMarketData = await this.getPortfolioMarket(id, market);
      let doc;
      const currentVolume = portfolioMarketData?.volume;
      if (currentVolume && currentVolume - volume === 0) {
        doc = await Portfolio.findOneAndUpdate(
          { _id: id },
          {
            $pull: { marketPortfolio: { market } },
          }
        );
      } else {
        doc = await Portfolio.findOneAndUpdate(
          { _id: id, marketPortfolio: { $elemMatch: { market } } },
          {
            $inc: {
              "marketPortfolio.$.volume": -volume,
            },
          }
        );
      }

      return doc;
    } else {
      return null;
    }
  }

  async getList() {
    const doc = await this.db.find({});
    return doc;
  }
}
