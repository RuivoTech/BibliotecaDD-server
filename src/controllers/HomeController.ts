import { Request, Response } from "express";
import knex from "../database/connection";

class HomeController {
    async index(request: Request, response: Response) {
        try {
            const trx = await knex.transaction();
            const livros = await trx('livro').transacting(trx)
                .whereRaw("quantidade <= 10")
                .select(
                    "id_livro",
                    "nome",
                    "autor",
                    "quantidade",
                    "tipo"
                )
                .orderBy('quantidade');

            const quantidadeLivros = await trx("retirada as r").transacting(trx)
                .join("livro as l", "l.id_livro", "r.id_livroRetirada")
                .limit(10)
                .orderBy("quantidade", "desc")
                .groupBy("r.id_livroRetirada")
                .select(
                    trx.raw("count(r.id_livroRetirada) as quantidade"),
                    "l.nome"
                );

            await trx.commit();

            return response.json({ livros, quantidadeLivros });
        } catch (error) {
            return response.json({ error })
        }
    }
}

export default HomeController;