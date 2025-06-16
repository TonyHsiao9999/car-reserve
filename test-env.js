require('dotenv').config();

console.log('環境變數檢查：');
console.log('ID_NUMBER 是否設定：', process.env.ID_NUMBER ? '是' : '否');
console.log('PASSWORD 是否設定：', process.env.PASSWORD ? '是' : '否');

if (!process.env.ID_NUMBER || !process.env.PASSWORD) {
  console.error('❌ 錯誤：環境變數未正確設定');
  process.exit(1);
} else {
  console.log('✅ 環境變數設定正確');
} 