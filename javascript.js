const elementoDataHora = document.getElementById("dataHora");
const elementoStatus = document.getElementById("statusContagem");
const botaoEditarMeta = document.getElementById("editarMetaSaresp");
const formularioMeta = document.getElementById("formularioMetaSaresp");
const campoMeta = document.getElementById("novoValorMetaSaresp");
const valorMeta = document.getElementById("valorMetaSaresp");
const statusMeta = document.getElementById("statusMetaSaresp");
const chaveMetaSaresp = "metaSaresp";
const secaoAvaliacoes = document.querySelector(".avaliacoes");
const cartoes = Array.from(document.querySelectorAll(".avaliacao"));
const diasIniciaisPorCartao = new Map(
    cartoes.map((cartao) => [cartao, Number(cartao.querySelector("strong").textContent)]),
);
const dataInicial = criarDataLocal(secaoAvaliacoes.dataset.dataInicial);
const feriadosPorAno = new Map();
const titulo = document.querySelector(".cabecalho h1");
const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
});

function animarTextoEmLetras(elemento) {
    const texto = elemento.textContent.trim();
    elemento.setAttribute("aria-label", texto);
    let indiceLetra = 0;
    const fragmento = document.createDocumentFragment();

    texto.split(/(\s+)/u).forEach((parte) => {
        if (/^\s+$/u.test(parte)) {
            const espaco = document.createElement("span");
            espaco.className = "espaco";
            espaco.setAttribute("aria-hidden", "true");
            espaco.textContent = parte;
            fragmento.append(espaco);
            return;
        }

        const palavra = document.createElement("span");
        palavra.className = "palavra";
        palavra.setAttribute("aria-hidden", "true");

        Array.from(parte).forEach((letra) => {
            const elementoLetra = document.createElement("span");
            elementoLetra.className = "letra";
            elementoLetra.style.setProperty("--indice-letra", indiceLetra);
            elementoLetra.textContent = letra;
            palavra.append(elementoLetra);
            indiceLetra++;
        });

        fragmento.append(palavra);
    });

    elemento.replaceChildren(fragmento);
}

function animarLetrasTitulo() {
    animarTextoEmLetras(titulo);
}

function animarLetrasCartoes() {
    document.querySelectorAll(".avaliacao > p > span").forEach(animarTextoEmLetras);
}

function criarDataLocal(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function atualizarStatus(mensagem) {
    if (elementoStatus) {
        elementoStatus.textContent = mensagem;
    }
}

function formatarMeta(valor) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function inicializarEdicaoMeta() {
    try {
        const metaSalva = localStorage.getItem(chaveMetaSaresp);
        if (metaSalva !== null) {
            const valorSalvo = Number(metaSalva);
            if (!Number.isFinite(valorSalvo) || valorSalvo < 0 || valorSalvo > 10) {
                throw new Error("O valor salvo deve estar entre 0 e 10.");
            }
            valorMeta.textContent = formatarMeta(valorSalvo);
            campoMeta.value = String(valorSalvo);
        }
    } catch (erro) {
        statusMeta.textContent = `Não foi possível carregar a meta salva. ${erro.message}`;
        console.error("Falha ao carregar a meta SARESP.", erro);
    }

    botaoEditarMeta.addEventListener("click", () => {
        formularioMeta.hidden = !formularioMeta.hidden;
        botaoEditarMeta.setAttribute("aria-expanded", String(!formularioMeta.hidden));
        if (!formularioMeta.hidden) {
            campoMeta.focus();
        }
    });

    document.getElementById("cancelarEdicaoMeta").addEventListener("click", () => {
        formularioMeta.hidden = true;
        botaoEditarMeta.setAttribute("aria-expanded", "false");
        statusMeta.textContent = "";
        botaoEditarMeta.focus();
    });

    formularioMeta.addEventListener("submit", (evento) => {
        evento.preventDefault();
        if (!campoMeta.reportValidity()) {
            return;
        }

        const novoValor = Number(campoMeta.value);
        if (!Number.isFinite(novoValor) || novoValor < 0 || novoValor > 10) {
            statusMeta.textContent = "Informe uma meta entre 0 e 10.";
            return;
        }

        try {
            localStorage.setItem(chaveMetaSaresp, String(novoValor));
            valorMeta.textContent = formatarMeta(novoValor);
            statusMeta.textContent = "Meta SARESP atualizada e salva neste navegador.";
            formularioMeta.hidden = true;
            botaoEditarMeta.setAttribute("aria-expanded", "false");
            botaoEditarMeta.focus();
        } catch (erro) {
            statusMeta.textContent = `Não foi possível salvar a meta. ${erro.message}`;
            console.error("Falha ao salvar a meta SARESP.", erro);
        }
    });
}

function atualizarDataHora() {
    const agora = new Date();
    elementoDataHora.dateTime = agora.toISOString();
    elementoDataHora.textContent = formatadorDataHora.format(agora);
}

function animarNumero(elemento) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    elemento.animate(
        [
            { transform: "scale(0.85)", color: "#ffe45c" },
            { transform: "scale(1.12)", color: "#fff2a8", offset: 0.6 },
            { transform: "scale(1)", color: "#ffe45c" },
        ],
        { duration: 650, easing: "ease-out" },
    );
}

async function obterFeriados(ano) {
    if (feriadosPorAno.has(ano)) {
        return feriadosPorAno.get(ano);
    }

    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    if (!resposta.ok) {
        throw new Error(`A API respondeu com o status ${resposta.status}.`);
    }

    const dados = await resposta.json();
    if (!Array.isArray(dados)) {
        throw new Error("A resposta da API de feriados está em formato inválido.");
    }

    const feriados = new Set(
        dados
            .filter((feriado) => feriado.type === "national" && /^\d{4}-\d{2}-\d{2}$/.test(feriado.date))
            .map((feriado) => feriado.date),
    );
    feriadosPorAno.set(ano, feriados);
    return feriados;
}

async function obterFeriadosDoPeriodo(dataFinal) {
    const feriados = new Set();
    for (let ano = dataInicial.getFullYear(); ano <= dataFinal.getFullYear(); ano++) {
        const feriadosDoAno = await obterFeriados(ano);
        feriadosDoAno.forEach((data) => feriados.add(data));
    }
    return feriados;
}

function contarDiasLetivos(dataFinal, feriados) {
    const dataContada = new Date(dataInicial);
    let total = 0;

    while (dataContada < dataFinal) {
        dataContada.setDate(dataContada.getDate() + 1);
        const diaDaSemana = dataContada.getDay();
        const ehDiaUtil = diaDaSemana >= 1 && diaDaSemana <= 5;
        const ehFeriado = feriados.has(formatarDataLocal(dataContada));

        if (ehDiaUtil && !ehFeriado) {
            total++;
        }
    }

    return total;
}

async function atualizarContagem() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (hoje < dataInicial) {
        atualizarStatus(`A contagem começa em ${new Intl.DateTimeFormat("pt-BR").format(dataInicial)}. São considerados feriados nacionais.`);
        return;
    }

    atualizarStatus("Consultando feriados nacionais...");

    try {
        const feriados = await obterFeriadosDoPeriodo(hoje);
        const diasLetivosDecorridos = contarDiasLetivos(hoje, feriados);

        cartoes.forEach((cartao) => {
            const elementoDias = cartao.querySelector("strong");
            const diasIniciais = diasIniciaisPorCartao.get(cartao);
            const novaContagem = String(Math.max(0, diasIniciais - diasLetivosDecorridos));
            if (elementoDias.textContent !== novaContagem) {
                elementoDias.textContent = novaContagem;
                animarNumero(elementoDias);
            }
        });

        atualizarStatus(`Contagem desde ${new Intl.DateTimeFormat("pt-BR").format(dataInicial)}: segunda a sexta, excluindo feriados nacionais. Sábados e domingos não são contados.`);
    } catch (erro) {
        atualizarStatus(`Não foi possível consultar os feriados nacionais. Os valores iniciais foram mantidos. ${erro.message}`);
        console.error("Falha ao atualizar a contagem de dias letivos.", erro);
    }
}

animarLetrasTitulo();
animarLetrasCartoes();
inicializarEdicaoMeta();
atualizarDataHora();
atualizarContagem();
window.setInterval(atualizarDataHora, 1000);
window.setInterval(atualizarContagem, 60_000);
