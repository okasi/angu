const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const otcsv = require("objects-to-csv");
const _ = require("lodash");

async function foreBet() {
  try {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    const url = "https://www.forebet.com/en/value-bets";
    console.log("going to: " + url);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000
    });
    console.log("☑️ " + url);
    // await page.screenshot({
    //   path: "valueBets.png",
    //   fullPage: true
    // });
    const html = await page.content();
    const $ = cheerio.load(html);
    const predictions = [];
    const predictionRows = $("table.schema > tbody > .tr_1,.tr_0");
    predictionRows.each(function() {
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
        predictions.push({
          homeTeam,
          awayTeam,
          date,
          league,
          homeTeamWinProbability: Number(homeTeamWinProbability),
          drawProbability: Number(drawProbability),
          awayTeamWinProbability: Number(awayTeamWinProbability)
        });
      }
    });

    // console.log(JSON.stringify(predictions, null, 2));
    const csv = new otcsv(predictions);
    await csv.toDisk("./valueBets.csv");
    browser.close();
    return predictions;
  } catch (e) {
    console.log(e);
  }
}

async function kickOff() {
  try {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    const url = "https://kickoff.ai/matches";
    console.log("going to: " + url);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000
    });
    console.log("☑️ " + url);

    try {
      await page.waitForSelector(".btn.btn-secondary.btn-block.mt-5", {
        timeout: 5000
      });
      await page.click(".btn.btn-secondary.btn-block.mt-5");
      await page.waitFor(5000);
      await page.waitForSelector(".btn.btn-secondary.btn-block.mt-5", {
        timeout: 5000
      });
      await page.click(".btn.btn-secondary.btn-block.mt-5");
      await page.waitFor(5000);
      await page.waitForSelector(".btn.btn-secondary.btn-block.mt-5", {
        timeout: 5000
      });
      await page.click(".btn.btn-secondary.btn-block.mt-5");
    } catch {}

    const html = await page.content();
    const $ = cheerio.load(html);
    const predictions = [];
    const predictionRows = $(".prediction.prediction-fixture");
    predictionRows.each(function() {
      const homeTeam = $(this)
        .find(".team-home > .team-name")
        .text();
      const awayTeam = $(this)
        .find(".team-away > .team-name")
        .text();
      const homeTeamWinProbability = $(this)
        .find(".prediction-win-home")
        .text()
        .replace("%", "");
      const drawProbability = $(this)
        .find(".prediction-draw")
        .text()
        .replace("%", "");
      const awayTeamWinProbability = $(this)
        .find(".prediction-win-away")
        .text()
        .replace("%", "");
      const date = $(this)
        .find(".match-time-list")
        .text();

      if (
        homeTeam &&
        awayTeam &&
        date &&
        homeTeamWinProbability &&
        drawProbability &&
        awayTeamWinProbability
      ) {
        predictions.push({
          homeTeam,
          awayTeam,
          date,
          homeTeamWinProbability: Number(homeTeamWinProbability),
          drawProbability: Number(drawProbability),
          awayTeamWinProbability: Number(awayTeamWinProbability)
        });
      }
    });

    // console.log(JSON.stringify(predictions, null, 2));
    const csv = new otcsv(predictions);
    await csv.toDisk("./kickOff.csv");
    browser.close();
    return predictions;
  } catch (e) {
    console.log(e);
  }
}

async function findMatches(foreBetPreds, kickOffPreds) {
  let matches = [];
  _.forEach(kickOffPreds, kickOffValue => {
    _.filter(
      foreBetPreds,
      p => _.includes(p.homeTeam, kickOffValue.homeTeam) && matches.push(p)
    );
  });
  let matchesToRemove = [];
  _.filter(matches, m => {
    if (
      m.homeTeamWinProbability < 50 &&
      m.drawProbability < 50 &&
      m.awayTeamWinProbability < 50
    ) {
      matchesToRemove.push(m);
    }
  });
  const cleanMatches = _.difference(matches, matchesToRemove);
  console.log(cleanMatches);
  const csv = new otcsv(cleanMatches);
  await csv.toDisk("./potentialBets.csv");
  return cleanMatches;
}

const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const dateTime = require("node-datetime");

app.use(cors());
app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});
app.listen(8080);

async function main() {
  const foreBetPreds = await foreBet();
  const kickOffPreds = await kickOff();

  app.get("/bets", async (req, res) => {
    return res.send(await findMatches(foreBetPreds, kickOffPreds));
  });

  const lastupdate = {
    lastupdate: dateTime.create().format("Y-m-d H:M:S")
  };

  app.get("/lastupdate", async (req, res) => {
    return res.send(lastupdate);
  });
}

main();

setInterval(async () => {
  main();
}, 43200000);
