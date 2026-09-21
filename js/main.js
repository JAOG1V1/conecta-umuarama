/* INTERFACE: as regras ficam em Core; aqui ligamos botões, desenho e salvamento. */
const $ = id => document.getElementById(id);
const state = { index:0, edits:{}, undo:[], redo:[], tool:'path', focus:0, routes:null, reachIndex:null, frame:0, motionTimer:0, generation:0, playing:false, finishMotion:null, pendingResult:null, filter:null, tutorial:false };
let canSave = true;
let progress = Storage.empty();
let comparisons;

function storageNotice(message) {
  $('storageNotice').hidden = false;
  $('storageNotice').textContent = message;
}
function loadProgress() {
  const result = Storage.load();
  progress = result.data;
  canSave = result.available;
  if (result.message) storageNotice(result.message);
}
function saveProgress() {
  progress.active = { index: state.index, edits: { ...state.edits } };
  progress.drafts[state.index] = { ...state.edits };
  $('continue').disabled = false;
  renderCampaign();
  if (!canSave) return;
  const result = Storage.save(progress);
  canSave = result.available;
  if (result.message) storageNotice(result.message);
}
function feedback(message, error=false) {
  $('feedback').textContent = message;
  $('feedback').classList.toggle('error',error);
}
function currentLevel() { return LEVELS[state.index]; }
function renderCampaign() {
  $('campaignProgress').innerHTML=Views.campaignProgress(LEVELS,progress);
  $('continue').textContent=progress.active ? 'Continuar · fase '+(progress.active.index+1) : 'Continuar';
}
function renderBuildOptions() {
  const level=currentLevel();
  let available=0;
  for(const tile of $('board').children) {
    const r=Number(tile.dataset.row),c=Number(tile.dataset.col);
    const preview=Building.preview(level,state.edits,r,c,state.tool);
    tile.classList.toggle('build-option',preview.allowed);
    tile.classList.remove('build-target');
    available+=Number(preview.allowed);
    const description=tileData(level,r,c).label;
    tile.setAttribute('aria-label','Linha '+(r+1)+', coluna '+(c+1)+': '+description+'. '+preview.message);
    tile.title=description+'. '+preview.message;
  }
  const guide=Building.guide(state.tool,available);
  $('buildLabel').textContent=guide.label;
  $('buildPreview').textContent=guide.message;
  $('buildGuide').classList.remove('unavailable');
  const focused=document.activeElement;
  if($('board').contains(focused)&&focused?.dataset.row!==undefined)
    previewCell(Number(focused.dataset.row),Number(focused.dataset.col));
}
function previewCell(r,c) {
  const preview=Building.preview(currentLevel(),state.edits,r,c,state.tool);
  for(const tile of $('board').children)tile.classList.toggle('build-target',
    preview.allowed&&Number(tile.dataset.row)===r&&Number(tile.dataset.col)===c);
  $('buildLabel').textContent=Building.labels[state.tool]+' · L'+(r+1)+' C'+(c+1);
  $('buildPreview').textContent=preview.message;
  $('buildGuide').classList.toggle('unavailable',!preview.allowed);
}
function selectTool(tool) {
  if(!Object.hasOwn(Building.labels,tool))return;
  state.tool=tool;renderHud();
  feedback('Ferramenta: '+Building.labels[tool]+'. O pontilhado mostra onde ela pode ser usada.');
}
function cancelMotion(clear=false) {
  cancelAnimationFrame(state.frame);
  clearTimeout(state.motionTimer);
  state.motionTimer = 0;
  state.finishMotion = null;
  state.pendingResult = null;
  state.frame = 0; state.generation++; state.playing = false;
  $('walkers').querySelectorAll('.is-moving').forEach(node=>node.classList.remove('is-moving'));
  $('people').querySelectorAll('[data-person]').forEach(button=>button.disabled=false);
  $('test').disabled = false; $('test').textContent = 'Testar rotas →';
  if (clear) {
    state.routes = null; state.filter = null;
    state.reachIndex = null;
    renderReach();
    $('routeLayer').replaceChildren(); $('walkers').replaceChildren();
  }
}
function tileData(level,r,c,edits=state.edits) {
  const base = level.map[r][c], edit = edits[r+','+c];
  if (edit) return {built:true,kind:edit,art:ART[edit],label:({path:'calçada construída',crossing:'faixa de pedestres construída',ramp:'rampa construída'})[edit],mark:edit==='ramp'?'R':''};
  const resident = level.people.find(p=>p.from===base);
  if (resident) return {kind:'house',art:house(resident.color),label:'casa de '+resident.name+', origem '+base,mark:base};
  const visitor = level.people.find(p=>p.to===base);
  if (visitor) return {kind:'destination',art:destination(level.destinationTypes[base],visitor.color),label:level.destinations[base]+', destino '+base+' de '+visitor.name,mark:base};
  const kinds = {'.':'grass',t:'tree','~':'water','=':'road',s:'stair',p:'path'};
  const names = {'.':'terreno livre',t:'árvore, passagem bloqueada','~':'água, passagem bloqueada','=':'rua, precisa de uma faixa',s:'escada, pode receber rampa',p:'calçada existente'};
  return {kind:kinds[base],art:ART[kinds[base]]||'',label:names[base],mark:base==='s'?'E':''};
}
function renderBoard() {
  const level=currentLevel(), width=level.map[0].length;
  const hadFocus=$('board').contains(document.activeElement);
  $('board').style.gridTemplateColumns='repeat('+width+',1fr)';
  $('board').parentElement?.classList.toggle('large-map',width>8);
  $('board').parentElement?.classList.toggle('medium-map',width===8);
  const fragment=document.createDocumentFragment();
  level.map.forEach((row,r)=>Array.from(row).forEach((_,c)=>{
    const data=tileData(level,r,c), b=document.createElement('button');
    b.type='button'; b.className='tile '+data.kind+(data.built?' built':''); b.dataset.row=r; b.dataset.col=c;
    b.tabIndex=(r*width+c===state.focus)?0:-1;
    b.setAttribute('aria-label','Linha '+(r+1)+', coluna '+(c+1)+': '+data.label);
    b.title=data.label; b.innerHTML=data.art+(data.mark?'<span class="mark">'+data.mark+'</span>':'');
    fragment.appendChild(b);
  }));
  $('board').replaceChildren(fragment);
  $('walkers').style.setProperty('--sprite-size',(110/width)+'%');
  if(!state.routes)drawIdleResidents();
  if (hadFocus) $('board').children[state.focus]?.focus({preventScroll:true});
  updateMapScroll();
  renderReach();
}
function renderReach(index=state.reachIndex) {
  const hadFocus=$('reachChoices').contains(document.activeElement);
  const missing=(state.routes||[]).map((route,i)=>({route,i})).filter(({route})=>!route.path);
  const selected=missing.find(item=>item.i===index)||missing[0];
  state.reachIndex=selected?.i??null;
  $('reachPanel').hidden=!selected;
  if(!selected)$('reachDetails').open=false;
  const route=selected?.route;
  const barrier=Views.hintBarrier(route,currentLevel());
  const cells=new Set((route?.reachable||[]).map(cell=>cell.join(',')));
  for (const tile of $('board').children) {
    const reachable=cells.has(tile.dataset.row+','+tile.dataset.col);
    const hinted=!!barrier&&Number(tile.dataset.row)===barrier.r&&Number(tile.dataset.col)===barrier.c;
    tile.classList.toggle('reachable',reachable);
    tile.classList.toggle('hint-barrier',hinted);
    tile.style.setProperty('--reach-color',route?.person.color||'#275d45');
    tile.setAttribute('aria-description',hinted ? 'Barreira indicada pela pista de '+route.person.name
      : reachable ? 'Dentro do alcance de '+route.person.name : '');
  }
  $('reachChoices').replaceChildren();
  for (const {route: candidate,i} of missing) {
    const button=document.createElement('button');button.type='button';button.className='btn small';
    button.textContent=candidate.person.name;
    button.setAttribute('aria-label','Alcance de '+candidate.person.name);
    button.setAttribute('aria-pressed',String(i===state.reachIndex));
    button.onclick=()=>renderReach(i);$('reachChoices').appendChild(button);
    if(hadFocus&&i===state.reachIndex)button.focus({preventScroll:true});
  }
  $('reachSummary').textContent=route ? 'Ver pista de '+route.person.name : 'Ver pista';
  $('reachNote').textContent=route ? Views.reachExplanation(route,barrier) : '';
  $('reachStatus').textContent=$('reachNote').textContent;
}
function updateMapScroll() {
  const map=$('mapScroll'), overflow=map.scrollWidth-map.clientWidth;
  const left=map.scrollLeft>1, right=map.scrollLeft<overflow-1;
  $('mapViewport').classList.toggle('more-left',left);
  $('mapViewport').classList.toggle('more-right',right);
  $('mapScrollHint').hidden=overflow<=1;
  $('mapScrollHint').textContent=left&&right ? '↔ Deslize para ver os dois lados do mapa.'
    : right ? 'Mapa continua à direita → Deslize para ver.' : '← Deslize para voltar ao início do mapa.';
}
function positionResident(node,r,c,offset=0) {
  const level=currentLevel();
  node.style.left=((c+.5+offset)/level.map[0].length*100)+'%';
  node.style.top=((r+.5+offset)/level.map.length*100)+'%';
}
function drawIdleResidents() {
  const level=currentLevel();
  $('walkers').replaceChildren();
  level.people.forEach(person=>{
    const r=level.map.findIndex(row=>row.includes(person.from));
    const node=Characters.walker(person);
    positionResident(node,r,level.map[r].indexOf(person.from));
    $('walkers').appendChild(node);
  });
}
function renderPeople() {
  const level = currentLevel();
  $('people').innerHTML = level.people.map((person, index) =>
    Views.personCard(person, index, level, state.routes?.[index])).join('')
    + (state.routes && level.people.length > 1
      ? '<button class="btn small ghost observe" data-person="all">Ver todos juntos</button>' : '');
  $('people').querySelectorAll('[data-person]').forEach(button => button.disabled = state.playing);
}

function renderHud() {
  const level=currentLevel(), spent=Core.cost(state.edits), left=level.budget-spent;
  $('phaseLabel').textContent='Fase '+level.id+' de '+LEVELS.length;
  $('phaseTitle').textContent=level.title; $('phaseDescription').textContent=level.description;
  $('phaseHint').textContent=level.hint; $('remaining').textContent=left;
  $('phaseStory').textContent=level.story;
  $('efficiencyGoal').textContent=level.tutorial ? 'Aprenda a construir e testar. Os desafios opcionais começam na próxima fase.' : 'Dois desafios: gastar até '+level.efficiencyCost+' e cumprir a meta de passos de cada morador. Os selos podem ser conquistados em partidas diferentes.';
  $('budgetMeta').textContent='Inicial: '+level.budget+' · Gasto: '+spent;
  $('boardBudget').textContent='Saldo: '+left+' / '+level.budget;
  $('budgetBar').style.width=(left/level.budget*100)+'%';
  $('recordLabel').textContent=progress.best[state.index]?'Recorde: '+progress.best[state.index]+' pontos':'Explore sem pressa';
  const challenges=level.tutorial ? '' : Views.challenges(level,state.edits,state.routes);
  for (const id of ['challenges','desktopChallenges']) {
    $(id).hidden=!!level.tutorial;
    $(id).innerHTML=challenges;
  }
  $('undo').disabled=!state.undo.length;
  $('redo').disabled=!state.redo.length;
  document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===state.tool)));
  renderPeople();
  renderBuildOptions();
}
function render() {renderBoard();renderHud();}
function showPendingResult() {
  if (document.hidden || $('modal').open || $('game').hidden || !state.pendingResult) return;
  const showResult=state.pendingResult;
  state.pendingResult=null;
  showResult();
}
function openModal(title,html,buttons=[],wide=false) {
  $('modal').classList.toggle('comparison-dialog',wide);
  $('modalBody').tabIndex=wide ? 0 : -1;
  $('modalBody').setAttribute('role','region');
  $('modalBody').setAttribute('aria-label',wide ? 'Mapas e resultados da comparação' : 'Conteúdo da janela');
  $('modalTitle').textContent=title; $('modalBody').innerHTML=html; $('modalActions').replaceChildren();
  for (const item of buttons) {
    const b=document.createElement('button'); b.className='btn '+(item.primary?'primary':'');
    b.textContent=item.label; b.onclick=()=>{$('modal').close();item.action?.();};
    $('modalActions').appendChild(b);
  }
  if (!$('modal').open) $('modal').showModal();
  // A janela informativa conclui o movimento e guarda a vitória até ser fechada.
  state.finishMotion?.();
}
function showComparison(message='') {
  if($('game').hidden)return;
  const reference=comparisons.references[state.index];
  const identical=reference!==null&&Comparison.same(reference,state.edits);
  const buttons=[{label:'Voltar ao mapa'}];
  if(!identical)buttons.push({label:reference===null ? 'Guardar atual como A' : 'Substituir referência A',primary:reference===null,action:()=>{
    if(reference===null)saveComparison();
    else openModal('Substituir a referência A?','<p>A construção atual ficará guardada no lugar da referência anterior desta fase. O tabuleiro continua como está.</p>',[
      {label:'Manter referência',action:()=>showComparison()},
      {label:'Substituir A',primary:true,action:saveComparison}
    ]);
  }});
  if(reference!==null&&!identical)buttons.push({label:'Usar A no mapa',action:()=>{
    openModal('Usar a referência A no mapa?','<p>A construção atual será substituída por A. Você poderá usar Desfazer para recuperar o tabuleiro anterior.</p>',[
      {label:'Continuar comparando',action:()=>showComparison()},
      {label:'Usar A',primary:true,action:restoreComparison}
    ]);
  }});
  openModal('Comparar soluções',ComparisonView.render(currentLevel(),reference,state.edits,message||comparisons.message),buttons,true);
}
function captureComparison() {
  const snapshot=Comparison.capture(currentLevel(),state.edits);
  if(!snapshot)return;
  comparisons.references[state.index]=snapshot;
  const result=Comparison.save(comparisons.references);
  comparisons.available=result.available;
  comparisons.message=result.message;
  return result;
}
function saveComparison() {
  const result=captureComparison();
  if(!result)return;
  showComparison(result.saved ? 'Referência A guardada. Volte ao mapa e experimente outra construção.' : result.message);
}
function experimentAfterWin() {
  if(!Core.score(currentLevel(),state.edits))return;
  const reference=comparisons.references[state.index];
  const store=()=>{
    const result=captureComparison();
    feedback(result?.saved ? 'Solução guardada como A. Altere o mapa e abra Comparar para ver o que mudou.'
      : (result?.message||'Referência disponível nesta sessão.'));
  };
  if(reference!==null&&!Comparison.same(reference,state.edits)) {
    openModal('Guardar esta solução como A?','<p>Já existe uma referência nesta fase. A construção atual ficará no lugar dela. Seu tabuleiro e seus recordes permanecem.</p>',[
      {label:'Manter referência A'},
      {label:'Substituir e experimentar',primary:true,action:store}
    ]);
  } else store();
}
function restoreComparison() {
  const snapshot=Comparison.capture(currentLevel(),comparisons.references[state.index]);
  if(!snapshot||Comparison.same(snapshot,state.edits))return;
  // Restaurar é uma edição: cancela um resultado pendente antes de trocar o mapa.
  cancelMotion(true);state.undo.push({...state.edits});state.redo=[];state.edits=snapshot;
  render();saveProgress();feedback('Referência A colocada no mapa. Desfazer recupera sua construção anterior.');
  $('board').children[state.focus]?.focus({preventScroll:true});
}
function confirmReset(action,index=state.index) {
  openModal('Recomeçar este tabuleiro?','<p>Somente as construções da fase '+LEVELS[index].id+' serão removidas. Os outros tabuleiros, as referências e seus recordes permanecem.</p>',[
    {label:'Continuar jogando',action:()=>{}},{label:'Recomeçar',primary:true,action}
  ]);
}
function begin(index,edits={},showTutorial=false) {
  if (!Storage.isUnlocked(progress,index) || !Core.validateSave(LEVELS[index],edits)) {
    feedback('Conclua a fase anterior antes de abrir este tabuleiro.',true);
    return;
  }
  cancelMotion(true);
  state.index=index;state.edits={...edits};state.undo=[];state.redo=[];state.tool='path';state.tutorial=showTutorial;
  const origin=LEVELS[index].people[0].from, row=LEVELS[index].map.findIndex(line=>line.includes(origin));
  state.focus=row*LEVELS[index].map[0].length+LEVELS[index].map[row].indexOf(origin);
  $('home').hidden=true;$('game').hidden=false;
  $('compare').hidden=false;
  document.body?.classList.add('is-playing');
  window.scrollTo?.({top:0,behavior:'instant'});
  $('hintDetails').open=false;
  render();saveProgress();
  feedback(index===0?'1/3 · Construa as três calçadas entre a casa A e a escola X.':'Escolha uma ferramenta e construa uma rota para cada morador.');
  $('phaseTitle').tabIndex=-1;$('phaseTitle').focus({preventScroll:true});
  if(showTutorial)openModal('Sua primeira conexão','<p><b>1.</b> A casa de Lia tem a letra A; a escola tem a letra X.</p><p><b>2.</b> Com a ferramenta Calçada, clique nas três células livres entre elas. Cada peça custa 1.</p><p><b>3.</b> Use “Testar rotas” e acompanhe Lia até a escola. Você pode desfazer qualquer construção.</p>',[
    {label:'Pular tutorial',action:()=>{state.tutorial=false;feedback('Construa um caminho entre A e X.');}},
    {label:'Vamos construir',primary:true,action:()=>{}}
  ]);
}
function chooseLevels() {
  const intro = Views.campaignProgress(LEVELS,progress)
    + '<p>Complete uma fase para abrir a próxima. Cada tabuleiro é guardado ao trocar de fase.</p>';
  openModal('Os caminhos do seu bairro', intro
    + LEVELS.map((level,index) => Views.levelCard(level,index,progress)).join(''));
}

function editCell(r,c) {
  const result=Core.apply(currentLevel(),state.edits,r,c,state.tool);
  if(!result.ok){feedback(result.message,true);return;}
  cancelMotion(true);state.undo.push({...state.edits});state.redo=[];state.edits=result.edits;
  render();saveProgress();
  if(state.tutorial&&state.index===0) {
    const ready=Core.score(currentLevel(),state.edits)>0;
    feedback(ready?'3/3 · A rota está pronta! Pressione “Testar rotas” para ver Lia caminhar.':'2/3 · Complete as calçadas entre A e X. Você pode usar Desfazer para corrigir.');
  } else feedback(result.message);
}
function drawRoutes(filter=null) {
  const level=currentLevel(),h=level.map.length,w=level.map[0].length;
  $('routeLayer').setAttribute('viewBox','0 0 '+w+' '+h);
  $('routeLayer').replaceChildren();
  (state.routes||[]).forEach((route,i)=>{
    if(!route.path || filter!==null&&filter!==i)return;
    const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    line.setAttribute('points',route.path.map(([r,c])=>(c+.5)+','+(r+.5)).join(' '));
    line.setAttribute('fill','none');line.setAttribute('stroke',route.person.color);
    line.setAttribute('stroke-width','.085');line.setAttribute('stroke-linecap','round');
    line.setAttribute('stroke-linejoin','round');line.setAttribute('opacity','.8');
    if(i===1)line.setAttribute('stroke-dasharray','.2 .13');
    if(i===2)line.setAttribute('stroke-dasharray','.035 .15');
    $('routeLayer').appendChild(line);
  });
}
function animateRoutes(done,filter=null) {
  cancelMotion();state.playing=true;state.filter=filter;
  $('people').querySelectorAll('[data-person]').forEach(button=>button.disabled=true);
  const generation=state.generation;
  $('test').disabled=false;$('test').textContent=done ? 'Concluir chegada →' : 'Concluir percurso →';
  drawRoutes(filter);drawIdleResidents();
  const residents=[...$('walkers').children];
  const walkers=(state.routes||[]).map((route,i)=>{
    if(!route.path || filter!==null&&filter!==i)return null;
    const node=residents[i];node.classList.add('is-moving');
    return {node,path:route.path,index:i};
  }).filter(Boolean);
  const duration=Math.max(0,...walkers.map(x=>(x.path.length-1)*290));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let start=null, completed=false;
  function frame(time) {
    if(completed || generation!==state.generation)return;
    if(start===null)start=time;
    const elapsed=reduced?duration+650:time-start;
    for(const item of walkers) {
      const pos=Math.min(item.path.length-1,elapsed/290),step=Math.floor(pos),next=Math.min(step+1,item.path.length-1),f=pos-step;
      const r=item.path[step][0]*(1-f)+item.path[next][0]*f;
      const c=item.path[step][1]*(1-f)+item.path[next][1]*f;
      const offset=filter===null?(item.index-(walkers.length-1)/2)*.12:0;
      positionResident(item.node,r,c,offset);
      const direction=item.path[next][1]-item.path[step][1];
      if(direction) item.node.style.setProperty('--facing',direction<0?-1:1);
      const arrived=pos===item.path.length-1;
      item.node.classList.toggle('is-moving',!arrived);
      item.node.classList.toggle('arrived',arrived);
    }
    if(elapsed<duration+(done?650:0)){state.frame=requestAnimationFrame(frame);return;}
    completed=true;
    clearTimeout(state.motionTimer);state.motionTimer=0;
    state.playing=false;state.frame=0;$('test').disabled=false;$('test').textContent='Testar rotas →';
    $('people').querySelectorAll('[data-person]').forEach(button=>button.disabled=false);
    state.finishMotion=null;
    state.pendingResult=done || null;
    showPendingResult();
  }
  state.finishMotion=()=>{
    cancelAnimationFrame(state.frame);
    if(start===null)start=0;
    frame(start+duration+650);
  };
  state.frame=requestAnimationFrame(frame);
  // Recupera a conclusão se o navegador parar os quadros sem avisar a visibilidade.
  state.motionTimer=setTimeout(()=>state.finishMotion?.(),duration+1650);
}
function resultModal(points) {
  const level = currentLevel(), last = state.index === LEVELS.length - 1;
  const total = progress.best.reduce((sum, value) => sum + value, 0);
  openModal(last ? 'Um bairro mais conectado!' : 'Todo mundo chegou!',
    Views.result(level, state.edits, points, total, last)+(last?Views.campaignProgress(LEVELS,progress):''), [
      {label:'Experimentar outra solução'},
      {label:last ? 'Ver minhas fases' : 'Próxima fase →', primary:true,
        action:()=>last ? chooseLevels() : begin(state.index+1,progress.drafts[state.index+1]??{})},
      ...(!level.tutorial?[{label:'Guardar e experimentar',action:experimentAfterWin}]:[])
    ]);
}

function testRoutes() {
  if(state.playing){state.finishMotion?.();return;}
  cancelMotion();state.routes=Core.routes(currentLevel(),state.edits);state.filter=null;
  const missing=state.routes.filter(r=>!r.path),points=Core.score(currentLevel(),state.edits);
  renderHud();renderReach();
  if(!missing.length&&points>0) {
    progress.best[state.index]=Math.max(progress.best[state.index],points);
    progress.shortBest ||= LEVELS.map(()=>false);
    if (!currentLevel().tutorial) progress.shortBest[state.index] ||= Core.summary(currentLevel(),state.edits).shortRoutes;
    saveProgress();renderHud();
    feedback('Todos os caminhos funcionam. Acompanhe os moradores até seus destinos.');
    animateRoutes(()=>resultModal(points));
  } else {
    const names=missing.map(r=>r.person.name);
    const subject=names.length<2 ? names[0] : names.slice(0,-1).join(', ')+' e '+names[names.length-1];
    feedback(subject+' ainda não '+(missing.length===1?'tem':'têm')+' caminho. Confira as calçadas, travessias e degraus.',true);
    // A falha apresenta o alcance imediatamente, sem impor uma espera.
    drawRoutes();drawIdleResidents();
  }
}
$('board').addEventListener('click',event=>{
  const b=event.target.closest('button[data-row]');if(!b)return;
  const r=Number(b.dataset.row),c=Number(b.dataset.col);state.focus=r*currentLevel().map[0].length+c;editCell(r,c);
});
$('board').addEventListener('keydown',event=>{
  const b=event.target.closest('button[data-row]');if(!b)return;
  const width=currentLevel().map[0].length,height=currentLevel().map.length;
  let r=Number(b.dataset.row),c=Number(b.dataset.col);
  if(event.key==='ArrowUp')r=Math.max(0,r-1);else if(event.key==='ArrowDown')r=Math.min(height-1,r+1);
  else if(event.key==='ArrowLeft')c=Math.max(0,c-1);else if(event.key==='ArrowRight')c=Math.min(width-1,c+1);
  else if(event.key==='Home')c=0;else if(event.key==='End')c=width-1;else return;
  event.preventDefault();b.tabIndex=-1;state.focus=r*width+c;const next=$('board').children[state.focus];next.tabIndex=0;next.focus({preventScroll:true});
  next.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
});
for(const type of ['pointerover','focusin'])$('board').addEventListener(type,event=>{
  const tile=event.target.closest('button[data-row]');
  if(tile)previewCell(Number(tile.dataset.row),Number(tile.dataset.col));
});
$('board').addEventListener('pointerleave',renderBuildOptions);
$('board').addEventListener('focusout',event=>{
  if(!$('board').contains(event.relatedTarget))renderBuildOptions();
});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>selectTool(b.dataset.tool));
function travelHistory(redo=false) {
  const source=redo?state.redo:state.undo,target=redo?state.undo:state.redo;
  if(!source.length)return;
  cancelMotion(true);target.push({...state.edits});state.edits=source.pop();
  render();saveProgress();feedback(redo?'Ação refeita. O orçamento foi recalculado.':'Última ação desfeita. Use Refazer para recuperá-la.');
}
$('undo').onclick=()=>travelHistory();
$('redo').onclick=()=>travelHistory(true);
document.addEventListener('keydown',event=>{
  if($('game').hidden||$('modal').open||event.altKey||event.target?.isContentEditable
    ||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName||''))return;
  const key=event.key.toLowerCase(), modifier=event.ctrlKey||event.metaKey;
  if(modifier&&(key==='z'||key==='y')) {
    event.preventDefault();travelHistory(key==='y'||event.shiftKey);return;
  }
  if(!modifier&&!event.shiftKey&&/^[1-4]$/.test(key)) {
    event.preventDefault();selectTool(['path','crossing','ramp','erase'][Number(key)-1]);
  }
});
$('test').onclick=testRoutes;$('reset').onclick=()=>confirmReset(()=>begin(state.index));
$('start').onclick=()=>progress.drafts[0]&&Object.keys(progress.drafts[0]).length?confirmReset(()=>begin(0,{},true),0):begin(0,{},true);
$('continue').onclick=()=>{if(progress.active)begin(progress.active.index,progress.active.edits);};
$('chooseHome').onclick=chooseLevels;$('chooseGame').onclick=chooseLevels;
$('backHome').onclick=()=>{cancelMotion();saveProgress();$('game').hidden=true;$('home').hidden=false;$('compare').hidden=true;document.body?.classList.remove('is-playing');$('start').focus();};
$('compare').onclick=()=>showComparison();
$('help').onclick=showHelp;$('credits').onclick=showCredits;$('topCredits').onclick=showCredits;
$('closeModal').onclick=()=>$('modal').close();
$('modal').addEventListener('close',showPendingResult);
$('reachDetails').addEventListener('toggle',()=>{
  if ($('reachDetails').open && !$('reachPanel').hidden && !$('game').hidden
      && !$('modal').open && window.matchMedia('(min-width: 601px)').matches) {
    // Mostra a explicação aberta sem deslocar o foco nem mudar o layout do mapa.
    $('reachNote').scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
  }
});
$('mapScroll').addEventListener('scroll',updateMapScroll);
window.addEventListener('resize',updateMapScroll);
$('modalBody').addEventListener('click',event=>{
  const b=event.target.closest('[data-level]');if(!b||b.disabled)return;
  const index=Number(b.dataset.level);$('modal').close();
  // Escolher o tabuleiro já aberto apenas fecha o seletor; preserva a vitória.
  if(index===state.index&&!$('game').hidden)return;
  begin(index,progress.drafts[index]??{},index===0&&!progress.best[0]);
});
$('people').addEventListener('click',event=>{
  const b=event.target.closest('[data-person]');if(!b||!state.routes||state.playing)return;
  animateRoutes(undefined,b.dataset.person==='all'?null:Number(b.dataset.person));
});
document.addEventListener('visibilitychange',()=>{
  // A aba oculta pode suspender requestAnimationFrame. Concluímos o desenho e
  // guardamos a apresentação do resultado para quando o jogador retornar.
  state.finishMotion?.();
  showPendingResult();
});
loadProgress();$('continue').disabled=!progress.active;renderCampaign();
comparisons=Comparison.load();$('compare').hidden=true;
$('home').hidden=false;$('game').hidden=true;
