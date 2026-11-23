/**
 * Representa um usuário da rede social: dados cadastrais e dados calculados a partir das conexões e dos posts.
 */
class Usuario {
    /**
     * @param {number} id Identificador numérico do usuário.
     * @param {string} usuario Nome de usuário único, iniciando com @.
     * @param {string} nome Nome completo.
     * @param {string} dataCadastro Data de cadastro no formato AAAA-MM-DD.
     */
    constructor(id, usuario, nome, dataCadastro) {
        this.id = id;
        this.usuario = usuario;
        this.nome = nome;
        this.dataCadastro = dataCadastro;
        this.qtdSeguindo = 0;
        this.qtdSeguidores = 0;
        this.qtdPosts = 0;
        this.totalCurtidas = 0;
    }

    /**
     * Calcula o engajamento do usuário, usado no ranking.
     * @returns {number} Seguidores vezes 2 mais a soma das curtidas dos posts.
     */
    engajamento() {
        return this.qtdSeguidores * 2 + this.totalCurtidas;
    }

}

module.exports = Usuario;
