import Router from "express";


import { BadRequest, Unauthorized } from "../response";




const router = Router();
router.get("/", async (req, res, next) => {
    res.json("asdas")
});

export default router