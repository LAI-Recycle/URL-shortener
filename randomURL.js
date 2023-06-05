
function randomURL() {
  //定義變數
  const numberpool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let collectionnumberpool = []
  collectionnumberpool = numberpool.split('')

  //隨機抽取 5 碼英數組合
  let randomnumber = ''
  for(let i = 0 ; i < 5 ; i++ ){
    //儲存
    const index = Math.floor(Math.random() * collectionnumberpool.length)
    randomnumber += collectionnumberpool[index]
  }
  //輸出
  return randomnumber
}

// export generatePassword function for other files to use

module.exports = randomURL
