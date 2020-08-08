import { ConnectionOptions } from "mongoose";

export const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DATABASE,
} = process.env;

export const MONGO_URI = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(
  MONGO_PASSWORD!
)}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;

export const MONGO_OPTION: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
