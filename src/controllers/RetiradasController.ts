import { Request, Response } from "express";
import knex from "../database/connection";
import UsuariosController from "./UsuariosController";

const usuariosController = new UsuariosController();

class RetiradasController {
    async index(request: Request, response: Response) {
        const trx = await knex.transaction();
        const retiradas = await trx('retirada as r')
            .join('livro as l', 'r.id_livroRetirada   ', 'l.id_livro')
            .select(
                "r.id_retirada",
                "r.ra",
                "r.nome",
                "r.curso",
                "r.semestre",
                knex.raw("DATE_FORMAT(r.data_retirada, '%Y-%m-%d') as data_retirada"),
                "r.id_livroRetirada",
                "r.criadoPor",
                trx.raw("DATE_FORMAT(r.dataCriado, '%Y-%m-%d') as dataCriado"),
                "r.alteradoPor",
                trx.raw("DATE_FORMAT(r.dataAlterado, '%Y-%m-%d') as dataAlterado"),
                "l.nome as livro"
            )
            .whereRaw("DAY(r.data_retirada) >= (DAY(now()) - 10)")

        await trx.commit();

        return response.json(retiradas);
    }

    async show(request: Request, response: Response) {
        const { id_retirada } = request.params;

        const trx = await knex.transaction();

        const retirada = await trx("retirada as r")
            .join('livro as l', 'r.id_livroRetirada', 'l.id_livro')
            .where({ id_retirada }).first()
            .select(
                "r.id_retirada",
                "r.ra",
                "r.nome",
                "r.curso",
                "r.semestre",
                knex.raw("DATE_FORMAT(r.data_retirada, '%Y-%m-%d') as data_retirada"),
                "r.id_livroRetirada",
                "r.criadoPor",
                "r,dataCriado",
                "r.alteradoPor",
                "r.dataAlterado",
                "l.nome as livro"
            );

        await trx.commit();

        if (!retirada) {
            return response.status(400).json({ message: "Retirada não encontrada" });
        }

        return response.json({ retirada });
    }

    async create(request: Request, response: Response) {
        const {
            ra,
            nome,
            curso,
            semestre,
            data_retirada,
            livros_retirada
        } = request.body;

        const trx = await knex.transaction();

        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

        let retiradas = [];

        for (let index = 0; index <= livros_retirada.length; index++) {
            retiradas.push({
                ra,
                nome,
                curso,
                semestre,
                data_retirada,
                id_livroRetirada: livros_retirada[index],
                criadoPor: usuario?.nome,
                dataCriado: trx.raw("now()")
            });
        }

        const insertedIds = await trx('retirada').insert(retiradas);
        const retiradaId = insertedIds[0];

        await trx.commit();

        return response.json({
            id_retirada: retiradaId,
            ra,
            nome,
            curso,
            semestre,
            data_retirada,
            livros_retirada
        });
    }

    async update(request: Request, response: Response) {
        const {
            id_retirada,
            ra,
            nome,
            curso,
            semestre,
            data_retirada,
            id_livroRetirada
        } = request.body;

        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

        const trx = await knex.transaction();

        const retirada = {
            id_retirada,
            ra,
            nome,
            curso,
            semestre,
            data_retirada,
            id_livroRetirada,
            alteradoPor: usuario?.nome,
            dataAlterado: trx.raw("now()")
        }

        await trx('retirada').update(retirada).where({ id_retirada });

        await trx.commit();

        return response.json(retirada);
    }

    async delete(request: Request, response: Response) {
        const { id_retirada } = request.params;
        const trx = await knex.transaction();

        await trx.delete().where({ id_retirada })

        return response.json({ mensagem: "Retidade removida com sucesso!" });
    }

    async relatorio(request: Request, response: Response) {
        const { dataInicio, dataFim } = request.query;

        const query = String(dataInicio) !== "0000-00-00" || String(dataFim) !== "0000-00-00"
            ? `data_retirada BETWEEN '${dataInicio}' AND '${dataFim}'` : "true";

        const trx = await knex.transaction();

        const retiradas = await trx("retirada as r")
            .join("livro as l", "l.id_livro", "r.id_livroRetirada")
            .whereRaw(query)
            .select("r.ra", "r.nome", "r.curso", "r.semestre", "l.nome as livro");

        trx.commit();

        return response.json(retiradas);
    }
}

export default RetiradasController;