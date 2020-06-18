import path from "path";

module.exports = {
    client: "mysql",
    version: "10.1",
    connection: {
        host: "localhost",
        user: "richieri",
        password: "Beatricy1812@",
        database: "bibliotecadd"
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true
}