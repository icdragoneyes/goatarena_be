const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const crypto = require("crypto");
const fetch = require("node-fetch");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Enable stealth mode
puppeteer.use(StealthPlugin());
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function scrapeDexScreener() {
  const browser = await puppeteer.launch({ headless: false });
  //const browser = await puppeteer.launch({
  //headless: true, // Try headless with stealth plugin
  //args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //});
  //const cookies = JSON.parse(fs.readFileSync("cookies.json"));

  const page = await browser.newPage();
  //await page.setCookie(...cookies);
  try {
    console.log("Navigating to DexScreener...");
    await page.goto(
      "https://dexscreener.com/solana/raydium?rankBy=trendingScoreH6&order=desc",
      {
        waitUntil: "networkidle2",
      }
    );
    await sleep(6000);
    // Continue scraping after bypassing bot detection
    const cont = await page.content();
    console.log(cont, "<<<<cont");
    await page.waitForSelector("div.ds-dex-table.ds-dex-table-top");

    const dexData = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "a.ds-dex-table-row.ds-dex-table-row-top"
      );
      return Array.from(rows).map((row) => {
        const href = row.getAttribute("href") || "";
        const contractAddress = href.split("/").pop();
        return {
          rank:
            row
              .querySelector(".ds-dex-table-row-badge-pair-no")
              ?.innerText.trim() || "N/A",
          tokenPair:
            row
              .querySelector(".ds-dex-table-row-base-token-symbol")
              ?.innerText.trim() +
            " / " +
            row
              .querySelector(".ds-dex-table-row-quote-token-symbol")
              ?.innerText.trim(),
          price:
            row
              .querySelector(".ds-dex-table-row-col-price")
              ?.innerText.trim() || "N/A",
          age:
            row
              .querySelector(".ds-dex-table-row-col-pair-age span")
              ?.innerText.trim() || "N/A",
          txns:
            row.querySelector(".ds-dex-table-row-col-txns")?.innerText.trim() ||
            "N/A",
          volume:
            row
              .querySelector(".ds-dex-table-row-col-volume")
              ?.innerText.trim() || "N/A",
          liquidity:
            row
              .querySelector(".ds-dex-table-row-col-liquidity")
              ?.innerText.trim() || "N/A",
          marketCap:
            row
              .querySelector(".ds-dex-table-row-col-market-cap")
              ?.innerText.trim() || "N/A",
          contractAddress: contractAddress || "N/A",
        };
      });
    });

    console.log("Scraped Data:", dexData);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    await browser.close();
  }
}

module.exports = {
  scrapeDexScreener,
};
