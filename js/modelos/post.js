/**
 * Publicação feita por um usuário da rede social.
 */
class Post {
    /**
     * @param {number} id Identificador numérico do post.
     * @param {Usuario} autor Usuário que publicou o post.
     * @param {string} data Data da publicação (AAAA-MM-DD).
     * @param {number} curtidas Quantidade de curtidas.
     * @param {string} texto Conteúdo do post.
     */
    constructor(id, autor, data, curtidas, texto) {
        this.id = id;
        // Guarda o próprio usuário, e não só o id, para mostrar o @ do autor sem fazer outra busca.
        this.autor = autor;
        this.data = data;
        this.curtidas = curtidas;
        this.texto = texto;
    }

}

module.exports = Post;
