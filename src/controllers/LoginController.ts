import { Request, Response, NextFunction, json } from "express";
import dotenv from "dotenv";

import knex from "../database/connection";
import crypto from "crypto";
import jwt from 'jsonwebtoken';

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

class LoginController {
    async login(request: Request, response: Response) {
        const { email, senha } = request.body;
        try {
            const usuario = await knex<Usuario>('usuarios')
                .where({ email }).orWhere({ nomeUsuario: email })
                .first();

            const salt: string = usuario?.salt || "";

            const hash = crypto.pbkdf2Sync(
                senha,
                salt,
                1000,
                64,
                `sha512`
            )
                .toString(`hex`);

            if (usuario && usuario?.senha === hash) {
                const token = jwt.sign(
                    {
                        id: usuario.id,
                        nomeUsuario: usuario.nomeUsuario,
                        email: usuario.email,
                        nome: usuario.nome,
                        nivel: usuario.nivel
                    },
                    String(process.env.SECRET)
                )

                return response.json({ token });
            }

            return response.json({
                error: "Não foi pssível encontrar o usuário"
            })
        } catch (error) {
            return response.json({ error: error })
        }

    }

    async verificarToken(request: Request, response: Response, next: NextFunction) {
        const { authorization } = request.headers;

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            if (authorization.split(' ')[1] === "undefined") {
                return response.json({ error: "undefined" });
            }
            try {
                const autorizado = jwt.verify(authorization.split(' ')[1], String(process.env.SECRET)) as Usuario;
                const usuario = await knex<Usuario>("usuarios")
                    .where({ email: autorizado.email })
                    .first();


                if (!usuario) {
                    return response.json({ error: "Você não tem autorização para acessar esta rota!" });
                };

                next();
            } catch (error) {

                return response.json({ error: error })
            }
        } else {
            return response.json({ error: "Você não tem autorização para acessar esta rota!" });
        }
    }

}

export default LoginController;