const config = require('../config.json')

const express = require('express')
const router = express.Router()
const axios = require('axios')

const TM_ACCESSTOKEN = config.tmdb.accessToken

//movie api
//naver 2023.03.31 서비스 종료
//kmdb 이미지 없음
//tmdb 띄어쓰기 검색 안됨

router.get('/movies', async(req, res) => {
    const apiUrl = "https://api.themoviedb.org/3/search/movie"
    const {keword} = req.query

    await axios.get(apiUrl, {
        params: {
            query: keword,
            language: 'ko'
        },
        headers: {
            "Authorization": `Bearer ${TM_ACCESSTOKEN}`,
        }
    })
    .then(result => {
        console.log(keword, '영화를 불러옵니다')
        res.send(result.data.results)
    })
    .catch((err) => {
        console.log(err)
    })
})

//herokuapp webtoons
router.get('/webtoons', async(req, res) => {
    const api_url = "https://korea-webtoon-api.herokuapp.com/search"
    const keword = '갓오브하이스쿨'
    // const keword = req.query.searchName
    console.log(req.query.keword)

    //여기 하는중
    await axios.get(api_url, {
        params: {
            keword: keword,
        },
    })
    .then(result => {
        console.log(keword, '웹툰을 불러옵니다')
        res.send(result.data)
    })
    .catch(() => {
        res.status(500).json({
            message : "모든 웹툰을 불러오는 도중 장애가 발생했습니다."
        })
    })
})

// 네이버 movie
// router.get('/movies', async(req, res) => {
//     const id_key = ""
//     const secret_key = ""
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