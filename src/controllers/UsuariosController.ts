import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import knex from "../database/connection";
import Mailer from "../config/Mailer";

dotenv.config();

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
            const usuarios = await knex("usuarios");

            return response.json(usuarios);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        try {
            const usuario = await knex("usuarios")
                .where({ id: id })
                .select("id", "nome", "nomeUsuario", "email", "nivel");

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

            const insertedIds = await knex('usuarios').insert(usuario);
            const usuarioId = insertedIds[0];

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
            const usuario = {
                id,
                nomeUsuario,
                email,
                nivel
            }

            await knex('usuarios').update(usuario).where({ id });

            return response.json(usuario);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async updatePerfil(request: Request, response: Response) {
        const {
            id,
            nome,
            email,
            senha

        } = request.body;
        try {
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

            await knex('usuarios').update(usuario).where({ id });

            return response.json(usuario);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        try {

            await knex.delete().from("usuarios").where({ id });

            const usuarios = await knex('usuarios');

            return response.json(usuarios);
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async getUsuario(authorization: String) {

        const autorizado = jwt.verify(String(authorization).split(' ')[1], String(process.env.SECRET)) as Usuario;
        const usuario = await knex<Usuario>("usuarios")
            .where({ email: autorizado.email })
            .first();

        return usuario;
    }
}

export default UsuariosController;