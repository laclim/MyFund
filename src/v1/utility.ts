import jwt from "jsonwebtoken";
// import { Refresh } from "../models/Refresh";
import { BadRequest, Unauthorized } from "./response";
import { RequestHandler, Request, Response, NextFunction } from "express";
export const generateGuid = () => {
  let result = "";
  for (let j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + "-";
    const i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
};

export const generateToken = (userId: string) => {
  const exp = Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXP!);
  var token = jwt.sign({ userId, exp }, process.env.JWT_SECRET!);
  return token;
};

export const trycatch = (handler: RequestHandler) => (
  ...args: [Request, Response, NextFunction]
) => handler(...args).catch(args[2]);

export const extractToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET!);
      const decoded = jwt.decode(token, { complete: true });

      req.headers.userId = (decoded as any).payload.userId;

      next();
    } catch (error) {
      throw new Unauthorized();
    }
  } else {
    throw new Unauthorized();
  }
  return null;
};

// export const generateRefreshToken = async (token: string, userId: string) => {
//   try {
//     const refreshToken = generateGuid();
//     // let dateNow = new Date();
//     // const expiredAt = dateNow.setDate(dateNow.getDate() + 1);

//     await Refresh.create({
//       refreshToken,
//       token,
//       isValid: true,
//       userId
//     });
//     return refreshToken;
//   } catch (error) {
//     throw new BadRequest("Cannot generate refresh token");
//   }
// };
