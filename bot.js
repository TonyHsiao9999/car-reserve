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

    // 等待頁面完全載入
    await page.waitForTimeout(5000);

    // 檢查並點擊登入按鈕
    console.log("🔍 尋找登入按鈕...");
    const loginButton = await page.waitForSelector('a[href="/Home/Login"], .login-button, .button-fill', { 
      timeout: 10000,
      visible: true 
    });
    
    if (loginButton) {
      console.log("✅ 找到登入按鈕，準備點擊...");
      await loginButton.click();
    } else {
      throw new Error("找不到登入按鈕");
    }

    // 等待登入表單載入
    console.log("⏳ 等待登入表單載入...");
    await page.waitForSelector('input#IDNumber', { 
      timeout: 10000,
      visible: true 
    });

    // 輸入登入資訊
    console.log("📝 輸入登入資訊...");
    await page.type('input#IDNumber', process.env.LTC_ID_NUMBER);
    await page.type('input#password', process.env.LTC_PASSWORD);

    // 點擊登入
    console.log("🔑 點擊登入...");
    await page.click('a.button-fill:nth-child(2)');
    
    // 等待登入成功
    console.log("⏳ 等待登入成功...");
    await page.waitForSelector('span.dialog-button', { 
      timeout: 10000,
      visible: true 
    });
    await page.click('span.dialog-button');

    // 點擊預約連結
    console.log("📅 準備預約...");
    await page.click('a.link:nth-child(2)');

    // 填寫預約資訊
    console.log("📝 填寫預約資訊...");
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
    
    // 在錯誤發生時截圖
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 已儲存錯誤截圖');
    } catch (screenshotError) {
      console.error('無法儲存錯誤截圖：', screenshotError);
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
