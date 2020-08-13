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

export const investFundSchema = Joi.object({
  market: Joi.any().allow("ETF", "STOCK", "INDEX"),
  quote: Joi.string().required(),
  description: Joi.string(),
});

export const tradeHistorySchema = Joi.object({
  market: Joi.string().required(),
  tradedPrice: Joi.number().required(),
  type: Joi.any().allow("BUY", "SELL").required(),
  tradedAt: Joi.date(),
});
