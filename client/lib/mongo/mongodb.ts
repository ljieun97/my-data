// import { MongoClient } from "mongodb"

// const MONGODB_URL = process.env.MONGODB_URL as string
// const MONGODB_DB = process.env.MONGODB_DB as string

// declare let _mongo: any
// declare let _db: any

// const connectMongo = async (): Promise<any> => {
//   console.log(MONGODB_URL)
//   if(_mongo && _db) return _db
//   _mongo = await MongoClient.connect(MONGODB_URL)
//   console.log(_mongo)
//   _db =  _mongo.db(MONGODB_DB)
// 	const connectDB = _db
//   return connectDB
// }

// export default connectMongo

import { MongoClient } from "mongodb"

const MONGODB_URL = process.env.MONGODB_URL || ''
const MONGODB_DB = process.env.MONGODB_DB || ''

let cachedClient: any
let cachedDb: any

const connectMongo = async (): Promise<any> => {
  if (cachedClient && cachedDb) return cachedDb
  const client = await MongoClient.connect(MONGODB_URL)
  const db = client.db(MONGODB_DB)
	cachedClient = client
	cachedDb = db
  return cachedDb
}

export default connectMongo