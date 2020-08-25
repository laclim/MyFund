import cron from "node-cron";
import {} from "cheerio";
import { PortfolioDB } from "./v1/model/portfolio";

import { IMarket, MarketDB } from "./v1/model/market";
import { HistoryPortfolioDB } from "./v1/model/historyPortfolio";
import Axios from "axios";
import { load, html } from "cheerio";
import moment from "moment-timezone";
import { FundDB } from "./v1/model/fund";

console.log(moment().format("YYYY-MM-DD HH:MM"));
export const task = cron.schedule(
  "30 21 * * *",
  async () => {
    if (moment().isoWeekday() !== 6 || moment().isoWeekday() !== 7) {
      console.log("Runing a job at 16:30 at America/New York timezone");
      console.log("Getting latest market price");
      await getLatestMarket();
      console.log("Calculating profit");
      await calcPortfolioProfit();
    }
  },
  {
    scheduled: true,
  }
);

async function updateMarketPrice(market: IMarket["_id"], closingPrice: number) {
  const marketDB = new MarketDB();
  const doc = await marketDB.updateMarketPrice(market, {
    date: moment().format("YYYY-MM-DD"),
    closingPrice,
  });
  return doc;
}

export async function calcPortfolioProfit() {
  // loop through all the portfolio
  const marketDB = new MarketDB();
  const portfolioDB = new PortfolioDB();
  const portfolioList = await portfolioDB.getList();
  portfolioList.forEach(async (el) => {
    const fundDB = new FundDB();
    let portfolioProfit = 0;
    for (let p of el.marketPortfolio!) {
      const closingPrice = await marketDB.getLatestPrice(p.market);
      if (closingPrice) {
        portfolioProfit += +(closingPrice * p.volume).toFixed(4);
      }
    }
    const fund = await fundDB.getFundByPortfolioID(el._id);
    const todayAmount = fund?.amount! + portfolioProfit;
    const netProfit = (todayAmount - fund?.initialAmount!) / todayAmount;

    const historyPortfolioDB = new HistoryPortfolioDB();
    if (await historyPortfolioDB.checkExist(el._id)) {
      await historyPortfolioDB.updateHistoryPortfolio(el._id, netProfit);
    } else {
      await historyPortfolioDB.createHistoryPortfolio(el._id, netProfit);
    }
  });
  await getLatestMarket();
  return "asda";
}

async function getLatestMarket() {
  const marketDB = new MarketDB();
  const marketList = await marketDB.getList();
  for (let market of marketList) {
    console.log(market.quote);
    const closingPrice = await getQuotePrice(market.quote!);
    await updateMarketPrice(market._id, closingPrice);
  }
}

async function getQuotePrice(quote: string): Promise<number> {
  return new Promise(async (resolve) => {
    Axios.get(`https://finance.yahoo.com/quote/${quote}/`, {
      responseType: "document",
    }).then((res) => {
      const $ = load(res.data, { xmlMode: true });
      //   const str = $("script[type='text/javascript']")[0].children[0].data;
      const price = parseFloat(
        $("#quote-header-info").find("span[data-reactid='32']").text()
      );
      //   const strreg = str.match(/DARLA_CONFIG = ([^;]*);/)[1];
      //   console.log(strreg);
      //   var months = JSON.parse(strreg);
      console.log(price);

      resolve(price);
    });
  });
}
