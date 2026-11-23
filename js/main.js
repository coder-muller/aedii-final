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
 * Lista os posts publicados entre duas datas, incluindo as duas, em ordem cronológica.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera data inicial e data final.
 */
function comandoPostsEntre(rede, parametros) {
    const inicio = parametros[0];
    const fim = parametros[1];
    if (inicio === undefined || fim === undefined) {
        console.error("informe as duas datas. Uso: posts-entre AAAA-MM-DD AAAA-MM-DD");
        process.exit(1);
    }

    const datas = [inicio, fim];
    for (let i = 0; i < datas.length; i++) {
        const partes = datas[i].split("-");
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);
        // Alem do formato, confere se o mês e o dia existem, para recusar datas como 2025-13-40.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datas[i]) || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
            console.error("data " + datas[i] + " inválida. Use o formato AAAA-MM-DD.");
            process.exit(1);
        }
    }

    // As datas no formato AAAA-MM-DD podem ser comparadas como texto, porque o ano vem antes do mês e do dia.
    if (inicio > fim) {
        console.error("a data inicial " + inicio + " é maior que a data final " + fim + ".");
        process.exit(1);
    }

    const posts = rede.buscarPostsEntre(inicio, fim);
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`${post.data}  ${post.autor.usuario}  ${post.curtidas} curtidas  ${post.texto}`);
    }
    console.log(posts.length + " posts encontrados entre " + inicio + " e " + fim + ".");
}

/**
 * Mostra os primeiros colocados do ranking de engajamento.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; aceita --limite N (padrão 20).
 */
function comandoRanking(rede, parametros) {
    let limite = 20;

    for (let i = 0; i < parametros.length; i++) {
        if (parametros[i] === "--limite") {
            const valor = parametros[i + 1];
            if (valor === undefined || !/^\d+$/.test(valor) || Number(valor) < 1) {
                console.error("o limite deve ser um número inteiro maior que zero. Uso: ranking --limite 20");
                process.exit(1);
            }
            limite = Number(valor);
            // Pula o valor do limite, que já foi lido.
            i++;
        } else {
            console.error("parâmetro " + parametros[i] + " inválido. Uso: ranking --limite 20");
            process.exit(1);
        }
    }

    const ranking = rede.gerarRanking();
    // Se o limite for maior que o total de usuários, mostra todos.
    const quantidade = Math.min(limite, ranking.length);

    console.log("Ranking de engajamento, top " + quantidade + " de " + ranking.length + " usuários");
    for (let i = 0; i < quantidade; i++) {
        const usuario = ranking[i];
        const posicao = String(i + 1).padStart(String(quantidade).length);
        console.log(`${posicao}. ${usuario.usuario.padEnd(24)} engajamento ${String(usuario.engajamento()).padStart(4)}  (${usuario.qtdSeguidores} seguidores, ${usuario.totalCurtidas} curtidas)`);
    }
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
        case "posts-entre":
            comandoPostsEntre(rede, parametros);
            break;
        case "ranking":
            comandoRanking(rede, parametros);
            break;
        default:
            console.error('comando "' + comando + '" inválido');
            process.exit(1);
    }
}

main();
