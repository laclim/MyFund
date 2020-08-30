import express, { Response, Request, NextFunction } from "express";
import session, { Store } from "express-session";
import { task } from "./crawlPrice";
import { default as v1 } from "./v1/routes";
import cors from "cors";
import cookieParser from "cookie-parser";
export const AppConfig = () => {
  const app = express();
  app.use(express.json());
  task.start();
  app.use(cors({ credentials: true }));
  app.use(cookieParser());
  app.use("/api/v1", v1);
  app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" });
  });
  app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    res
      .status(err.status || 500)
      .send({ message: err.message || "Internal Server Error" });
  });
  return app;
};
