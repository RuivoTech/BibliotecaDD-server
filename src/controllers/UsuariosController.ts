import { Request, Response } from "express";
import knex from "../database/connection";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Mailer from "../config/Mailer";

interface Usuario {
    id: number,
    nomeUsuario: string,
    nome: string,
    email: string,
    nivel: number,
    senha: string,
    salt: string
}

const mailer = new Mailer();

class UsuariosController {
    async index(request: Request, response: Response) {
        try {
            const trx = await knex.transaction();

            const usuarios = await trx("usuarios").transacting(trx)

            await trx.commit();

            return response.json(usuarios);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        try {
            const trx = await knex.transaction();

            const usuario = await trx("usuarios").transacting(trx)
                .where({ id: id })
                .select("id", "nome", "nomeUsuario", "email", "nivel");

            trx.commit();

            return response.json(usuario[0]);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async create(request: Request, response: Response) {
        const {
            nomeUsuario,
            nome,
            email,
            nivel
        } = request.body;
        try {

            const senha = crypto.randomBytes(6).toString("hex");

            const trx = await knex.transaction();

            const salt = crypto.randomBytes(16).toString('hex');

            const hash = crypto.pbkdf2Sync(senha, salt,
                1000, 64, `sha512`).toString(`hex`);

            const usuario = {
                nomeUsuario,
                nome,
                email,
                nivel,
                senha: hash,
                salt
            }

            const insertedIds = await trx('usuarios').transacting(trx).insert(usuario);
            const usuarioId = insertedIds[0];

            await trx.commit();

            mailer.sendMail(usuario.email, usuario.nome, senha, usuario.nomeUsuario);

            return response.json({
                id: usuarioId,
                ...usuario
            })
        } catch (error) {
            return response.json({ error: error })
        }
    }

    async update(request: Request, response: Response) {
        const {
            id,
            nomeUsuario,
            email,
            nivel
        } = request.body;
        try {
            const trx = await knex.transaction();

            const usuario = {
                id,
                nomeUsuario,
                email,
                nivel
            }

            await trx('usuarios').transacting(trx).update(usuario).where({ id });

            await trx.commit();

            return response.json(usuario);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async updatePerfil(request: Request, response: Response) {
        const {
            id,
            nome,
            nomeUsuario,
            email,
            senha

        } = request.body;
        try {
            const trx = await knex.transaction();

            const salt = crypto.randomBytes(16).toString('hex');

            const novaSenha = crypto.pbkdf2Sync(senha, salt,
                1000, 64, `sha512`).toString(`hex`);

            const usuario = {
                id,
                nome,
                email,
                senha: novaSenha,
                salt
            }

            await trx('usuarios').transacting(trx).update(usuario).where({ id });

            await trx.commit();

            return response.json(usuario);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        try {
            const trx = await knex.transaction();

            await trx.delete().transacting(trx).from("usuarios").where({ id });

            const usuarios = await trx('usuarios').transacting(trx);

            trx.commit();

            return response.json(usuarios);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async getUsuario(authorization: String) {

        const trx = await knex.transaction();

        const autorizado = jwt.verify(String(authorization).split(' ')[1], "RuivoTech-BibliotecaDD") as Usuario;
        const usuario = await trx<Usuario>("usuarios").transacting(trx)
            .where({ email: autorizado.email })
            .first();

        trx.commit();

        return usuario;
    }
}

export default UsuariosController;