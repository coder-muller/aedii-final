/*
 * Tabela hash com tratamento de colisões por encadeamento separado.
 * Cada posição do vetor armazena uma lista de pares de chave e valor,
 * chaves que colidem no mesmo índice são mantidas na mesma lista.
 */
class TabelaHash {
    /*
     * Inicializa a tabela com todas as posições vazias.
     * @param {number} tamanho Número de posições da tabela.
     */
    constructor(tamanho = 4001) {
        // 4001 é primo e corresponde a cerca do dobro do número de usuários,
        // resultando em fator de carga perto de 0,5 e listas de colisão curtas.
        this.tamanho = tamanho;
        this.posicoes = [];
        for (let i = 0; i < tamanho; i++) {
            this.posicoes.push([]);
        }
    }

    /*
     * Calcula o índice de uma chave usando hash polinomial.
     * A função é determinística: a mesma chave sempre gera o mesmo índice.
     * @param {string} chave Chave a ser mapeada, ex: "@john_doe".
     * @returns {number} Índice no intervalo [0, tamanho - 1].
     * Complexidade: O(l), em que "l" é o comprimento da chave.
     */
    hash(chave) {
        let h = 0;
        for (let i = 0; i < chave.length; i++) {
            // A multiplicação pela base torna o resultado dependente da posição de cada caractere e sem ela, anagramas como "@ab" e "@ba" colidiriam.
            h = (h * 31 + chave.charCodeAt(i)) % this.tamanho;
        }
        return h;
    }
}

module.exports = TabelaHash;
