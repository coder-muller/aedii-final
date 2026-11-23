const TabelaHash = require("./estruturas/tabela-hash");
const Usuario = require("./modelos/usuario");

/**
 * Núcleo da rede social.
 */
class RedeSocial {
    /**
     * Monta todas as estruturas a partir das linhas dos arquivos.
     * @param {string[][]} usuarios Linhas de usuarios.csv.
     * @param {string[][]} seguidores Linhas de seguidores.csv.
     * @param {string[][]} posts Linhas de posts.csv.
     */
    constructor(usuarios, seguidores, posts) {
        // Vetor indexado pelo id
        // Permite acessar um usuário pelo id em O(1), sem precisar de dicionário.
        this.usuariosPorId = [];
        // Tabela hash para localizar um usuário pelo "@usuário" usnado o comando buscar.
        this.tabelaUsuarios = new TabelaHash();

        for (let i = 0; i < usuarios.length; i++) {
            const [id, usuario, nome, dataCadastro] = usuarios[i];
            const novo = new Usuario(Number(id), usuario, nome, dataCadastro);
            this.usuariosPorId[novo.id] = novo;
            this.tabelaUsuarios.inserir(usuario, novo);
        }

        // Cada conexão "A segue B" soma 1 em quem A segue e 1 nos seguidores de B.
        for (let i = 0; i < seguidores.length; i++) {
            const seguidor = this.usuariosPorId[Number(seguidores[i][0])];
            const seguido = this.usuariosPorId[Number(seguidores[i][1])];
            seguidor.qtdSeguindo++;
            seguido.qtdSeguidores++;
        }

        for (let i = 0; i < posts.length; i++) {
            const autor = this.usuariosPorId[Number(posts[i][1])];
            autor.qtdPosts++;
            autor.totalCurtidas += Number(posts[i][3]);
        }
    }

    /**
     * Função para buscar usuário pelo nome do usuário
     * @param {string} usuario Nome de usuário com "@".
     * @returns {Usuario|null} O usuário encontrado, ou null se não existir.
     */
    buscarUsuario(usuario) {
        return this.tabelaUsuarios.buscar(usuario);
    }
}

module.exports = RedeSocial;
