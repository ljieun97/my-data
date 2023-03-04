const MyMovieModel = require("../../models/my-movie-model")

function _getMyMovies(data) {
  return new Promise((resolve, reject) => {
    MyMovieModel
      .find(
        { "userId": data.userId },
        {
          title: true, 
          date: true,
          rating: true,
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
  let myMovie = data.myMovie
  return new Promise((resolve, reject) => {
    MyMovieModel
      .updateOne({ "title": myMovie.title }, {
        userId: data.userId,
        title: myMovie.title,
        date: myMovie.date, 
        rating: myMovie.rating,
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