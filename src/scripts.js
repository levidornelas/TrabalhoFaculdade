let tarefas = [];
let simulando = false;
let intervalo;
let tecnicaMemoria = 'Segmentação';
let quantum = 2;
let indiceRR = 0;
let historico = [];

function selecionarMemoria(botao) {
  document.querySelectorAll('.tecnicaMemoria button').forEach(b => b.classList.remove('active'));
  botao.classList.add('active');
  tecnicaMemoria = botao.innerText;
}

function adicionarTarefa() {
  const nome = document.getElementById('nomeProcesso').value || `Tarefa ${tarefas.length + 1}`;
  const prioridade = parseInt(document.getElementById('prioridade').value);
  const tempo = parseInt(document.getElementById('tempo').value);
  tarefas.push({ nome, prioridade, tempo, tempoRestante: tempo, chegada: Date.now() });
  renderTarefas();
}

function renderTarefas() {
  const lista = document.getElementById('listaTarefas');
  lista.innerHTML = '';
  tarefas.forEach((t, i) => {
    const div = document.createElement('div');
    div.innerHTML = `${t.nome} &nbsp;&nbsp; Priori.: ${t.prioridade} | Temp. ${t.tempoRestante}s 🗑`;
    div.onclick = () => {
      tarefas.splice(i, 1);
      renderTarefas();
    };
    lista.appendChild(div);
  });
}

function iniciarSimulacao() {
  const tarefasBackup = tarefas.map(t => ({ ...t })); // salva cópia para o histórico
  if (simulando || tarefas.length === 0) return;
  simulando = true;
  const painel = document.getElementById('simulacao');
  const tipo = document.getElementById('escalonamento').value;
  painel.innerHTML = `<h3>Simulando ${tipo} com ${tecnicaMemoria}...</h3>`;
  indiceRR = 0;
  quantum = parseInt(document.getElementById('quantum').value) || 2;

  intervalo = setInterval(() => {
    if (!simulando || tarefas.length === 0) {
      clearInterval(intervalo);
      simulando = false;
      painel.innerHTML += '<p style="color:green">Todas as tarefas foram concluídas.</p>';
      historico.push({
        tipo: tipo,
        memoria: tecnicaMemoria,
        horario: new Date().toLocaleString(),
        tarefas: [...tarefasBackup]
      });
      return;
    }

    let tarefaAtual;
    switch (tipo) {
      case 'FCFS':
        tarefas.sort((a, b) => a.chegada - b.chegada);
        tarefaAtual = tarefas[0];
        break;
      case 'SJF':
        tarefas.sort((a, b) => a.tempoRestante - b.tempoRestante);
        tarefaAtual = tarefas[0];
        break;
      case 'Priority':
        tarefas.sort((a, b) => b.prioridade - a.prioridade);
        tarefaAtual = tarefas[0];
        break;
      case 'Round Robin':
        if (indiceRR >= tarefas.length) indiceRR = 0;
        tarefaAtual = tarefas[indiceRR];
        break;
    }

    if (tipo === 'Round Robin') {
      let execTime = Math.min(quantum, tarefaAtual.tempoRestante);
      tarefaAtual.tempoRestante -= execTime;

      painel.innerHTML = `<p>Executando (RR): ${tarefaAtual.nome} (${execTime}s do quantum)</p>`;

      if (tarefaAtual.tempoRestante <= 0) {
        painel.innerHTML += `<p style="color:blue">${tarefaAtual.nome} concluída!</p>`;
        tarefas.splice(indiceRR, 1);
        if (indiceRR >= tarefas.length) indiceRR = 0;
      } else {
        indiceRR++;
      }
    } else {
      tarefaAtual.tempoRestante -= 1;
      painel.innerHTML = `<p>Executando: ${tarefaAtual.nome} (Tempo restante: ${tarefaAtual.tempoRestante}s)</p>`;

      if (tarefaAtual.tempoRestante <= 0) {
        painel.innerHTML += `<p style="color:blue">${tarefaAtual.nome} concluída!</p>`;
        tarefas.splice(tarefas.indexOf(tarefaAtual), 1);
      }
    }

    renderTarefas();
  }, 1000);
}



function historicoDeSimulacoes() {
  const painel = document.getElementById('historico');
  painel.innerHTML = '<h3>Histórico de Simulações</h3>';

  if (historico.length === 0) {
    painel.innerHTML += '<p>Nenhuma simulação realizada ainda.</p>';
    return;
  }

  historico.forEach((sim, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>Simulação ${index + 1}</strong><br>
      Tipo: ${sim.tipo}<br>
      Técnica de Memória: ${sim.memoria}<br>
      Horário: ${sim.horario}<br>
      Tarefas:
      <ul>
        ${sim.tarefas.map(t => `<li>${t.nome} - Prioridade: ${t.prioridade}, Tempo: ${t.tempo}s</li>`).join('')}
      </ul>
      <hr>
    `;
    painel.appendChild(div);
  });
}

function pararSimulacao() {
  simulando = false;
  clearInterval(intervalo);
  document.getElementById('simulacao').innerHTML = '<h3>Simulação parada.</h3>';
}