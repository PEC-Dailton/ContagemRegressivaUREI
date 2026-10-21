var elementoDataHora = document.getElementById("dataHora");
var elementoStatus = document.getElementById("statusContagem");
var botaoEditarMeta = document.getElementById("editarMetaSaresp");
var formularioMeta = document.getElementById("formularioMetaSaresp");
var campoMeta = document.getElementById("novoValorMetaSaresp");
var valorMeta = document.getElementById("valorMetaSaresp");
var statusMeta = document.getElementById("statusMetaSaresp");
var botaoCancelarMeta = document.getElementById("cancelarEdicaoMeta");
var chaveMetaSaresp = "metaSaresp";
var secaoAvaliacoes = document.querySelector(".avaliacoes");
var cartoes = document.querySelectorAll(".avaliacao");
var diasIniciaisPorCartao = [];
var dataInicial;
var titulo = document.querySelector(".cabecalho h1");

for (var indiceCartao = 0; indiceCartao < cartoes.length; indiceCartao++) {
    diasIniciaisPorCartao.push(Number(cartoes[indiceCartao].querySelector("strong").textContent));
}

function animarTextoEmLetras(elemento) {
    var texto = elemento.textContent.replace(/^\s+|\s+$/g, "");
    var partes = texto.split(/(\s+)/);
    var indiceLetra = 0;
    var fragmento = document.createDocumentFragment();

    elemento.setAttribute("aria-label", texto);

    for (var indiceParte = 0; indiceParte < partes.length; indiceParte++) {
        var parte = partes[indiceParte];
        if (/^\s+$/.test(parte)) {
            var espaco = document.createElement("span");
            espaco.className = "espaco";
            espaco.setAttribute("aria-hidden", "true");
            espaco.textContent = parte;
            fragmento.appendChild(espaco);
            continue;
        }

        var palavra = document.createElement("span");
        palavra.className = "palavra";
        palavra.setAttribute("aria-hidden", "true");

        for (var indiceCaractere = 0; indiceCaractere < parte.length; indiceCaractere++) {
            var elementoLetra = document.createElement("span");
            elementoLetra.className = "letra";
            elementoLetra.style.animationDelay = (indiceLetra * 45) + "ms";
            elementoLetra.style.webkitAnimationDelay = (indiceLetra * 45) + "ms";
            elementoLetra.textContent = parte.charAt(indiceCaractere);
            palavra.appendChild(elementoLetra);
            indiceLetra++;
        }

        fragmento.appendChild(palavra);
    }

    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
    elemento.appendChild(fragmento);
}

function animarLetrasTitulo() {
    if (titulo) {
        animarTextoEmLetras(titulo);
    }
}

function animarLetrasCartoes() {
    var textos = document.querySelectorAll(".avaliacao > p > span");
    for (var indiceTexto = 0; indiceTexto < textos.length; indiceTexto++) {
        animarTextoEmLetras(textos[indiceTexto]);
    }
}

function criarDataLocal(data) {
    var partes = data.split("-");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function formatarDataLocal(data) {
    var mes = String(data.getMonth() + 1);
    var dia = String(data.getDate());
    if (mes.length < 2) {
        mes = "0" + mes;
    }
    if (dia.length < 2) {
        dia = "0" + dia;
    }
    return data.getFullYear() + "-" + mes + "-" + dia;
}

function atualizarStatus(mensagem) {
    if (elementoStatus) {
        elementoStatus.textContent = mensagem;
    }
}

function formatarDataHora(data) {
    var dia = String(data.getDate());
    var mes = String(data.getMonth() + 1);
    var hora = String(data.getHours());
    var minuto = String(data.getMinutes());
    var segundo = String(data.getSeconds());

    if (dia.length < 2) { dia = "0" + dia; }
    if (mes.length < 2) { mes = "0" + mes; }
    if (hora.length < 2) { hora = "0" + hora; }
    if (minuto.length < 2) { minuto = "0" + minuto; }
    if (segundo.length < 2) { segundo = "0" + segundo; }

    return dia + "/" + mes + "/" + data.getFullYear() + ", " + hora + ":" + minuto + ":" + segundo;
}

function atualizarDataHora() {
    if (!elementoDataHora) {
        console.error("O elemento do relógio (#dataHora) não foi encontrado.");
        return;
    }

    var agora = new Date();
    elementoDataHora.textContent = formatarDataHora(agora);
    elementoDataHora.setAttribute("datetime", agora.toISOString());
}

function adicionarClasse(elemento, nomeClasse) {
    if ((" " + elemento.className + " ").indexOf(" " + nomeClasse + " ") === -1) {
        elemento.className += " " + nomeClasse;
    }
}

function removerClasse(elemento, nomeClasse) {
    elemento.className = (" " + elemento.className + " ")
        .replace(" " + nomeClasse + " ", " ")
        .replace(/^\s+|\s+$/g, "");
}

function animarNumero(elemento) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    removerClasse(elemento, "animar-numero");
    elemento.offsetWidth;
    adicionarClasse(elemento, "animar-numero");
    window.setTimeout(function () {
        removerClasse(elemento, "animar-numero");
    }, 700);
}

function inicializarEdicaoMeta() {
    if (!botaoEditarMeta || !formularioMeta || !campoMeta || !statusMeta || !botaoCancelarMeta || !valorMeta) {
        if (botaoEditarMeta) {
            console.error("O formulário de edição da meta está incompleto.");
        }
        return;
    }

    try {
        var metaSalva = window.localStorage.getItem(chaveMetaSaresp);
        if (metaSalva !== null) {
            var valorSalvo = Number(metaSalva);
            if (isNaN(valorSalvo) || valorSalvo < 0 || valorSalvo > 10) {
                throw new Error("O valor salvo deve estar entre 0 e 10.");
            }
            valorMeta.textContent = valorSalvo.toFixed(2).replace(".", ",");
            campoMeta.value = String(valorSalvo);
        }
    } catch (erro) {
        statusMeta.textContent = "Não foi possível carregar a meta salva. " + erro.message;
        console.error("Falha ao carregar a meta SARESP.", erro);
    }

    botaoEditarMeta.addEventListener("click", function () {
        formularioMeta.hidden = !formularioMeta.hidden;
        botaoEditarMeta.setAttribute("aria-expanded", String(!formularioMeta.hidden));
        if (!formularioMeta.hidden) {
            campoMeta.focus();
        }
    });

    botaoCancelarMeta.addEventListener("click", function () {
        formularioMeta.hidden = true;
        botaoEditarMeta.setAttribute("aria-expanded", "false");
        statusMeta.textContent = "";
        botaoEditarMeta.focus();
    });

    formularioMeta.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var novoValor = Number(campoMeta.value);
        if (isNaN(novoValor) || novoValor < 0 || novoValor > 10) {
            statusMeta.textContent = "Informe uma meta entre 0 e 10.";
            return;
        }

        try {
            window.localStorage.setItem(chaveMetaSaresp, String(novoValor));
            valorMeta.textContent = novoValor.toFixed(2).replace(".", ",");
            statusMeta.textContent = "Meta SARESP atualizada e salva neste navegador.";
            formularioMeta.hidden = true;
            botaoEditarMeta.setAttribute("aria-expanded", "false");
            botaoEditarMeta.focus();
        } catch (erro) {
            statusMeta.textContent = "Não foi possível salvar a meta. " + erro.message;
            console.error("Falha ao salvar a meta SARESP.", erro);
        }
    });
}

function contarDiasLetivos(dataFinal) {
    var dataContada = new Date(dataInicial.getTime());
    var feriadosNacionais = ["2026-11-02", "2026-11-20"];
    var total = 0;

    while (dataContada < dataFinal) {
        dataContada.setDate(dataContada.getDate() + 1);
        var diaDaSemana = dataContada.getDay();
        var ehDiaUtil = diaDaSemana >= 1 && diaDaSemana <= 5;
        var ehFeriado = feriadosNacionais.indexOf(formatarDataLocal(dataContada)) !== -1;

        if (ehDiaUtil && !ehFeriado) {
            total++;
        }
    }

    return total;
}

function atualizarContagem() {
    if (!secaoAvaliacoes || !dataInicial) {
        atualizarStatus("Não foi possível iniciar a contagem: falta a data inicial.");
        console.error("A seção de avaliações ou sua data inicial não foi encontrada.");
        return;
    }

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (hoje < dataInicial) {
        atualizarStatus("A contagem começa em " + formatarDataHora(dataInicial).split(",")[0] + ".");
        return;
    }

    var diasLetivosDecorridos = contarDiasLetivos(hoje);
    for (var indice = 0; indice < cartoes.length; indice++) {
        var elementoDias = cartoes[indice].querySelector("strong");
        if (!elementoDias) {
            console.error("Um cartão de avaliação está sem o número de dias.");
            continue;
        }

        var novaContagem = String(Math.max(0, diasIniciaisPorCartao[indice] - diasLetivosDecorridos));
        if (elementoDias.textContent !== novaContagem) {
            elementoDias.textContent = novaContagem;
            animarNumero(elementoDias);
        }
    }

    atualizarStatus("Contagem atualizada automaticamente: dias úteis de segunda a sexta, sem feriados nacionais. A contagem atualiza a cada minuto.");
}

if (secaoAvaliacoes && secaoAvaliacoes.getAttribute("data-data-inicial")) {
    dataInicial = criarDataLocal(secaoAvaliacoes.getAttribute("data-data-inicial"));
}

animarLetrasTitulo();
animarLetrasCartoes();
inicializarEdicaoMeta();
atualizarDataHora();
atualizarContagem();
window.setInterval(atualizarDataHora, 1000);
window.setInterval(atualizarContagem, 60000);

