import jwt from "jsonwebtoken";
// import { Refresh } from "../models/Refresh";
import { BadRequest, Unauthorized } from "./response";
import { RequestHandler, Request, Response, NextFunction } from "express";
import Joi, { ValidationError } from "@hapi/joi";
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
  // const exp = Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXP!);
  var token = jwt.sign({ userId }, process.env.JWT_SECRET!);
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
  let token = "";
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      next(new Unauthorized());
    }
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    const decoded = jwt.decode(token, { complete: true });
    console.log(decoded);
    req.headers.userId = (decoded as any).payload.userId;
    next();
  } catch (error) {
    next(new Unauthorized());
  }
  return null;
};

export async function validateRequest<T>(
  schema: Joi.Schema,
  request: T
): Promise<T> {
  try {
    await schema.validate(request, { abortEarly: false });
    return request;
  } catch (error) {
    throw new BadRequest(error);
  }
}

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
