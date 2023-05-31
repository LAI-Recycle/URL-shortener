const express = require('express')
const mongoose = require('mongoose')
const exphbs = require("express-handlebars")
const randomURL = require('./randomURL')
const ShortUrl = require('./models/shorturl') // 載入 shorturl model

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


// 首頁
app.get("/", (req, res) => {
  res.render("index")
})


app.post('/shortURL', (req, res) => {
  const origlUrl = req.body.inputURL       // 從 req.body 拿出表單裡的 inputURL 資料
  console.log('options', origlUrl)


    // 在 MongoDB 中查詢對應的 shortenedUrl
  ShortUrl.findOne({ originalUrl: origlUrl }, (err, result) => {
    if (err) {
      // 處理錯誤
      console.error(err);
      return;
    }

    if (result) {
      // 顯示對應的 shortenedUrl
      console.log('對應的 shortenedUrl：', result.shortenedUrl);
      return res.render('index' , {  shortnumber : result.shortenedUrl , origlUrl : origlUrl})

    } else {

      console.log('找不到對應的 shortenedUrl');
      const shortnumber = randomURL()
      return ShortUrl.create({ originalUrl : origlUrl , shortenedUrl : shortnumber })     // 存入資料庫
        // .then(() => res.redirect('/')) // 新增完成後導回首頁 //結果居然使用render重新導回就好
        .then(() => res.render('index' , {  shortnumber : shortnumber , origlUrl : origlUrl})) // 新增完成後導回首頁
        .catch(error => console.log(error))
    }
  });


})


app.listen(3000, () => {
  console.log('App is running on http://localhost:3000')
})


