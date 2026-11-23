/**
 * Nó da árvore AVL. Guarda uma chave e todos os valores associados a ela.
 */
class NoAVL {
    /**
     * @param {string} chave Chave do nó (AAAA-MM-DD).
     * @param {*} valor Primeiro valor associado à chave.
     */
    constructor(chave, valor) {
        this.chave = chave;
        // Vários posts podem ter a mesma data, então todos ficam no mesmo nó.
        this.valores = [valor];
        this.esquerda = null;
        this.direita = null;
        // Altura da subárvore que começa neste nó; uma folha tem altura 1.
        this.altura = 1;
    }

}

/**
 * Árvore binária de busca que se mantém balanceada por meio de rotações.
 */
class ArvoreAVL {
    constructor() {
        this.raiz = null;
    }

    /**
     * Retorna a altura de um nó.
     * @param {NoAVL|null} no Nó consultado.
     * @returns {number} Altura do nó, ou 0 se o nó não existir.
     */
    altura(no) {
        // Tratar o nó inexistente como altura 0 evita verificar null em todos os calculos de altura e de balanceamento.
        return no === null ? 0 : no.altura;
    }

    /**
     * Recalcula a altura de um nó a partir das alturas dos filhos.
     * @param {NoAVL} no Nó a ser atualizado.
     */
    atualizarAltura(no) {
        no.altura = 1 + Math.max(this.altura(no.esquerda), this.altura(no.direita));
    }

    /**
     * Calcula o fator de balanceamento de um nó.
     * @param {NoAVL} no Nó consultado.
     * @returns {number} Altura da esquerda menos altura da direita.
     */
    fatorBalanceamento(no) {
        // Positivo pende para a esquerda. Negativo pende para a direita.
        // Fora do intervalo [-1, 1], o nó está desbalanceado e precisa de rotação.
        return this.altura(no.esquerda) - this.altura(no.direita);
    }

    /**
     * Rotação simples à direita, usada quando o nó pende para a esquerda.
     * @param {NoAVL} no Nó desbalanceado.
     * @returns {NoAVL} Nova raiz da subárvore.
     * Complexidade O(1).
     */
    rotacaoDireita(no) {
        const novaRaiz = no.esquerda;
        const meio = novaRaiz.direita;

        // O filho esquerdo sobe e o nó desce para a direita dele.
        novaRaiz.direita = no;
        // A subárvore do meio é maior que novaRaiz e menor que no, então passa a ser o filho esquerdo de no.
        no.esquerda = meio;

        // A altura de no é atualizada primeiro porque agora ele está abaixo de novaRaiz.
        this.atualizarAltura(no);
        this.atualizarAltura(novaRaiz);

        return novaRaiz;
    }

    /**
     * Rotação simples à esquerda, usada quando o nó pende para a direita.
     * @param {NoAVL} no Nó desbalanceado.
     * @returns {NoAVL} Nova raiz da subárvore.
     * Complexidade O(1).
     */
    rotacaoEsquerda(no) {
        const novaRaiz = no.direita;
        const meio = novaRaiz.esquerda;

        // O filho direito sobe e o nó desce para a esquerda dele.
        novaRaiz.esquerda = no;
        // A subárvore do meio é maior que no e menor que novaRaiz, então passa a ser o filho direito de no.
        no.direita = meio;

        // A altura de no é atualizada primeiro porque agora ele está abaixo de novaRaiz.
        this.atualizarAltura(no);
        this.atualizarAltura(novaRaiz);

        return novaRaiz;
    }

}

module.exports = { ArvoreAVL, NoAVL };
