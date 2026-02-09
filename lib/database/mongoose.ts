import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? process.env.MONGODB_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as unknown as { mongoose: MongooseCache }).mongoose;

if (!cached) {
  cached = (global as unknown as { mongoose: MongooseCache }).mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI or MONGODB_URL environment variable");
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        if (process.env.NODE_ENV === "development") {
          console.info("[mongoose] connecting to MongoDB using URI (redacted)");
        }
        const conn = await mongoose.connect(MONGODB_URI as string);
        return conn;
      } catch (err) {
        console.error("[mongoose] connection error:", err);
        throw err;
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
