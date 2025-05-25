function adicionarLinha() {
  const tabela = document.getElementById("tabelaItens").getElementsByTagName('tbody')[0];
  const indice = parseFloat(document.getElementById("indice").value.replace(',', '.')) / 100 || 0;
  const dataInicio = new Date(document.getElementById("dataInicio").value);
  const dataFim = new Date(document.getElementById("dataFim").value);

  if (isNaN(dataInicio) || isNaN(dataFim)) {
    alert("Por favor, preencha as datas de início e fim do contrato.");
    return;
  }

  gerarColunasAnos(dataInicio, dataFim);

  const novaLinha = tabela.insertRow();
  const campos = ["item", "descricao", "unidade", "quantidade", "valorUnitario"];

  campos.forEach(campo => {
    const celula = novaLinha.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.step = "0.01";

    if (campo === "valorUnitario") {
      input.addEventListener("input", () => {
        let val = input.value.replace(/\D/g, "");
        val = (parseInt(val, 10) / 100).toFixed(2);
        input.value = formatarMoeda(val);
      });
    }

    if (campo === "quantidade") {
      input.addEventListener("input", () => {
        let val = input.value.replace(/\D/g, "");
        input.value = formatarNumero(val);
      });
    }

    input.oninput = () => atualizarLinha(novaLinha, indice, dataInicio, dataFim);
    celula.appendChild(input);
  });

  for (let i = 0; i < 4; i++) {
    novaLinha.insertCell().textContent = "-";
  }

  const anos = obterAnos(dataInicio, dataFim);
  anos.forEach(() => novaLinha.insertCell().textContent = "-");

  const celulaExcluir = novaLinha.insertCell();
  const botaoExcluir = document.createElement("button");
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.onclick = () => {
    novaLinha.remove();
    atualizarTotais();
  };
  botaoExcluir.style.backgroundColor = "#cc0000";
  botaoExcluir.style.color = "white";
  botaoExcluir.style.border = "none";
  botaoExcluir.style.padding = "5px 10px";
  botaoExcluir.style.cursor = "pointer";
  botaoExcluir.style.borderRadius = "4px";
  celulaExcluir.appendChild(botaoExcluir);
}

function atualizarLinha(linha, indice, dataInicio, dataFim) {
  const quantidade = desformatarNumero(linha.cells[3].firstChild?.value);
  const valorUnitario = desformatarMoeda(linha.cells[4].firstChild?.value);

  const valorTotalAtual = quantidade * valorUnitario;
  const valorUnitarioAtualizado = valorUnitario * (1 + indice);
  const valorTotalAtualizado = quantidade * valorUnitarioAtualizado;
  const diferenca = valorTotalAtualizado - valorTotalAtual;

  linha.cells[5].textContent = formatarMoeda(valorTotalAtual);
  linha.cells[6].textContent = formatarMoeda(valorUnitarioAtualizado);
  linha.cells[7].textContent = formatarMoeda(valorTotalAtualizado);
  linha.cells[8].textContent = formatarMoeda(diferenca);

  const anos = obterAnos(dataInicio, dataFim);
  const rateio = ratearPorAnoDias(valorTotalAtualizado, dataInicio, dataFim);

  anos.forEach((ano, idx) => {
    const valor = rateio[ano] || 0;
    linha.cells[9 + idx].textContent = formatarMoeda(valor);
  });

  atualizarTotais();
}

function atualizarTotais() {
  const tbody = document.getElementById("tabelaItens").getElementsByTagName('tbody')[0];
  let totalAtual = 0;
  let totalAtualizado = 0;
  let totalDiferenca = 0;

  Array.from(tbody.rows).forEach(row => {
    totalAtual += desformatarMoeda(row.cells[5].textContent);
    totalAtualizado += desformatarMoeda(row.cells[7].textContent);
    totalDiferenca += desformatarMoeda(row.cells[8].textContent);
  });

  document.getElementById("totalAtual").textContent = formatarMoeda(totalAtual);
  document.getElementById("totalAtualizado").textContent = formatarMoeda(totalAtualizado);
  document.getElementById("totalDiferenca").textContent = formatarMoeda(totalDiferenca);
}

function obterAnos(dataInicio, dataFim) {
  const anos = [];
  for (let ano = dataInicio.getFullYear(); ano <= dataFim.getFullYear(); ano++) {
    anos.push(ano);
  }
  return anos;
}

function gerarColunasAnos(dataInicio, dataFim) {
  const thead = document.getElementById("tabelaItens").getElementsByTagName("thead")[0];
  const row = thead.rows[0];
  while (row.cells.length > 9) row.deleteCell(-1);

  obterAnos(dataInicio, dataFim).forEach(ano => {
    const th = document.createElement("th");
    th.textContent = "Exercício " + ano;
    row.appendChild(th);
  });

  if (row.cells.length === 9 + obterAnos(dataInicio, dataFim).length) {
    const th = document.createElement("th");
    th.textContent = "Ações";
    row.appendChild(th);
  }
}

function ratearPorAnoDias(valorTotal, dataInicio, dataFim) {
  const diasPorAno = {};
  const dataAtual = new Date(dataInicio);

  while (dataAtual <= dataFim) {
    const ano = dataAtual.getFullYear();
    if (!diasPorAno[ano]) diasPorAno[ano] = 0;
    diasPorAno[ano]++;
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  const totalDias = Object.values(diasPorAno).reduce((a, b) => a + b, 0);
  const valoresRateados = {};
  for (const ano in diasPorAno) {
    valoresRateados[ano] = valorTotal * (diasPorAno[ano] / totalDias);
  }
  return valoresRateados;
}

function copiarTabela() {
  const tabela = document.getElementById("tabelaItens");
  const range = document.createRange();
  range.selectNode(tabela);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  alert("Tabela copiada para a área de transferência.");
}

function formatarMoeda(valor) {
  return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function desformatarMoeda(valorFormatado) {
  if (!valorFormatado) return 0;
  return parseFloat(valorFormatado.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

function formatarNumero(valor) {
  return parseInt(valor, 10).toLocaleString('pt-BR');
}

function desformatarNumero(valorFormatado) {
  if (!valorFormatado) return 0;
  return parseInt(valorFormatado.replace(/\./g, '')) || 0;
}
