const UserModel = require("../models/user.model")

function getUserInfo(_id) {
  return new Promise((resolve, reject) => {
    UserModel
      .findOne({ _id })
      .exec()
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      })
  })
}

function createUser(param) {
    const {id, email, name, picture} = param
    return new Promise((resolve, reject) => {
        UserModel
        .updateOne({ authId: id }, {
            authId: id,
            email,
            name,
            nickName: name, 
            picture,
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

function updateUser(param) {
    const {_id, nickName, picture} = param
    return new Promise((resolve, reject) => {
        UserModel
        .findOneAndUpdate(
            { _id }, 
            { $set: { nickName, picture } }
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

function deleteUser(_id) {
  return new Promise((resolve, reject) => {
    UserModel
      .findOneAndDelete({ _id })
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
    getUserInfo,
    createUser,
    updateUser,
    deleteUser,
}