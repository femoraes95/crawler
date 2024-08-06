const express = require("express");
const puppeteer = require("puppeteer");
const { crawlPage } = require("./crawler");

const app = express();

const url =
  "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao";

app.get("/crawl/:cnpj", async (req, res) => {
  const { cnpj } = req.params;
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage({});
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Simular a digitação do CNPJ no campo apropriado
    await page.type("#cnpj", cnpj, { delay: 100 }); // Supondo que o campo tenha o id 'cnpj'
    // await page.click("#submit"); // Supondo que o botão de submit tenha o id 'submit'
    // await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Aqui você pode modificar conforme necessário para extrair as informações desejadas
    // Por exemplo, para extrair o título da página:
    const title = await page.title();

    res.json({
      title,
    });
  } catch (error) {
    console.error("Error fetching the URL:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

crawlPage("48700529000144");

module.exports = app;
