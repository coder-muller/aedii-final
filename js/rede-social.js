const TabelaHash = require("./estruturas/tabela-hash");
const { ArvoreAVL } = require("./estruturas/arvore-avl");
const mergeSort = require("./estruturas/merge-sort");
const Grafo = require("./estruturas/grafo");
const Usuario = require("./modelos/usuario");
const Post = require("./modelos/post");

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

        // Grafo de quem segue quem, em que cada usuário é um vértice identificado pelo id.
        this.grafo = new Grafo(usuarios.length);

        // Cada conexão "A segue B" vira uma aresta de A para B e soma 1 em quem A segue e 1 nos seguidores de B.
        for (let i = 0; i < seguidores.length; i++) {
            const seguidor = this.usuariosPorId[Number(seguidores[i][0])];
            const seguido = this.usuariosPorId[Number(seguidores[i][1])];
            this.grafo.adicionarAresta(seguidor.id, seguido.id);
            seguidor.qtdSeguindo++;
            seguido.qtdSeguidores++;
        }

        // Árvore AVL com os posts indexados pela data, usada no comando posts-entre.
        this.postsPorData = new ArvoreAVL();

        for (let i = 0; i < posts.length; i++) {
            const [id, idAutor, data, curtidas, texto] = posts[i];
            const autor = this.usuariosPorId[Number(idAutor)];
            const post = new Post(Number(id), autor, data, Number(curtidas), texto);
            autor.qtdPosts++;
            autor.totalCurtidas += post.curtidas;
            this.postsPorData.inserir(data, post);
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

    /**
     * Busca os posts publicados entre duas datas, incluindo as duas, em ordem cronológica.
     * @param {string} inicio Data inicial (AAAA-MM-DD).
     * @param {string} fim Data final (AAAA-MM-DD).
     * @returns {Post[]} Posts encontrados.
     * Complexidade O(log n + k), sendo k a quantidade de datas dentro do intervalo.
     */
    buscarPostsEntre(inicio, fim) {
        return this.postsPorData.buscarIntervalo(inicio, fim);
    }

    /**
     * Ordena todos os usuários do maior para o menor engajamento, com desempate pela ordem alfabética do @usuario.
     * @returns {Usuario[]} Usuários na ordem do ranking.
     * Complexidade O(n log n) por causa do Merge Sort.
     */
    gerarRanking() {
        const usuarios = [];
        // A posição 0 do vetor fica vazia porque os ids começam em 1.
        for (let id = 1; id < this.usuariosPorId.length; id++) {
            usuarios.push(this.usuariosPorId[id]);
        }

        return mergeSort(usuarios, (a, b) => {
            // Subtrair b de a coloca o maior engajamento primeiro.
            const diferenca = b.engajamento() - a.engajamento();
            if (diferenca !== 0) {
                return diferenca;
            }
            // No empate a comparação dos textos coloca o @usuario em ordem alfabética.
            if (a.usuario < b.usuario) {
                return -1;
            }
            if (a.usuario > b.usuario) {
                return 1;
            }
            return 0;
        });
    }
}

module.exports = RedeSocial;
