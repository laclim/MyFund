import { BadRequest } from "./v1/response";

export enum ErrorStatus {
  USER_DEAVTIVATE = "USER_DEAVTIVATE",
  USER_NOT_ACTIVE = "USER_NOT_ACTIVE",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  MARKET_CODE_EXIST = "MARKET_CODE_EXIST",
  INVALID_MARKET_COL = "INVALID_MARKET_COL",
  NO_RECORD_FOUND = "NO_RECORD_FOUND",
  INVEST_NOT_VALID = "INVEST_NOT_VALID",
  PORTFOLIO_AMOUNT_NOT_MATCH = "PORTFOLIO_AMOUNT_NOT_MATCH",
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
      case ErrorStatus.NO_RECORD_FOUND:
        status = {
          statusCode: 1006,
          statusMessage: "no record found",
        };
        break;
      case ErrorStatus.INVEST_NOT_VALID:
        status = {
          statusCode: 1007,
          statusMessage: "possible not enough amount",
        };
        break;
      case ErrorStatus.PORTFOLIO_AMOUNT_NOT_MATCH:
        status = {
          statusCode: 1008,
          statusMessage:
            "does not match your portfolio amount or you dont own this market",
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
