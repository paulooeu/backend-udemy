const bcrypt = require("bcrypt-nodejs");
const db = require("../../config/db");
const { perfil: obterPerfil } = require("../Query/perfil");
const { usuario: obterUsuario } = require("../Query/usuario");

const mutations = {
  registrarUsuario(_, { dados }) {
    return mutations.novoUsuario(_, {
      dados: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha
      }
    });
  },
  async novoUsuario(_, { dados }) {
    try {
      const idsPerfis = [];
      if (!dados.perfis || !dados.perfis.length) {
        dados.perfis = [
          {
            nome: "comum"
          }
        ];
      }

      for (let filtro of dados.perfis) {
        const perfil = await obterPerfil(_, {
          filtro
        });
        if (perfil) idsPerfis.push(perfil.id);
      }
      const salt = bcrypt.genSaltSync();
      dados.senha = bcrypt.hashSync(dados.senha, salt);

      delete dados.perfis;
      const [id] = await db("usuarios").insert(dados);

      for (let perfil_id of idsPerfis) {
        await db("usuarios_perfis").insert({ perfil_id, usuario_id: id });
      }

      return dados;
    } catch (e) {
      throw new Error(e);
    }
  },
  async excluirUsuario(_, args) {
    try {
      const usuario = await obterUsuario(_, args);
      if (usuario) {
        const { id } = usuario;
        await db("usuarios_perfis")
          .where({ usuario_id: id })
          .delete();
        await db("usuarios")
          .where({ id })
          .delete();
      }
      return usuario;
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
  async alterarUsuario(_, { filtro, dados }) {
    try {
      const usuario = await obterUsuario(_, { filtro });
      if (usuario) {
        const { id } = usuario;
        if (dados.perfis) {
          await db("usuarios_perfis")
            .where({ usuario_id: id })
            .delete();

          for (let filtro of dados.perfis) {
            const perfil = await obterPerfil(_, {
              filtro
            });

            if (perfil) {
              await db("usuarios_perfis").insert({
                perfil_id: perfil.id,
                usuario_id: id
              });
            }
          }
        }
        if (dados.senha) {
          const salt = bcrypt.genSaltSync();
          dados.senha = bcrypt.hashSync(dados.senha, salt);
        }

        delete dados.perfis;
        await db("usuarios")
          .where({ id })
          .update(dados);
      }
      return !usuario ? null : { ...usuario, ...dados };
    } catch (e) {
      throw new Error(e);
    }
  }
};
module.exports = mutations;
