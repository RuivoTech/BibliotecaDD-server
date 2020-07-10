import { Request, Response } from "express";
import knex from "../database/connection";
import UsuariosController from "./UsuariosController";

const usuariosController = new UsuariosController();

class LivrosController {
    async index(request: Request, response: Response) {
        try {
            const livros = await knex('livro');

            return response.json(livros);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async show(request: Request, response: Response) {
        const { id_livro } = request.params;
        try {
            const livro = await knex("livro").where({ id_livro }).first();

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
            const usuario = await usuariosController.getUsuario(String(request.headers.authorization));

            const livro = {
                nome,
                autor,
                quantidade,
                tipo,
                criadoPor: usuario?.nome,
                dataCriado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
            }

            const insertedIds = await knex('livro').insert(livro);
            const livroId = insertedIds[0];

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

            const livro = {
                id_livro,
                nome,
                autor,
                quantidade,
                tipo,
                alteradoPor: usuario?.nome,
                dataAlterado: String(data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate())
            }

            await knex('livro').update(livro).where({ id_livro });

            return response.json(livro);
        } catch (error) {
            return response.json({ error: error });
        }

    }

    async delete(request: Request, response: Response) {
        const { id_livro } = request.params;

        await knex.delete().from("livro").where({ id_livro });

        const livros = await knex('livro');

        return response.json(livros);
    }

    async relatorio(request: Request, response: Response) {
        let { tipo, emBaixa } = request.query;
        let sql = "";

        if (tipo !== "todos") {
            sql += `tipo = ${tipo}`;
        }

        if (tipo !== "todos" && emBaixa) {
            sql += " AND quantidade <= 10";
        } else if (tipo === "todos" && emBaixa) {
            sql += " quantidade <= 10";
        }

        const livros = await knex('livro')
            .whereRaw(sql);

        return response.json(livros);
    }
}

export default LivrosController;