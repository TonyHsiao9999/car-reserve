require('dotenv').config();
const puppeteer = require('puppeteer-core');
const fs = require('fs');

// 建立 Promise 版本的 setTimeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 除錯函數：截圖並儲存 HTML
async function debugPage(page, step) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const debugDir = 'debug';
    
    // 建立除錯目錄
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir);
    }

    // 儲存截圖
    await page.screenshot({ 
      path: `${debugDir}/screenshot-${step}-${timestamp}.png`,
      fullPage: true 
    });

    // 儲存 HTML
    const html = await page.content();
    fs.writeFileSync(`${debugDir}/html-${step}-${timestamp}.html`, html);

    console.log(`📸 已儲存除錯資訊：${step}`);
  } catch (error) {
    console.error('❌ 儲存除錯資訊失敗：', error);
  }
}

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
    await debugPage(page, 'initial-page');

    // 等待頁面完全載入
    console.log("⏳ 等待頁面載入...");
    await sleep(5000);

    // 檢查並點擊登入按鈕
    console.log("🔍 尋找登入按鈕...");
    const loginButton = await page.waitForSelector('a[href="/Home/Login"], .login-button, .button-fill', { 
      timeout: 10000,
      visible: true 
    });
    
    if (loginButton) {
      console.log("✅ 找到登入按鈕，準備點擊...");
      await loginButton.click();
      await debugPage(page, 'after-login-click');
    } else {
      throw new Error("找不到登入按鈕");
    }

    // 等待登入表單載入
    console.log("⏳ 等待登入表單載入...");
    await page.waitForSelector('input#IDNumber', { 
      timeout: 10000,
      visible: true 
    });
    await debugPage(page, 'login-form');

    // 輸入登入資訊
    console.log("📝 輸入登入資訊...");
    await page.type('input#IDNumber', process.env.LTC_ID_NUMBER);
    await page.type('input#password', process.env.LTC_PASSWORD);
    await debugPage(page, 'after-input-credentials');

    // 點擊登入
    console.log("🔑 點擊登入...");
    await page.click('a.button-fill:nth-child(2)');
    await debugPage(page, 'after-login-submit');
    
    // 等待登入成功
    console.log("⏳ 等待登入成功...");
    await page.waitForSelector('span.dialog-button', { 
      timeout: 10000,
      visible: true 
    });
    await page.click('span.dialog-button');
    await debugPage(page, 'after-login-success');

    // 等待頁面重新載入
    console.log("⏳ 等待頁面重新載入...");
    await sleep(5000);

    // 點擊預約連結
    console.log("📅 準備預約...");
    const reservationLink = await page.waitForSelector('a.link, a[href*="Reservation"], .reservation-link', {
      timeout: 10000,
      visible: true
    });

    if (reservationLink) {
      console.log("✅ 找到預約連結，準備點擊...");
      await reservationLink.click();
      await debugPage(page, 'after-reservation-click');
    } else {
      throw new Error("找不到預約連結");
    }

    // 等待預約頁面載入
    console.log("⏳ 等待預約頁面載入...");
    await sleep(10000);

    // 檢查是否在預約頁面
    console.log("🔍 檢查預約頁面...");
    const currentUrl = page.url();
    console.log("當前頁面 URL:", currentUrl);
    await debugPage(page, 'check-reservation-page');

    if (!currentUrl.includes('Reservation')) {
      console.log("⚠️ 不在預約頁面，嘗試重新導航...");
      await page.goto('https://www.ntpc.ltc-car.org/Reservation', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await sleep(5000);
      await debugPage(page, 'after-redirect');
    }

    // 填寫預約資訊
    console.log("📝 填寫預約資訊...");
    
    // 等待並檢查表單元素
    console.log("⏳ 等待表單元素載入...");
    await page.waitForSelector('select#pickUp_location', { 
      timeout: 30000,
      visible: true 
    }).catch(async (error) => {
      console.log("⚠️ 等待表單元素超時，嘗試重新整理頁面...");
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(5000);
      await debugPage(page, 'after-reload');
      return page.waitForSelector('select#pickUp_location', { 
        timeout: 30000,
        visible: true 
      });
    });

    await debugPage(page, 'before-form-fill');

    await page.select('select#pickUp_location', '1');
    
    await page.waitForSelector('input#pickUp_address_text', { 
      timeout: 30000,
      visible: true 
    });
    await page.fill('input#pickUp_address_text', '亞東紀念醫院');
    await page.keyboard.press('ArrowDown');
    await sleep(2000);
    
    const locationLabel = await page.waitForSelector('.location:nth-child(1) > label', { 
      timeout: 30000,
      visible: true 
    });
    if (locationLabel) {
      await locationLabel.click();
    }

    await page.waitForSelector('select#getOff_location', { 
      timeout: 30000,
      visible: true 
    });
    await page.select('select#getOff_location', '0');
    
    await page.waitForSelector('select#getOff_address', { 
      timeout: 30000,
      visible: true 
    });
    await page.select('select#getOff_address', '新北市板橋區中正路1巷18號');

    const options = await page.$$('select#appointment_date option');
    if (options.length >= 13) {
      const value = await options[12].getAttribute('value');
      await page.select('select#appointment_date', value);
    }

    await page.waitForSelector('select#appointment_hour', { 
      timeout: 30000,
      visible: true 
    });
    await page.select('select#appointment_hour', '16');
    
    await page.waitForSelector('select#appointment_minutes', { 
      timeout: 30000,
      visible: true 
    });
    await page.select('select#appointment_minutes', '40');

    await page.waitForSelector('.form_item:nth-child(6) .cus_checkbox_type1:nth-child(2) > div', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('.form_item:nth-child(6) .cus_checkbox_type1:nth-child(2) > div');
    
    await page.waitForSelector('#accompany_label', { 
      timeout: 30000,
      visible: true 
    });
    await page.select('#accompany_label', '1');
    
    await page.waitForSelector('.form_item:nth-child(10) .cus_checkbox_type1:nth-child(2) > div', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('.form_item:nth-child(10) .cus_checkbox_type1:nth-child(2) > div');
    
    await page.waitForSelector('.form_item:nth-child(11) .cus_checkbox_type1:nth-child(1) > div', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('.form_item:nth-child(11) .cus_checkbox_type1:nth-child(1) > div');
    
    await page.waitForSelector('.form_item:nth-child(12) .cus_checkbox_type1:nth-child(2) > div', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('.form_item:nth-child(12) .cus_checkbox_type1:nth-child(2) > div');

    await page.waitForSelector('.page_bottom > .button', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('.page_bottom > .button');
    
    await page.waitForSelector('button.button-fill:nth-child(2)', { 
      timeout: 30000,
      visible: true 
    });
    await page.click('button.button-fill:nth-child(2)');

    console.log('✅ 預約完成！');
  } catch (error) {
    console.error('❌ 發生錯誤：', error.message);
    console.error('錯誤堆疊：', error.stack);
    
    // 在錯誤發生時截圖
    try {
      await debugPage(page, 'error');
    } catch (screenshotError) {
      console.error('無法儲存錯誤截圖：', screenshotError);
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
