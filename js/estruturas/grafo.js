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

}

module.exports = Grafo;
