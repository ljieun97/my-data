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
      ).sort({"date": -1})
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

function _updateMyMovie(data) {
  let myMovie = data.myMovie
  return new Promise((resolve, reject) => {
    MyMovieModel
      .findOneAndUpdate(
        { _id: data.movieId }, 
        { $set: { date: myMovie.date, rating: myMovie.rating } }
      )
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

function _deleteMyMovie(data) {
  return new Promise((resolve, reject) => {
    MyMovieModel
      .findOneAndDelete({ _id: data.movieId })
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
  getMyMovies: _getMyMovies,
  createMyMovie: _createMyMovie,
  updateMyMovie: _updateMyMovie,
  deleteMyMovie: _deleteMyMovie,
}