import { Request, Response } from "express";
import knex from "../database/connection";
import crypto from "crypto";
import jwt from "jsonwebtoken";

interface Usuario {
    id: number,
    nomeUsuario: string,
    nome: string,
    email: string,
    nivel: number,
    senha: string,
    salt: string
}

class UsuariosController {
    async index(request: Request, response: Response) {
        const trx = await knex.transaction();

        const usuarios = await trx("usuarios")

        await trx.commit();

        return response.json(usuarios);
    }

    async create(request: Request, response: Response) {
        const {
            nomeUsuario,
            email,
            permissao
        } = request.body;

        const senha = crypto.randomBytes(6).toString("hex");

        const trx = await knex.transaction();

        const salt = crypto.randomBytes(16).toString('hex');

        const hash = crypto.pbkdf2Sync(senha, salt,
            1000, 64, `sha512`).toString(`hex`);

        const usuario = {
            nomeUsuario,
            email,
            permissao,
            senha: hash,
            salt
        }

        const insertedIds = await trx('usuarios').insert(usuario);
        const usuarioId = insertedIds[0];

        await trx.commit();

        return response.json({
            id: usuarioId,
            ...usuario
        })
    }

    async update(request: Request, response: Response) {
        const {
            id,
            nomeUsuario,
            email,
            permissao
        } = request.body;

        const trx = await knex.transaction();

        const usuario = {
            id,
            nomeUsuario,
            email,
            permissao
        }

        await trx('usuarios').update(usuario).where({ id });

        await trx.commit();

        return response.json(usuario);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const trx = await knex.transaction();

        await trx.delete().where({ id });

        trx.commit();

        return response.json({ mensagem: "Usuário removido com sucesso!" });
    }

    async getUsuario(authorization: String) {

        const trx = await knex.transaction();

        const autorizado = jwt.verify(String(authorization).split(' ')[1], "RuivoTech-BibliotecaDD") as Usuario;
        const usuario = await trx<Usuario>("usuarios")
            .where({ email: autorizado.email })
            .first();

        return usuario;
    }
}

export default UsuariosController;