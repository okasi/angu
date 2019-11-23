const puppeteer = require("puppeteer");
const otcsv = require("objects-to-csv");
const cheerio = require("cheerio");
const _ = require("lodash");
async function run() {
  try {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.goto("https://www.forebet.com/en/value-bets", {
      waitUntil: "networkidle0",
      timeout: 60000
    });
    await page.screenshot({
      path: "valueBets.png",
      fullPage: true
    });
    const html = await page.content();
    const $ = cheerio.load(html);
    const valueBets = [];
    const tableRows = $("table.schema > tbody > .tr_1,.tr_0");
    tableRows.each(function() {
      const data = $(this).html();
      const homeTeam = $(this)
        .find(".homeTeam > span")
        .text();
      const awayTeam = $(this)
        .find(".awayTeam > span")
        .text();
      const date = $(this)
        .find(".date_bah")
        .text();
      let league = $(this)
        .find(".shortagDiv.tghov")
        .attr("onclick");
      if (league !== null && typeof league !== "undefined") {
        league = league
          .replace("getstag(this,", "")
          .replace(")", "")
          .split(",")[2]
          .replace("'", "")
          .replace("'", "")
          .trim();
      }
      const tdArr = $(this)
        .find("td")
        .toArray();
      const homeTeamWinProbability = $(tdArr[1]).text();
      const drawProbability = $(tdArr[2]).text();
      const awayTeamWinProbability = $(tdArr[3]).text();
      if (
        homeTeam &&
        awayTeam &&
        date &&
        league &&
        homeTeamWinProbability &&
        drawProbability &&
        awayTeamWinProbability
      ) {
        valueBets.push({
          homeTeam,
          awayTeam,
          date: Date(date),
          league,
          homeTeamWinProbability: Number(homeTeamWinProbability),
          drawProbability: Number(drawProbability),
          awayTeamWinProbability: Number(awayTeamWinProbability)
        });
      }
    });
    console.log(JSON.stringify(valueBets, null, 2));
    const csv = new otcsv(valueBets);
    await csv.toDisk("./valueBets.csv");
    browser.close();
  } catch (e) {
    console.log(e);
  }
}

run();
