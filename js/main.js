const aedlib = require("./aedlib"); // biblioteca base do projeto (obrigatória - não remova)
const RedeSocial = require("./rede-social");
const comandos = require("./comandos");

// Texto mostrado pelo comando ajuda e também quando o comando é inválido.
const AJUDA = `Uso
  node js/main.js <comando> [parâmetros] [--json]

Comandos
  buscar @usuario             Mostra nome, data de cadastro, quantos segue, seguidores e posts de um usuário.
                              Exemplo  node js/main.js buscar @henrique_nascimento

  sugerir @usuario k          Sugere até k pessoas para seguir, entre os amigos de amigos.
                              Exemplo  node js/main.js sugerir @henrique_nascimento 5

  comunidades                 Mostra as comunidades da rede e quantos usuários estão isolados.
                              Exemplo  node js/main.js comunidades

  posts-entre data1 data2     Lista os posts entre duas datas (AAAA-MM-DD), incluindo as duas.
                              Exemplo  node js/main.js posts-entre 2025-03-01 2025-03-31

  top-seguidos k              Mostra os k usuários com mais seguidores.
                              Exemplo  node js/main.js top-seguidos 10

  top-curtidos k              Mostra os k posts com mais curtidas.
                              Exemplo  node js/main.js top-curtidos 10

  ranking [--limite N]        Mostra o ranking de engajamento. Sem --limite mostra os 20 primeiros.
                              Exemplo  node js/main.js ranking --limite 20

  ajuda                       Mostra esta ajuda.
                              Exemplo  node js/main.js ajuda

Opções
  --json                      Mostra o resultado em JSON, para ser usado por outro programa.
                              Exemplo  node js/main.js top-seguidos 3 --json`;

/**
 * Lê o comando recebido por argumento, carrega os dados e executa o comando.
 */
function main() {
    // O comando começa na posição 2 e os parâmetros na 3.
    const comando = process.argv[2];
    const parametros = process.argv.slice(3);

    // A ajuda é tratada antes de carregar os dados, porque ela não precisa deles.
    if (comando === "ajuda") {
        console.log(AJUDA);
        return;
    }

    const [usuarios, seguidores, posts] = aedlib.socialCarregarDados();
    const rede = new RedeSocial(usuarios, seguidores, posts);

    switch (comando) {
        case "buscar":
            comandos.comandoBuscar(rede, parametros);
            break;
        case "posts-entre":
            comandos.comandoPostsEntre(rede, parametros);
            break;
        case "sugerir":
            comandos.comandoSugerir(rede, parametros);
            break;
        case "top-seguidos":
            comandos.comandoTopSeguidos(rede, parametros);
            break;
        case "top-curtidos":
            comandos.comandoTopCurtidos(rede, parametros);
            break;
        case "comunidades":
            comandos.comandoComunidades(rede, parametros);
            break;
        case "ranking":
            comandos.comandoRanking(rede, parametros);
            break;
        default:
            // Sem comando ou com um comando desconhecido, mostra o erro e a ajuda e termina com código 1.
            if (comando === undefined) {
                console.error("nenhum comando informado.");
            } else {
                console.error('comando "' + comando + '" inválido');
            }
            console.error("");
            console.error(AJUDA);
            process.exit(1);
    }
}

main();
