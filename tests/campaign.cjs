/* Resumo da campanha e cartões de fases, usando os mesmos módulos do jogo. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = ['js/core.js', 'js/levels.js', 'js/storage.js', 'js/views.js']
  .map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const context = vm.createContext({});
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context, {timeout: 1000});
const value = code => JSON.parse(JSON.stringify(run(code)));
const reset = () => run('var progress = Storage.empty();');
let passed = 0, failed = 0;
function test(name, check) {
  reset();
  try { check(); passed++; console.log('PASSOU — ' + name); }
  catch (error) { failed++; console.error('FALHOU — ' + name + ': ' + error.message); }
}

test('Campanha nova informa cinco fases, oito selos e a primeira conexão', () => {
  assert.deepEqual(value('Views.campaignSummary(LEVELS, progress)'), {
    completed: 0, totalLevels: 5, economyBadges: 0, shortBadges: 0,
    totalBadges: 0, maxBadges: 8, totalPoints: 0, nextIndex: 0
  });
});

test('Tutorial concluído soma pontos e fases, mas não oferece selos', () => {
  run('progress.best[0] = 820; progress.shortBest = [true,false,false,false,false];');
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 1);
  assert.equal(summary.totalPoints, 820);
  assert.equal(summary.totalBadges, 0);
  assert.equal(summary.nextIndex, 1);
});

test('Economia e percursos curtos guardados em soluções diferentes contam separadamente', () => {
  run(`progress.best = [820,755,760,838,0];
    progress.shortBest = [true,true,true,true,false];`);
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 4);
  assert.equal(summary.economyBadges, 3);
  assert.equal(summary.shortBadges, 3);
  assert.equal(summary.totalBadges, 6);
  assert.equal(summary.totalPoints, 3173);
  assert.equal(summary.nextIndex, 4);
});

test('Solução de atalho na fase quatro não recebe o selo de economia', () => {
  run(`progress.best = [820,755,760,746,0];
    progress.shortBest = [false,true,true,true,false];`);
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.economyBadges, 2);
  assert.equal(summary.shortBadges, 3);
});

test('Obras guardadas não contam como fases ou selos conquistados', () => {
  run('progress.drafts[0] = {...LEVELS[0].solution}; progress.active = {index:0, edits: {...LEVELS[0].solution}};');
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 0);
  assert.equal(summary.totalPoints, 0);
  assert.equal(summary.totalBadges, 0);
});

test('Recorde posterior a uma lacuna é contado, mas a sugestão prioriza a fase pendente', () => {
  run('progress.best = [820,0,0,0,800];');
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 2);
  assert.equal(summary.totalPoints, 1620);
  assert.equal(summary.nextIndex, 1);
});

test('Depois da campanha, a sugestão aponta o primeiro selo ainda não conquistado', () => {
  run(`progress.best = [820,755,760,838,775];
    progress.shortBest = [false,true,true,false,true];`);
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 5);
  assert.equal(summary.nextIndex, 3);
  assert.equal(summary.totalBadges, 7);
  assert.match(run('Views.campaignProgress(LEVELS, progress)'), /selos restantes em Travessia segura/);
});

test('Todos os selos deixam de sugerir uma fase pendente', () => {
  run(`progress.best = [820,755,760,838,775];
    progress.shortBest = [false,true,true,true,true];`);
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.totalBadges, 8);
  assert.equal(summary.nextIndex, null);
  assert.match(run('Views.campaignProgress(LEVELS, progress)'), /Todos os caminhos e selos concluídos/);
});

test('Resumo não inventa conquistas para notas inválidas ou selos sem conclusão', () => {
  run(`progress.best = [820,699,'800',1001,800.5];
    progress.shortBest = [true,true,true,true,true];`);
  const summary = value('Views.campaignSummary(LEVELS, progress)');
  assert.equal(summary.completed, 1);
  assert.equal(summary.totalPoints, 820);
  assert.equal(summary.totalBadges, 0);
});

test('Renderização informa progresso acessível e conta selos pelos recordes', () => {
  run('progress.best = [820,755,0,0,0]; progress.shortBest = [false,true,false,false,false];');
  const html = run('Views.campaignProgress(LEVELS, progress)');
  assert.match(html, /<b>2\/5<\/b> fases concluídas/);
  assert.match(html, /<b>2\/8<\/b> selos conquistados/);
  assert.match(html, /<progress[^>]+value="2" max="5"/);
  assert.match(html, /aria-valuetext="2 de 5 fases concluídas"/);
  assert.match(html, /1575 pontos em recordes/);
  assert.match(html, /Próxima conexão: 3\. Uma cidade para todos\./);
});

test('Identificadores e títulos são escapados antes da renderização', () => {
  const html = run(`Views.campaignProgress([{...LEVELS[0], id:'<img>', title:'<script>&"teste"'}], {best:[0]})`);
  assert(!html.includes('<img>') && !html.includes('<script>'));
  assert.match(html, /&lt;img&gt;/);
  assert.match(html, /&lt;script&gt;&amp;&quot;teste&quot;/);
});

test('Campanha vazia mostra estado legível sem barra com máximo zero', () => {
  assert.equal(value('Views.campaignSummary([], null)').nextIndex, null);
  const html = run('Views.campaignProgress([], null)');
  assert.match(html, /Nenhuma fase disponível/);
  assert.match(html, /value="0" max="1"/);
  assert(!html.includes('NaN') && !html.includes('undefined'));
});

test('Cartão identifica uma obra válida sem exibir conquistas antecipadas', () => {
  run(`progress.drafts[0] = {'2,2':'path'};`);
  const html = run('Views.levelCard(LEVELS[0], 0, progress)');
  assert.match(html, /Obra guardada/);
  assert(!html.includes('Concluída') && !html.includes('✦'));
});

test('Cartão não anuncia obra vazia, inválida ou de fase bloqueada', () => {
  for (const edits of ['{}', `{'99,99':'path'}`, 'null']) {
    run(`progress.drafts[0] = ${edits};`);
    assert(!run('Views.levelCard(LEVELS[0], 0, progress)').includes('Obra guardada'));
  }
  run('progress.drafts[2] = {...LEVELS[2].solution};');
  const locked = run('Views.levelCard(LEVELS[2], 2, progress)');
  assert.match(locked, / disabled/);
  assert(!locked.includes('Obra guardada'));
});

test('Resumo e cartões não alteram o progresso salvo', () => {
  run(`progress.best = [820,755,0,0,0]; progress.drafts[0] = {'2,2':'path'};
    progress.shortBest = [true,true,false,false,false];`);
  const before = run('JSON.stringify(progress)');
  run('Views.campaignSummary(LEVELS, progress); Views.campaignProgress(LEVELS, progress); LEVELS.forEach((level,index) => Views.levelCard(level,index,progress));');
  assert.equal(run('JSON.stringify(progress)'), before);
});

console.log(`\n${passed}/${passed + failed} testes de campanha passaram.`);
process.exitCode = failed ? 1 : 0;
