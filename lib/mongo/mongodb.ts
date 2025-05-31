import { Db, MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo() {
  if (db && client) {
    return { db, client };
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }

  db = client.db(MONGODB_DB);
  return { db, client };
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// export const connectMongo = async (): Promise<any> => {
//   if (!db) {
//     try {
//       db = client.db(MONGODB_DB)
//     } catch (error) {
//       console.error('MongoDB connection error:', error)
//       throw error
//     }
//   }
//   return db
// }

// export const closeMongo = async (): Promise<any> => {
//   try {
//     await client.close()
//     console.log('MongoDB connection closed')
//   } catch (error) {
//     console.error('Error closing MongoDB connection:', error)
//     throw error;
//   }
// }