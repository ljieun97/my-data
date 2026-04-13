import { NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb";
import { headers } from "next/headers";

export async function GET() {
  let mongoClient;

  try {
    const headersList = headers();
    const uid = (await headersList).get("authorization");

    const { client, db } = await connectMongo();
    mongoClient = client;

    const results = await db
      .collection("contents")
      .find({
        user_id: uid,
        user_date: { $type: "string", $regex: /^\d{4}-\d{2}-\d{2}/ },
      })
      .sort({ user_date: -1, _id: -1 })
      .toArray();

    return NextResponse.json(results);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e });
  } finally {
    if (mongoClient) closeMongo();
  }
}
