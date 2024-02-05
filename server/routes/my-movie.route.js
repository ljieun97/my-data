const express = require('express')
const router = express.Router()
const MyMovieManager = require('../managers/my-data/my-movie.manager')

router.post('/movies', function(req, res){
    MyMovieManager.getMyMovies(req.body)
        .then(result => {
            console.log('내 영화를 불러옵니다.')
            res.status(200).send(result)
        })
        .catch(() => {
            res.status(500).json({
                message : "내 영화 불러오는 도중 장애가 발생했습니다."
            })
        })
})

router.post('/', function(req, res){
    MyMovieManager.createMyMovie(req.body)
        .then(result => {
            console.log('내 영화가 등록 되었습니다.')
            res.status(200).send(result)
        })
        .catch(() => {
            res.status(500).json({
                message : "내 영화 등록 도중 장애가 발생했습니다."
            })
        })
})

router.put('/', function(req, res){
    MyMovieManager.updateMyMovie(req.body)
        .then(result => {
            console.log('내 영화가 수정 되었습니다.')
            res.status(200).send(result)
        })
        .catch(() => {
            res.status(500).json({
                message : "내 영화 수정 도중 장애가 발생했습니다."
            })
        })
})

router.delete('/', function(req, res){
    MyMovieManager.deleteMyMovie(req.body)
        .then(result => {
            console.log('내 영화가 삭제 되었습니다.')
            res.status(200).send(result)
        })
        .catch(() => {
            res.status(500).json({
                message : "내 영화 삭제 도중 장애가 발생했습니다."
            })
        })
})

module.exports = router