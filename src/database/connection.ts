import dotenv from "dotenv";
import knex from "knex";

dotenv.config();

const connection = knex({
    client: "mysql",
    version: "10.1",
    connection: {
        host: process.env.BD_HOST,
        user: process.env.BD_USER,
        password: process.env.BD_PASSWORD,
        database: process.env.BD_BASE
    },
    pool: {
        min: 5,
        max: 30
    },
    acquireConnectionTimeout: 1000
});

export default connection;