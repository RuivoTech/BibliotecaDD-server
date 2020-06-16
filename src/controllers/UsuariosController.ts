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
        const trx = await knex.transaction();

        const usuarios = await trx("usuarios")

        await trx.commit();

        return response.json(usuarios);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const trx = await knex.transaction();

        const usuario = await trx("usuarios")
            .where({ id: id })
            .select("id", "nome", "nomeUsuario", "email", "nivel");

        trx.commit();

        return response.json(usuario[0]);
    }

    async create(request: Request, response: Response) {
        const {
            nomeUsuario,
            nome,
            email,
            nivel
        } = request.body;

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

        const insertedIds = await trx('usuarios').insert(usuario);
        const usuarioId = insertedIds[0];

        await trx.commit();

        mailer.sendMail(usuario.email, usuario.nome, senha, usuario.nomeUsuario);

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
            nivel
        } = request.body;

        const trx = await knex.transaction();

        const usuario = {
            id,
            nomeUsuario,
            email,
            nivel
        }

        await trx('usuarios').update(usuario).where({ id });

        await trx.commit();

        return response.json(usuario);
    }

    async updatePerfil(request: Request, response: Response) {
        const {
            id,
            nome,
            nomeUsuario,
            email,
            senha

        } = request.body;

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