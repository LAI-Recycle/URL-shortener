// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const dbState = {
  ready: false,
  reason: 'MongoDB 未設定，縮網址功能已停用。'
}

const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
  console.log('MongoDB disabled: MONGODB_URI is not set.')
  module.exports = { dbState }
  return
}

let mongoose

try {
  mongoose = require('mongoose')
} catch (error) {
  dbState.reason = '找不到 mongoose 套件，縮網址功能已停用。'
  console.log(`MongoDB disabled: ${error.message}`)
  module.exports = { dbState }
  return
}

dbState.reason = 'MongoDB 連線中，縮網址功能暫時不可用。'
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // 設定連線到 mongoDB
  .catch((error) => {
    dbState.ready = false
    dbState.reason = 'MongoDB 連線失敗，縮網址功能已停用。'
    console.log(`mongodb error! ${error.message}`)
  })

// 取得資料庫連線狀態
const db = mongoose.connection

// 連線異常
db.on('error', (error) => {
  dbState.ready = false
  dbState.reason = 'MongoDB 連線失敗，縮網址功能已停用。'
  console.log(`mongodb error! ${error.message}`)
})
// 連線成功
db.once('open', () => {
  dbState.ready = true
  dbState.reason = null
  console.log('mongodb connected!')
})

module.exports = { dbState }
