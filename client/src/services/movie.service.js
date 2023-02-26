import axios from 'axios';

const API_URL = 'http://localhost:3000';

class MovieService {
  getMovieList() {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'GET',
            url: API_URL + '/movie',
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

export default new MovieService();