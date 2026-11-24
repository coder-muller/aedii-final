/**
 * Heap binária guardada em um vetor.
 */
class Heap {
    /**
     * @param {Function} comparar Recebe (a, b) e devolve negativo se a deve ficar mais perto do topo que b.
     */
    constructor(comparar) {
        // A função de comparação decide se o heap é de mínimo ou de máximo, então a mesma classe serve para os dois.
        this.comparar = comparar;
        // A árvore fica num vetor. Os filhos da posição i ficam em 2i + 1 e 2i + 2, e o pai fica em (i - 1) / 2 arredondado para baixo.
        this.itens = [];
    }

    /**
     * Retorna quantos itens estão no heap.
     * @returns {number} Quantidade de itens.
     */
    tamanho() {
        return this.itens.length;
    }

    /**
     * Retorna o item do topo sem removê-lo.
     * @returns {*} O item de maior prioridade, ou null se o heap estiver vazio.
     * Complexidade O(1).
     */
    topo() {
        return this.itens.length === 0 ? null : this.itens[0];
    }

    /**
     * Insere um item no heap.
     * @param {*} item Item a ser inserido.
     * Complexidade O(log n).
     */
    inserir(item) {
        // O item entra no fim do vetor, que é a primeira vaga livre da árvore, e depois sobe até a posição certa.
        this.itens.push(item);
        this.subir(this.itens.length - 1);
    }

    /**
     * Remove e retorna o item do topo.
     * @returns {*} O item de maior prioridade, ou null se o heap estiver vazio.
     * Complexidade O(log n).
     */
    remover() {
        if (this.itens.length === 0) {
            return null;
        }

        const topo = this.itens[0];
        const ultimo = this.itens.pop();

        // O último item ocupa o lugar do topo, porque tirar do fim do vetor não deixa buraco na árvore, e depois desce até a posição certa.
        if (this.itens.length > 0) {
            this.itens[0] = ultimo;
            this.descer(0);
        }

        return topo;
    }

    /**
     * Sobe um item trocando com o pai enquanto ele tiver mais prioridade que o pai (sift-up).
     * @param {number} posicao Posição do item no vetor.
     * Complexidade O(log n), porque no máximo percorre a altura da árvore.
     */
    subir(posicao) {
        while (posicao > 0) {
            const pai = Math.floor((posicao - 1) / 2);

            // Se o pai já tem prioridade maior ou igual, a ordem do heap está correta e o item para aqui.
            if (this.comparar(this.itens[posicao], this.itens[pai]) >= 0) {
                return;
            }

            [this.itens[posicao], this.itens[pai]] = [this.itens[pai], this.itens[posicao]];
            posicao = pai;
        }
    }

    /**
     * Desce um item trocando com o filho de maior prioridade enquanto algum filho tiver mais prioridade que ele (sift-down).
     * @param {number} posicao Posição do item no vetor.
     * Complexidade O(log n), porque no máximo percorre a altura da árvore.
     */
    descer(posicao) {
        const tamanho = this.itens.length;

        while (true) {
            const esquerdo = 2 * posicao + 1;
            const direito = 2 * posicao + 2;
            let escolhido = posicao;

            // Compara o item com os dois filhos para saber qual dos três deve ficar em cima.
            if (esquerdo < tamanho && this.comparar(this.itens[esquerdo], this.itens[escolhido]) < 0) {
                escolhido = esquerdo;
            }
            if (direito < tamanho && this.comparar(this.itens[direito], this.itens[escolhido]) < 0) {
                escolhido = direito;
            }

            // Se nenhum filho tem mais prioridade, o item chegou na posição certa.
            if (escolhido === posicao) {
                return;
            }

            // A troca é feita com o filho de maior prioridade para que ele possa ficar acima do outro filho.
            [this.itens[posicao], this.itens[escolhido]] = [this.itens[escolhido], this.itens[posicao]];
            posicao = escolhido;
        }
    }

}

module.exports = Heap;
