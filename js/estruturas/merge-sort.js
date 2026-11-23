/**
 * Ordena uma lista com Merge Sort sem alterar a lista original.
 * @param {Array} lista Itens a serem ordenados.
 * @param {Function} comparar Recebe (a, b) e devolve negativo se a vem antes, positivo se b vem antes e 0 se são equivalentes.
 * @returns {Array} Nova lista ordenada.
 * Complexidade O(n log n) em qualquer caso.
 */
function mergeSort(lista, comparar) {
    const copia = [];
    for (let i = 0; i < lista.length; i++) {
        copia.push(lista[i]);
    }

    // O vetor auxiliar é criado uma vez só e reaproveitado em todas as intercalações.
    const auxiliar = [];
    ordenarTrecho(copia, auxiliar, 0, copia.length - 1, comparar);
    return copia;
}

/**
 * Divide o trecho ao meio, ordena cada metade e depois junta as duas.
 * @param {Array} lista Lista sendo ordenada.
 * @param {Array} auxiliar Vetor de apoio usado na intercalação.
 * @param {number} inicio Primeira posição do trecho.
 * @param {number} fim Última posição do trecho.
 * @param {Function} comparar Função de comparação.
 */
function ordenarTrecho(lista, auxiliar, inicio, fim, comparar) {
    // Um trecho com zero ou um item já está ordenado.
    if (inicio >= fim) {
        return;
    }

    const meio = Math.floor((inicio + fim) / 2);
    ordenarTrecho(lista, auxiliar, inicio, meio, comparar);
    ordenarTrecho(lista, auxiliar, meio + 1, fim, comparar);
    intercalar(lista, auxiliar, inicio, meio, fim, comparar);
}

/**
 * Junta duas metades vizinhas e já ordenadas em um único trecho ordenado.
 * @param {Array} lista Lista sendo ordenada.
 * @param {Array} auxiliar Vetor de apoio usado na intercalação.
 * @param {number} inicio Primeira posição da metade esquerda.
 * @param {number} meio Última posição da metade esquerda.
 * @param {number} fim Última posição da metade direita.
 * @param {Function} comparar Função de comparação.
 * Complexidade O(n), sendo n o tamanho do trecho.
 */
function intercalar(lista, auxiliar, inicio, meio, fim, comparar) {
    let esquerda = inicio;
    let direita = meio + 1;
    let posicao = inicio;

    // A cada volta o menor dos dois primeiros itens das metades vai para o vetor auxiliar.
    while (esquerda <= meio && direita <= fim) {
        // Em caso de empate o item da esquerda vai primeiro, o que mantém a ordem original e deixa a ordenação estável.
        if (comparar(lista[esquerda], lista[direita]) <= 0) {
            auxiliar[posicao] = lista[esquerda];
            esquerda++;
        } else {
            auxiliar[posicao] = lista[direita];
            direita++;
        }
        posicao++;
    }

    // Quando uma metade acaba, o que sobrou da outra já está em ordem e é copiado direto.
    while (esquerda <= meio) {
        auxiliar[posicao] = lista[esquerda];
        esquerda++;
        posicao++;
    }
    while (direita <= fim) {
        auxiliar[posicao] = lista[direita];
        direita++;
        posicao++;
    }

    for (let i = inicio; i <= fim; i++) {
        lista[i] = auxiliar[i];
    }
}

module.exports = mergeSort;
