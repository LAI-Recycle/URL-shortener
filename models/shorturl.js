const mongoose = require('mongoose')
const Schema = mongoose.Schema
const shorturlSchema = new Schema({
  originalUrl: {
    type: String, // 資料型別是字串
    required: true // 這是個必填欄位
  },
 shortenedUrl: {
    type: String,
    required: true
  }
})
module.exports = mongoose.model('ShortUrl', shorturlSchema)



