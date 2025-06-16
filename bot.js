require('dotenv').config();
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  });
  const page = await browser.newPage();

  try {
    console.log("🔐 開始開啟網站...");
    await page.goto('https://www.ntpc.ltc-car.org/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.click('a[href="/Home/Login"]');
    await page.waitForSelector('input#IDNumber', { timeout: 10000 });
    await page.type('input#IDNumber', process.env.ID_NUMBER);
    await page.type('input#password', process.env.PASSWORD);

    await page.click('a.button-fill:nth-child(2)');
    await page.waitForSelector('span.dialog-button', { timeout: 10000 });
    await page.click('span.dialog-button');

    await page.click('a.link:nth-child(2)');

    await page.select('select#pickUp_location', '1');
    await page.fill('input#pickUp_address_text', '亞東紀念醫院');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    await page.click('.location:nth-child(1) > label');

    await page.select('select#getOff_location', '0');
    await page.select('select#getOff_address', '新北市板橋區中正路1巷18號');

    const options = await page.$$('select#appointment_date option');
    if (options.length >= 13) {
      const value = await options[12].getAttribute('value');
      await page.select('select#appointment_date', value);
    }

    await page.select('select#appointment_hour', '16');
    await page.select('select#appointment_minutes', '40');

    await page.click('.form_item:nth-child(6) .cus_checkbox_type1:nth-child(2) > div');
    await page.select('#accompany_label', '1');
    await page.click('.form_item:nth-child(10) .cus_checkbox_type1:nth-child(2) > div');
    await page.click('.form_item:nth-child(11) .cus_checkbox_type1:nth-child(1) > div');
    await page.click('.form_item:nth-child(12) .cus_checkbox_type1:nth-child(2) > div');

    await page.click('.page_bottom > .button');
    await page.click('button.button-fill:nth-child(2)');

    console.log('✅ 預約完成！');
  } catch (error) {
    console.error('❌ 發生錯誤：', error.message);
    console.error('錯誤堆疊：', error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
