import moment from "moment";
import { model, Schema, Document } from "mongoose";
import { IPortfolio } from "./portfolio";

interface IHistoryPortfolio extends Document {
  monthYear: String;
  details: [IHistoryPortfolioDetails];
  portfolio: IPortfolio["_id"];
}

export interface IHistoryPortfolioDetails {
  profitPercentage: number;
}

const historyPortfolioDetailsSchema = new Schema(
  {
    profitPercentage: Number,
  },
  { timestamps: true }
);

const historyPortfolioSchema = new Schema(
  {
    monthYear: String,
    details: [historyPortfolioDetailsSchema],
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: "Portfolio",
      required: true,
    },
  },
  { timestamps: true }
);

export const HistoryPortfolio = model<IHistoryPortfolio>(
  "HistoryPortfolio",
  historyPortfolioSchema,
  "HistoryPortfolio"
);

export class HistoryPortfolioDB {
  monthYear: string;
  constructor() {
    this.monthYear = moment().format("MM-YYYY");
  }
  async checkExist(portfolioId: IPortfolio["_id"]) {
    const isExist = await HistoryPortfolio.exists({
      portfolio: portfolioId,
      monthYear: this.monthYear,
    });
    return isExist;
  }

  async createHistoryPortfolio(
    portfolioId: IPortfolio["_id"],
    profitPercentage: number
  ) {
    HistoryPortfolio.create({
      monthYear: this.monthYear,
      details: [{ profitPercentage }],
      portfolio: portfolioId,
    });
  }

  async updateHistoryPortfolio(
    portfolioId: IPortfolio["_id"],
    profitPercentage: number
  ) {
    const doc = await HistoryPortfolio.updateOne(
      { portfolio: portfolioId, monthYear: this.monthYear },
      {
        $push: { details: { profitPercentage } },
        portfolio: portfolioId,
      }
    );
    return doc;
  }

  async getLastGain(portfolioId: IPortfolio["_id"]) {
    const doc = await HistoryPortfolio.findOne({
      portfolio: portfolioId,
    }).sort({ _id: -1 });
    if (doc) return doc?.details.reverse()[0];
    else return { profitPercentage: 0 };
  }

  async getAllPortfolioHistoryDetails(
    portfolioId: IPortfolio["_id"],
    month?: number
  ) {
    let doc;
    let data: any[] = [];
    if (month) {
      doc = await HistoryPortfolio.find({ portfolio: portfolioId })
        .sort({ _id: -1 })
        .limit(month);
    } else {
      doc = await HistoryPortfolio.find({ portfolio: portfolioId }).sort({
        _id: -1,
      });
    }
    doc.forEach((el) => {
      el.details.reverse();
      data = data.concat(el.details);
    });

    return data;
  }
}
