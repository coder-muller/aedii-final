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

    /**
     * Corrige o desbalanceamento de um nó aplicando as rotações necessárias.
     * @param {NoAVL} no Nó que pode estar desbalanceado.
     * @returns {NoAVL} Raiz da subárvore já balanceada.
     * Complexidade O(1).
     */
    balancear(no) {
        const fator = this.fatorBalanceamento(no);

        if (fator > 1) {
            // Se o filho esquerdo pende para a direita, ele é girado antes para que o desequilíbrio fique todo do mesmo lado.
            if (this.fatorBalanceamento(no.esquerda) < 0) {
                no.esquerda = this.rotacaoEsquerda(no.esquerda);
            }
            return this.rotacaoDireita(no);
        }

        if (fator < -1) {
            // Se o filho direito pende para a esquerda, ele é girado antes para que o desequilíbrio fique todo do mesmo lado.
            if (this.fatorBalanceamento(no.direita) > 0) {
                no.direita = this.rotacaoDireita(no.direita);
            }
            return this.rotacaoEsquerda(no);
        }

        return no;
    }

    /**
     * Insere um valor na árvore. Se a chave já existir, o valor é adicionado ao nó dela.
     * @param {string} chave Chave do valor (AAAA-MM-DD).
     * @param {*} valor Valor a ser guardado.
     * Complexidade O(log n).
     */
    inserir(chave, valor) {
        this.raiz = this.inserirNo(this.raiz, chave, valor);
    }

    /**
     * Desce recursivamente até a posição da chave, insere e rebalanceia o caminho de volta.
     * @param {NoAVL|null} no Raiz da subárvore atual.
     * @param {string} chave Chave do valor.
     * @param {*} valor Valor a ser guardado.
     * @returns {NoAVL} Nova raiz da subárvore depois da inserção.
     */
    inserirNo(no, chave, valor) {
        if (no === null) {
            return new NoAVL(chave, valor);
        }

        if (chave < no.chave) {
            no.esquerda = this.inserirNo(no.esquerda, chave, valor);
        } else if (chave > no.chave) {
            no.direita = this.inserirNo(no.direita, chave, valor);
        } else {
            // A chave já existe, então o valor entra na lista do nó e a estrutura da árvore não muda.
            no.valores.push(valor);
            return no;
        }

        // Na volta da recursão cada nó do caminho recalcula a altura e se corrige se ficou desbalanceado.
        this.atualizarAltura(no);
        return this.balancear(no);
    }

    /**
     * Busca todos os valores com chave entre inicio e fim, incluindo as duas pontas, em ordem crescente.
     * @param {string} inicio Menor chave do intervalo (AAAA-MM-DD).
     * @param {string} fim Maior chave do intervalo (AAAA-MM-DD).
     * @returns {Array} Valores encontrados em ordem crescente de chave.
     * Complexidade O(log n + k), sendo k a quantidade de nós dentro do intervalo.
     */
    buscarIntervalo(inicio, fim) {
        const resultado = [];
        this.buscarIntervaloNo(this.raiz, inicio, fim, resultado);
        return resultado;
    }

    /**
     * Percorre em ordem apenas os ramos que podem ter chaves dentro do intervalo.
     * @param {NoAVL|null} no Raiz da subárvore atual.
     * @param {string} inicio Menor chave do intervalo.
     * @param {string} fim Maior chave do intervalo.
     * @param {Array} resultado Lista que recebe os valores encontrados.
     */
    buscarIntervaloNo(no, inicio, fim, resultado) {
        if (no === null) {
            return;
        }

        // Só desce para a esquerda se o nó for maior que o início, porque senão tudo lá é menor que o intervalo.
        if (inicio < no.chave) {
            this.buscarIntervaloNo(no.esquerda, inicio, fim, resultado);
        }

        // A esquerda é visitada antes e a direita depois, assim os valores já saem em ordem crescente.
        if (inicio <= no.chave && no.chave <= fim) {
            for (let i = 0; i < no.valores.length; i++) {
                resultado.push(no.valores[i]);
            }
        }

        // Só desce para a direita se o nó for menor que o fim, porque senão tudo lá é maior que o intervalo.
        if (no.chave < fim) {
            this.buscarIntervaloNo(no.direita, inicio, fim, resultado);
        }
    }

}

module.exports = { ArvoreAVL, NoAVL };
