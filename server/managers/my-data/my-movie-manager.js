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

function _updateMyMovie(data) {
  return new Promise((resolve, reject) => {
    switch (data.type) {
      case '날짜':
        MyMovieModel
          .findOneAndUpdate(
            { _id: data.movieId }, 
            { $set: { date: data.value } }
          )
          .then(result => {
            console.log(result)
            resolve(result)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
        break
      case '평점':
        MyMovieModel
          .findOneAndUpdate(
            { _id: data.movieId }, 
            { $set: { rating: data.value } }
          ).exec()
          .then(result => {
            console.log(result)
            resolve(result)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
        break
    }
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