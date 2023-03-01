import axios from 'axios'
const API_URL = 'http://localhost:3000'

class MyMovieService {
    getMyMovies(userId) {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'POST',
                url: API_URL + '/my-movie/movies',
                data: {
                    userId: userId
                }
            })
            .then(function (res) {
                resolve(res);
            })
            .catch(function (err) {
                reject(err);
            })
        })
    }
    createMyMovie(userId, movieInfo, myInfo) {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'POST',
                url: API_URL + '/my-movie',
                data: {
                    userId: userId,
                    movieInfo: movieInfo,
                    myInfo: myInfo,
                },
            })
            .then(function (res) {
                console.log(res)
                resolve(res)
            })
            .catch(function (err) {
                reject(err)
            })
        })
    }
}

export default new MyMovieService()