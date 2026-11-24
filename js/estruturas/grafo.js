/**
 * Grafo dirigido representado por listas de adjacência.
 */
class Grafo {
    /**
     * @param {number} qtdVertices Quantidade de vértices. Os vértices são numerados de 1 a qtdVertices.
     */
    constructor(qtdVertices) {
        this.qtdVertices = qtdVertices;
        this.qtdArestas = 0;
        // saida guarda os vértices para onde v aponta. Na rede social é quem v segue.
        this.saida = [];
        // entrada guarda os vértices que apontam para v. Na rede social são os seguidores de v.
        this.entrada = [];

        // A posição 0 fica vazia porque os vértices começam em 1.
        for (let v = 0; v <= qtdVertices; v++) {
            this.saida.push([]);
            this.entrada.push([]);
        }
    }

    /**
     * Adiciona uma aresta dirigida de origem para destino.
     * @param {number} origem Vértice de onde a aresta sai.
     * @param {number} destino Vértice onde a aresta chega.
     * Complexidade O(1).
     */
    adicionarAresta(origem, destino) {
        // A aresta é guardada nas duas listas para que dê para andar no grafo nos dois sentidos sem procurar nada.
        this.saida[origem].push(destino);
        this.entrada[destino].push(origem);
        this.qtdArestas++;
    }

    /**
     * Encontra os componentes conexos com busca em largura, tratando cada aresta como não dirigida.
     * @returns {number[][]} Lista de componentes, cada um com os vértices que fazem parte dele.
     * Complexidade O(V + E), porque cada vértice entra na fila uma vez e cada aresta é olhada duas vezes.
     */
    componentesConexos() {
        const visitado = [];
        for (let v = 0; v <= this.qtdVertices; v++) {
            visitado.push(false);
        }

        const componentes = [];
        for (let inicio = 1; inicio <= this.qtdVertices; inicio++) {
            // Um vértice já visitado pertence a um componente que foi encontrado antes.
            if (visitado[inicio]) {
                continue;
            }

            // A fila é um vetor com um índice de leitura, assim tirar o primeiro da fila custa O(1) sem usar shift.
            const fila = [inicio];
            let frente = 0;
            visitado[inicio] = true;

            while (frente < fila.length) {
                const atual = fila[frente];
                frente++;

                // Olhar a saída e a entrada faz a busca ignorar o sentido da aresta, como se o grafo fosse não dirigido.
                const listas = [this.saida[atual], this.entrada[atual]];
                for (let l = 0; l < listas.length; l++) {
                    for (let i = 0; i < listas[l].length; i++) {
                        const vizinho = listas[l][i];
                        // Marcar ao entrar na fila evita que o mesmo vértice seja colocado nela mais de uma vez.
                        if (!visitado[vizinho]) {
                            visitado[vizinho] = true;
                            fila.push(vizinho);
                        }
                    }
                }
            }

            // Como nada é removido do vetor, no final a fila contém exatamente os vértices do componente.
            componentes.push(fila);
        }

        return componentes;
    }

}

module.exports = Grafo;
