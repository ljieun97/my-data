import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB = process.env.MONGODB_DB || ''

let cachedClient: any
let cachedDb: any

const connectMongo = async (): Promise<any> => {
  if (cachedClient && cachedDb) return cachedDb
  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db(MONGODB_DB)
	cachedClient = client
	cachedDb = db
  return cachedDb
}

export default connectMongo