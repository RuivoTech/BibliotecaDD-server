import { Request, Response } from "express";
import knex from "../database/connection";
import UsuariosController from "./UsuariosController";

const usuariosController = new UsuariosController();

class LivrosController {
    async index(request: Request, response: Response) {
        const trx = await knex.transaction();

        const livros = await trx('livro');

        await trx.commit();

        return response.json(livros);
    }

    async show(request: Request, response: Response) {
        const { id_livro } = request.params;

        const trx = await knex.transaction();

        const livro = await trx("livro").where({ id_livro }).first();

        await trx.commit();

        if (!livro) {
            return response.status(400).json({ message: "Livro não encontrado" });
        }

        return response.json({ livro });
    }

    async create(request: Request, response: Response) {
        const {
            nome,
            autor,
            quantidade,
            tipo
        } = request.body;

        const trx = await knex.transaction();

        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

        const livro = {
            nome,
            autor,
            quantidade,
            tipo,
            criadoPor: usuario?.nome
        }

        const insertedIds = await trx('livro').insert(livro);
        const livroId = insertedIds[0];

        await trx.commit();

        return response.json({
            id: livroId,
            ...livro
        })
    }

    async update(request: Request, response: Response) {
        const {
            id_livro,
            nome,
            autor,
            quantidade,
            tipo
        } = request.body;

        const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

        const trx = await knex.transaction();

        const livro = {
            id_livro,
            nome,
            autor,
            quantidade,
            tipo,
            alteradoPor: usuario?.nome
        }

        await trx('livro').update(livro).where({ id_livro });

        await trx.commit();

        return response.json(livro);
    }

    async delete(request: Request, response: Response) {
        const { id_livro } = request.params;
        const trx = await knex.transaction();

        await trx.delete().where({ id_livro });

        await trx.commit();

        return response.json({ mensagem: "Livro removido com sucesso!" });
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

        const livros = await trx('livro')
            .whereRaw(sql);

        trx.commit();

        return response.json(livros);
    }
}

export default LivrosController;