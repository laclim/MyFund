import { Schema, model, Document } from "mongoose";
import { Double } from "mongodb";
import { IUser } from "./user";
import { investFund } from "../api/fund";
import { bool, IpOptions } from "@hapi/joi";
import { PortfolioDB, IPortfolio } from "./portfolio";

export interface IFund extends Document {
  amount: number;
  initialAmount: number;
  investedAmount?: number;
  user: IUser["_id"];
  history?: [IHistorySchema];
  portfolio: IPortfolio["_id"];
}

interface IHistorySchema {
  addedAmount: number;
}

const HistorySchema = new Schema(
  {
    addedAmount: Number,
  },
  { timestamps: true }
);

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    initialAmount: { type: Number, required: true },

    history: { type: [HistorySchema], default: [] },
    isPublic: { type: Boolean, default: true },
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: "Portfolio",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Fund = model<IFund>("Fund", schema, "Fund");

export class FundDB {
  db: import("mongoose").Model<IFund, {}>;

  constructor() {
    this.db = Fund;
  }
  async createFund(
    user: IUser["_id"],
    amount: number,
    portfolio: IPortfolio["_id"]
  ) {
    const doc = await this.db.create({
      user,
      amount,
      initialAmount: amount,
      history: [],
      portfolio,
    });
    return doc;
  }
  async getFund(id: IFund["_id"]) {
    const doc = await Fund.findOne({ _id: id })
      .populate("user", "name _id")
      .populate("portfolio");
    return doc;
  }
  async getFundList() {
    const doc = await Fund.find({})
      .populate("user", "name _id")
      .populate("portfolio");

    return doc;
  }

  async topUp(user: IUser["_id"], addedAmount: number) {
    const doc = await Fund.findOneAndUpdate(
      { user },
      {
        $inc: { amount: addedAmount, initialAmount: addedAmount },
        $push: { history: { addedAmount: addedAmount } },
      },
      { new: true }
    );
    return doc;
  }

  async updateAmount({
    id,
    user,
    addedAmount,
  }: {
    id?: IFund["_id"];
    user: IUser["_id"];
    addedAmount: number;
  }) {
    let doc;
    if (addedAmount > 0) {
      doc = await Fund.findOneAndUpdate(
        { user },
        {
          $inc: { amount: addedAmount },
        },
        { new: true }
      );
    } else {
      // invest / withrawl (subtract amount)
      doc = await Fund.findOneAndUpdate(
        { user },
        { $inc: { amount: addedAmount } }
      );
    }
    return doc;
  }

  async isInvestValid(user: IUser["_id"], investAmount: number) {
    const doc = await Fund.findOne({ user }).select("amount");
    if (investAmount < doc?.amount!) {
      return true;
    }
    return false;
  }

  async getPortfolioId(user: IUser["_id"]) {
    const doc = await Fund.findOne({ user }).select("portfolio");
    return doc?.portfolio;
  }
  async getFundByPortfolioID(id: IPortfolio["_id"]) {
    const doc = await Fund.findOne({ portfolio: id });
    return doc;
  }
}
