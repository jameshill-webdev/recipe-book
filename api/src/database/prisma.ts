import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 5, // max concurrent open DB connections
	idleTimeoutMillis: 30_000, // idle connection timeout
	connectionTimeoutMillis: 10_000, // db connection timeout
	keepAlive: true, // enable TCP keep-alive packets for DB connections
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
