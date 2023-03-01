const mongoose = require('mongoose')

const connect = () => {
    const url = 'mongodb://localhost:27017/my-data'
    mongoose.connect(url)
        .then(()=> {
            console.log('몽고디비 연결 성공')
        })
        .catch((err)=>{
            console.log('몽고디비 연결 에러', err)
        })
  }

module.exports = connect