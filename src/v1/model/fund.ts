import { Schema, model, Document } from "mongoose";
import { Double } from "mongodb";
import { IUser } from "./user";

export interface IFund extends Document {
  amount: number;
  user: IUser["_id"];
  history?: [IHistorySchema];
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
    history: { type: [HistorySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Fund = model<IFund>("Fund", schema, "Fund");

export async function createFund(user: IUser["_id"], amount: number) {
  return await Fund.create({
    user,
    amount,
    history: [{ addedAmount: amount }],
  });
}

export async function getFundDB(user: IUser["_id"]) {
  return await Fund.findOne({
    user,
  }).populate("user");
}

export async function updateFund(user: IUser["_id"], amount: number) {
  return await Fund.findOneAndUpdate(
    { user },
    {
      $inc: { amount },
      $push: { history: { addedAmount: amount } },
    },
    { new: true }
  );
}
