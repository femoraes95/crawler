const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function crawlPage(cnpj) {
  const url =
    "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao";
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true, // Abre o DevTools automaticamente
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-running-insecure-content",
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--mute-audio",
        "--no-zygote",
        "--no-xshm",
        "--window-size=1920,1080",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--enable-webgl",
        "--ignore-certificate-errors",
        "--lang=pt-BR,pt;q=0.9",
        "--password-store=basic",
        "--disable-gpu-sandbox",
        "--disable-software-rasterizer",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-infobars",
        "--disable-breakpad",
        "--disable-canvas-aa",
        "--disable-2d-canvas-clip-aa",
        "--disable-gl-drawing-for-tests",
        "--enable-low-end-device-mode",
      ],
      userDataDir: "./user_data", // Persistir o perfil do navegador
    });

    const page = await browser.newPage();

    // Configurar o user agent para parecer um navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    );

    // Setar propriedades do navegador para evitar detecção
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(window, "outerWidth", {
        get: () => window.innerWidth,
      });
      Object.defineProperty(window, "outerHeight", {
        get: () => window.innerHeight,
      });
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("#cnpj"); // Esperar o campo de CNPJ aparecer

    // Simular rolagem suave
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Simular clique aleatório
    const elements = await page.$$("button");
    const randomButton = elements[Math.floor(Math.random() * elements.length)];
    await randomButton.focus();

    // Mover o mouse até o campo de CNPJ
    await page.mouse.move(0, 1);

    await page.click("#cnpj"); // Focar no campo de CNPJ

    // Simular a digitação do CNPJ no campo apropriado com atrasos aleatórios
    for (const char of cnpj) {
      await page.type("#cnpj", char, { delay: Math.random() * 200 + 50 }); // Atraso aleatório entre 50ms e 150ms
    }

    // Identificar o tipo de CAPTCHA
    const captchaType = await page.evaluate(() => {
      const recaptcha = document.querySelector(".g-recaptcha");
      const hcaptcha = document.querySelector(".h-captcha");
      if (recaptcha) {
        return "reCAPTCHA";
      } else if (hcaptcha) {
        return "hCaptcha";
      } else {
        return "Unknown";
      }
    });

    console.log(`CAPTCHA Type: ${captchaType}`);

    // Obter as coordenadas do botão
    const buttonElement = await page.$("#continuar");
    const { x, y } = await buttonElement.boundingBox();

    // Mover o mouse para um ponto próximo ao botão
    await page.mouse.move(x - 10, y - 10); // Ajustar as coordenadas conforme necessário

    // Simular um leve movimento em direção ao botão
    await page.mouse.move(x, y, { steps: 5 }); // 5 passos para um movimento mais suave

    // Clicar no botão
    await page.mouse.click(x, y);

    await page.click("#continuar"); // Clicar no botão de continuar

    // Aqui você pode modificar conforme necessário para extrair as informações desejadas
    // Por exemplo, para extrair o título da página:
    const title = await page.title();

    // await browser.close();

    return { title, captchaType };
  } catch (error) {
    console.error("Error fetching the URL:", error);
    throw new Error("Failed to fetch the URL");
  }
  // Não fecharemos o navegador aqui para permitir testes interativos
  // finally {
  //   if (browser) {
  //     await browser.close();
  //   }
  // }
}

module.exports = { crawlPage };
