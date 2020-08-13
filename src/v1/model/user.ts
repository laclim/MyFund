import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  loginType?: ["FACEBOOK"];
}

const userSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: { type: String, select: false },
    name: String,
    loginType: { type: String, enum: ["FACEBOOK"] },
    isValidate: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema, "User");
