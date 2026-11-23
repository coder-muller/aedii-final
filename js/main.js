const aedlib = require("./aedlib"); // biblioteca base do projeto (obrigatória - não remova)
const RedeSocial = require("./rede-social");

/**
 * Exibe os dados cadastrais e as contagens de um usuário.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera @usuario.
 */
function comandoBuscar(rede, parametros) {
    const usuario = parametros[0];
    if (usuario === undefined) {
        console.error("informe o usuário. Uso: buscar @usuario");
        process.exit(1);
    }

    const encontrado = rede.buscarUsuario(usuario);
    if (encontrado === null) {
        console.error("usuário " + usuario + " não encontrado.");
        process.exit(1);
    }

    console.log(encontrado.usuario);
    console.log(`  Nome:        ${encontrado.nome}`);
    console.log(`  Cadastro:    ${encontrado.dataCadastro}`);
    console.log(`  Seguindo:    ${encontrado.qtdSeguindo}`);
    console.log(`  Seguidores:  ${encontrado.qtdSeguidores}`);
    console.log(`  Posts:       ${encontrado.qtdPosts}`);
}

/**
 * Carrega os dados, identifica o comando recebido por argumento e o executa.
 */
function main() {
    const [usuarios, seguidores, posts] = aedlib.socialCarregarDados();
    const rede = new RedeSocial(usuarios, seguidores, posts);

    // O comando começa na posição 2 e os parâmetros na 3.
    const comando = process.argv[2];
    const parametros = process.argv.slice(3);

    switch (comando) {
        case "buscar":
            comandoBuscar(rede, parametros);
            break;
        default:
            console.error('comando "' + comando + '" inválido');
            process.exit(1);
    }
}

main();
