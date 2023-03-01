const MyMovieModel = require("../../models/my-movie-model")

function _getMyMovies(data) {
  return new Promise((resolve, reject) => {
    MyMovieModel
      .find(
        { "userId": data.userId },
        {
          movieInfo: true, 
          myInfo: true,
        }
      )
      .exec()
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      })
  })
}


function _createMyMovie(data) {
  return new Promise((resolve, reject) => {
    MyMovieModel
      .updateOne({ "movieInfo.title": data.movieInfo.title }, {
        userId : data.userId,
        movieInfo : data.movieInfo,
        myInfo : data.myInfo,
      }, { upsert: true })
      .then(result => {
        console.log(result)
        resolve(result)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

module.exports = {
  createMyMovie: _createMyMovie,
  getMyMovies: _getMyMovies,
}