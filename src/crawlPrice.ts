import cron from "node-cron";

import { PortfolioDB } from "./v1/model/portfolio";

import { IMarket, MarketDB, marketType } from "./v1/model/market";
import { HistoryPortfolioDB } from "./v1/model/historyPortfolio";
import Axios from "axios";
import { load, html } from "cheerio";
import moment from "moment-timezone";
import { FundDB } from "./v1/model/fund";
console.log(moment().format("YYYY-MM-DD HH:MM a"));

export const task = cron.schedule(
  "20 21 * * *",
  async () => {
    if (process.env.NODE_ENV == "production") {
      if (moment().isoWeekday() !== 6 && moment().isoWeekday() !== 7) {
        console.log(`Runing a job at ${moment().format("YYYY-MM-DD HH:MM a")}`);
        console.log("Getting latest market price");
        await getLatestMarket();
        console.log("Calculating profit");
        await calcPortfolioProfit();
      }
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
    const netProfit =
      (todayAmount - fund?.initialAmount!) / fund?.initialAmount!;

    const historyPortfolioDB = new HistoryPortfolioDB();
    if (await historyPortfolioDB.checkExist(el._id)) {
      await historyPortfolioDB.updateHistoryPortfolio(el._id, netProfit);
    } else {
      await historyPortfolioDB.createHistoryPortfolio(el._id, netProfit);
    }
  });
  // await getLatestMarket();
  return "asda";
}

async function getLatestMarket() {
  const marketDB = new MarketDB();
  const marketList = await marketDB.getList();

  await Promise.all(
    marketList.map(async (market) => {
      console.log(market.quote);
      const closingPrice = await getQuotePrice(market.type, market.quote!);
      await updateMarketPrice(market._id, closingPrice);
    })
  );
}

async function getQuotePrice(type: marketType, quote: string): Promise<number> {
  return new Promise(async (resolve) => {
    // fetch(`https://finance.yahoo.com/quote/${quote}/`).then(async (res) => {
    //   const $ = load(await res.text(), { xmlMode: true });
    //   //   const str = $("script[type='text/javascript']")[0].children[0].data;
    //   const price = parseFloat(
    //     $("#quote-header-info").find("span[data-reactid='32']").text()
    //   );
    //   //   const strreg = str.match(/DARLA_CONFIG = ([^;]*);/)[1];
    //   //   console.log(strreg);
    //   //   var months = JSON.parse(strreg);
    //   console.log(price);

    //   resolve(price);
    // });
    let marketT;
    switch (type) {
      case marketType.ETF:
        marketT = "etfs";
        break;

      case marketType.STOCK:
        marketT = "equities";
        break;
      case marketType.INDEX:
        marketT = "indices";
        break;

      default:
        break;
    }

    Axios.get(`https://www.investing.com/${marketT}/${quote}`).then((res) => {
      const $ = load(res.data, { xmlMode: true });

      const price = parseFloat(
        $(".overViewBox.instrument").find("#last_last").text()
      );

      console.log(price);
      resolve(price);
    });
  });
}
