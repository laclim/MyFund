import { ErrorStatus, Status, IStatus } from "../error";
import { Response } from "express";
import { nextTick } from "process";
abstract class HttpError extends Error {
  public status!: number;
}
export class BadRequest extends HttpError {
  constructor(message = "Bad Request") {
    super(message);
    this.status = 400;
  }
}

export class Unauthorized extends HttpError {
  constructor(message = "Unauthorized") {
    super(message);
    this.status = 401;
  }
}

export function DataResponse(
  res: Response,
  statusList: IStatus[],
  data?: object | null,
  message?: string | null
) {
  if (!statusList.length) {
    res.json({ statusList, data });
  } else res.status(400).json({ statusList, data, message });
  return null;
}
