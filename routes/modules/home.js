// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()

const randomURL = require('../../randomURL')
const ShortUrl = require('../../models/shorturl') // 載入 shorturl model


// 定義首頁路由
router.get('/', (req, res) => {
  res.render('index')
})


router.post('/shortURL', (req, res) => {
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
      // 生成短網址
      const shortnumber = `${randomURL()}`;
      
      return ShortUrl.create({ originalUrl : origlUrl , shortenedUrl : shortnumber })     // 存入資料庫
        // .then(() => res.redirect('/')) // 新增完成後導回首頁 //結果居然使用render重新導回就好
        .then(() => res.render('index' , {  shortnumber : shortnumber , origlUrl : origlUrl})) // 新增完成後導回首頁
        .catch(error => console.log(error))
    }
  });


})



router.get('/:shortenedUrl', (req, res) => {
  // console.log('進入短網址',req.params);
  
  const URL = req.params.shortenedUrl;

  // 從資料庫中查找原始網址
  ShortUrl.findOne({ shortenedUrl : URL }, (err, result) => {
    
    if (err) {
      // 處理錯誤
      console.error(err);
      return;
    }
    if (result) {
      
      
      // console.log('對應的原始網址：', result.originalUrl); 
      res.redirect(result.originalUrl)

    } else {

      // console.log('找不到對應的原始網址');
      res.render('index')
      
    }
  }); 
});


// 匯出路由模組
module.exports = router