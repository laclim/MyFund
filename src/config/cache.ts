import { RedisOptions } from "ioredis";

const {
  REDIS_PORT = 6379,
  REDIS_HOST = "35.240.183.154",
  REDIS_PASSWORD = "secret"
} = process.env;

export const REDIS_CONFIG: RedisOptions = {
  port: +REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD
};
