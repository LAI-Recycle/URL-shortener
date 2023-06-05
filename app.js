const express = require('express')
const mongoose = require('mongoose')
const exphbs = require("express-handlebars")
const randomURL = require('./randomURL')
const ShortUrl = require('./models/shorturl') // 載入 shorturl model

const routes = require('./routes')
const app = express()

// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // 設定連線到 mongoDB

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs"}))
app.set("view engine", "hbs")

// setting body-parser
app.use(express.urlencoded({ extended: true }))

// 將 request 導入路由器
app.use(routes)


app.listen(3000, () => {
  console.log('App is running on http://localhost:3000')
})


