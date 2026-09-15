/* HTML de apresentação. Textos dos dados são escapados antes da interpolação. */
const Views = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  function personCard(person, index, level, route) {
    const status = !route ? 'Rota ainda não testada'
      : route.path ? 'Conectado · ' + (route.path.length - 1) + ' passos' : 'Ainda sem caminho';
    return `<div class="person">
      <span class="avatar" aria-hidden="true">${Characters.portrait(person)}</span>
      <div class="person-copy">
        <b>${escape(person.name)} · ${escape(person.from)} → ${escape(person.to)}</b>
        <small>${escape(level.destinations[person.to])}</small>
        <small>${person.stairs ? 'Pode usar escadas' : 'Rota sem degraus'}</small>
        <small>Meta de percurso: até ${person.stepGoal} passos</small>
        <span class="route-state">${status}</span>
        ${route?.path ? `<button class="btn small ghost observe" data-person="${index}"
          aria-label="Observar a rota de ${escape(person.name)}">Observar rota</button>` : ''}
      </div>
    </div>`;
  }

  function levelCard(level, index, progress) {
    const unlocked = Storage.isUnlocked(progress, index);
    const best = progress.best[index];
    const economical = best >= Core.economyScore(level, level.efficiencyCost);
    const label = best ? 'Recorde de economia: ' + best + ' pontos'
      : unlocked ? 'Disponível para explorar' : 'Conclua a fase anterior';
    return `<button class="level-card" data-level="${index}" ${unlocked ? '' : 'disabled'}>
      <span><b>${level.id}. ${escape(level.title)}</b><small>${label}</small>
        ${!level.tutorial && economical ? '<span class="economy-badge">✦ Economia</span>' : ''}
        ${!level.tutorial && progress.shortBest?.[index] ? '<span class="economy-badge">✦ Percursos curtos</span>' : ''}
      </span><span aria-hidden="true">${unlocked ? '→' : '—'}</span>
    </button>`;
  }

  function challenges(level, edits, testedRoutes) {
    const spent=Core.cost(edits), complete=testedRoutes?.every(route=>route.path);
    const economy=spent>level.efficiencyCost ? 'Acima da meta'
      : complete ? 'Meta atingida' : 'Complete as rotas para avaliar';
    const people=level.people.map((person,index)=>{
      const route=testedRoutes?.[index];
      const status=!route ? 'Não testado · meta '+person.stepGoal : !route.path ? 'Sem caminho · meta '+person.stepGoal
        : (route.path.length-1)+' / '+person.stepGoal+' passos · '
          +(route.path.length-1<=person.stepGoal ? 'Meta atingida' : 'Acima da meta');
      return `<li><b>${escape(person.name)}</b><span>${status}</span></li>`;
    }).join('');
    return `<h3>Desafios desta solução</h3><p><b>Economia</b>
      <span>Gasto: ${spent} / ${level.efficiencyCost} · ${economy}</span></p>
      <h4>Percursos curtos</h4><ul>${people}</ul>`;
  }

  function hintBarrier(route, level) {
    if (!route || route.path) return null;
    const r=level.map.findIndex(row=>row.includes(route.person.to));
    if (r<0) return null;
    const c=level.map[r].indexOf(route.person.to), priority={stair:0,road:1,gap:2};
    const distance=item=>Math.abs(item.r-r)+Math.abs(item.c-c);
    // Prioriza o tipo de barreira; entre iguais, aproxima a pista do destino.
    // A distância não considera obstáculos e não prova o menor custo.
    return [...(route.barriers||[])].sort((a,b)=>priority[a.kind]-priority[b.kind]
      ||distance(a)-distance(b)||a.r-b.r||a.c-b.c)[0]||null;
  }

  function reachExplanation(route, barrier) {
    const count=route.reachable?.length||0;
    const reason=barrier ? ({stair:'Há uma escada sem rampa',road:'Há uma rua sem faixa',gap:'Há terreno sem calçada'})[barrier.kind]
      +' na borda do alcance, na linha '+(barrier.r+1)+', coluna '+(barrier.c+1)+'.' : 'Procure outra ligação entre as passagens permitidas.';
    const reach=count===1 ? route.person.name+' ainda está sem saída da casa.'
      : count===0 ? 'Não há alcance disponível para '+route.person.name+'.'
      : route.person.name+' pode alcançar '+count+' células, incluindo a casa.';
    return reach+' O tracejado mostra essa área. '+reason
      +(barrier?' A célula da pista está marcada em laranja.':'')+' Isso é uma pista; não é a única solução.';
  }

  function result(level, edits, points, total, last) {
    const report = Core.summary(level, edits);
    if (!report.complete) return '<p>Ainda há moradores sem caminho. Complete as rotas antes de ver o resultado.</p>';
    const routes = Core.routes(level, edits);
    const arrivals = routes.map(({person, path}) => `<div class="arrival-card">
      <span class="arrival-portrait" aria-hidden="true">${Characters.portrait(person)}</span>
      <div><b>${escape(person.name)} chegou · ${path.length - 1} passos</b>
        <p>${escape(Story.arrival(person, path, edits))}</p></div>
    </div>`).join('');
    const challenges = level.tutorial
      ? '<div class="result-note">Primeira conexão concluída! Nas próximas fases, experimente os desafios de economia e percurso.</div>'
      : `<div class="result-note"><b>Seus desafios nesta solução</b>
          <p>${report.efficient ? '✦ Economia conquistada' : 'Economia: tente gastar até ' + level.efficiencyCost}</p>
          <p>${report.shortRoutes ? '✦ Percursos curtos conquistados' : 'Percursos curtos: tente cumprir a meta de passos de cada morador'}</p>
          <p>Você pode conquistar os selos em partidas diferentes. Ambos são opcionais.</p></div>`;
    return `<div class="victory">
      <span class="eyebrow">${escape(level.title)} · fase concluída</span>
      <div class="result-number">${points}<span class="points-label"> pontos de economia</span></div>
      <div class="result-stats">
        <div><b>${report.connected}/${report.total}</b><span>moradores conectados</span></div>
        <div><b>${report.remaining}</b><span>unidades economizadas</span></div>
        ${report.total>1 ? `<div><b>${report.shared}</b><span>células compartilhadas</span></div>` : ''}
      </div>
      <div class="arrivals">${arrivals}</div>${challenges}
      <p class="result-caption">Construção: ${report.spent} de ${level.budget} unidades.
        Percursos: ${report.steps} passos no total. Os pontos medem economia;
        o selo de percursos curtos reconhece a distância de cada morador.</p>
      ${last ? `<p><b>Campanha concluída. Seu total de recordes: ${total} pontos de economia.</b></p>
        <p>${report.efficient&&report.shortRoutes ? 'Você conquistou os dois selos nesta solução!' : 'Desafio final: é possível conquistar os dois selos na mesma solução. Experimente outra rede de caminhos.'}</p>
        <div class="result-note"><b>Do bairro do jogo ao seu dia a dia</b><p>No caminho que você faz todo dia, onde uma escada ou uma rua sem faixa mudaria a rota de alguém?</p></div>` : ''}
    </div>`;
  }
  return Object.freeze({escape, personCard, levelCard, challenges, hintBarrier, reachExplanation, result});
})();
