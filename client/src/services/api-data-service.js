import axios from 'axios'
const API_URL = 'http://localhost:3000'

class MovieService {
  getMovies(keword) {
    return new Promise(function (resolve, reject) {
 
        axios({
            method: 'GET',
            url: API_URL + '/api-data/movies',
            params: {
              keword: keword
            },
        })
        .then(function (res) {
          console.log(keword)
            console.log(res)
            resolve(res)
        })
        .catch(function (err) {
            reject(err)
        })
    })
  }
  getWebtoons(keword) {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'GET',
            url: API_URL + '/api-data/webtoons',
            params: {
              keword: keword
            },
        })
        .then(function (res) {
            resolve(res)
        })
        .catch(function (err) {
            reject(err)
        })
    })
  }
}

export default new MovieService()