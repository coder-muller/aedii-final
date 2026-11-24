# Relatório da Atividade Final de AEDII

## Rede Social Simplificada

**Integrantes**
- Guilherme Coelho Müller
- Arthur Ortiz Fonseca

**Linguagem** JavaScript, com todo o código na pasta `js/`.

**Como executar**

```bash
node js/main.js ajuda
node js/main.js buscar @henrique_nascimento
```

---

## 1. O que foi feito

Todas as funcionalidades pedidas foram implementadas, incluindo o bônus.

| Item | Comando | Estrutura usada |
|---|---|---|
| 3.1 | `buscar @usuario` | Tabela hash própria com encadeamento |
| 3.2 | `sugerir @usuario k` | Grafo com listas de adjacência e heap própria |
| 3.3 | `comunidades` | Grafo e busca em largura (BFS) |
| 3.4 | `posts-entre data1 data2` | Árvore AVL com rotações e busca por intervalo |
| 3.5 | `top-seguidos k` e `top-curtidos k` | Heap própria (heap de mínimo com até k itens) |
| 3.6 | `ranking [--limite N]` | Merge Sort próprio |
| 3.7 | API de linha de comando | Usa as estruturas acima, com `ajuda`, `--json` e códigos de saída |

Algumas decisões de interpretação do enunciado.

- **Comunidades e isolados.** Cada componente conexo com dois ou mais usuários é mostrado como uma comunidade. Os usuários sem nenhuma ligação são contados à parte, como "isolados". O comando também mostra o total de componentes conexos contando cada isolado como um componente, para que o resultado sirva para as duas leituras possíveis do enunciado.
- **Datas invertidas.** Em `posts-entre`, se a data inicial for maior que a final, o programa mostra uma mensagem de erro e termina com código 1, em vez de trocar as datas sozinho.
- **Desempates.** No `ranking`, no `top-seguidos` e no `sugerir`, empates são resolvidos pela ordem alfabética do `@usuario`. No `top-curtidos`, o empate é resolvido pelo menor id do post. Assim o resultado é sempre o mesmo para a mesma entrada.
- **Valor de k maior que o total.** Nos comandos com `k` ou `--limite`, um valor maior que a quantidade disponível não é erro. O programa mostra todos os itens que existem.

---

## 2. Como foi feito

### Organização dos arquivos

```
js/
├── main.js                 ponto de entrada da API
├── comandos.js             validação dos parâmetros e formatação da saída de cada comando
├── rede-social.js          monta as estruturas e responde às consultas
├── estruturas/
│   ├── tabela-hash.js      tabela hash com encadeamento separado
│   ├── arvore-avl.js       árvore AVL com rotações e busca por intervalo
│   ├── grafo.js            grafo dirigido com listas de adjacência e BFS
│   ├── heap.js             heap binária genérica
│   └── merge-sort.js       Merge Sort genérico
└── modelos/
    ├── usuario.js          classe Usuario
    └── post.js             classe Post
```

| Arquivo | Papel |
|---|---|
| `main.js` | Lê os argumentos do terminal, separa a opção `--json`, trata o comando `ajuda` e chama a função do comando pedido. Em comando inválido mostra o erro e a ajuda. |
| `comandos.js` | Uma função por comando (`comandoBuscar`, `comandoSugerir` etc.). Cada uma valida os parâmetros, chama a `RedeSocial` e imprime o resultado em texto ou em JSON. |
| `rede-social.js` | Classe `RedeSocial`. No construtor lê as linhas dos CSVs e monta todas as estruturas. Os métodos (`buscarUsuario`, `sugerir`, `encontrarComunidades`, `buscarPostsEntre`, `topSeguidos`, `topCurtidos`, `gerarRanking`) fazem as consultas. |
| `estruturas/*.js` | As cinco estruturas e algoritmos implementados do zero. Nenhum deles sabe o que é usuário ou post. Eles recebem chaves, valores e funções de comparação, então poderiam ser usados em outro projeto. |
| `modelos/*.js` | As classes `Usuario` e `Post`, que representam os dados. O `Usuario` guarda os contadores (seguindo, seguidores, posts, curtidas) e calcula o próprio engajamento. |

### Fluxo de execução

1. O `main.js` lê o comando. Se for `ajuda`, mostra a ajuda sem carregar os dados.
3. O construtor da `RedeSocial` percorre cada arquivo uma única vez.
   - `usuarios.csv` cria cada `Usuario`, guarda em um vetor indexado pelo id e insere na tabela hash com o `@usuario` como chave.
   - `seguidores.csv` adiciona cada conexão como aresta no grafo e atualiza os contadores de seguindo e seguidores.
   - `posts.csv` cria cada `Post`, insere na AVL pela data, guarda na lista de posts e atualiza a quantidade de posts e de curtidas do autor.
4. A função do comando chama o método da `RedeSocial` e imprime o resultado.

### Respeito às regras da seção 4

- Não são usados `Map`, `Set`, `WeakMap`, `Array.prototype.sort()` nem objetos `{}` como dicionário.
- Quando é preciso achar algo pelo id do usuário, o programa usa um **vetor indexado pelo id**. Os ids vão de 1 a 2000, então `usuariosPorId[5]` é o usuário de id 5, com acesso em O(1).
- Quando é preciso achar algo pelo `@usuario`, o programa usa a **tabela hash própria**.
- Objetos `{ ... }` aparecem só em `comandos.js`, na saída com `--json`. Ali eles são registros com campos fixos montados para o `JSON.stringify`. Nada é guardado ou buscado neles por chave, então não funcionam como dicionário.
- Não há bibliotecas externas. Os únicos recursos da linguagem usados além de vetores e classes são métodos de string (`split`, `padStart`, `padEnd`), `Math.max`, `Math.min`, `Math.floor`, expressões regulares para validar datas e números e o `JSON.stringify`.

---

## 3. Escolhas tomadas e por quê

### 3.1 Tabela hash

**Função de hash.** Hash polinomial com base 31.

```
h = 0
para cada caractere c da chave
    h = (h * 31 + código de c) % tamanho
```

- Multiplicar por 31 antes de somar cada caractere faz a posição de cada letra influenciar o resultado. Com uma soma simples, anagramas como `@ab` e `@ba` cairiam sempre na mesma posição.
- 31 é primo e ímpar, o que espalha bem os valores. É a mesma base usada pelo `String.hashCode()` do Java.
- O `% tamanho` é aplicado a cada caractere, e não só no final. Sem isso, o valor cresceria rápido e passaria de 2^53, limite a partir do qual o `Number` do JavaScript perde precisão. Como a operação de módulo pode ser feita a cada passo sem mudar o resultado, o número fica sempre pequeno.

**Colisões.** Encadeamento separado. Cada posição da tabela é uma lista de pares `[chave, valor]`, e as chaves que caem no mesmo índice ficam juntas nessa lista. A busca calcula o índice e percorre só a lista daquela posição, comparando as chaves. O `inserir` também percorre a lista para não duplicar uma chave que já existe.

O encadeamento foi escolhido em vez do endereçamento aberto porque é mais simples de implementar e de explicar, não sofre com agrupamento de chaves e continua funcionando mesmo se a tabela ficar cheia.

**Tamanho da tabela.** 4001 posições.

- É um número primo, o que ajuda o `%` a espalhar os índices.
- É cerca do dobro da quantidade de usuários (2000), o que dá **fator de carga 0,5**.

Os números medidos com os dados reais confirmam que a função espalha bem as chaves.

| Medida | Valor |
|---|---|
| Chaves inseridas | 2000 |
| Fator de carga | 0,500 |
| Posições vazias | 2416 (o esperado para um hash uniforme é cerca de 2427) |
| Posições com 1 chave | 1233 |
| Posições com 2 chaves | 296 |
| Posições com 3 ou mais chaves | 56 |
| Maior lista | 5 chaves |

### 3.2 Árvore AVL

**Por que AVL e não uma lista ordenada.** Uma lista ordenada também permitiria achar o início do intervalo com busca binária, em O(log n). O problema é a inserção, porque cada novo post exige deslocar os elementos seguintes, em O(n). Com 20.000 posts isso daria cerca de 200 milhões de deslocamentos no pior caso. Na AVL, a inserção custa O(log n), e a árvore fica pronta para receber novos posts sem reconstruir nada.

Uma árvore binária de busca comum também não serviria. Se as datas fossem inseridas em ordem crescente, ela viraria uma lista, com altura igual ao número de nós. A AVL evita isso porque o fator de balanceamento de cada nó (altura da esquerda menos altura da direita) fica sempre entre -1 e 1. Quando uma inserção quebra essa regra, a árvore se corrige com rotações.

**Rotações.** Os quatro casos são tratados no método `balancear`.

| Caso | Situação | Correção |
|---|---|---|
| Esquerda-esquerda | Nó pende para a esquerda e o filho esquerdo também | Rotação à direita |
| Direita-direita | Nó pende para a direita e o filho direito também | Rotação à esquerda |
| Esquerda-direita | Nó pende para a esquerda e o filho esquerdo pende para a direita | Rotação à esquerda no filho e depois à direita no nó |
| Direita-esquerda | Nó pende para a direita e o filho direito pende para a esquerda | Rotação à direita no filho e depois à esquerda no nó |

**Um nó por data.** Os dados têm 20.000 posts, mas só 669 datas diferentes. Cada nó guarda uma data e a lista de todos os posts dela. Assim a árvore tem 669 nós em vez de 20.000, e não é preciso decidir para que lado vão as chaves repetidas. As datas são comparadas como texto, o que funciona porque o formato `AAAA-MM-DD` coloca o ano antes do mês e o mês antes do dia.

Com os dados reais, a árvore ficou com **altura 11**. O limite teórico da AVL para 669 nós é cerca de 13,5 (1,44 · log2 n).

**Busca por intervalo sem percorrer a árvore inteira.** O método `buscarIntervaloNo` só desce para a esquerda se a data do nó for maior que o início do intervalo, porque senão tudo à esquerda é menor que o intervalo. Da mesma forma, só desce para a direita se a data do nó for menor que o fim. Como a esquerda é visitada antes do nó e a direita depois, os posts já saem em ordem cronológica.

Na consulta de março de 2025, a busca visitou **39 dos 669 nós**. Na consulta de um único dia, visitou 2.

### 3.3 Heap

**Implementação.** Heap binária guardada em um vetor. Os filhos da posição `i` ficam em `2i + 1` e `2i + 2`, e o pai fica em `(i - 1) / 2` arredondado para baixo. A inserção coloca o item no fim e o faz subir (sift-up). A remoção tira o topo, coloca o último item no lugar e o faz descer (sift-down).

A classe recebe uma função de comparação no construtor. Isso permite que a mesma classe funcione como heap de mínimo ou de máximo, sem código duplicado.

**Heap de mínimo no top-k.** Nos comandos `top-seguidos`, `top-curtidos` e `sugerir`, o método `selecionarMelhores` usa uma **heap de mínimo com no máximo k itens**.

1. Cada item entra na heap.
2. Quando a heap passa de k itens, o menor sai. O topo é sempre o pior entre os k melhores vistos até ali.
3. No final, sobram exatamente os k maiores. Eles saem da heap do menor para o maior, e o resultado é preenchido de trás para frente.

A heap de mínimo foi escolhida porque o custo fica em **O(n log k)** e a memória em O(k). Com uma heap de máximo, seria preciso colocar todos os n itens na heap e depois remover k, o que custa O(n + k log n) com construção em O(n), ou O(n log n) com inserções uma a uma, e ocupa memória O(n). Como k costuma ser pequeno (10 ou 20) e n vai até 20.000, a heap de mínimo é mais econômica.

### 3.4 Ordenação

**Algoritmo escolhido.** Merge Sort, usado no `ranking` e também para ordenar as comunidades por tamanho.

- **Sempre O(n log n).** O Quick Sort pode cair para O(n²) dependendo da escolha do pivô e da ordem dos dados. O Merge Sort não tem pior caso ruim.
- **É estável.** Na intercalação, em caso de empate, o item da metade esquerda vai primeiro. Itens equivalentes mantêm a ordem original. O Heap Sort não tem essa propriedade.
- **Recebe uma função de comparação.** O algoritmo não sabe nada sobre engajamento. A regra do ranking (maior engajamento primeiro e, no empate, ordem alfabética do `@usuario`) fica na `RedeSocial`, e o mesmo Merge Sort serve para qualquer outra ordenação.

O vetor auxiliar da intercalação é criado uma única vez e reaproveitado em todas as chamadas, em vez de criar vetores novos a cada divisão. A função devolve uma cópia ordenada e não altera a lista original.

### 3.5 Grafo

**Representação.** Grafo dirigido com **listas de adjacência** guardadas em vetores indexados pelo id. Cada vértice tem duas listas.

- `saida[v]` guarda quem v segue. É usada no `sugerir`.
- `entrada[v]` guarda quem segue v. Junto com a `saida`, permite tratar o grafo como não dirigido no `comunidades`.

Cada aresta é gravada nas duas listas, então andar em qualquer sentido não exige nenhuma busca.

A lista de adjacência foi escolhida em vez da matriz de adjacência porque o grafo é esparso. Uma matriz teria 2000 × 2000 = 4 milhões de células para guardar só 15.000 arestas, e percorrer os vizinhos de um vértice custaria O(V) em vez de O(grau). Com listas, o espaço é O(V + E).

**Comunidades (BFS).** O método `componentesConexos` faz uma busca em largura a partir de cada vértice ainda não visitado.

- A busca olha a lista de saída e a de entrada de cada vértice, o que faz o sentido da aresta ser ignorado.
- A fila é um vetor com um índice de leitura, então tirar o primeiro da fila custa O(1), sem usar `shift`. No final, esse vetor contém exatamente os vértices do componente.
- O vértice é marcado como visitado quando entra na fila, o que impede que ele entre duas vezes.

**Sugestões (amigos de amigos).** O método `sugerir` usa dois vetores indexados pelo id. O `jaSegue` marca quem o usuário já segue, e o `emComum` conta, para cada candidato, quantas pessoas seguidas pelo usuário também seguem o candidato. Para cada pessoa seguida, o método percorre quem ela segue e ignora o próprio usuário e quem ele já segue. Na primeira vez que um candidato aparece, ele entra na lista de candidatos. Depois, os k melhores são escolhidos com a heap.

---

## 4. Complexidade

Notação usada na tabela.

| Símbolo | Significado | Valor nos dados |
|---|---|---|
| U | usuários | 2000 |
| E | conexões (arestas) | 15.000 |
| P | posts | 20.000 |
| D | datas distintas (nós da AVL) | 669 |
| L | tamanho do `@usuario` | até cerca de 25 caracteres |
| k | parâmetro do comando | |

### Montagem das estruturas

| Etapa | Complexidade | Justificativa |
|---|---|---|
| Usuários na tabela hash | O(U · L) | Cada inserção calcula o hash em O(L) e percorre uma lista de tamanho médio constante |
| Conexões no grafo | O(E) | Cada aresta é adicionada nas duas listas em O(1) |
| Posts na AVL | O(P log D) | Cada inserção desce a altura da árvore, que é O(log D) |
| **Total** | **O(U · L + E + P log D)** | Feita uma única vez por execução |

### Comandos

| Comando | Complexidade | Justificativa |
|---|---|---|
| `buscar` | O(L) em média | Calcula o hash da chave em O(L) e percorre uma lista de colisão com tamanho médio constante. No pior caso, com todas as chaves na mesma posição, seria O(U · L). |
| `sugerir` | O(U + A + c log k) | O(U) para iniciar os vetores `jaSegue` e `emComum`. A é a soma dos graus de saída das pessoas que o usuário segue, porque cada uma dessas arestas é olhada uma vez. Os c candidatos passam por uma heap de no máximo k itens. |
| `comunidades` | O(U + E + c log c) | A BFS coloca cada vértice na fila uma vez e olha cada aresta duas vezes (uma por lista). Depois, as c comunidades são ordenadas pelo Merge Sort. |
| `posts-entre` | O(log D + m + p) | A busca desce até o início do intervalo em O(log D), visita os m nós com datas dentro do intervalo e copia os p posts encontrados. |
| `top-seguidos` | O(U log k) | Cada um dos U usuários passa por uma heap que nunca passa de k itens. |
| `top-curtidos` | O(P log k) | Cada um dos P posts passa por uma heap que nunca passa de k itens. |
| `ranking` | O(U log U) | Merge Sort dos U usuários. Calcular o engajamento de cada um é O(1), porque os contadores já foram preenchidos na carga. |

Tempos médios medidos com os dados reais, sem contar a carga.

| Comando | Tempo |
|---|---|
| `buscar` | menos de 0,001 ms |
| `posts-entre` (um mês) | 0,03 ms |
| `sugerir` (k = 5) | 0,18 ms |
| `comunidades` | 0,26 ms |
| `top-seguidos` (k = 10) | 0,37 ms |
| `ranking` | 0,73 ms |
| `top-curtidos` (k = 10) | 1,77 ms |

---

## 5. Testes feitos manualmente

Os testes abaixo foram executados no terminal. Além deles, os resultados de cada comando foram conferidos com cálculos feitos de forma independente direto dos arquivos CSV, como indicado em cada seção.

### 5.1 `buscar` (tabela hash)

```
$ node js/main.js buscar @henrique_nascimento
@henrique_nascimento
  Nome:        Henrique Nascimento
  Cadastro:    2022-10-26
  Seguindo:    10
  Seguidores:  12
  Posts:       8
```

Os valores foram conferidos contando as linhas dos CSVs. O usuário de id 1 aparece 10 vezes como seguidor, 12 vezes como seguido e é autor de 8 posts.

| Caso | Entrada | Saída | Código |
|---|---|---|---|
| Usuário existente | `buscar @henrique_nascimento` | Dados acima | 0 |
| **Usuário inexistente** | `buscar @nao_existe` | `usuário @nao_existe não encontrado.` | 1 |
| Sem parâmetro | `buscar` | `informe o usuário. Uso: buscar @usuario` | 1 |

A tabela hash também foi testada com tamanho 1, o que força todas as chaves a colidirem na mesma posição. As buscas continuaram encontrando o valor certo de cada chave e devolvendo `null` para chaves inexistentes.

### 5.2 `sugerir` (grafo e heap)

```
$ node js/main.js sugerir @henrique_nascimento 5
Sugestões para @henrique_nascimento, 5 de 65 candidatos
1. @andre_martins2          2 conexões em comum
2. @beatriz_moreira3        2 conexões em comum
3. @eduarda_rocha5          2 conexões em comum
4. @mateus_pereira2         2 conexões em comum
5. @sofia_freitas           2 conexões em comum
```

Conferência à mão. `@andre_martins2` tem 2 conexões em comum porque é seguido por `@marcelo_ribeiro` e `@pedro_costa2`, e os dois são seguidos por `@henrique_nascimento`.

| Caso | Entrada | Saída | Código |
|---|---|---|---|
| Caso normal | `sugerir @henrique_nascimento 5` | 5 sugestões, de 65 candidatos | 0 |
| **k maior que o número de candidatos** | `sugerir @henrique_nascimento 1000` | `Sugestões para @henrique_nascimento, 65 de 65 candidatos` e as 65 sugestões | 0 |
| **Usuário isolado** | `sugerir @mariana_gomes 5` | `nenhuma sugestão para @mariana_gomes. Esse usuário não segue ninguém.` | 0 |
| Segue pessoas que não seguem ninguém novo | `sugerir @isabela_pinto 5` | `nenhuma sugestão para @isabela_pinto. As pessoas seguidas por esse usuário não seguem ninguém novo.` | 0 |
| **Usuário inexistente** | `sugerir @nao_existe 5` | `usuário @nao_existe não encontrado.` | 1 |
| k inválido | `sugerir @henrique_nascimento abc` | `k deve ser um número inteiro maior que zero. Uso: sugerir @usuario k` | 1 |
| Sem k | `sugerir @henrique_nascimento` | `informe o usuário e a quantidade de sugestões. Uso: sugerir @usuario k` | 1 |

Conferência adicional. Os 2000 usuários foram testados com k = 1, 5 e 10000 e comparados com uma busca feita por força bruta. Os resultados foram idênticos, e nenhuma sugestão incluiu o próprio usuário ou alguém que ele já segue.

### 5.3 `comunidades` (grafo e BFS)

```
$ node js/main.js comunidades
18 comunidades encontradas
 1. 930 usuários
 2. 620 usuários
 3. 310 usuários
 4. 8 usuários
 5. 8 usuários
 6. 8 usuários
 7. 7 usuários
 8. 6 usuários
 9. 6 usuários
10. 6 usuários
11. 5 usuários
12. 5 usuários
13. 4 usuários
14. 4 usuários
15. 4 usuários
16. 4 usuários
17. 4 usuários
18. 3 usuários
58 usuários isolados
76 componentes conexos no total, contando cada isolado como um componente
```

| Verificação | Resultado |
|---|---|
| Grafo pequeno com `1→2` e `3→2` | 1, 2 e 3 ficam no mesmo componente, mesmo sem caminho dirigido de 1 até 3. Isso confirma que o sentido é ignorado. |
| Grafo sem arestas | Todos os vértices ficam isolados |
| Os 58 isolados | São exatamente os usuários com 0 seguindo e 0 seguidores |
| Soma dos tamanhos das comunidades mais os isolados | 2000 |
| Comparação com outro algoritmo (union-find) | Mesmas 18 comunidades com os mesmos tamanhos, e os mesmos 58 isolados |
| Parâmetro a mais (`comunidades 5`) | `o comando comunidades não recebe parâmetros. Uso: comunidades`, código 1 |

### 5.4 `posts-entre` (árvore AVL)

```
$ node js/main.js posts-entre 2025-03-01 2025-03-31
2025-03-01  @mariana_araujo3  0 curtidas  Hash grafo javascript treino viagem semana dados
2025-03-01  @renata_martins  0 curtidas  Grafo chuva semana muito heap música
2025-03-01  @quesia_dias2  3 curtidas  Viagem semana música ontem muito de incrível
...
2025-03-31  @felipe_lima3  0 curtidas  Recomendo sabe consegui fim feliz amanhã código chuva bom estudei como projeto
922 posts encontrados entre 2025-03-01 e 2025-03-31.
```

O primeiro post listado é do dia 01 e o último do dia 31, o que confirma que as duas datas estão incluídas. A contagem de 922 posts foi conferida filtrando o CSV diretamente.

| Caso | Entrada | Saída | Código |
|---|---|---|---|
| Um mês | `posts-entre 2025-03-01 2025-03-31` | 922 posts | 0 |
| Um único dia | `posts-entre 2025-09-01 2025-09-01` | 23 posts | 0 |
| **Intervalo sem posts** | `posts-entre 2020-01-01 2020-12-31` | `0 posts encontrados entre 2020-01-01 e 2020-12-31.` | 0 |
| **Datas invertidas** | `posts-entre 2025-03-31 2025-03-01` | `a data inicial 2025-03-31 é maior que a data final 2025-03-01.` | 1 |
| Mês inexistente | `posts-entre 2025-13-01 2025-12-31` | `data 2025-13-01 inválida. Use o formato AAAA-MM-DD.` | 1 |
| Formato errado | `posts-entre 2025-3-1 2025-03-31` | `data 2025-3-1 inválida. Use o formato AAAA-MM-DD.` | 1 |
| Falta uma data | `posts-entre 2025-03-01` | `informe as duas datas. Uso: posts-entre AAAA-MM-DD AAAA-MM-DD` | 1 |

Verificações da AVL.

| Verificação | Resultado |
|---|---|
| Os quatro casos de rotação (inserindo 30, 20, 10 / 10, 20, 30 / 30, 10, 20 / 10, 30, 20) | Todos terminam com 20 na raiz, 10 à esquerda e 30 à direita |
| 1000 chaves inseridas em ordem crescente | Altura 10 (sem balanceamento seria 1000) |
| Árvore inteira conferida após as inserções | Chaves em ordem, alturas corretas e todos os fatores entre -1 e 1 |
| Nós visitados na busca de um mês | 39 de 669 |
| Nós visitados na busca de um dia | 2 de 669 |

### 5.5 `top-seguidos` e `top-curtidos` (heap)

```
$ node js/main.js top-seguidos 10
Top 10 usuários com mais seguidores
 1. @nicolas_mendes          110 seguidores
 2. @mariana_costa           109 seguidores
 3. @renata_pinto            109 seguidores
 4. @isabela_freitas3        108 seguidores
 5. @larissa_moreira         108 seguidores
 6. @pedro_costa2            107 seguidores
 7. @karina_teixeira         18 seguidores
 8. @gabriela_teixeira       17 seguidores
 9. @lucas_souza             17 seguidores
10. @nicolas_santos3         17 seguidores
```

```
$ node js/main.js top-curtidos 5
Top 5 posts com mais curtidas
1. 2988 curtidas  2025-06-16  @zeca_pinto  De jogo de fim viagem livro café bom árvore cansado estruturas
2. 1274 curtidas  2025-01-17  @ursula_martins  Sol café finalmente ontem sabe algoritmo ruim
3.  789 curtidas  2026-06-03  @renata_souza2  Dados viagem algoritmo academia
4.  747 curtidas  2025-10-04  @mateus_vieira  Fim treino código recomendo muito
5.  704 curtidas  2026-05-13  @henrique_teixeira3  Hoje algoritmo bug estudei academia heap sol ruim
```

| Caso | Entrada | Saída | Código |
|---|---|---|---|
| Caso normal | `top-seguidos 10` | Lista acima | 0 |
| Empate | `top-seguidos 10` | `@mariana_costa` e `@renata_pinto`, com 109, aparecem em ordem alfabética | 0 |
| **k maior que o total** | `top-seguidos 5000` | `Top 2000 usuários com mais seguidores` e os 2000 usuários | 0 |
| k zero | `top-curtidos 0` | `k deve ser um número inteiro maior que zero. Uso: top-curtidos k` | 1 |
| k não numérico | `top-seguidos abc` | `k deve ser um número inteiro maior que zero. Uso: top-seguidos k` | 1 |
| Sem k | `top-seguidos` | `k deve ser um número inteiro maior que zero. Uso: top-seguidos k` | 1 |

Verificações da heap.

| Verificação | Resultado |
|---|---|
| Heap vazia | `topo` e `remover` devolvem `null` |
| Heap de mínimo com `[5, 3, 8, 1, 9, 2]` | Remove na ordem `1, 2, 3, 5, 8, 9` |
| Heap de máximo com os mesmos números | Remove na ordem `9, 8, 5, 3, 2, 1` |
| 200 rodadas com inserções e remoções aleatórias | A regra da heap foi conferida depois de cada operação, sem nenhuma falha |
| `top-seguidos` com k = 1, 5, 10, 50, 1999, 2000 e 5000 | Igual ao resultado de uma ordenação completa |
| `top-curtidos` com k = 1, 5, 10, 100, 20000 e 50000 | Igual ao resultado de uma ordenação completa |

### 5.6 `ranking` (Merge Sort)

```
$ node js/main.js ranking
Ranking de engajamento, top 20 de 2000 usuários
 1. @zeca_pinto              engajamento 3012  (7 seguidores, 2998 curtidas)
 2. @ursula_martins          engajamento 1301  (5 seguidores, 1291 curtidas)
 3. @renata_souza2           engajamento  939  (7 seguidores, 925 curtidas)
 4. @mateus_vieira           engajamento  771  (8 seguidores, 755 curtidas)
 5. @henrique_teixeira3      engajamento  732  (10 seguidores, 712 curtidas)
 6. @andre_ferreira          engajamento  670  (12 seguidores, 646 curtidas)
 7. @joao_rocha              engajamento  653  (7 seguidores, 639 curtidas)
 8. @patricia_barbosa        engajamento  537  (10 seguidores, 517 curtidas)
 9. @rafael_rocha            engajamento  531  (6 seguidores, 519 curtidas)
10. @eduarda_costa           engajamento  524  (8 seguidores, 508 curtidas)
11. @henrique_araujo3        engajamento  475  (10 seguidores, 455 curtidas)
12. @mariana_teixeira        engajamento  458  (5 seguidores, 448 curtidas)
13. @renata_pinto            engajamento  458  (109 seguidores, 240 curtidas)
14. @rafael_araujo2          engajamento  454  (5 seguidores, 444 curtidas)
15. @renata_gomes            engajamento  441  (5 seguidores, 431 curtidas)
16. @gabriela_nascimento     engajamento  424  (3 seguidores, 418 curtidas)
17. @pedro_costa2            engajamento  424  (107 seguidores, 210 curtidas)
18. @beatriz_mendes2         engajamento  411  (12 seguidores, 387 curtidas)
19. @isabela_freitas3        engajamento  396  (108 seguidores, 180 curtidas)
20. @zeca_cardoso4           engajamento  394  (4 seguidores, 386 curtidas)
```

O desempate alfabético aparece nas posições 12 e 13 (`@mariana_teixeira` e `@renata_pinto`, com 458) e nas posições 16 e 17 (`@gabriela_nascimento` e `@pedro_costa2`, com 424). A fórmula pode ser conferida em cada linha, por exemplo 7 × 2 + 2998 = 3012.

| Caso | Entrada | Saída | Código |
|---|---|---|---|
| Padrão | `ranking` | 20 primeiros | 0 |
| Com limite | `ranking --limite 3` | 3 primeiros | 0 |
| Limite maior que o total | `ranking --limite 5000` | Os 2000 usuários | 0 |
| Limite inválido | `ranking --limite abc` | `o limite deve ser um número inteiro maior que zero. Uso: ranking --limite 20` | 1 |
| Limite zero | `ranking --limite 0` | Mesma mensagem | 1 |
| Parâmetro desconhecido | `ranking 10` | `parâmetro 10 inválido. Uso: ranking --limite 20` | 1 |

Verificações do Merge Sort.

| Verificação | Resultado |
|---|---|
| Lista vazia, um item, já ordenada, ordem inversa, com repetidos e de tamanho ímpar | Todas ordenadas corretamente |
| Estabilidade com `b2 a1 c2 d1 e2` ordenados pelo número | `a1 d1 b2 c2 e2`, mantendo a ordem original nos empates |
| 100 listas aleatórias | Todas iguais à referência |
| Ranking completo dos 2000 usuários | As 2000 posições são idênticas às de um ranking calculado de forma independente direto dos CSVs |

---

## 6. API de linha de comando (bônus)

### 6.1 Comandos

| Comando | Parâmetros | Exemplo |
|---|---|---|
| `buscar` | `@usuario` | `node js/main.js buscar @henrique_nascimento` |
| `sugerir` | `@usuario k` | `node js/main.js sugerir @henrique_nascimento 5` |
| `comunidades` | nenhum | `node js/main.js comunidades` |
| `posts-entre` | `data1 data2` no formato `AAAA-MM-DD` | `node js/main.js posts-entre 2025-03-01 2025-03-31` |
| `top-seguidos` | `k` | `node js/main.js top-seguidos 10` |
| `top-curtidos` | `k` | `node js/main.js top-curtidos 10` |
| `ranking` | `--limite N` (opcional, padrão 20) | `node js/main.js ranking --limite 20` |
| `ajuda` | nenhum | `node js/main.js ajuda` |

Todos os comandos aceitam a opção **`--json`**, em qualquer posição.

### 6.2 Ajuda e comando inválido

`node js/main.js ajuda` lista todos os comandos, os parâmetros de cada um e um exemplo de uso, e termina com código 0. Um comando inválido, ou nenhum comando, mostra a mensagem de erro seguida da mesma ajuda e termina com código 1.

```
$ node js/main.js xyz
comando "xyz" inválido

Uso
  node js/main.js <comando> [parâmetros] [--json]

Comandos
  buscar @usuario             Mostra nome, data de cadastro, quantos segue, seguidores e posts de um usuário.
                              Exemplo  node js/main.js buscar @henrique_nascimento

  sugerir @usuario k          Sugere até k pessoas para seguir, entre os amigos de amigos.
                              Exemplo  node js/main.js sugerir @henrique_nascimento 5
...
```

### 6.3 Saída em JSON

```
$ node js/main.js top-seguidos 2 --json
{
  "total": 2,
  "usuarios": [
    {
      "posicao": 1,
      "usuario": "@nicolas_mendes",
      "seguidores": 110
    },
    {
      "posicao": 2,
      "usuario": "@mariana_costa",
      "seguidores": 109
    }
  ]
}
```

```
$ node js/main.js buscar @henrique_nascimento --json
{
  "usuario": "@henrique_nascimento",
  "nome": "Henrique Nascimento",
  "dataCadastro": "2022-10-26",
  "seguindo": 10,
  "seguidores": 12,
  "posts": 8
}
```

Campos do JSON de cada comando.

| Comando | Campos |
|---|---|
| `buscar` | `usuario`, `nome`, `dataCadastro`, `seguindo`, `seguidores`, `posts` |
| `sugerir` | `usuario`, `totalCandidatos`, `sugestoes` (com `posicao`, `usuario`, `conexoesEmComum`) |
| `comunidades` | `totalComunidades`, `comunidades` (com `posicao`, `tamanho`), `usuariosIsolados`, `componentesConexos` |
| `posts-entre` | `inicio`, `fim`, `total`, `posts` (com `id`, `data`, `autor`, `curtidas`, `texto`) |
| `top-seguidos` | `total`, `usuarios` (com `posicao`, `usuario`, `seguidores`) |
| `top-curtidos` | `total`, `posts` (com `posicao`, `id`, `curtidas`, `data`, `autor`, `texto`) |
| `ranking` | `totalUsuarios`, `ranking` (com `posicao`, `usuario`, `engajamento`, `seguidores`, `curtidas`) |

A saída de todos os comandos com `--json` foi validada com um leitor de JSON, inclusive nos casos com lista vazia. O redirecionamento para arquivo (`node js/main.js top-seguidos 3 --json > saida.json`) gera um arquivo com JSON válido.

### 6.4 Erros e códigos de saída

- Em caso de sucesso, o código de saída é 0.
- Parâmetros faltando ou inválidos (data mal formatada, `k` não numérico, usuário inexistente, datas invertidas, comando inválido) geram uma mensagem clara e terminam com `process.exit(1)`.
- As mensagens de erro e a ajuda do comando inválido são escritas no **stderr**. Com `--json`, o stdout fica vazio quando há erro, então um programa que lê o JSON nunca recebe texto misturado.

| Entrada | stderr | stdout | Código |
|---|---|---|---|
| `buscar @nao_existe --json` | `usuário @nao_existe não encontrado.` | vazio | 1 |
| `sugerir @henrique_nascimento abc --json` | `k deve ser um número inteiro maior que zero. Uso: sugerir @usuario k` | vazio | 1 |
| `posts-entre 2025-13-01 2025-03-31 --json` | `data 2025-13-01 inválida. Use o formato AAAA-MM-DD.` | vazio | 1 |
| `top-curtidos 0 --json` | `k deve ser um número inteiro maior que zero. Uso: top-curtidos k` | vazio | 1 |
| `xyz --json` | `comando "xyz" inválido` e a ajuda | vazio | 1 |

### 6.5 Separação entre estruturas e interface

O código foi dividido em camadas, e cada camada só conhece a de baixo.

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Entrada | `main.js` | Lê `process.argv`, separa o `--json`, trata `ajuda` e comando inválido e escolhe o comando |
| Interface | `comandos.js` | Valida os parâmetros, mostra as mensagens de erro e formata a saída em texto ou JSON |
| Lógica | `rede-social.js` | Monta as estruturas a partir dos dados e responde às consultas |
| Estruturas | `estruturas/` | Tabela hash, AVL, grafo, heap e Merge Sort, sem nenhuma referência a usuários ou posts |
| Modelos | `modelos/` | Classes `Usuario` e `Post` |

Por causa dessa divisão, a API foi criada sem mudar nenhuma estrutura de dados. Adicionar o `--json`, por exemplo, alterou só o `main.js` e o `comandos.js`. A saída sem `--json` de todos os comandos foi comparada antes e depois dessa mudança e continuou idêntica.

Os argumentos são lidos com `process.argv`, que é o recurso permitido pelo enunciado. A API não usa nenhuma estrutura proibida pela seção 4.
