import axios from 'axios'
const API_URL = 'http://localhost:3000'

class MovieService {
  getMovies(searchMovie) {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'GET',
            url: API_URL + '/all-movie',
            params: {
              searchMovie: searchMovie
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

export default new MovieService()