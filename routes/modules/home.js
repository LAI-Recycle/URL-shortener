// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()

const { dbState } = require('../../config/mongoose')
const randomURL = require('../../randomURL')

function renderIndex(res, viewModel = {}) {
  return res.render('index', {
    databaseUnavailable: !dbState.ready,
    databaseMessage: dbState.reason,
    ...viewModel
  })
}

function getShortUrlModel() {
  try {
    return require('../../models/shorturl')
  } catch (error) {
    console.error(error)
    dbState.ready = false
    dbState.reason = '資料模型載入失敗，縮網址功能已停用。'
    return null
  }
}

function requireDatabase(res, viewModel = {}) {
  if (!dbState.ready) {
    renderIndex(res, {
      errorMessage: '資料庫未連線，現在只能開啟首頁，無法使用縮網址功能。',
      ...viewModel
    })
    return null
  }

  const ShortUrl = getShortUrlModel()

  if (!ShortUrl) {
    renderIndex(res, {
      errorMessage: '資料模型載入失敗，現在只能開啟首頁，無法使用縮網址功能。',
      ...viewModel
    })
    return null
  }

  return ShortUrl
}

// 定義首頁路由
router.get('/', (req, res) => {
  renderIndex(res)
})


router.post('/shortURL', async (req, res) => {
  const userInput = (req.body.inputURL || '').trim() // 從 req.body 拿出表單裡的 inputURL 資料
  if (!userInput) {
    return renderIndex(res, { errorMessage: '請輸入網址' })
  }

  // 自動補上 protocol，避免輸入 "google.com" 直接重導失敗
  const origlUrl = /^https?:\/\//i.test(userInput)
    ? userInput
    : `http://${userInput}`

  const ShortUrl = requireDatabase(res, { origlUrl })
  if (!ShortUrl) return

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

    return renderIndex(res, { shortnumber: result.shortenedUrl, origlUrl })
  } catch (err) {
    console.error(err)
    return renderIndex(res, { errorMessage: '發生錯誤，請稍後再試', origlUrl })
  }
})



router.get('/:shortenedUrl', async (req, res) => {
  const shortenedUrl = req.params.shortenedUrl

  const ShortUrl = requireDatabase(res)
  if (!ShortUrl) return

  try {
    // 從資料庫中查找原始網址
    const result = await ShortUrl.findOne({ shortenedUrl })

    if (result) {
      return res.redirect(result.originalUrl)
    } else {
      return renderIndex(res, { errorMessage: '找不到對應的短網址' })
    }
  } catch (err) {
    console.error(err)
    return renderIndex(res, { errorMessage: '發生錯誤，請稍後再試' })
  }
})


// 匯出路由模組
module.exports = router
