import express, { Response, Request } from "express";

import LoginController from "./controllers/LoginController";
import UsuariosController from "./controllers/UsuariosController";
import LivrosController from "./controllers/LivrosController";
import HomeController from "./controllers/HomeController";
import RetiradasController from "./controllers/RetiradasController";

const routes = express.Router();

const loginController = new LoginController();
const usuariosController = new UsuariosController();
const livrosController = new LivrosController();
const homeController = new HomeController();
const retiradasController = new RetiradasController();

routes.post('/login', loginController.login);

routes.get("/relatorioLivros", livrosController.relatorio);
routes.get("/relatorioRetiradas", retiradasController.relatorio);

routes.use(loginController.verificarToken);

routes.get("/home", homeController.index);

routes.get("/livros", livrosController.index);
routes.get("/livros/:id_livro", livrosController.show);
routes.post("/livros", livrosController.create);
routes.put("/livros", livrosController.update);
routes.delete("/livros/:id_livro", livrosController.delete);

routes.get("/retiradas", retiradasController.index);
routes.get("/retiradas/:id_retirada", retiradasController.show);
routes.post("/retiradas", retiradasController.create);
routes.put("/retiradas", retiradasController.update);
routes.delete("/retiradas/:id_retirada", retiradasController.delete);

routes.get("/usuarios", usuariosController.index);
routes.get("/usuarios/:id", usuariosController.show);
routes.post('/usuarios', usuariosController.create);
routes.put('/usuarios', usuariosController.update);
routes.put("/usuarios/:id", usuariosController.updatePerfil);
routes.delete("/usuarios/:id", usuariosController.delete);


export default routes;