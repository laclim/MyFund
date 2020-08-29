import Router from "express";

import { BadRequest, Unauthorized } from "./response";

import { generateGuid, generateToken, trycatch, extractToken } from "./utility";

import { addUser, login } from "./api/user";
import {
  addFund,
  getFund,
  getFunds,
  getPortfolioHistory,
  investFund,
} from "./api/fund";
import multer from "multer";
import {
  createMarket,
  updateMarketPrice,
  getMarket,
  updatePortfolioHistory,
  getMarkets,
} from "./api/market";
const router = Router();
const upload = multer({ dest: "uploads/" });

//public

const publicRoute = Router();
publicRoute.post("/user", trycatch(addUser));
publicRoute.post("/login", trycatch(login));
publicRoute.get("/funds", trycatch(getFunds));
publicRoute.get("/fund/:id", trycatch(getFund));
publicRoute.get("/market/:id", trycatch(getMarket));
publicRoute.get("/market", trycatch(getMarkets));
publicRoute.get(
  "/portfolioHistory/:portfolioID",
  trycatch(getPortfolioHistory)
);

// private

const privateRoute = Router();
privateRoute.post("/fund", trycatch(addFund));
privateRoute.post("/market", upload.single("csvFile"), trycatch(createMarket));
privateRoute.put("/market/:marketCode", trycatch(updateMarketPrice));
privateRoute.post("/fund/invest", trycatch(investFund));
privateRoute.post("/portfolio/history", trycatch(updatePortfolioHistory));
router.use("/", publicRoute);
router.use("/", extractToken, privateRoute);

export default router;
