import Router from "express";

import { BadRequest, Unauthorized } from "./response";

import { generateGuid, generateToken, trycatch, extractToken } from "./utility";

import { addUser, login } from "./api/user";
import { addFund, getFund } from "./api/fund";
import multer from "multer";
import { createMarket, updateMarketPrice, getMarket } from "./api/market";
const router = Router();
const upload = multer({ dest: "uploads/" });

//public

const publicRoute = Router();
publicRoute.post("/user", trycatch(addUser));
publicRoute.post("/login", trycatch(login));
publicRoute.get("/fund/:id", trycatch(getFund));
publicRoute.get("/market", trycatch(getMarket));
// private

const privateRoute = Router();
privateRoute.post("/fund", trycatch(addFund));
privateRoute.post("/market", upload.single("csvFile"), trycatch(createMarket));
privateRoute.put("/market", trycatch(updateMarketPrice));
router.use("/", publicRoute);
router.use("/", extractToken, privateRoute);

export default router;
