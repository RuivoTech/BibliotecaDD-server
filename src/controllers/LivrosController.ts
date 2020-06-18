import { Request, Response } from "express";
import knex from "../database/connection";
import UsuariosController from "./UsuariosController";

const usuariosController = new UsuariosController();

class LivrosController {
    async index(request: Request, response: Response) {
        try {
            const trx = await knex.transaction();

            const livros = await trx('livro').transacting(trx);

            await trx.commit();

            return response.json(livros);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async show(request: Request, response: Response) {
        const { id_livro } = request.params;
        try {
            const trx = await knex.transaction();

            const livro = await trx("livro").transacting(trx).where({ id_livro }).first();

            await trx.commit();

            if (!livro) {
                return response.status(400).json({ message: "Livro não encontrado" });
            }

            return response.json({ livro });
        } catch (error) {
            return response.json({ error: error })
        }
    }

    async create(request: Request, response: Response) {
        const {
            nome,
            autor,
            quantidade,
            tipo
        } = request.body;
        let data = new Date();
        try {
            const trx = await knex.transaction();

            const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

            const livro = {
                nome,
                autor,
                quantidade,
                tipo,
                criadoPor: usuario?.nome,
                dataCriado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
            }

            const insertedIds = await trx('livro').transacting(trx).insert(livro);
            const livroId = insertedIds[0];

            await trx.commit();

            return response.json({
                id: livroId,
                ...livro
            })
        } catch (error) {
            return response.json({ error: error })
        }
    }

    async update(request: Request, response: Response) {
        const {
            id_livro,
            nome,
            autor,
            quantidade,
            tipo
        } = request.body;
        let data = new Date();
        try {
            const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

            const trx = await knex.transaction();

            const livro = {
                id_livro,
                nome,
                autor,
                quantidade,
                tipo,
                alteradoPor: usuario?.nome,
                dataAlterado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
            }

            await trx('livro').transacting(trx).update(livro).where({ id_livro });

            await trx.commit();

            return response.json(livro);
        } catch (error) {
            return response.json({ error: error });
        }

    }

    async delete(request: Request, response: Response) {
        const { id_livro } = request.params;
        const trx = await knex.transaction();

        await trx.delete().transacting(trx).from("livro").where({ id_livro });

        const livros = await trx('livro').transacting(trx);

        await trx.commit();

        return response.json(livros);
    }

    async relatorio(request: Request, response: Response) {
        let { tipo, emBaixa } = request.query;
        let sql = "";

        if (tipo != "todos") {
            sql += "tipo = " + (tipo === "engenharia" ? "0" : "1");
        }

        if (tipo != "todos" && emBaixa) {
            sql += " AND quantidade <= 10";
        } else if (tipo == "todos" && emBaixa) {
            sql += " quantidade <= 10";
        }

        const trx = await knex.transaction();

        const livros = await trx('livro').transacting(trx)
            .whereRaw(sql);

        trx.commit();

        return response.json(livros);
    }
}

export default LivrosController;