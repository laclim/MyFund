import { IUser } from "./user";
import { Schema, model, Document, Model } from "mongoose";
import { string } from "@hapi/joi";
export enum marketType {
  ETF = "ETF",
  INDEX = "INDEX",
  STOCK = "STOCK",
}

export interface IPriceSchema {
  date: string;
  closingPrice: number;
}

export interface IMarket extends Document {
  _id: string;
  price?: [IPriceSchema];
  quote?: string;
  type: marketType;
  active?: boolean;
}

const PriceSchema = new Schema(
  {
    date: { type: String, required: true, unique: true },
    closingPrice: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new Schema(
  {
    _id: String,
    price: { type: [PriceSchema], default: [] },
    quote: String,
    type: { type: String, enum: ["ETF", "INDEX", "STOCK"] },
    active: { type: Boolean, default: true },
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

  async createMarket({
    marketCode,
    type,
    quote,
    price,
  }: {
    marketCode: string;
    type: marketType;
    quote?: string;
    price?: Array<IPriceSchema>;
  }) {
    const doc = await Market.create({
      _id: marketCode,
      type,
      quote,
      price,
    });
    return doc;
  }
  async updateMarketDetails({
    marketCode,
    active,
    type,
    quote,
  }: {
    marketCode: string;
    active?: boolean;
    quote?: string;
    type?: marketType;
  }) {
    let updateFields = {};
    if (active) {
      updateFields = { ...updateFields, active };
    }
    if (quote) {
      updateFields = { ...updateFields, quote };
    }
    if (type) {
      updateFields = { ...updateFields, type };
    }

    const doc = await Market.findByIdAndUpdate(
      marketCode,
      {
        $set: updateFields,
      },
      { new: true }
    );
    return doc;
  }

  async updateMarketPrice(marketCode: string, price: IPriceSchema) {
    const doc = await Market.findOneAndUpdate(
      { _id: marketCode },
      {
        $addToSet: { price },
      },
      { new: true, runValidators: true }
    );

    return doc;
  }

  async getMarket(marketCode: string) {
    const doc = await Market.findById(marketCode);
    doc?.price?.reverse();
    return doc;
  }
  async getMarkets(marketCode: Array<IMarket["_id"]>) {
    const doc = await Market.find(
      { _id: { $in: marketCode } },
      { price: { $slice: -1 } }
    );

    return doc;
  }

  async getLatestPrice(marketCode: string) {
    const doc = await Market.findById(marketCode, { price: { $slice: -1 } });
    const closingPrice = doc?.price?.[0].closingPrice;
    return closingPrice;
  }

  async getList() {
    const doc = await Market.find({ active: true });
    return doc;
  }
  async isMarketExist(id: IMarket["_id"]) {
    const isExist = await Market.exists({ _id: id });
    return isExist;
  }
}
