const express = require('express')
const exphbs = require("express-handlebars")

const routes = require('./routes')
require('./config/mongoose')

const app = express()

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs"}))
app.set("view engine", "hbs")

// setting body-parser
app.use(express.urlencoded({ extended: true }))
// 將 request 導入路由器
app.use(routes)

app.listen(3000, () => {
  console.log('App is running on http://localhost:3000')
})


