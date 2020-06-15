import { Request, Response } from "express";
import knex from "../database/connection";

class HomeController {
    async index(request: Request, response: Response) {
        try {
            const trx = await knex.transaction();
            const livros = await trx('livro')
                .whereRaw("quantidade <= 10")
                .select(
                    "id_livro",
                    "nome",
                    "autor",
                    "quantidade",
                    knex.raw("CASE tipo WHEN 0 THEN 'Engenharia' ELSE 'Normal' END as tipo")
                )
                .orderBy('quantidade');

            const quantidadeLivros = await trx("retirada as r")
                .join("livro as l", "l.id_livro", "r.id_livroRetirada")
                .limit(10)
                .orderBy("quantidade", "desc")
                .groupBy("r.id_livroRetirada")
                .select(
                    knex.raw("count(r.id_livroRetirada) as quantidade"),
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