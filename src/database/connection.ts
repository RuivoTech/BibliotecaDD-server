import knex from "knex";

const connection = knex({
    client: "mysql",
    version: "10.1",
    connection: {
        host: "localhost",
        user: "richieri",
        password: "Beatricy1812@",
        database: "bibliotecadd"
    }
});

export default connection;