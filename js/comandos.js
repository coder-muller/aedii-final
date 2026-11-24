/**
 * Exibe os dados cadastrais e as contagens de um usuário.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera @usuario.
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoBuscar(rede, parametros, json) {
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

    if (json) {
        // O objeto aqui é só um registro com campos fixos para gerar o JSON, e não é usado como dicionário.
        console.log(JSON.stringify({
            usuario: encontrado.usuario,
            nome: encontrado.nome,
            dataCadastro: encontrado.dataCadastro,
            seguindo: encontrado.qtdSeguindo,
            seguidores: encontrado.qtdSeguidores,
            posts: encontrado.qtdPosts,
        }, null, 2));
        return;
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
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoPostsEntre(rede, parametros, json) {
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

    if (json) {
        const lista = [];
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            lista.push({ id: post.id, data: post.data, autor: post.autor.usuario, curtidas: post.curtidas, texto: post.texto });
        }
        console.log(JSON.stringify({ inicio: inicio, fim: fim, total: posts.length, posts: lista }, null, 2));
        return;
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`${post.data}  ${post.autor.usuario}  ${post.curtidas} curtidas  ${post.texto}`);
    }
    console.log(posts.length + " posts encontrados entre " + inicio + " e " + fim + ".");
}

/**
 * Mostra até k sugestões de pessoas para o usuário seguir, ordenadas pelas conexões em comum.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera @usuario e k.
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoSugerir(rede, parametros, json) {
    const usuario = parametros[0];
    const k = parametros[1];
    if (usuario === undefined || k === undefined || parametros.length > 2) {
        console.error("informe o usuário e a quantidade de sugestões. Uso: sugerir @usuario k");
        process.exit(1);
    }
    if (!/^\d+$/.test(k) || Number(k) < 1) {
        console.error("k deve ser um número inteiro maior que zero. Uso: sugerir @usuario k");
        process.exit(1);
    }

    const encontrado = rede.buscarUsuario(usuario);
    if (encontrado === null) {
        console.error("usuário " + usuario + " não encontrado.");
        process.exit(1);
    }

    const [sugestoes, totalCandidatos] = rede.sugerir(encontrado, Number(k));

    if (json) {
        const lista = [];
        for (let i = 0; i < sugestoes.length; i++) {
            lista.push({ posicao: i + 1, usuario: sugestoes[i][0].usuario, conexoesEmComum: sugestoes[i][1] });
        }
        console.log(JSON.stringify({ usuario: encontrado.usuario, totalCandidatos: totalCandidatos, sugestoes: lista }, null, 2));
        return;
    }

    if (sugestoes.length === 0) {
        if (encontrado.qtdSeguindo === 0) {
            console.log("nenhuma sugestão para " + encontrado.usuario + ". Esse usuário não segue ninguém.");
        } else {
            console.log("nenhuma sugestão para " + encontrado.usuario + ". As pessoas seguidas por esse usuário não seguem ninguém novo.");
        }
        return;
    }

    console.log("Sugestões para " + encontrado.usuario + ", " + sugestoes.length + " de " + totalCandidatos + " candidatos");
    for (let i = 0; i < sugestoes.length; i++) {
        const [sugerido, emComum] = sugestoes[i];
        const posicao = String(i + 1).padStart(String(sugestoes.length).length);
        console.log(`${posicao}. ${sugerido.usuario.padEnd(24)} ${emComum} conexões em comum`);
    }
}

/**
 * Mostra os k usuários com mais seguidores.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera k.
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoTopSeguidos(rede, parametros, json) {
    const k = parametros[0];
    if (k === undefined || parametros.length > 1 || !/^\d+$/.test(k) || Number(k) < 1) {
        console.error("k deve ser um número inteiro maior que zero. Uso: top-seguidos k");
        process.exit(1);
    }

    const usuarios = rede.topSeguidos(Number(k));

    if (json) {
        const lista = [];
        for (let i = 0; i < usuarios.length; i++) {
            lista.push({ posicao: i + 1, usuario: usuarios[i].usuario, seguidores: usuarios[i].qtdSeguidores });
        }
        console.log(JSON.stringify({ total: usuarios.length, usuarios: lista }, null, 2));
        return;
    }

    console.log("Top " + usuarios.length + " usuários com mais seguidores");
    for (let i = 0; i < usuarios.length; i++) {
        const posicao = String(i + 1).padStart(String(usuarios.length).length);
        console.log(`${posicao}. ${usuarios[i].usuario.padEnd(24)} ${usuarios[i].qtdSeguidores} seguidores`);
    }
}

/**
 * Mostra os k posts com mais curtidas, com autor, data e texto.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; espera k.
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoTopCurtidos(rede, parametros, json) {
    const k = parametros[0];
    if (k === undefined || parametros.length > 1 || !/^\d+$/.test(k) || Number(k) < 1) {
        console.error("k deve ser um número inteiro maior que zero. Uso: top-curtidos k");
        process.exit(1);
    }

    const posts = rede.topCurtidos(Number(k));

    if (json) {
        const lista = [];
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            lista.push({ posicao: i + 1, id: post.id, curtidas: post.curtidas, data: post.data, autor: post.autor.usuario, texto: post.texto });
        }
        console.log(JSON.stringify({ total: posts.length, posts: lista }, null, 2));
        return;
    }

    console.log("Top " + posts.length + " posts com mais curtidas");
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const posicao = String(i + 1).padStart(String(posts.length).length);
        console.log(`${posicao}. ${String(post.curtidas).padStart(4)} curtidas  ${post.data}  ${post.autor.usuario}  ${post.texto}`);
    }
}

/**
 * Mostra as comunidades da rede, do maior tamanho para o menor, e quantos usuários estão isolados.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; não recebe nenhum.
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoComunidades(rede, parametros, json) {
    if (parametros.length > 0) {
        console.error("o comando comunidades não recebe parâmetros. Uso: comunidades");
        process.exit(1);
    }

    const [comunidades, isolados] = rede.encontrarComunidades();

    if (json) {
        const lista = [];
        for (let i = 0; i < comunidades.length; i++) {
            lista.push({ posicao: i + 1, tamanho: comunidades[i].length });
        }
        console.log(JSON.stringify({
            totalComunidades: comunidades.length,
            comunidades: lista,
            usuariosIsolados: isolados,
            componentesConexos: comunidades.length + isolados,
        }, null, 2));
        return;
    }

    console.log(comunidades.length + " comunidades encontradas");
    for (let i = 0; i < comunidades.length; i++) {
        const posicao = String(i + 1).padStart(String(comunidades.length).length);
        console.log(`${posicao}. ${comunidades[i].length} usuários`);
    }
    console.log(isolados + " usuários isolados");
    console.log((comunidades.length + isolados) + " componentes conexos no total, contando cada isolado como um componente");
}

/**
 * Mostra os primeiros colocados do ranking de engajamento.
 * @param {RedeSocial} rede Rede social já carregada.
 * @param {string[]} parametros Parâmetros do comando; aceita --limite N (padrão 20).
 * @param {boolean} json Se verdadeiro, mostra o resultado em JSON.
 */
function comandoRanking(rede, parametros, json) {
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

    if (json) {
        const lista = [];
        for (let i = 0; i < quantidade; i++) {
            const usuario = ranking[i];
            lista.push({
                posicao: i + 1,
                usuario: usuario.usuario,
                engajamento: usuario.engajamento(),
                seguidores: usuario.qtdSeguidores,
                curtidas: usuario.totalCurtidas,
            });
        }
        console.log(JSON.stringify({ totalUsuarios: ranking.length, ranking: lista }, null, 2));
        return;
    }

    console.log("Ranking de engajamento, top " + quantidade + " de " + ranking.length + " usuários");
    for (let i = 0; i < quantidade; i++) {
        const usuario = ranking[i];
        const posicao = String(i + 1).padStart(String(quantidade).length);
        console.log(`${posicao}. ${usuario.usuario.padEnd(24)} engajamento ${String(usuario.engajamento()).padStart(4)}  (${usuario.qtdSeguidores} seguidores, ${usuario.totalCurtidas} curtidas)`);
    }
}

module.exports = {
    comandoBuscar,
    comandoPostsEntre,
    comandoSugerir,
    comandoTopSeguidos,
    comandoTopCurtidos,
    comandoComunidades,
    comandoRanking,
};
