import Router from "express";


import { BadRequest, Unauthorized } from "./response";


import { generateGuid, generateToken,trycatch,extractToken } from "./utility";

import user from "./api/user"
const router = Router();

router.use("/user",user);



export default router;
