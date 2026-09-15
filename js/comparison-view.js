/* Apresentação da comparação. Os mapas são somente leitura; o tabuleiro continua em main.js. */
const ComparisonView = (() => {
  const escape = Views.escape;

  function map(level, report, label) {
    const width = level.map[0].length;
    const cells = level.map.map((row,r) => Array.from(row).map((_,c) => {
      const data = tileData(level,r,c,report.edits);
      return `<span class="tile ${data.kind}${data.built ? ' built' : ''}">${data.art}
        ${data.mark ? '<span class="mark">'+escape(data.mark)+'</span>' : ''}</span>`;
    }).join('')).join('');
    const lines = Core.routes(level,report.edits).map(({person,path},index) => !path ? ''
      : `<polyline points="${path.map(([r,c])=>(c+.5)+','+(r+.5)).join(' ')}"
          stroke="${escape(person.color)}" ${index ? 'stroke-dasharray="'+(index===1 ? '.2 .13' : '.035 .15')+'"' : ''}/>`).join('');
    const journeys=report.people.map(person=>person.name+': '+(person.steps===null ? 'sem caminho' : person.steps+' passos')).join('; ');
    return `<div class="comparison-map" role="img" aria-label="${escape(label)}: ${report.connected} de ${report.total} moradores com caminho, gasto ${report.spent}. ${escape(journeys)}.">
      <div class="comparison-grid comparison-columns-${width}" aria-hidden="true">${cells}</div>
      <svg class="comparison-routes" viewBox="0 0 ${width} ${level.map.length}" aria-hidden="true" focusable="false">${lines}</svg>
    </div>`;
  }

  function card(level,report,label,isCurrent) {
    const badges = level.tutorial ? 'Fase de aprendizado' : !report.complete ? 'Complete as rotas para atingir as metas'
      : 'Metas atendidas: '+([report.efficient ? 'Economia' : '',report.shortRoutes ? 'Percursos curtos' : ''].filter(Boolean).join(' · ') || 'nenhuma ainda');
    return `<section class="comparison-card${isCurrent ? ' comparison-current' : ''}">
      <h3>${label}</h3><p class="comparison-metrics"><b>${report.spent}</b> de ${level.budget} unidades · <b>${report.connected}/${report.total}</b> com caminho</p>
      ${map(level,report,label)}<p class="comparison-badges">${badges}</p></section>`;
  }

  function change(delta,unit) {
    if(delta===null)return 'Não comparável';
    if(delta===0)return 'Igual';
    return Math.abs(delta)+' '+unit+(delta<0 ? ' a menos' : ' a mais');
  }

  function table(pair) {
    const steps = n => n===null ? 'Sem caminho' : n+' passos';
    return `<table class="comparison-table"><caption>O que muda de A para B?</caption>
      <thead><tr><th scope="col">Medida</th><th scope="col">A</th><th scope="col">B</th><th scope="col">Diferença em B</th></tr></thead>
      <tbody><tr><th scope="row">Gasto</th><td>${pair.a.spent}</td><td>${pair.b.spent}</td><td>${change(pair.costDelta,'unid.')}</td></tr>
      ${pair.a.people.map((person,i)=>`<tr><th scope="row">${escape(person.name)}<small>${escape(person.from)} → ${escape(person.to)}</small></th>
        <td>${steps(person.steps)}</td><td>${steps(pair.b.people[i].steps)}</td><td>${change(pair.stepDeltas[i],'passos')}</td></tr>`).join('')}
      </tbody></table>`;
  }

  function render(level,reference,current,message='') {
    const b = Comparison.analyse(level,current);
    const pair = reference===null ? null : Comparison.compare(level,reference,current);
    const conclusions = {
      identical: 'A e B têm a mesma construção. Volte ao mapa e experimente mudar um caminho.',
      incomplete: 'Ainda há moradores sem caminho em '+(pair?.a.complete ? 'B' : pair?.b.complete ? 'A' : 'A e B')+'. Complete as ligações antes de comparar todos os percursos.',
      tie: 'Construções diferentes, com o mesmo gasto e os mesmos passos para cada morador.',
      tradeoff: 'Cada escolha tem uma vantagem. Observe o gasto e o percurso de cada morador antes de decidir.',
      'a-dominates': 'A gasta menos ou encurta percursos, sem aumentar o gasto nem o caminho de qualquer morador em relação a B.',
      'b-dominates': 'B gasta menos ou encurta percursos, sem aumentar o gasto nem o caminho de qualquer morador em relação a A.'
    };
    const empty = '<section class="comparison-card comparison-empty"><h3>A — Referência</h3><div><span class="comparison-letter" aria-hidden="true">A</span><p><b>Guarde uma ideia para testar outra.</b></p><p>Guarde a construção atual como A. Depois volte ao mapa, mude os caminhos ou reinicie esta fase. A continuará aqui.</p></div></section>';
    return `<p class="comparison-intro">${escape(level.title)} · Guarde uma construção e descubra o que muda ao tentar outra.</p>
      ${message ? '<p class="notice" role="status">'+escape(message)+'</p>' : ''}
      <div class="comparison-pair">${pair ? card(level,pair.a,'A — Referência',false) : empty}${card(level,b,'B — Construção atual',true)}</div>
      ${pair ? table(pair)+'<p class="comparison-conclusion">'+conclusions[pair.verdict]+'</p>' : ''}
      <p class="comparison-footnote">Com o salvamento disponível, A fica guardada por fase neste navegador. Os números mostram os caminhos possíveis agora; use Testar rotas no mapa para conquistar pontos e selos.</p>`;
  }
  return Object.freeze({render});
})();
