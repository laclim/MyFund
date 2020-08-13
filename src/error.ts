import { BadRequest } from "./v1/response";

export enum ErrorStatus {
  USER_DEAVTIVATE = "USER_DEAVTIVATE",
  USER_NOT_ACTIVE = "USER_NOT_ACTIVE",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  MARKET_CODE_EXIST = "MARKET_CODE_EXIST",
  INVALID_MARKET_COL = "INVALID_MARKET_COL",
}

export interface IStatus {
  statusCode: number;
  statusMessage: string;
}

export class Status {
  statusList: IStatus[];
  constructor(statusList = []) {
    this.statusList = statusList;
  }
  addStatus(message: ErrorStatus): void {
    let status: IStatus = {
      statusCode: 200,
      statusMessage: "success",
    };
    switch (message) {
      case ErrorStatus.USER_DEAVTIVATE:
        status = {
          statusCode: 1001,
          statusMessage: "user deactivate",
        };
        break;
      case ErrorStatus.USER_NOT_ACTIVE:
        status = {
          statusCode: 1002,
          statusMessage: "user deactivate",
        };
        break;
      case ErrorStatus.INVALID_CREDENTIALS:
        status = {
          statusCode: 1003,
          statusMessage: "email or password not correct",
        };
        break;
      case ErrorStatus.MARKET_CODE_EXIST:
        status = {
          statusCode: 1004,
          statusMessage: "market code already exist",
        };
        break;
      case ErrorStatus.INVALID_MARKET_COL:
        status = {
          statusCode: 1005,
          statusMessage: "market collection invalid",
        };
        break;

      default:
        break;
    }

    this.statusList.push(status);
  }

  getStatusList(): IStatus[] | [] {
    return this.statusList;
  }
}
