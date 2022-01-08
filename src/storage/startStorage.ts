import { MongoClient } from "mongodb";
import { log } from "../utils/log";

export const storage = new MongoClient(process.env.STORAGE!);

export async function startStorage() {
    log('Connecting to MongoDB');
    await storage.connect();
    log('Connected');
}