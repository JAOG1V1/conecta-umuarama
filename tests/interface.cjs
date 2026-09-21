/* Integração sem navegador: simula somente as APIs DOM e de animação usadas.
   Verifica fluxos e cancelamento; não verifica aparência, CSS ou acessibilidade. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function app(reduced = false, memory = new Map()) {
  let document;
  const events=[];
  class Element {
    constructor(tag = 'div') {
      this.tag = tag; this.children = []; this.dataset = {}; this.attributes = {};
      this.events = {}; this.className = ''; this.open = false; this.disabled = false;
      this.scrollWidth=404;this.clientWidth=404;this.scrollLeft=0;
      this.style = {setProperty(name, value) {this[name] = value;}};
      this.classList = {
        toggle: (name, force) => {
          const set = new Set(this.className.split(' ').filter(Boolean));
          const add = force === undefined ? !set.has(name) : force;
          if (add) set.add(name); else set.delete(name);
          this.className = [...set].join(' '); return add;
        },
        add: name => this.classList.toggle(name, true),
        remove: name => this.classList.toggle(name, false)
      };
    }
    set innerHTML(value) {
      this.html = value; this.children = [];
      // Botões Observar são recriados pela interface depois de cada teste de rota.
      for (const match of value.matchAll(/<button\b[^>]*data-person="([^"]+)"[^>]*>/g)) {
        const button = new Element('button'); button.dataset.person = match[1]; this.appendChild(button);
      }
    }
    get innerHTML() {return this.html || '';}
    appendChild(child) {child.parent = this; this.children.push(child); return child;}
    replaceChildren(...nodes) {this.children = []; nodes.flatMap(node => node.tag === 'fragment' ? node.children : [node]).forEach(node => this.appendChild(node));}
    contains(node) {return node === this || this.children.some(child => child.contains(node));}
    setAttribute(name, value) {this.attributes[name] = value;}
    focus() {document.activeElement = this;}
    showModal() {this.open = true;}
    close() {
      if (!this.open) return;
      this.open = false;
      events.push(()=>this.events.close?.forEach(fn=>fn()));
    }
    addEventListener(type, fn) {(this.events[type] ||= []).push(fn);}
    querySelectorAll(selector) {
      const all = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
      if (selector === '*') return all;
      if (selector === '[data-person]') return all.filter(node => node.dataset.person !== undefined);
      if (selector.startsWith('.')) return all.filter(node => node.className.split(' ').includes(selector.slice(1)));
      return [];
    }
  }
  const nodes = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], new Element()]));
  const toolButtons = [...html.matchAll(/\bdata-tool="([^"]+)"/g)].map(match => {const node = new Element('button'); node.dataset.tool = match[1]; return node;});
  document = {
    activeElement: null, hidden: false, events: {},
    getElementById: id => nodes.get(id) || null,
    createElement: tag => new Element(tag),
    createElementNS: (namespace, tag) => new Element(tag),
    createDocumentFragment: () => new Element('fragment'),
    querySelectorAll: selector => selector === '[data-tool]' ? toolButtons : [],
    addEventListener(type, fn) {(this.events[type] ||= []).push(fn);}
  };
  const frames = new Map(); let nextFrame = 0;
  const timers = new Map(); let nextTimer=0,now=0;

  const sandbox = {
    document, window: {matchMedia: () => ({matches: reduced}),addEventListener() {}},
    localStorage: {getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key)},
    requestAnimationFrame: fn => {const id = ++nextFrame; frames.set(id, fn); return id;},
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: (fn,delay) => {const id=++nextTimer;timers.set(id,{fn,due:now+delay});return id;},
    clearTimeout: id => timers.delete(id)
  };
  const context = vm.createContext(sandbox);
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
  return {
    nodes, frames, timers, document, memory,
    unlock: () => vm.runInContext('progress.best.fill(700);', context),
    run: code => vm.runInContext(code, context),
    flushEvents() {while(events.length)events.shift()();},
    advance(ms) {
      const end=now+ms;
      while([...timers.values()].some(timer=>timer.due<=end)) {
        const [id,timer]=[...timers.entries()].sort((a,b)=>a[1].due-b[1].due)[0];
        now=timer.due;timers.delete(id);timer.fn();this.flushEvents();
      }
      now=end;this.flushEvents();
    },
    flush() {
      this.flushEvents();
      for (let tick = 0; frames.size; tick++) {
        assert(tick < 300, 'Animação não terminou');
        const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(tick * 100));
      }
      this.flushEvents();
    }
  };
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {fn(); passed++; console.log('PASSOU — ' + name);}
  catch (error) {failed++; console.error('FALHOU — ' + name + ': ' + error.message);}
}

test('Início carrega todos os scripts e abre o tutorial', () => {
  const game = app();
  assert.equal(game.nodes.get('home').hidden, false);
  game.nodes.get('start').onclick();
  assert.equal(game.nodes.get('modal').open, true);
  assert.equal(game.nodes.get('walkers').children.length, 1);
  assert.match(game.nodes.get('walkers').children[0].innerHTML, /lia\.png/);
  assert.equal(game.nodes.get('hintDetails').open, false);
});

for (let index = 0; index < 5; index++) test('Fase ' + (index + 1) + ': chegada, resultado e próxima ação', () => {
  const game = app();
  game.unlock();
  game.run('begin(' + index + ', LEVELS[' + index + '].solution); testRoutes();');
  assert.equal(game.nodes.get('test').disabled, false);
  assert.equal(game.nodes.get('test').textContent, 'Concluir chegada →');
  assert(game.nodes.get('people').querySelectorAll('[data-person]').every(button => button.disabled));
  game.flush();
  assert.equal(game.nodes.get('test').disabled, false);
  assert.equal(game.nodes.get('modal').open, true);
  assert.match(game.nodes.get('modalBody').innerHTML, /moradores conectados/);
  assert(!game.nodes.get('modalBody').innerHTML.includes('undefined'));
  assert(game.nodes.get('walkers').children.every(node => node.className.includes('arrived')));
  game.nodes.get('modalActions').children[1].onclick();
  if (index < 4) assert.equal(game.run('state.index'), index + 1);
  else assert.match(game.nodes.get('modalTitle').textContent, /caminhos do seu bairro/);
});

test('Observar durante a vitória não descarta o resultado', () => {
  const game = app(); game.unlock(); game.run('begin(1, LEVELS[1].solution); testRoutes();');
  const generation = game.run('state.generation');
  game.nodes.get('people').events.click[0]({target: {closest: () => ({dataset: {person: '0'}})}});
  assert.equal(game.run('state.generation'), generation);
  game.flush(); assert.equal(game.nodes.get('modal').open, true);
});

test('Edição durante animação cancela o resultado antigo e restaura moradores', () => {
  const game = app(); game.run('begin(0, LEVELS[0].solution); testRoutes();');
  const stale = [...game.frames.values()][0];
  game.run("state.tool='erase'; editCell(2,3);"); stale(10000); game.flush();
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.run('state.routes'), null);
  assert.equal(game.nodes.get('walkers').children.length, 1);
  assert(!game.nodes.get('walkers').children[0].className.includes('is-moving'));
});

test('Caio permanece na origem quando apenas Lia pode chegar', () => {
  const game = app();
  game.unlock();
  game.run("const partial={...LEVELS[2].solution}; delete partial['3,3']; begin(2,partial); testRoutes();");
  game.flush();
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.nodes.get('walkers').children.length, 2);
  assert.match(game.nodes.get('walkers').children[1].innerHTML, /caio\.png/);
  assert(!game.nodes.get('walkers').children[1].className.includes('arrived'));
  assert.match(game.nodes.get('feedback').textContent, /Caio/);
});

test('Movimento reduzido conclui sem esperar o percurso', () => {
  const game = app(true); game.run('begin(0, LEVELS[0].solution); testRoutes();');
  const callback = [...game.frames.values()][0]; game.frames.clear(); callback(0);
  assert.equal(game.frames.size, 0); assert.equal(game.nodes.get('modal').open, true);
});

test('Desfazer restaura orçamento e reiniciar preserva recordes', () => {
  const game = app();
  game.run('begin(0); editCell(2,2);'); assert.equal(game.nodes.get('remaining').textContent, 4);
  game.nodes.get('undo').onclick(); assert.equal(game.nodes.get('remaining').textContent, 5);
  game.run('begin(0,LEVELS[0].solution); testRoutes();'); game.flush();
  const best = game.run('progress.best[0]');
  game.nodes.get('modal').close(); game.nodes.get('reset').onclick();
  game.nodes.get('modalActions').children[1].onclick();
  assert.equal(game.run('progress.best[0]'), best);
  assert.equal(game.nodes.get('remaining').textContent, 5);
});

test('Dicas voltam a ficar fechadas ao trocar de fase', () => {
  const game = app(); game.unlock(); game.run('begin(0);'); game.nodes.get('hintDetails').open = true;
  game.run('begin(1);'); assert.equal(game.nodes.get('hintDetails').open, false);
  assert.match(game.nodes.get('phaseStory').textContent, /Caio/);
});

test('Voltar ao início cancela a animação pendente', () => {
  const game = app(); game.run('begin(0,LEVELS[0].solution); testRoutes();');
  game.nodes.get('backHome').onclick(); game.flush();
  assert.equal(game.nodes.get('home').hidden, false);
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.frames.size, 0);
});

test('Trocar de aba antes do primeiro quadro preserva vitória e libera botões', () => {
  const game=app(); game.run('begin(0,LEVELS[0].solution); testRoutes();');
  game.document.hidden=true; game.document.events.visibilitychange[0]();
  assert.equal(game.run('state.playing'),false);
  assert.equal(game.nodes.get('test').disabled,false);
  assert.equal(game.nodes.get('modal').open,false);
  game.document.hidden=false; game.document.events.visibilitychange[0]();
  assert.equal(game.nodes.get('modal').open,true);
  assert.match(game.nodes.get('modalBody').innerHTML,/fase concluída/);
});
test('Voltar a uma aba com animação pendente recupera a conclusão', () => {
  const game=app(); game.run('begin(0,LEVELS[0].solution); testRoutes();');
  game.document.events.visibilitychange[0]();
  assert.equal(game.nodes.get('modal').open,true);
  assert.equal(game.run('state.playing'),false);
});
test('Abrir fase bloqueada é rejeitado também fora do seletor', () => {
  const game=app(); game.run('begin(4,LEVELS[4].solution);');
  assert.equal(game.run('state.index'),0);
  assert.equal(game.run('progress.best[4]'),0);
});
test('Repetir fase com nota menor mantém recorde e selo conquistado', () => {
  const game=app(); game.unlock();
  game.run('begin(3,LEVELS[3].alternatives[0]); testRoutes();'); game.flush();
  const best=game.run('progress.best[3]');
  game.nodes.get('modal').close();
  game.run('begin(3,LEVELS[3].solution); testRoutes();'); game.flush();
  assert.equal(game.run('progress.best[3]'),best);
  assert.equal(game.run('progress.shortBest[3]'),true);
  assert.equal(game.run('Storage.validateProgress(progress).best[3]'),best);
});
test('Obras do jogador têm uma identificação visual própria', () => {
  const game=app();game.unlock();game.run('begin(2,LEVELS[2].solution);');
  const built=game.nodes.get('board').children[1*7+2];
  const existing=game.nodes.get('board').children[2*7+3];
  assert(built.className.includes('built'));
  assert(!existing.className.includes('built'));
});
test('Texto com símbolos HTML é exibido como texto nos resultados', () => {
  const game=app();
  game.run("LEVELS[0].people[0].arrival='<img src=x> & aspas'; begin(0,LEVELS[0].solution); testRoutes();");
  game.flush();
  assert.match(game.nodes.get('modalBody').innerHTML,/&lt;img src=x&gt; &amp; aspas/);
});

for (const button of ['help','topCredits','chooseGame','compare']) test('Janela '+button+' preserva a vitória até fechar',()=>{
  const game=app();game.unlock();game.run('begin(1,LEVELS[1].solution);testRoutes();');
  game.nodes.get(button).onclick();
  assert.equal(game.run('state.playing'),false);
  assert.equal(game.nodes.get('test').disabled,false);
  assert.equal(game.run('typeof state.pendingResult'),'function');
  assert.notEqual(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
  game.nodes.get('closeModal').onclick();game.flushEvents();
  assert.equal(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
  assert.equal(game.run('state.pendingResult'),null);
  assert.equal(game.timers.size,0);
  game.nodes.get('closeModal').onclick();game.flushEvents();
  assert.equal(game.nodes.get('modal').open,false);
});
test('Cancelar reinício apresenta a vitória, confirmar descarta o resultado antigo',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');
  game.nodes.get('reset').onclick();game.nodes.get('modalActions').children[0].onclick();game.flushEvents();
  assert.equal(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
  game.nodes.get('closeModal').onclick();game.flushEvents();
  game.run('testRoutes();');game.nodes.get('reset').onclick();
  game.nodes.get('modalActions').children[1].onclick();game.flushEvents();game.advance(10000);
  assert.equal(game.nodes.get('modal').open,false);
  assert.equal(game.run('Object.keys(state.edits).length'),0);
});
test('Trocar de fase pelo seletor cancela a vitória anterior',()=>{
  const game=app();game.unlock();game.run('begin(1,LEVELS[1].solution);testRoutes();chooseLevels();');
  game.nodes.get('modalBody').events.click[0]({target:{closest:()=>({dataset:{level:'2'}})}});
  game.flushEvents();game.advance(10000);
  assert.equal(game.run('state.index'),2);assert.equal(game.nodes.get('modal').open,false);
  assert.equal(game.run('JSON.stringify(progress.drafts[1])'),game.run('JSON.stringify(LEVELS[1].solution)'));
});
test('Temporizador conclui sem nenhum quadro ou evento de visibilidade',()=>{
  const game=app();game.unlock();game.run('begin(4,LEVELS[4].solution);testRoutes();');
  const stale=[...game.frames.values()][0];
  game.advance(10000);
  assert.equal(game.run('state.playing'),false);assert.equal(game.nodes.get('test').disabled,false);
  assert.equal(game.nodes.get('modalTitle').textContent,'Um bairro mais conectado!');
  assert.equal(game.frames.size,0);assert.equal(game.timers.size,0);
  game.nodes.get('closeModal').onclick();game.flushEvents();stale(20000);
  assert.equal(game.nodes.get('modal').open,false);
});
test('Temporizador em aba oculta aguarda retorno e respeita a ajuda aberta',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');
  game.document.hidden=true;game.advance(10000);
  assert.equal(game.nodes.get('modal').open,false);assert.equal(game.nodes.get('test').disabled,false);
  game.nodes.get('help').onclick();game.document.hidden=false;game.document.events.visibilitychange[0]();
  assert.notEqual(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
  game.nodes.get('closeModal').onclick();game.flushEvents();
  assert.equal(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
});
test('Editar cancela também o temporizador e a conclusão atrasada',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');
  game.run("state.tool='erase';editCell(2,3);");game.advance(10000);
  assert.equal(game.timers.size,0);assert.equal(game.nodes.get('modal').open,false);
});
test('Desafios comparam as duas soluções da fase 4 e invalidam teste após edição',()=>{
  const game=app();game.unlock();game.run('begin(3,LEVELS[3].alternatives[0]);testRoutes();');
  assert.match(game.nodes.get('challenges').innerHTML,/Gasto: 7 \/ 7 · Meta atingida/);
  assert.match(game.nodes.get('challenges').innerHTML,/12 \/ 10 passos · Acima da meta/);
  game.flush();game.nodes.get('closeModal').onclick();game.flushEvents();
  game.run('begin(3,LEVELS[3].solution);testRoutes();');
  assert.match(game.nodes.get('challenges').innerHTML,/Gasto: 11 \/ 7 · Acima da meta/);
  assert.match(game.nodes.get('challenges').innerHTML,/10 \/ 10 passos · Meta atingida/);
  game.run("state.tool='erase';editCell(5,2);");
  assert.match(game.nodes.get('challenges').innerHTML,/Não testado/);
});
test('Seletor mostra selos conquistados e tutorial não cria novo selo',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');game.flush();
  assert.equal(game.run('progress.shortBest[0]'),false);
  assert.equal(game.nodes.get('challenges').hidden,true);
  game.unlock();game.run('begin(3,LEVELS[3].alternatives[0]);testRoutes();');game.flush();
  const first=game.run('Views.levelCard(LEVELS[3],3,progress)');
  assert.match(first,/✦ Economia/);assert(!first.includes('✦ Percursos curtos'));
  game.run('begin(3,LEVELS[3].solution);testRoutes();');game.flush();
  const both=game.run('Views.levelCard(LEVELS[3],3,progress)');
  assert.match(both,/✦ Economia/);assert.match(both,/✦ Percursos curtos/);
});
test('Resultado incompleto retorna orientação e fase individual omite compartilhamento',()=>{
  const game=app();
  assert.match(game.run('Views.result(LEVELS[0],{},0,0,false)'),/Ainda há moradores sem caminho/);
  assert(!game.run('Views.result(LEVELS[0],LEVELS[0].solution,820,820,false)').includes('células compartilhadas'));
});
test('Pista visual acompanha início, final e ausência de rolagem',()=>{
  const game=app(),map=game.nodes.get('mapScroll'),viewport=game.nodes.get('mapViewport');
  map.clientWidth=344;game.run('updateMapScroll();');
  assert.equal(game.nodes.get('mapScrollHint').hidden,false);assert.match(viewport.className,/more-right/);
  map.scrollLeft=60;game.run('updateMapScroll();');
  assert.match(viewport.className,/more-left/);assert(!viewport.className.includes('more-right'));
  map.clientWidth=404;map.scrollLeft=0;game.run('updateMapScroll();');
  assert.equal(game.nodes.get('mapScrollHint').hidden,true);
});

test('Segundo clique conclui a chegada uma vez e cancela quadros e temporizador',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');
  const stale=[...game.frames.values()][0];
  assert.equal(game.nodes.get('test').disabled,false);
  game.nodes.get('test').onclick();
  assert.equal(game.run('state.playing'),false);assert.equal(game.nodes.get('modal').open,true);
  assert.equal(game.frames.size,0);assert.equal(game.timers.size,0);
  game.nodes.get('closeModal').onclick();game.flushEvents();stale(10000);game.advance(10000);
  assert.equal(game.nodes.get('modal').open,false);
});
test('Escolher a própria fase no seletor preserva peças, desfazer e vitória',()=>{
  const game=app();game.unlock();game.run('begin(1,LEVELS[1].solution);testRoutes();chooseLevels();');
  const generation=game.run('state.generation');
  game.nodes.get('modalBody').events.click[0]({target:{closest:()=>({dataset:{level:'1'}})}});
  game.flushEvents();assert.equal(game.nodes.get('modalTitle').textContent,'Todo mundo chegou!');
  assert.equal(game.run('state.generation'),generation);assert.equal(game.run('Core.cost(state.edits)'),9);
});
test('Falha mostra alcance imediatamente, sem animação e sem pedir teste repetido',()=>{
  const game=app();game.unlock();
  game.run("const partial={...LEVELS[2].solution};delete partial['3,3'];begin(2,partial);testRoutes();");
  assert.equal(game.frames.size,0);assert.equal(game.timers.size,0);assert.equal(game.run('state.playing'),false);
  assert.equal(game.nodes.get('reachPanel').hidden,false);
  assert.match(game.nodes.get('reachNote').textContent,/Caio pode alcançar 5 células/);
  assert.match(game.nodes.get('reachNote').textContent,/escada sem rampa.*linha 4, coluna 4/);
  assert.equal(game.nodes.get('board').querySelectorAll('.reachable').length,5);
  assert.match(game.nodes.get('challenges').innerHTML,/Complete as rotas para avaliar/);
  game.run("state.tool='ramp';editCell(3,3);");
  assert.equal(game.nodes.get('reachPanel').hidden,true);
  assert.equal(game.nodes.get('board').querySelectorAll('.reachable').length,0);
  game.run('testRoutes();');game.nodes.get('test').onclick();
  assert.equal(game.nodes.get('modal').open,true);
});
test('Alcances de moradores diferentes são selecionáveis e mantêm foco',()=>{
  const game=app();game.unlock();game.run('begin(1);testRoutes();');
  const buttons=game.nodes.get('reachChoices').children;
  assert.equal(buttons.length,2);buttons[1].focus();buttons[1].onclick();
  assert.match(game.nodes.get('reachNote').textContent,/Caio/);
  assert.equal(game.document.activeElement,game.nodes.get('reachChoices').children[1]);
  assert.equal(game.nodes.get('board').querySelectorAll('.reachable').length,1);
});
test('Final celebra os dois selos e convida à reflexão sobre caminhos reais',()=>{
  const game=app();game.unlock();game.run('begin(4,LEVELS[4].alternatives[1]);testRoutes();');game.nodes.get('test').onclick();
  assert.match(game.nodes.get('modalBody').innerHTML,/Você conquistou os dois selos nesta solução/);
  assert.match(game.nodes.get('modalBody').innerHTML,/No caminho que você faz todo dia/);
});

test('Pista do tutorial aponta para a escola e marca a mesma célula do texto',()=>{
  const game=app();game.run('begin(0);testRoutes();');
  const marks=game.nodes.get('board').querySelectorAll('.hint-barrier');
  assert.equal(marks.length,1);
  assert.equal(marks[0].dataset.row,2);assert.equal(marks[0].dataset.col,2);
  assert.match(marks[0].attributes['aria-description'],/Barreira indicada pela pista de Lia/);
  assert.match(game.nodes.get('reachNote').textContent,/linha 3, coluna 3/);
  assert.match(game.nodes.get('reachNote').textContent,/Lia ainda está sem saída da casa/);
  assert.equal(game.nodes.get('reachStatus').textContent,game.nodes.get('reachNote').textContent);
});
test('Desempate da pista preserva a escada, é determinístico e não altera barreiras',()=>{
  const game=app();game.unlock();
  game.run("const partial={...LEVELS[2].solution};delete partial['3,3'];begin(2,partial);testRoutes();");
  assert.equal(game.run('JSON.stringify(Views.hintBarrier(state.routes[1],currentLevel()))'),'{"r":3,"c":3,"kind":"stair"}');
  const before=game.run('JSON.stringify(state.routes[1].barriers)');
  game.run('Views.hintBarrier(state.routes[1],currentLevel());');
  assert.equal(game.run('JSON.stringify(state.routes[1].barriers)'),before);
  assert.equal(game.run('JSON.stringify(Views.hintBarrier({...state.routes[1],barriers:[...state.routes[1].barriers].reverse()},currentLevel()))'),'{"r":3,"c":3,"kind":"stair"}');
  assert.equal(game.run('Views.hintBarrier({...state.routes[1],barriers:[]},currentLevel())'),null);
  assert.equal(game.run('Views.hintBarrier(Core.routes(currentLevel(),LEVELS[2].solution)[1],currentLevel())'),null);
});
test('Trocar morador move a marca sem deixar descrições antigas e mantém foco',()=>{
  const game=app();game.unlock();game.run('begin(4);testRoutes();');
  const old=game.nodes.get('board').querySelectorAll('.hint-barrier')[0];
  const rosa=game.nodes.get('reachChoices').children[2];rosa.focus();rosa.onclick();
  const marks=game.nodes.get('board').querySelectorAll('.hint-barrier');
  assert.equal(marks.length,1);assert.notEqual(marks[0],old);
  assert.equal(old.attributes['aria-description'],'');
  assert.match(marks[0].attributes['aria-description'],/Rosa/);
  assert.equal(game.document.activeElement,game.nodes.get('reachChoices').children[2]);
  assert.match(game.nodes.get('feedback').textContent,/Lia, Caio e Rosa ainda não têm caminho/);
});
test('Editar limpa a marca, o anúncio e a pista expandida; edição rejeitada os preserva',()=>{
  const game=app();game.run('begin(0);testRoutes();');game.nodes.get('reachDetails').open=true;
  game.run('editCell(0,0);');
  assert.equal(game.nodes.get('reachDetails').open,true);
  assert.equal(game.nodes.get('board').querySelectorAll('.hint-barrier').length,1);
  game.run('editCell(2,2);');
  assert.equal(game.nodes.get('reachDetails').open,false);
  assert.equal(game.nodes.get('board').querySelectorAll('.hint-barrier').length,0);
  assert.equal(game.nodes.get('reachStatus').textContent,'');
  assert(game.nodes.get('board').children.every(tile=>!tile.attributes['aria-description']));
});

// Os novos fluxos usam os botões reais dos diálogos. O mapa inicial de cada
// cenário é montado pelas mesmas funções usadas nas demais integrações.
function chooseAction(game, label) {
  const button = game.nodes.get('modalActions').children.find(node => node.textContent === label);
  assert(button, 'Ação indisponível: ' + label);
  button.onclick();
  game.flushEvents();
}
function closeDialog(game) {
  game.nodes.get('closeModal').onclick();
  game.flushEvents();
}
function saveReference(game) {
  game.nodes.get('compare').onclick();
  chooseAction(game, 'Guardar atual como A');
  assert.equal(game.nodes.get('modalTitle').textContent, 'Comparar soluções');
}
function comparisonRow(game, name) {
  const body = game.nodes.get('modalBody').innerHTML.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
  assert(body, 'Tabela de comparação ausente');
  const row = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].find(match => match[1].includes('<th scope="row">' + name));
  assert(row, 'Linha de comparação ausente: ' + name);
  return row[1];
}

test('Comparar aparece no tabuleiro e fica escondido ao voltar ao início', () => {
  const game = app();
  assert.equal(game.nodes.get('compare').hidden, true);
  game.run('begin(0);');
  assert.equal(game.nodes.get('compare').hidden, false);
  game.nodes.get('backHome').onclick();
  assert.equal(game.nodes.get('compare').hidden, true);
  game.nodes.get('compare').onclick();
  assert.equal(game.nodes.get('modal').open, false);
});

test('Referências de fases diferentes sobrevivem a reinício e recarga', () => {
  const game = app(); game.unlock();
  game.run('begin(3, LEVELS[3].solution);');
  saveReference(game); closeDialog(game);
  const fourthReference = game.run('JSON.stringify(comparisons.references[3])');
  game.nodes.get('reset').onclick();
  chooseAction(game, 'Recomeçar');
  assert.equal(game.run('Object.keys(state.edits).length'), 0);
  assert.equal(game.run('JSON.stringify(comparisons.references[3])'), fourthReference);
  game.run('begin(2, LEVELS[2].alternatives[0]);');
  saveReference(game); closeDialog(game);
  const thirdReference = game.run('JSON.stringify(comparisons.references[2])');
  game.run('begin(3, LEVELS[3].alternatives[0]);');
  const resumed = app(false, game.memory);
  assert.equal(resumed.run('JSON.stringify(comparisons.references[3])'), fourthReference);
  assert.equal(resumed.run('JSON.stringify(comparisons.references[2])'), thirdReference);
  assert.equal(resumed.run('comparisons.references[0]'), null);
  resumed.nodes.get('continue').onclick();
  assert.equal(resumed.run('state.index'), 3);
  resumed.nodes.get('compare').onclick();
  assert.match(comparisonRow(resumed, 'Gasto'), /<td>11<\/td><td>7<\/td>/);
  assert.match(comparisonRow(resumed, 'Caio'), /<td>10 passos<\/td><td>12 passos<\/td>/);
});

test('Guardar, consultar e restaurar não concedem pontos nem desbloqueiam fases', () => {
  const game = app();
  game.run('begin(0, LEVELS[0].solution);');
  saveReference(game); closeDialog(game);
  game.run('begin(0);');
  game.nodes.get('compare').onclick();
  chooseAction(game, 'Usar A no mapa');
  chooseAction(game, 'Usar A');
  assert.equal(game.run('JSON.stringify(state.edits)'), game.run('JSON.stringify(LEVELS[0].solution)'));
  assert.equal(game.run('progress.best.every(points => points === 0)'), true);
  assert.equal(game.run('progress.shortBest?.some(Boolean) || false'), false);
  assert.equal(game.run('Storage.isUnlocked(progress, 1)'), false);
  assert.equal(game.run('state.routes'), null);
  const resumed = app(false, game.memory);
  assert.equal(resumed.run('progress.best.every(points => points === 0)'), true);
  assert.equal(resumed.run('Storage.isUnlocked(progress, 1)'), false);
});

test('Editar mantém A intacta e Desfazer recupera B depois de usar A', () => {
  const game = app();
  game.run('begin(0, LEVELS[0].solution);');
  saveReference(game); closeDialog(game);
  const reference = game.run('JSON.stringify(comparisons.references[0])');
  game.run("state.tool='erase'; editCell(2,3);");
  const current = game.run('JSON.stringify(state.edits)');
  const historyLength = game.run('state.undo.length');
  assert.notEqual(current, reference);
  assert.equal(game.run('JSON.stringify(comparisons.references[0])'), reference);
  game.nodes.get('compare').onclick();
  chooseAction(game, 'Usar A no mapa');
  chooseAction(game, 'Usar A');
  assert.equal(game.run('state.undo.length'), historyLength + 1);
  assert.equal(game.run('JSON.stringify(state.edits)'), reference);
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.document.activeElement, game.nodes.get('board').children[game.run('state.focus')]);
  game.nodes.get('undo').onclick();
  assert.equal(game.run('JSON.stringify(state.edits)'), current);
  assert.equal(game.run('JSON.stringify(comparisons.references[0])'), reference);
});

test('Substituir referência exige confirmação e cancelar preserva os dois mapas', () => {
  const game = app();
  game.run('begin(0, LEVELS[0].solution);');
  saveReference(game); closeDialog(game);
  const reference = game.run('JSON.stringify(comparisons.references[0])');
  game.run("state.tool='erase'; editCell(2,3);");
  const current = game.run('JSON.stringify(state.edits)');
  game.nodes.get('compare').onclick();
  chooseAction(game, 'Substituir referência A');
  assert.equal(game.nodes.get('modalTitle').textContent, 'Substituir a referência A?');
  assert.equal(game.run('JSON.stringify(comparisons.references[0])'), reference);
  chooseAction(game, 'Manter referência');
  assert.equal(game.run('JSON.stringify(comparisons.references[0])'), reference);
  assert.equal(game.run('JSON.stringify(state.edits)'), current);
  chooseAction(game, 'Substituir referência A');
  chooseAction(game, 'Substituir A');
  assert.equal(game.run('JSON.stringify(comparisons.references[0])'), current);
  assert.equal(game.run('JSON.stringify(state.edits)'), current);
});

test('Guardar durante chegada preserva a vitória exatamente uma vez', () => {
  const game = app();
  game.run('begin(0, LEVELS[0].solution); testRoutes();');
  const stale = [...game.frames.values()][0];
  const record = game.run('progress.best[0]');
  saveReference(game);
  assert.equal(game.run('state.playing'), false);
  assert.equal(game.run('typeof state.pendingResult'), 'function');
  assert.equal(game.run('progress.best[0]'), record);
  assert.equal(game.nodes.get('modalTitle').textContent, 'Comparar soluções');
  closeDialog(game);
  assert.equal(game.nodes.get('modalTitle').textContent, 'Todo mundo chegou!');
  assert.equal(game.run('state.pendingResult'), null);
  closeDialog(game); stale(20000); game.advance(20000); game.flush();
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.frames.size, 0);
  assert.equal(game.timers.size, 0);
});

test('Restaurar A cancela vitória antiga e permite recuperar B com Desfazer', () => {
  const game = app(); game.unlock();
  game.run('begin(3, LEVELS[3].alternatives[0]);');
  saveReference(game); closeDialog(game);
  game.run('begin(3, LEVELS[3].solution); testRoutes();');
  const stale = [...game.frames.values()][0];
  const current = game.run('JSON.stringify(state.edits)');
  const record = game.run('progress.best[3]');
  game.nodes.get('compare').onclick();
  assert.equal(game.run('typeof state.pendingResult'), 'function');
  chooseAction(game, 'Usar A no mapa');
  chooseAction(game, 'Usar A');
  stale(20000); game.advance(20000); game.flush();
  assert.equal(game.run('state.pendingResult'), null);
  assert.equal(game.run('state.routes'), null);
  assert.equal(game.nodes.get('modal').open, false);
  assert.equal(game.run('Core.cost(state.edits)'), 7);
  assert.equal(game.run('progress.best[3]'), record);
  game.nodes.get('undo').onclick();
  assert.equal(game.run('JSON.stringify(state.edits)'), current);
  assert.equal(game.nodes.get('modal').open, false);
});

test('A janela de ajuda recupera a largura normal após comparar', () => {
  const game = app(); game.run('begin(0);');
  game.nodes.get('compare').onclick();
  assert(game.nodes.get('modal').className.split(' ').includes('comparison-dialog'));
  closeDialog(game);
  game.nodes.get('help').onclick();
  assert(!game.nodes.get('modal').className.split(' ').includes('comparison-dialog'));
});

test('Comparação incompleta mostra Sem caminho sem apresentar zero como percurso melhor', () => {
  const game = app(); game.unlock();
  game.run('begin(2, LEVELS[2].solution);');
  saveReference(game); closeDialog(game);
  game.run("state.tool='erase'; editCell(3,3);");
  game.nodes.get('compare').onclick();
  const caio = comparisonRow(game, 'Caio');
  assert.match(caio, /<td>8 passos<\/td><td>Sem caminho<\/td><td>Não comparável<\/td>/);
  assert(!caio.includes('0 passos'));
  assert.match(game.nodes.get('modalBody').innerHTML, /Ainda há moradores sem caminho/);
  assert(!game.nodes.get('modalBody').innerHTML.includes('B gasta menos ou encurta percursos'));
});

test('Fase 4 explica economia com percurso maior como uma troca entre vantagens', () => {
  const game = app(); game.unlock();
  game.run('begin(3, LEVELS[3].solution);');
  saveReference(game); closeDialog(game);
  game.run('begin(3, LEVELS[3].alternatives[0]);');
  game.nodes.get('compare').onclick();
  assert.match(comparisonRow(game, 'Gasto'), /<td>11<\/td><td>7<\/td><td>4 unid\. a menos<\/td>/);
  assert.match(comparisonRow(game, 'Caio'), /<td>10 passos<\/td><td>12 passos<\/td><td>2 passos a mais<\/td>/);
  assert.match(game.nodes.get('modalBody').innerHTML, /Cada escolha tem uma vantagem/);
  assert.match(game.nodes.get('modalBody').innerHTML, /Metas atendidas: Economia/);
  assert.match(game.nodes.get('modalBody').innerHTML, /Metas atendidas: Percursos curtos/);
});

test('Fase 3 não esconde o percurso maior de Caio atrás da mesma soma de passos', () => {
  const game = app(); game.unlock();
  game.run('begin(2, LEVELS[2].solution);');
  saveReference(game); closeDialog(game);
  game.run('begin(2, LEVELS[2].alternatives[0]);');
  game.nodes.get('compare').onclick();
  assert.match(comparisonRow(game, 'Gasto'), /<td>8<\/td><td>8<\/td><td>Igual<\/td>/);
  assert.match(comparisonRow(game, 'Lia'), /<td>8 passos<\/td><td>4 passos<\/td><td>4 passos a menos<\/td>/);
  assert.match(comparisonRow(game, 'Caio'), /<td>8 passos<\/td><td>12 passos<\/td><td>4 passos a mais<\/td>/);
  assert.match(game.nodes.get('modalBody').innerHTML, /Cada escolha tem uma vantagem/);
  assert(!game.nodes.get('modalBody').innerHTML.includes('com o mesmo gasto e os mesmos passos para cada morador'));
});
test('Prévia informa custo e reembolso sem construir nem gastar',()=>{
  const game=app();game.run('begin(0);previewCell(2,2);');
  assert.match(game.nodes.get('buildPreview').textContent,/Custa 1 · saldo depois: 4/);
  assert.equal(game.run('Object.keys(state.edits).length'),0);
  assert.equal(game.nodes.get('remaining').textContent,5);
  game.run("editCell(2,2);selectTool('erase');previewCell(2,2);");
  assert.match(game.nodes.get('buildPreview').textContent,/Devolve 1 · saldo depois: 5/);
  assert.equal(game.run('Object.keys(state.edits).length'),1);
});
test('Prévia não marca obstáculos ou construções incompatíveis como disponíveis',()=>{
  const game=app();game.run('begin(0);');
  const cells=game.nodes.get('board').children;
  assert(cells[16].className.includes('build-option'));
  assert(!cells[0].className.includes('build-option'));
  game.run('previewCell(0,0);');
  assert.match(game.nodes.get('buildGuide').className,/unavailable/);
  game.run("selectTool('crossing');");
  assert(!cells.some(tile=>tile.className.includes('build-option')));
  assert.match(game.nodes.get('buildPreview').textContent,/Nenhuma célula disponível/);
});
test('Prévia respeita orçamento esgotado e volta a permitir construir após desfazer',()=>{
  const game=app();game.run("begin(0);for(const [r,c] of [[2,2],[2,3],[2,4],[1,1],[1,2]])editCell(r,c);previewCell(1,4);");
  assert.match(game.nodes.get('buildPreview').textContent,/Orçamento insuficiente/);
  assert(!game.nodes.get('board').children.some(tile=>tile.className.includes('build-option')));
  game.nodes.get('undo').onclick();
  assert(game.nodes.get('board').children[11].className.includes('build-option'));
  assert.equal(game.nodes.get('remaining').textContent,1);
});
test('Refazer recupera duas ações, orçamento e salvamento sem conceder conquistas',()=>{
  const game=app();game.run('begin(0);editCell(2,2);editCell(2,3);');
  game.nodes.get('undo').onclick();game.nodes.get('undo').onclick();
  assert.equal(game.nodes.get('redo').disabled,false);
  game.nodes.get('redo').onclick();game.nodes.get('redo').onclick();
  assert.equal(game.nodes.get('remaining').textContent,3);
  assert.equal(game.nodes.get('redo').disabled,true);
  assert.equal(game.run('progress.best.every(value=>value===0)'),true);
  const resumed=app(false,game.memory);resumed.nodes.get('continue').onclick();
  assert.equal(resumed.run('JSON.stringify(state.edits)'),game.run('JSON.stringify(state.edits)'));
});
test('Erro não apaga Refazer; uma nova construção válida descarta o futuro',()=>{
  const game=app();game.run('begin(0);editCell(2,2);travelHistory();editCell(0,0);');
  assert.equal(game.nodes.get('redo').disabled,false);
  game.run('editCell(2,3);');assert.equal(game.nodes.get('redo').disabled,true);
  game.nodes.get('redo').onclick();
  assert.equal(game.run('JSON.stringify(state.edits)'),'{"2,3":"path"}');
});
test('Refazer cancela resultado antigo e deixa rotas prontas para novo teste',()=>{
  const game=app();game.run('begin(0);editCell(2,2);editCell(2,3);editCell(2,4);testRoutes();');
  const stale=[...game.frames.values()][0];
  game.nodes.get('undo').onclick();game.nodes.get('redo').onclick();
  stale(20000);game.advance(20000);game.flush();
  assert.equal(game.nodes.get('modal').open,false);
  assert.equal(game.run('state.routes'),null);
  assert.equal(game.run('Core.score(currentLevel(),state.edits)'),820);
});
function shortcut(game,key,extras={}) {
  let prevented=false;
  game.document.events.keydown[0]({key,target:{tagName:'BUTTON'},preventDefault(){prevented=true;},...extras});
  return prevented;
}
test('Atalhos selecionam ferramentas e desfazem/refazem com Ctrl ou Cmd',()=>{
  const game=app();game.run('begin(0);editCell(2,2);');
  assert(shortcut(game,'4'));assert.equal(game.run('state.tool'),'erase');
  assert(shortcut(game,'z',{ctrlKey:true}));assert.equal(game.run('Core.cost(state.edits)'),0);
  assert(shortcut(game,'Z',{metaKey:true,shiftKey:true}));assert.equal(game.run('Core.cost(state.edits)'),1);
  shortcut(game,'z',{ctrlKey:true});shortcut(game,'y',{ctrlKey:true});
  assert.equal(game.run('Core.cost(state.edits)'),1);
});
test('Atalhos respeitam início, diálogos, campos de texto e modificadores do navegador',()=>{
  const game=app();assert.equal(shortcut(game,'4'),false);
  game.run('begin(0);');game.nodes.get('help').onclick();assert.equal(shortcut(game,'4'),false);
  closeDialog(game);
  for(const target of [{tagName:'INPUT'},{tagName:'TEXTAREA'},{tagName:'SELECT'},{isContentEditable:true}])
    assert.equal(shortcut(game,'4',{target}),false);
  assert.equal(shortcut(game,'4',{altKey:true}),false);
  assert.equal(shortcut(game,'1',{ctrlKey:true}),false);
  assert.equal(game.run('state.tool'),'path');
});
test('Trocar ferramenta pelo teclado preserva a prévia da célula focada',()=>{
  const game=app();game.run('begin(0);editCell(2,2);');
  game.nodes.get('board').children[16].focus();shortcut(game,'4');
  assert.match(game.nodes.get('buildPreview').textContent,/Devolve 1 · saldo depois: 5/);
  assert.match(game.nodes.get('buildLabel').textContent,/L3 C3/);
  shortcut(game,'z',{ctrlKey:true});
  assert.match(game.nodes.get('buildPreview').textContent,/Só é possível remover/);
});
function switchLevel(game,index) {
  game.run('chooseLevels();');
  game.nodes.get('modalBody').events.click[0]({target:{closest:()=>({dataset:{level:String(index)}})}});
  game.flushEvents();
}
test('Trocar de fase e recarregar recupera cada tabuleiro separadamente',()=>{
  const game=app();game.unlock();game.run('begin(0);editCell(2,2);');
  switchLevel(game,1);game.run('editCell(2,1);');switchLevel(game,0);
  assert.equal(game.run('JSON.stringify(state.edits)'),'{"2,2":"path"}');
  const resumed=app(false,game.memory);switchLevel(resumed,1);
  assert.equal(resumed.run('JSON.stringify(state.edits)'),'{"2,1":"path"}');
  assert.equal(resumed.run('state.undo.length+state.redo.length'),0);
});
test('Reiniciar uma fase preserva outros tabuleiros e limpa o histórico local',()=>{
  const game=app();game.unlock();game.run('begin(0);editCell(2,2);');
  switchLevel(game,1);game.run('editCell(2,1);travelHistory();');
  game.nodes.get('reset').onclick();chooseAction(game,'Recomeçar');
  assert.equal(game.run('state.redo.length'),0);
  assert.equal(game.run('JSON.stringify(progress.drafts[1])'),'{}');
  switchLevel(game,0);assert.equal(game.run('JSON.stringify(state.edits)'),'{"2,2":"path"}');
});
test('Rascunhos continuam funcionando na sessão se o navegador não salvar',()=>{
  const game=app();game.unlock();game.run('canSave=false;begin(0);editCell(2,2);');
  switchLevel(game,1);game.run('editCell(2,1);');switchLevel(game,0);
  assert.equal(game.run('JSON.stringify(state.edits)'),'{"2,2":"path"}');
  assert.equal(game.memory.has('conecta-umuarama-v1'),false);
});
test('Guardar após vencer preserva o tabuleiro, cria A e não altera pontos',()=>{
  const game=app();game.unlock();game.run('begin(3,LEVELS[3].solution);testRoutes();');game.flush();
  const score=game.run('progress.best[3]');chooseAction(game,'Guardar e experimentar');
  assert.equal(game.nodes.get('modal').open,false);
  assert.equal(game.run('JSON.stringify(comparisons.references[3])'),game.run('JSON.stringify(state.edits)'));
  assert.equal(game.run('progress.best[3]'),score);
  assert.match(game.nodes.get('feedback').textContent,/Altere o mapa e abra Comparar/);
});
test('Guardar após vencer respeita uma referência diferente e permite cancelar',()=>{
  const game=app();game.unlock();game.run('begin(3,LEVELS[3].alternatives[0]);');
  saveReference(game);closeDialog(game);
  game.run('begin(3,LEVELS[3].solution);testRoutes();');game.flush();
  chooseAction(game,'Guardar e experimentar');
  assert.equal(game.nodes.get('modalTitle').textContent,'Guardar esta solução como A?');
  chooseAction(game,'Manter referência A');assert.equal(game.run('Core.cost(comparisons.references[3])'),7);
  game.run('experimentAfterWin();');chooseAction(game,'Substituir e experimentar');
  assert.equal(game.run('Core.cost(comparisons.references[3])'),11);
});
test('Campanha na tela inicial atualiza após vitória e preserva recordes ao editar',()=>{
  const game=app();game.run('begin(0,LEVELS[0].solution);testRoutes();');game.flush();closeDialog(game);
  game.nodes.get('backHome').onclick();
  assert.match(game.nodes.get('campaignProgress').innerHTML,/<b>1\/5<\/b>/);
  assert.match(game.nodes.get('campaignProgress').innerHTML,/820 pontos em recordes/);
  game.nodes.get('continue').onclick();game.run("selectTool('erase');editCell(2,2);");
  assert.match(game.nodes.get('campaignProgress').innerHTML,/<b>1\/5<\/b>/);
});

console.log('\n' + passed + '/' + (passed + failed) + ' testes de integração passaram.');
process.exitCode = failed ? 1 : 0;
