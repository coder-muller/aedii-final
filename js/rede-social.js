const TabelaHash = require("./estruturas/tabela-hash");
const { ArvoreAVL } = require("./estruturas/arvore-avl");
const mergeSort = require("./estruturas/merge-sort");
const Grafo = require("./estruturas/grafo");
const Heap = require("./estruturas/heap");
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
        // Lista simples com todos os posts, usada no comando top-curtidos.
        this.posts = [];

        for (let i = 0; i < posts.length; i++) {
            const [id, idAutor, data, curtidas, texto] = posts[i];
            const autor = this.usuariosPorId[Number(idAutor)];
            const post = new Post(Number(id), autor, data, Number(curtidas), texto);
            autor.qtdPosts++;
            autor.totalCurtidas += post.curtidas;
            this.postsPorData.inserir(data, post);
            this.posts.push(post);
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
     * Seleciona os k melhores itens de uma lista usando um heap de mínimo com no máximo k itens.
     * @param {Array} itens Itens a serem avaliados.
     * @param {number} k Quantidade de itens desejada.
     * @param {Function} comparar Recebe (a, b) e devolve negativo se a é melhor que b.
     * @returns {Array} Os k melhores itens, do melhor para o pior. Se houver menos que k itens, devolve todos.
     * Complexidade O(n log k), porque cada um dos n itens passa por um heap que nunca passa de k itens.
     */
    selecionarMelhores(itens, k, comparar) {
        // A comparação é invertida para que o pior entre os escolhidos fique no topo e seja o primeiro a sair.
        const heap = new Heap((a, b) => comparar(b, a));

        for (let i = 0; i < itens.length; i++) {
            heap.inserir(itens[i]);
            // Quando o heap passa de k itens, o pior sai, assim sobram sempre os k melhores vistos até agora.
            if (heap.tamanho() > k) {
                heap.remover();
            }
        }

        // O heap entrega do pior para o melhor, então o resultado é preenchido de trás para frente.
        const resultado = [];
        for (let i = heap.tamanho() - 1; i >= 0; i--) {
            resultado[i] = heap.remover();
        }
        return resultado;
    }

    /**
     * Busca os k usuários com mais seguidores, com desempate pela ordem alfabética do @usuario.
     * @param {number} k Quantidade de usuários.
     * @returns {Usuario[]} Usuários do que tem mais seguidores para o que tem menos.
     * Complexidade O(n log k).
     */
    topSeguidos(k) {
        const usuarios = [];
        for (let id = 1; id < this.usuariosPorId.length; id++) {
            usuarios.push(this.usuariosPorId[id]);
        }

        return this.selecionarMelhores(usuarios, k, (a, b) => {
            if (a.qtdSeguidores !== b.qtdSeguidores) {
                return b.qtdSeguidores - a.qtdSeguidores;
            }
            if (a.usuario < b.usuario) {
                return -1;
            }
            if (a.usuario > b.usuario) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Busca os k posts com mais curtidas, com desempate pelo id do post.
     * @param {number} k Quantidade de posts.
     * @returns {Post[]} Posts do mais curtido para o menos curtido.
     * Complexidade O(n log k).
     */
    topCurtidos(k) {
        return this.selecionarMelhores(this.posts, k, (a, b) => {
            if (a.curtidas !== b.curtidas) {
                return b.curtidas - a.curtidas;
            }
            // O desempate pelo id deixa o resultado sempre igual quando dois posts têm as mesmas curtidas.
            return a.id - b.id;
        });
    }

    /**
     * Sugere até k pessoas para o usuário seguir, entre quem é seguido por alguém que ele segue (amigos de amigos).
     * @param {Usuario} usuario Usuário que vai receber as sugestões.
     * @param {number} k Quantidade máxima de sugestões.
     * @returns {Array} Lista com as sugestões e o total de candidatos. Cada sugestão é [Usuario, conexões em comum].
     * Complexidade O(V + A + c log k), sendo A as arestas olhadas a partir de quem o usuário segue e c a quantidade de candidatos.
     */
    sugerir(usuario, k) {
        const seguindo = this.grafo.saida[usuario.id];

        // jaSegue marca quem o usuário segue e emComum conta, para cada candidato, quantos desses seguidos também seguem ele.
        // Os dois são vetores indexados pelo id, então marcar e consultar custa O(1).
        const jaSegue = [];
        const emComum = [];
        for (let id = 0; id < this.usuariosPorId.length; id++) {
            jaSegue.push(false);
            emComum.push(0);
        }
        for (let i = 0; i < seguindo.length; i++) {
            jaSegue[seguindo[i]] = true;
        }

        // Para cada pessoa que o usuário segue, todos que ela segue estão a distância 2 e podem virar candidatos.
        const candidatos = [];
        for (let i = 0; i < seguindo.length; i++) {
            const amigosDoAmigo = this.grafo.saida[seguindo[i]];
            for (let j = 0; j < amigosDoAmigo.length; j++) {
                const candidato = amigosDoAmigo[j];
                // O próprio usuário e quem ele já segue não podem ser sugeridos.
                if (candidato === usuario.id || jaSegue[candidato]) {
                    continue;
                }
                // Na primeira vez que o candidato aparece ele entra na lista, e nas outras só soma mais uma conexão em comum.
                if (emComum[candidato] === 0) {
                    candidatos.push(candidato);
                }
                emComum[candidato]++;
            }
        }

        const avaliados = [];
        for (let i = 0; i < candidatos.length; i++) {
            avaliados.push([this.usuariosPorId[candidatos[i]], emComum[candidatos[i]]]);
        }

        const sugestoes = this.selecionarMelhores(avaliados, k, (a, b) => {
            if (a[1] !== b[1]) {
                return b[1] - a[1];
            }
            if (a[0].usuario < b[0].usuario) {
                return -1;
            }
            if (a[0].usuario > b[0].usuario) {
                return 1;
            }
            return 0;
        });

        return [sugestoes, candidatos.length];
    }

    /**
     * Separa a rede em comunidades, que são os componentes conexos com mais de um usuário.
     * @returns {Array} Lista com as comunidades em ordem decrescente de tamanho e a quantidade de usuários isolados.
     * Complexidade O(V + E) da BFS mais O(c log c) para ordenar as c comunidades.
     */
    encontrarComunidades() {
        const componentes = this.grafo.componentesConexos();
        const comunidades = [];
        let isolados = 0;

        for (let i = 0; i < componentes.length; i++) {
            // Um componente com um único usuário é alguém que não segue ninguém e não é seguido por ninguém.
            if (componentes[i].length === 1) {
                isolados++;
            } else {
                comunidades.push(componentes[i]);
            }
        }

        const ordenadas = mergeSort(comunidades, (a, b) => b.length - a.length);
        return [ordenadas, isolados];
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
