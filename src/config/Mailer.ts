import nodemailer from "nodemailer";

class Mailer {
    async sendMail(email: String, nome: String, senha: String, nomeUsuario: String) {
        try {
            const remetente = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: "sinergia.unicesumar@gmail.com",
                    pass: "ywyzxokuczzclygn"
                }
            });

            await remetente.sendMail({
                from: "Sinergia <sinergia.unicesumar@gmail.com>",
                to: `${nome} <${email}>`,
                subject: "Seu acesso ao sistema SEI",
                html: `<p>Olá, ${nome}.</p>
                <p> Seus dados de acesso estão abaixo: </p>
                <p>
                    E-mail: <strong>${email}</strong>
                </p>
                <p>
                    Nome de usuário: <strong>${nomeUsuario}</strong>
                </p>
                <p>
                    Senha: <strong>${senha}</strong>
                </p>
                    `
            });

            console.log("Email enviado com sucesso!!");

        } catch (error) {
            console.error(error);
        }
    }
}

export default Mailer;














