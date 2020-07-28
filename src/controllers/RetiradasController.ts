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
        try {
            const retiradas = await knex('retirada as r')
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
                    knex.raw("DATE_FORMAT(r.dataCriado, '%Y-%m-%d') as dataCriado"),
                    "r.alteradoPor",
                    knex.raw("DATE_FORMAT(r.dataAlterado, '%Y-%m-%d') as dataAlterado"),
                    "l.nome as livro"
                )
                .orderBy("r.data_retirada", "desc");

            return response.json(retiradas);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async show(request: Request, response: Response) {
        const { id_retirada } = request.params;
        try {
            const retirada = await knex("retirada as r")
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

            if (!retirada) {
                return response.status(400).json({ message: "Retirada não encontrada" });
            }

            return response.json({ retirada });
        } catch (error) {
            return response.json({ error: error })
        }

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
        try {
            const usuario = await usuariosController.getUsuario(String(request.headers.authorization));
            let data = new Date()

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

                await knex("livro").where({ id_livro: retirada.id_livroRetirada }).decrement("quantidade", 1);

                await knex('retirada').insert(retirada);
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
        try {
            const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

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

            await knex('retirada').update(retirada).where({ id_retirada });

            return response.json(retirada);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async delete(request: Request, response: Response) {
        const { id_retirada } = request.params;

        try {
            const retirada = await knex("retirada").where("id_retirada", id_retirada).first();

            await knex("livro").where({ id_livro: retirada.id_livroRetirada }).increment("quantidade", 1)

            await knex.delete().from("retirada").where({ id_retirada });

            const retiradas = await knex('retirada as r')
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
                    knex.raw("DATE_FORMAT(r.dataCriado, '%Y-%m-%d') as dataCriado"),
                    "r.alteradoPor",
                    knex.raw("DATE_FORMAT(r.dataAlterado, '%Y-%m-%d') as dataAlterado"),
                    "l.nome as livro"
                )
                .whereRaw("DAY(r.data_retirada) >= (DAY(now()) - 10)");

            return response.json(retiradas);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async relatorio(request: Request, response: Response) {
        const { dataInicio, dataFim } = request.query;

        const query = String(dataInicio) !== "0000-00-00" || String(dataFim) !== "0000-00-00"
            ? `data_retirada BETWEEN '${dataInicio}' AND '${dataFim}'` : "true";

        const retiradas = await knex("retirada as r")
            .join("livro as l", "l.id_livro", "r.id_livroRetirada")
            .whereRaw(query)
            .select("r.ra", "r.nome", "r.curso", "r.semestre", "l.nome as livro");

        return response.json(retiradas);
    }
}

export default RetiradasController;