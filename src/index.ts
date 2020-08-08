import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { APP_PORT, MONGO_URI, MONGO_OPTION } from "./config";
import mongoose from "mongoose";
import { AppConfig } from "./app";
(async () => {
  try {
    await mongoose.connect(MONGO_URI, MONGO_OPTION);
  } catch (error) {
    console.log(error);
  }

  //   const RedisStore = connectRedis(session);
  //   const client = new Redis(REDIS_CONFIG);
  //   const store = new RedisStore({ client });
  const app = AppConfig();
  app.listen(3000, () => console.log(`http://localhost:${APP_PORT}`));
})();
