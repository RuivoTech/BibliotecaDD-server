import knex from "knex";

const connection = knex({
    client: "mysql",
    version: "10.1",
    connection: {
        host: "localhost",
        user: "richieri",
        password: "Beatricy1812@",
        database: "bibliotecadd"
    },
    pool: {
        min: 5,
        max: 30
    },
    acquireConnectionTimeout: 1000
});

export default connection;