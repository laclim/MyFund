import { IUser } from "./user";
import { Schema, model, Document, Model } from "mongoose";
export enum marketType {
  ETF = "ETF",
  INDEX = "INDEX",
  STOCK = "STOCK",
}

export interface IPriceSchema {
  date: Date;
  closingPrice: number;
}

export interface IMarket extends Document {
  _id: string;
  price?: [IPriceSchema];
  type: marketType;
}

const PriceSchema = new Schema(
  {
    date: { type: Date, required: true },
    closingPrice: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new Schema(
  {
    _id: String,
    price: { type: [PriceSchema], default: [] },
    type: { type: String, enum: ["ETF", "INDEX", "STOCK"] },
  },
  { _id: false, timestamps: true }
);

export const Market = model<IMarket>("Market", schema, "Market");

export class MarketDB {
  db: Model<IMarket, {}>;

  constructor() {
    this.db = Market;
  }

  async checkMarketID(marketCode: string) {
    const isExist = await Market.exists({ _id: marketCode });
    return isExist;
  }

  async createMarket(
    marketCode: string,
    type: marketType,
    price?: Array<IPriceSchema>
  ) {
    const doc = await Market.create({
      _id: marketCode,
      type,
      price,
    });
    return doc;
  }

  async updateMarketPrice(marketCode: string, price: Array<IPriceSchema>) {
    const doc = await Market.findOneAndUpdate(
      { _id: marketCode },
      {
        $push: { price: { $each: price } },
      }
    );

    return doc;
  }

  async getMarket(marketCode: string) {
    const doc = await Market.findById(marketCode);

    return doc;
  }
}
