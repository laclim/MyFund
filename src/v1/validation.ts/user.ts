import Joi from "@hapi/joi";

const email = Joi.string()
  .email()
  .min(8)
  .max(256)
  .lowercase()
  .trim()
  .required();

const code = Joi.string().length(4).required();

const password = Joi.string().min(3).max(128).required();

export const userSchema = Joi.object({
  email,
  password,
  name: Joi.string().min(3).max(128).required(),
});

export const loginSchema = Joi.object({
  email,
  password,
});

export const fundSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

export const investSchema = Joi.object({
  market: Joi.string().required(),
  // amount: Joi.number().positive().required(),
  volume: Joi.number().positive().required(),
  tradedPrice: Joi.number().positive().required(),
  tradedAt: Joi.date(),
  type: Joi.string().valid("BUY", "SELL").required(),
});

export const tradeHistorySchema = Joi.object({
  market: Joi.string().required(),
  tradedPrice: Joi.number().required(),
  type: Joi.string().valid("BUY", "SELL").required(),
  tradedAt: Joi.date(),
});

export const updateMarketSchema = Joi.object({
  quote: Joi.string(),
  active: Joi.boolean(),
  type: Joi.string().valid("ETF", "STOCK", "INDEX"),
});
