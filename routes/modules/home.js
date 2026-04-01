// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()

const randomURL = require('../../randomURL')
const ShortUrl = require('../../models/shorturl') // 載入 shorturl model


// 定義首頁路由
router.get('/', (req, res) => {
  res.render('index')
})


router.post('/shortURL', async (req, res) => {
  const userInput = (req.body.inputURL || '').trim() // 從 req.body 拿出表單裡的 inputURL 資料
  if (!userInput) {
    return res.render('index', { errorMessage: '請輸入網址' })
  }

  // 自動補上 protocol，避免輸入 "google.com" 直接重導失敗
  const origlUrl = /^https?:\/\//i.test(userInput)
    ? userInput
    : `http://${userInput}`

  try {
    // 在 MongoDB 中查詢對應的 shortenedUrl
    let result = await ShortUrl.findOne({ originalUrl: origlUrl })

    if (!result) {
      // 找不到則生成短網址並存入資料庫，碰撞時重試
      let shortnumber
      for (let i = 0; i < 5; i++) {
        shortnumber = randomURL()
        const exists = await ShortUrl.findOne({ shortenedUrl: shortnumber })
        if (!exists) break
        shortnumber = null
      }
      if (!shortnumber) throw new Error('無法生成唯一短碼，請稍後再試')
      result = await ShortUrl.create({ originalUrl: origlUrl, shortenedUrl: shortnumber })
    }

    return res.render('index', { shortnumber: result.shortenedUrl, origlUrl })
  } catch (err) {
    console.error(err)
    return res.render('index', { errorMessage: '發生錯誤，請稍後再試' })
  }
})



router.get('/:shortenedUrl', async (req, res) => {
  const shortenedUrl = req.params.shortenedUrl

  try {
    // 從資料庫中查找原始網址
    const result = await ShortUrl.findOne({ shortenedUrl })

    if (result) {
      return res.redirect(result.originalUrl)
    } else {
      return res.render('index', { errorMessage: '找不到對應的短網址' })
    }
  } catch (err) {
    console.error(err)
    return res.render('index', { errorMessage: '發生錯誤，請稍後再試' })
  }
})


// 匯出路由模組
module.exports = router