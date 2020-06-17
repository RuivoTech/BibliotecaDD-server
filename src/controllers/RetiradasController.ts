import { Request, Response } from "express";
import knex from "../database/connection";
import UsuariosController from "./UsuariosController";

const usuariosController = new UsuariosController();

interface Livro {
    id_livro: number,
    nome: string,
    autor: string,
    quantidade: number,
    tipo: number
}

interface Retirada {
    id_retirada?: number,
    ra: number,
    nome: string,
    curso: string,
    semestre: number,
    data_retirada: string,
    id_livroRetirada: number,
    criadoPor?: string,
    dataCriado?: string,
    alteradoPor?: string,
    dataAlterado?: string
}

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
            data_retirada
        } = request.body.retirada;
        const { livros_retirada } = request.body;

        const trx = await knex.transaction();

        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));
        let data = new Date()
        try {
            livros_retirada.map(async (livro: Livro) => {
                const retirada: Retirada = {
                    ra,
                    nome,
                    curso,
                    semestre,
                    data_retirada,
                    id_livroRetirada: livro.id_livro,
                    criadoPor: String(usuario?.nome),
                    dataCriado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
                };
                const insertedID = await trx('retirada').insert(retirada);
                const idRetirada = insertedID[0];

                await trx.commit();
            });

            return response.json({ mensagem: "Retirada cadastrada com sucesso!" });
        } catch (error) {
            return response.json({ error })
        }

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
        let data = new Date()
        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

        const trx = await knex.transaction();

        const retirada: Retirada = {
            id_retirada,
            ra,
            nome,
            curso,
            semestre,
            data_retirada,
            id_livroRetirada,
            alteradoPor: String(usuario?.nome),
            dataAlterado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
        };

        await trx('retirada').update(retirada).where({ id_retirada });

        await trx.commit();

        return response.json(retirada);
    }

    async delete(request: Request, response: Response) {
        const { id_retirada } = request.params;
        const trx = await knex.transaction();

        await trx.delete().from("retirada").where({ id_retirada });

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

        trx.commit();

        return response.json(retiradas);
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