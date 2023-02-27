
const { default: axios } = require('axios');
var express = require('express');
var router = express.Router();

// 감상가능한곳 알려주는 db 필요
// 다음 영화 검색 제공안함
// tmdb 한글 검색 제공안함, 결과만 한글 가능
// 영화진흥위원회 or 네이버에 보러가기 있는데 api에서 제공안해줌 ㅠ

router.get('/', async(req, res) => {
    const id_key = "Iv6QgLvJvepxu6heSY5H"
    const secret_key = "ZT4gCL0phm"
    const base_url = "https://openapi.naver.com/v1/search/movie.json"
    const title = req.query.searchMovie

    const result = await axios.get(
        base_url,
        {
            params: {query: title},
            headers: {
                "X-Naver-Client-Id": id_key,
                "X-Naver-Client-Secret": secret_key,
            }
        }
    )
    res.send(result.data.items)
});

module.exports = router;