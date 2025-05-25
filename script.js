function adicionarLinha() {
  const tabela = document.getElementById("tabelaItens").getElementsByTagName('tbody')[0];
  const indice = parseFloat(document.getElementById("indice").value.replace(',', '.')) / 100 || 0;
  const dataInicio = new Date(document.getElementById("dataInicio").value);
  const dataFim = new Date(document.getElementById("dataFim").value);
  if (isNaN(dataInicio)||isNaN(dataFim)) {alert("Preencha datas.");return;}
  gerarColunasAnos(dataInicio,dataFim);
  const novaLinha = tabela.insertRow();
  const campos=["item","descricao","unidade","quantidade","valorUnitario"];
  campos.forEach(campo=>{
    const celula=novaLinha.insertCell();
    const input=document.createElement("input");
    input.type="text";
    input.step="0.01";
    if(campo==="valorUnitario"){
      input.addEventListener("input",()=>{let v=input.value.replace(/\D/g,"");v=(parseInt(v,10)/100).toFixed(2);input.value=formatarMoeda(v);});
    }
    if(campo==="quantidade"){
      input.addEventListener("input",()=>{let v=input.value.replace(/\D/g,"");input.value=formatarNumero(v);});
    }
    input.oninput=()=>atualizarLinha(novaLinha,indice,dataInicio,dataFim);
    celula.appendChild(input);
  });
  for(let i=0;i<4;i++) novaLinha.insertCell().textContent="-";
  const anos=obterAnos(dataInicio,dataFim);
  anos.forEach(()=>novaLinha.insertCell().textContent="-");
  const celExcluir=novaLinha.insertCell();const btn=document.createElement("button");btn.textContent="Excluir";
  btn.onclick=()=>{novaLinha.remove();atualizarTotais();};btn.style.backgroundColor="#cc0000";btn.style.color="white";
  btn.style.border="none";btn.style.padding="5px 10px";btn.style.cursor="pointer";btn.style.borderRadius="4px";
  celExcluir.appendChild(btn);
}

function atualizarLinha(linha,indice,dataInicio,dataFim){
  const qtd=desformatarNumero(linha.cells[3].firstChild?.value);
  const vUnit=desformatarMoeda(linha.cells[4].firstChild?.value);
  const vTotal=qtd*vUnit;
  const vUnitUpd=vUnit*(1+indice);
  const vTotalUpd=qtd*vUnitUpd;
  const diff=vTotalUpd-vTotal;
  linha.cells[5].textContent=formatarMoeda(vTotal);
  linha.cells[6].textContent=formatarMoeda(vUnitUpd);
  linha.cells[7].textContent=formatarMoeda(vTotalUpd);
  linha.cells[8].textContent=formatarMoeda(diff);
  const anos=obterAnos(dataInicio,dataFim);
  const rateio=ratearPorAnoDias(vTotalUpd,dataInicio,dataFim);
  anos.forEach((ano,idx)=>linha.cells[9+idx].textContent=formatarMoeda(rateio[ano]||0));
  atualizarTotais();
}

function atualizarTotais(){
  const rows=document.getElementById("tabelaItens").tBodies[0].rows;
  let tA=0,tU=0,tD=0;
  Array.from(rows).forEach(r=>{tA+=desformatarMoeda(r.cells[5].textContent);tU+=desformatarMoeda(r.cells[7].textContent);tD+=desformatarMoeda(r.cells[8].textContent);});
  document.getElementById("totalAtual").textContent=formatarMoeda(tA);
  document.getElementById("totalAtualizado").textContent=formatarMoeda(tU);
  document.getElementById("totalDiferenca").textContent=formatarMoeda(tD);
}

function obterAnos(start,end){const a=[];for(let y=start.getFullYear();y<=end.getFullYear();y++)a.push(y);return a;}

function gerarColunasAnos(start,end){
  const head=document.getElementById("tabelaItens").tHead.rows[0];
  while(head.cells.length>9) head.deleteCell(-1);
  obterAnos(start,end).forEach(y=>{const th=document.createElement("th");th.textContent="Exercício "+y;head.appendChild(th);});
}

function ratearPorAnoDias(val,start,end){
  const dias={};const i=new Date(start);i.setHours(0,0,0,0);const f=new Date(end);f.setHours(0,0,0,0);
  for(let d=new Date(i);d<=f;d.setDate(d.getDate()+1)){const y=d.getFullYear();dias[y]=(dias[y]||0)+1;}
  const tot=Object.values(dias).reduce((x,y)=>x+y,0);const res={};
  for(const y in dias) res[y]=val*(dias[y]/tot);
  return res;
}

function copiarTabela(){const t=document.getElementById("tabelaItens"),r=document.createRange();r.selectNode(t);window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");alert("Tabela copiada");}

function formatarMoeda(v){return parseFloat(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function desformatarMoeda(f){return parseFloat((f||'').replace(/[R$\s.]/g,'').replace(',','.'))||0;}
function formatarNumero(v){return parseInt(v,10).toLocaleString('pt-BR');}
function desformatarNumero(f){return parseInt((f||'').replace(/\./g,''),10)||0;}
