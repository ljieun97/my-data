const express = require('express')
const router = express.Router()
const axios = require('axios')

//kmdb
router.get('/', async(req, res) => {
    const id_key = "Iv6QgLvJvepxu6heSY5H"
    const secret_key = "ZT4gCL0phm"
    const api_url = "https://openapi.naver.com/v1/search/movie.json"
    const title = req.query.searchMovie

    await axios.get(api_url, {
        params: {
            query: title,
            display: 100,
        },
        headers: {
            "X-Naver-Client-Id": id_key,
            "X-Naver-Client-Secret": secret_key,
        }
    })
    .then(result => {
        console.log(title, '영화를 불러옵니다')
        res.send(result.data.items)
    })
    .catch(() => {
        res.status(500).json({
            message : "모든 영화 불러오는 도중 장애가 발생했습니다."
        })
    })
})

//네이버
// router.get('/', async(req, res) => {
//     const id_key = "Iv6QgLvJvepxu6heSY5H"
//     const secret_key = "ZT4gCL0phm"
//     const api_url = "https://openapi.naver.com/v1/search/movie.json"
//     const title = req.query.searchMovie

//     await axios.get(api_url, {
//         params: {
//             query: title,
//             display: 100,
//         },
//         headers: {
//             "X-Naver-Client-Id": id_key,
//             "X-Naver-Client-Secret": secret_key,
//         }
//     })
//     .then(result => {
//         console.log(title, '영화를 불러옵니다')
//         res.send(result.data.items)
//     })
//     .catch(() => {
//         res.status(500).json({
//             message : "모든 영화 불러오는 도중 장애가 발생했습니다."
//         })
//     })
// })

module.exports = router