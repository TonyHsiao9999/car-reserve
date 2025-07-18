# LTC Car Bot

自動預約新北市長照交通接送平台的程式。

## 功能說明

- 自動登入系統
- 自動填寫預約資訊
- 自動選擇預約時間
- 支援定期執行

## 預約條件

- 每週一與週四
- 16:40 從亞東紀念醫院 → 板橋中正路

## 部署說明

### 本地執行

1. 安裝依賴：
   ```bash
   npm install
   ```

2. 設定環境變數：
   建立 `.env` 檔案，內容如下：
   ```
   LTC_ID_NUMBER=您的身分證號碼
   LTC_PASSWORD=您的密碼
   ```

3. 執行程式：
   ```bash
   node bot.js
   ```

### Zeabur 部署

1. 在 Zeabur 上建立新專案
2. 選擇 Docker 部署方式
3. 設定環境變數：
   - `LTC_ID_NUMBER`
   - `LTC_PASSWORD`
4. 設定 Cron Job：
   - Schedule: `0 0 * * 1,4`（每週一和週四執行）
   - Command: `npm start`

## 注意事項

- 請確保環境變數正確設定
- 建議定期檢查程式執行狀態
- 如遇到問題，請查看錯誤日誌
