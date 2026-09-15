/* Testes compartilhados pelo navegador e pelo executor Node.js.
   Todo acesso ao armazenamento é simulado. */
const runChecks = () => {
  const results = [];
  const assert = (ok, message = "Condição não atendida") => { if (!ok) throw Error(message); };
  const equal = (a, b) => assert(JSON.stringify(a) === JSON.stringify(b), "Valores diferentes");
  const test = (name, fn) => {
    try { fn(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  };
  const fixture = (map, stairs = false, budget = 10) => ({
    id: 99, title: "Teste", description: "", hint: "", budget, map,
    people: [{ name: "Pessoa", from: "A", to: "X", stairs, color: "#123456" }],
    destinations: { X: "Destino" }, solution: {}
  });
  const progress = (best = [0, 0, 0, 0, 0], active = null) => ({ version: 1, best: [...best], active });
  const valid = data => { const result = Storage.validateProgress(data); assert(!!result); return result; };
  const invalid = data => {
    let rejected = false;
    try { rejected = !Storage.validateProgress(data); } catch (_) { rejected = true; }
    assert(rejected, "Progresso inválido foi aceito");
  };
  const fakeStorage = (raw = null, options = {}) => ({
    raw, removed: 0, writes: 0,
    getItem() { if (options.failRead) throw Error("Leitura bloqueada"); return this.raw; },
    setItem(key, value) { if (options.failWrite) throw Error("Escrita bloqueada"); this.raw = String(value); this.writes++; },
    removeItem() { this.raw = null; this.removed++; }
  });

  LEVELS.forEach((level, index) => test("Fase " + (index + 1) + ": solução de referência", () => {
    assert(Core.validatesave(level, level.solution), "Solução inválida");
    assert(Core.cost(level.solution) <= level.budget, "Orçamento excedido");
    const routes = Core.routes(level, level.solution);
    assert(routes.length === level.people.length);
    routes.forEach(({ person, path }) => {
      assert(Array.isArray(path) && path.length > 1, "Morador sem rota");
      const first = path[0], last = path[path.length - 1];
      assert(level.map[first[0]][first[1]] === person.from);
      assert(level.map[last[0]][last[1]] === person.to);
      path.slice(1).forEach((cell, i) =>
        assert(Math.abs(cell[0] - path[i][0]) + Math.abs(cell[1] - path[i][1]) === 1, "Rota contém diagonal ou salto"));
    });
    assert(Core.score(level, level.solution) >= 700);
  }));

  LEVELS.forEach(level => {
    (level.alternatives || []).forEach((solution, i) => test('Fase ' + level.id + ': alternativa ' + (i + 1) + ' conecta todos', () => {
      assert(Core.validatesave(level, solution));
      assert(Core.routes(level, solution).every(route => route.path));
      assert(Core.score(level, solution) >= 700);
    }));
    test('Fase ' + level.id + ': selo de economia é alcançável', () => {
      assert([level.solution, ...(level.alternatives || [])].some(edits => Core.summary(level, edits).efficient));
      assert(!Core.summary(level, {}).efficient, 'Fase incompleta ganhou selo');
    });
  });
  test('Fase 3: mesma despesa pode mudar a distância dos moradores', () => {
    const level = LEVELS[2], alternative = level.alternatives[0];
    assert(Core.cost(level.solution) === Core.cost(alternative));
    equal(Core.routes(level, level.solution).map(route => route.path.length - 1), [8, 8]);
    equal(Core.routes(level, alternative).map(route => route.path.length - 1), [4, 12]);
  });
  test('Fase 4: contorno acessível custa menos e exige mais passos', () => {
    const level = LEVELS[3], shortcut = Core.summary(level, level.solution), detour = Core.summary(level, level.alternatives[0]);
    assert(shortcut.complete && detour.complete);
    assert(shortcut.spent === 11 && detour.spent === 7);
    assert(shortcut.steps === 10 && detour.steps === 12);
    assert(!shortcut.efficient && detour.efficient);
  });
  test('Fase 5: rampa opcional encurta a rota de Caio', () => {
    const level = LEVELS[4], alternative = level.alternatives[0];
    assert(Core.cost(level.solution) === 22 && Core.cost(alternative) === 20);
    assert(Core.routes(level, level.solution)[1].path.length === 9);
    assert(Core.routes(level, alternative)[1].path.length === 11);
  });
  test('Resumo conta células compartilhadas uma vez por célula', () => {
    const level = LEVELS[1], report = Core.summary(level, level.solution);
    assert(report.connected === 2 && report.total === 2 && report.complete);
    assert(report.shared === 5 && report.steps === 16);
    assert(report.spent === 9 && report.remaining === 2);
  });
  test('Resumo incompleto informa apenas percursos existentes, sem selo', () => {
    const level = LEVELS[2], edits = {...level.solution};
    delete edits['3,3'];
    const report = Core.summary(level, edits);
    assert(report.connected === 1 && report.total === 2 && !report.complete);
    assert(!report.efficient && report.shared === 0 && report.steps === 8);
  });
  test('Resultados e rotas não alteram as peças do jogador', () => {
    const level = LEVELS[4], edits = {...level.solution}, before = JSON.stringify(edits);
    Core.summary(level, edits); Core.routes(level, edits); Core.score(level, edits);
    assert(JSON.stringify(edits) === before);
  });
  test('Referências anteriores continuam válidas no progresso salvo', () => {
    LEVELS.forEach((level, index) => {
      const data = progress(LEVELS.map(() => 700), {index, edits: {...level.solution}});
      assert(Storage.validateProgress(data));
    });
  });

  test("BFS não conecta células na diagonal", () => {
    assert(Core.routes(fixture(["At", "tX"]), {})[0].path === null);
  });
  test("BFS usa calçadas existentes e encontra rota mínima", () => {
    equal(Core.routes(fixture(["AppX", "pppp"]), {})[0].path, [[0,0], [0,1], [0,2], [0,3]]);
  });
  test("Edifício intermediário não vira passagem", () => {
    assert(Core.routes(fixture(["ABX"], true), {})[0].path === null);
  });
  test("Escada bloqueia perfil sem acesso a escadas", () => {
    assert(Core.routes(fixture(["AsX"]), {})[0].path === null);
  });
  test("Escada permite passagem ao perfil compatível", () => {
    assert(Core.routes(fixture(["AsX"], true), {})[0].path.length === 3);
  });
  test("Rampa permite passagem ao perfil sem escadas", () => {
    assert(Core.routes(fixture(["AsX"]), { "0,1": "ramp" })[0].path.length === 3);
  });
  test("Rua sem faixa bloqueia passagem", () => {
    assert(Core.routes(fixture(["A=X"]), {})[0].path === null);
  });
  test("Faixa habilita travessia", () => {
    assert(Core.routes(fixture(["A=X"]), { "0,1": "crossing" })[0].path.length === 3);
  });
  test("Construção conecta terreno pelo custo correto", () => {
    const level = fixture(["A.X"]), result = Core.apply(level, {}, 0, 1, "path");
    assert(result.ok); equal(result.edits, { "0,1": "path" });
    assert(Core.cost(result.edits) === 1 && Core.routes(level, result.edits)[0].path.length === 3);
  });
  test("Ações são puras e clique duplicado não duplica gasto", () => {
    const level = fixture(["A..X"]), original = { "0,1": "path" };
    const changed = Core.apply(level, original, 0, 2, "path");
    assert(changed.ok && changed.edits !== original);
    equal(original, { "0,1": "path" });
    const repeated = Core.apply(level, changed.edits, 0, 2, "path");
    assert(!repeated.ok);
    equal(repeated.edits, changed.edits);
    assert(Core.cost(repeated.edits) === 2);
  });
  test("Remoção reembolsa e restaura escada original", () => {
    const level = fixture(["AsX"]), original = { "0,1": "ramp" };
    const result = Core.apply(level, original, 0, 1, "erase");
    assert(result.ok && Core.cost(result.edits) === 0);
    equal(original, { "0,1": "ramp" });
    assert(Core.routes(level, result.edits)[0].path === null);
  });
  test("Ação inválida preserva o estado", () => {
    const level = fixture(["AtX"]), original = {};
    [[0,1,"path"],[0,0,"path"],[-1,0,"path"],[0,99,"path"],[0,1,"unknown"]].forEach(([r,c,tool]) => {
      const result = Core.apply(level, original, r, c, tool);
      assert(!result.ok && result.edits === original);
    });
  });
  test("Orçamento não pode ficar negativo", () => {
    const level = fixture(["A..X"], false, 1), original = { "0,1": "path" };
    const result = Core.apply(level, original, 0, 2, "path");
    assert(!result.ok && result.edits === original);
    assert(!Core.validatesave(level, { "0,1": "path", "0,2": "path" }));
  });
  test("Custos conhecidos e peças desconhecidas", () => {
    assert(Core.cost({ a:"path", b:"crossing", c:"ramp" }) === 6);
    assert(Core.cost({ "0,1": "unknown" }) === Infinity);
  });
  test("Validação rejeita coordenadas e peças incompatíveis", () => {
    const level = fixture(["A.X"]);
    [{"-1,0":"path"},{"0,-1":"path"},{"0,3":"path"},{"0,1":"ramp"},{"0,0":"path"},{"0,1":"unknown"}]
      .forEach(edits => assert(!Core.validatesave(level, edits)));
    assert(Core.validatesave(level, {}));
  });
  test("Pontuação depende de conclusão e saldo", () => {
    const level = fixture(["A.X"], false, 10);
    assert(Core.score(level, {}) === 0);
    assert(Core.score(level, { "0,1": "path" }) === 970);
    assert(Core.score(fixture(["A.X"], false, 1), { "0,1": "path" }) === 700);
  });
  test("Progresso vazio é válido e tem cópias independentes", () => {
    const first = Storage.empty(), second = Storage.empty();
    equal(first, progress()); valid(first); first.best[0] = 700; equal(second, progress());
  });
  test("Prefixo de fases concluídas é aceito sem mutação", () => {
    const data = progress([700,850,1000,0,0]), before = JSON.stringify(data);
    equal(valid(data), data); assert(JSON.stringify(data) === before);
  });
  test("Pontuações inválidas são rejeitadas", () => {
    [[699,0,0,0,0],[1001,0,0,0,0],[700.5,0,0,0,0],["700",0,0,0,0]]
      .forEach(best => invalid(progress(best)));
  });
  test("Fase inicial, próxima liberada e anterior podem ser retomadas", () => {
    [progress([0,0,0,0,0],{index:0,edits:{}}),
     progress([700,0,0,0,0],{index:1,edits:{}}),
     progress([700,800,0,0,0],{index:0,edits:{}})].forEach(valid);
  });
  test("Fase bloqueada e índice inválido são rejeitados", () => {
    [1,-1,5,0.5].forEach(index => invalid(progress(undefined,{index,edits:{}})));
  });
  test("Edições inválidas da fase ativa são rejeitadas", () => {
    invalid(progress(undefined,{index:0,edits:{"-1,0":"path"}}));
  });
  test("Versão incompatível e estruturas incompletas são rejeitadas", () => {
    [null,[],{}, {...progress(),version:2}, {...progress(),best:[0]}, {...progress(),active:{}}].forEach(invalid);
  });
  test("Carregar progresso válido preserva dados", () => {
    const data = progress([700,0,0,0,0],{index:1,edits:{}}), fake = fakeStorage(JSON.stringify(data));
    const result = Storage.load(fake); assert(result.available && fake.removed === 0); equal(result.data,data);
  });
  test("Armazenamento vazio inicia campanha nova", () => {
    const result = Storage.load(fakeStorage()); assert(result.available); equal(result.data,progress());
  });
  test("JSON corrompido é preservado em recuperação com aviso", () => {
    const fake = fakeStorage("{incompleto"), result = Storage.load(fake);
    equal(result.data,progress()); assert(result.available && !!result.message && fake.removed === 0 && fake.writes === 1);
  });
  test("Falha de leitura permite jogar sem salvamento", () => {
    const result = Storage.load(fakeStorage(null,{failRead:true}));
    assert(!result.available && !!result.message); equal(result.data,progress());
  });
  test("Salvar grava JSON no armazenamento simulado", () => {
    const fake = fakeStorage(), data = progress([700,0,0,0,0]), result = Storage.save(data,fake);
    assert(result.available && fake.writes === 1); equal(JSON.parse(fake.raw),data);
  });
  test("Falha de escrita retorna aviso sem interromper jogo", () => {
    const result = Storage.save(progress(),fakeStorage(null,{failWrite:true}));
    assert(!result.available && !!result.message);
  });

  test('Recordes com lacunas são preservados sem liberar fases futuras', () => {
    const data=valid(progress([820,0,0,0,760]));
    assert(Storage.isUnlocked(data,1));
    assert(!Storage.isUnlocked(data,2));
    assert(Storage.isUnlocked(data,4));
  });
  test('Tabuleiro danificado não apaga recordes válidos', () => {
    const data=progress([820,755,0,0,0],{index:2,edits:{'99,99':'path'}});
    const result=Storage.load(fakeStorage(JSON.stringify(data)));
    equal(result.data.best,data.best); assert(result.data.active===null);
    assert(!!result.message);
  });
  test('Recuperação adapta quantidade de fases e descarta só notas inválidas', () => {
    const recovered=Storage.recover({version:1,best:[820,'erro',760],active:null});
    equal(recovered.best,[820,0,760,0,0]);
    valid(recovered);
  });
  test('Salvar estado inválido mantém o conteúdo anterior', () => {
    const fake=fakeStorage('anterior');
    const result=Storage.save(progress([12,0,0,0,0]),fake);
    assert(result.saved===false && fake.raw==='anterior' && fake.writes===0);
  });
  test('Selos de percurso sobrevivem a salvar e carregar', () => {
    const data={...progress([820,755,0,0,0]),shortBest:[true,true,false,false,false]};
    const fake=fakeStorage(); Storage.save(data,fake);
    const loaded=Storage.load(fake).data;
    equal(loaded.best,data.best); equal(loaded.shortBest,data.shortBest);
    assert(loaded.active===null && loaded.version===1);
  });
  test('Fase 4 oferece selos diferentes para atalho e contorno', () => {
    const level=LEVELS[3];
    const shortcut=Core.summary(level,level.solution);
    const detour=Core.summary(level,level.alternatives[0]);
    assert(shortcut.shortRoutes && !shortcut.efficient);
    assert(detour.efficient && !detour.shortRoutes);
  });
  test('Fase 3 avalia a distância de cada pessoa, não apenas a soma', () => {
    const level=LEVELS[2];
    assert(Core.summary(level,level.solution).shortRoutes);
    assert(!Core.summary(level,level.alternatives[0]).shortRoutes);
  });
  test('Todas as metas de percurso têm uma solução conhecida', () => {
    LEVELS.forEach(level=>assert([level.solution,...(level.alternatives||[])]
      .some(edits=>Core.summary(level,edits).shortRoutes)));
  });
  test('Falas de Caio reagem à rota escolhida nas fases 3, 4 e 5', () => {
    [2,3,4].forEach(index=>{
      const level=LEVELS[index],person=level.people.find(p=>p.movement==='wheelchair');
      const speech=edits=>Story.arrival(person,Core.routes(level,edits).find(r=>r.person===person).path,edits);
      assert(speech(level.solution)!==speech(level.alternatives[0]));
    });
  });
  test('Comprar uma rampa fora do trajeto não produz fala sobre usá-la', () => {
    const person={name:'Teste',stepGoal:2,arrival:'Cheguei',reactions:{ramp:'Usei rampa',short:'Direto'}};
    assert(Story.arrival(person,[[0,0],[0,1]],{'2,2':'ramp'})==='Direto');
  });

  test('Falha de Caio mostra exatamente as células alcançáveis antes da escada', () => {
    const edits={...LEVELS[2].solution};delete edits['3,3'];
    const before=JSON.stringify(edits),route=Core.routes(LEVELS[2],edits)[1];
    assert(route.path===null);
    equal(route.reachable.map(cell=>cell.join(',')).sort(),['1,2','1,3','1,4','1,5','2,3']);
    assert(route.barriers.some(item=>item.kind==='stair'&&item.r===3&&item.c===3));
    assert(!route.reachable.some(([r,c])=>r===3&&c===3));
    assert(JSON.stringify(edits)===before);
  });
  test('Diagnóstico respeita perfil, terreno, fronteira e ausência de diagonais',()=>{
    const stairs=Core.routes(fixture(['AsX']),{})[0];
    equal(stairs.reachable,[[0,0]]);equal(stairs.barriers,[{r:0,c:1,kind:'stair'}]);
    assert(Core.routes(fixture(['AsX'],true),{})[0].path);
    equal(Core.routes(fixture(['A=X']),{})[0].barriers,[{r:0,c:1,kind:'road'}]);
    equal(Core.routes(fixture(['A.X']),{})[0].barriers,[{r:0,c:1,kind:'gap'}]);
    equal(Core.routes(fixture(['At','tX']),{})[0].reachable,[[0,0]]);
    equal(Core.routes(fixture(['At','tX']),{})[0].barriers,[]);
  });
  test('Estado inválido não produz uma área de alcance enganosa',()=>{
    const route=Core.routes(LEVELS[2],{'99,99':'path'})[1];
    equal(route.reachable,[]);equal(route.barriers,[]);assert(route.path===null);
  });
  test('Fase 5 tem solução testemunhada com ambos os selos e custo 20',()=>{
    const edits=LEVELS[4].alternatives[1],report=Core.summary(LEVELS[4],edits);
    assert(Core.validateSave(LEVELS[4],edits));
    assert(report.spent===20&&report.efficient&&report.shortRoutes);
    equal(Core.routes(LEVELS[4],edits).map(route=>route.path.length-1),[6,8,10]);
  });
  test('Referência copia as peças e rejeita estados inválidos',()=>{
    const edits={...LEVELS[0].solution}, copy=Comparison.capture(LEVELS[0],edits);
    equal(copy,edits);assert(copy!==edits);
    delete edits['2,2'];assert(copy['2,2']==='path');
    copy['1,1']='path';assert(!Object.prototype.hasOwnProperty.call(edits,'1,1'));
    [null,[],{'99,99':'path'},{'2,2':'ramp'}].forEach(value=>assert(Comparison.capture(LEVELS[0],value)===null));
    assert(Comparison.capture(fixture(['A..X'],false,1),{'0,1':'path','0,2':'path'})===null);
  });
  test('Referências iguais independem da ordem das coordenadas',()=>{
    const a={'2,2':'path','2,3':'path'},b={'2,3':'path','2,2':'path'};
    assert(Comparison.same(a,b));assert(Comparison.same({},{}));
    assert(!Comparison.same(a,{'2,2':'path'}));assert(!Comparison.same(a,{'2,2':'ramp','2,3':'path'}));
    assert(!Comparison.same(null,null));assert(!Comparison.same([],{}));
  });
  test('Análise informa métricas completas sem compartilhar dados editáveis',()=>{
    const edits={...LEVELS[2].solution},report=Comparison.analyse(LEVELS[2],edits);
    assert(report.spent===8&&report.remaining===2&&report.connected===2&&report.total===2);
    assert(report.complete&&report.efficient&&report.shortRoutes&&report.steps===16);
    equal(report.people,[{name:'Lia',from:'A',to:'X',steps:8},{name:'Caio',from:'B',to:'Y',steps:8}]);
    delete report.edits['3,3'];report.people[0].name='Alterado';
    assert(edits['3,3']==='ramp'&&LEVELS[2].people[0].name==='Lia');
  });
  test('Análise incompleta não confunde ausência de caminho com zero passos',()=>{
    const edits={...LEVELS[2].solution};delete edits['3,3'];
    const report=Comparison.analyse(LEVELS[2],edits);
    assert(report.connected===1&&report.total===2&&!report.complete&&report.steps===null);
    equal(report.people.map(person=>person.steps),[8,null]);
    assert(!report.efficient&&!report.shortRoutes);
    const emptyReport=Comparison.analyse(LEVELS[0],{});
    assert(emptyReport.steps===null&&emptyReport.people[0].steps===null);
  });
  test('Comparação rejeita estados inválidos sem produzir diferenças',()=>{
    assert(Comparison.analyse(LEVELS[0],{'2,2':'ramp'})===null);
    assert(Comparison.compare(LEVELS[0],null,LEVELS[0].solution)===null);
    assert(Comparison.compare(LEVELS[0],LEVELS[0].solution,{'99,99':'path'})===null);
  });
  test('Comparação da fase 4 mostra menor custo contra menor percurso',()=>{
    const level=LEVELS[3],result=Comparison.compare(level,level.alternatives[0],level.solution);
    assert(result.verdict==='tradeoff'&&result.costDelta===4);
    equal(result.stepDeltas,[-2]);assert(result.a.spent===7&&result.a.steps===12&&result.b.spent===11&&result.b.steps===10);
    const reverse=Comparison.compare(level,level.solution,level.alternatives[0]);
    assert(reverse.verdict==='tradeoff'&&reverse.costDelta===-4);equal(reverse.stepDeltas,[2]);
  });
  test('Mesma soma de passos não esconde piora para um morador',()=>{
    const level=LEVELS[2],result=Comparison.compare(level,level.solution,level.alternatives[0]);
    assert(result.a.steps===16&&result.b.steps===16&&result.costDelta===0);
    equal(result.stepDeltas,[-4,4]);assert(result.verdict==='tradeoff');
  });
  test('Dominância exige custo e todos os percursos sem piora',()=>{
    const level=LEVELS[4],result=Comparison.compare(level,level.solution,level.alternatives[1]);
    assert(result.verdict==='b-dominates'&&result.costDelta===-2);equal(result.stepDeltas,[-4,0,0]);
    const reverse=Comparison.compare(level,level.alternatives[1],level.solution);
    assert(reverse.verdict==='a-dominates'&&reverse.costDelta===2);equal(reverse.stepDeltas,[4,0,0]);
    const extra={...LEVELS[0].solution,'1,1':'path'};
    const sameDistance=Comparison.compare(LEVELS[0],LEVELS[0].solution,extra);
    assert(sameDistance.verdict==='a-dominates'&&sameDistance.costDelta===1);equal(sameDistance.stepDeltas,[0]);
  });
  test('Empate de métricas não diz que construções diferentes são idênticas',()=>{
    const level=fixture(['A.X','...']);
    const a={'0,1':'path','1,0':'path'},b={'0,1':'path','1,2':'path'};
    const result=Comparison.compare(level,a,b);
    assert(result.verdict==='tie'&&result.costDelta===0);equal(result.stepDeltas,[0]);
    assert(!Comparison.same(result.a.edits,result.b.edits));
  });
  test('Construções idênticas são reconhecidas mesmo antes da conclusão',()=>{
    assert(Comparison.compare(LEVELS[0],{},{}).verdict==='identical');
    const original=LEVELS[0].solution,reordered=Object.fromEntries(Object.entries(original).reverse());
    assert(Comparison.compare(LEVELS[0],original,reordered).verdict==='identical');
  });
  test('Comparação parcial mantém diferenças individuais conhecidas sem declarar vencedor',()=>{
    const level=LEVELS[2],partial={...level.solution};delete partial['3,3'];
    const result=Comparison.compare(level,partial,level.solution);
    assert(result.verdict==='incomplete'&&result.costDelta===2&&result.a.steps===null);
    equal(result.stepDeltas,[0,null]);
    assert(Comparison.compare(LEVELS[0],{},LEVELS[0].solution).verdict==='incomplete');
  });
  test('Comparar não altera peças, mapas, recordes ou selos',()=>{
    const level=LEVELS[4],a={...level.solution},b={...level.alternatives[1]};
    const data={...progress([820,755,760,746,0]),shortBest:[false,true,true,true,false]};
    const before=JSON.stringify({a,b,level,data});
    const result=Comparison.compare(level,a,b);
    delete result.a.edits['1,2'];result.b.people[0].steps=999;
    assert(JSON.stringify({a,b,level,data})===before);
  });
  test('Referências de fases diferentes sobrevivem a salvar e recarregar',()=>{
    const references=LEVELS.map(()=>null);references[0]={...LEVELS[0].solution};references[3]={...LEVELS[3].alternatives[0]};
    const fake=fakeStorage(),result=Comparison.save(references,fake);
    assert(result.available&&result.saved&&fake.writes===1);
    const loaded=Comparison.load(fake);equal(loaded.references,references);assert(loaded.available&&!loaded.message);
    delete references[0]['2,2'];assert(loaded.references[0]['2,2']==='path');
    delete loaded.references[3]['1,2'];assert(Comparison.load(fake).references[3]['1,2']==='path');
  });
  test('Carregar referências descarta só fases incompatíveis',()=>{
    const references=[LEVELS[0].solution,{'99,99':'path'},LEVELS[2].alternatives[0],null,{'1,2':'ramp'}];
    const fake=fakeStorage(JSON.stringify({version:1,references})),result=Comparison.load(fake);
    assert(result.available&&!!result.message&&fake.writes===0&&fake.removed===0);
    equal(result.references,[LEVELS[0].solution,null,LEVELS[2].alternatives[0],null,null]);
    const shorter=Comparison.load(fakeStorage(JSON.stringify({version:1,references:[{}]})));
    equal(shorter.references,[{},null,null,null,null]);assert(!!shorter.message);
  });
  test('Referências vazias são independentes e formatos danificados não são gravados ao carregar',()=>{
    const first=Comparison.load(fakeStorage()),second=Comparison.load(fakeStorage());
    equal(first.references,[null,null,null,null,null]);assert(first.available&&!first.message);
    first.references[0]={};assert(second.references[0]===null);
    ['{incompleto','null','[]','{}',JSON.stringify({version:2,references:[{}]})]
      .forEach(raw=>{
        const fake=fakeStorage(raw),result=Comparison.load(fake);
        equal(result.references,[null,null,null,null,null]);
        assert(result.available&&!!result.message&&fake.writes===0&&fake.removed===0&&fake.raw===raw);
      });
  });
  test('Salvar referências mantém válidas, rejeita peças erradas e preserva a entrada',()=>{
    const references=[LEVELS[0].solution,{'0,0':'path'},null,LEVELS[3].solution,{'1,2':'ramp'}];
    const before=JSON.stringify(references),fake=fakeStorage(),result=Comparison.save(references,fake);
    assert(result.saved&&result.available&&!!result.message&&JSON.stringify(references)===before);
    equal(JSON.parse(fake.raw),{version:1,references:[LEVELS[0].solution,null,null,LEVELS[3].solution,null]});
  });
  test('Formato geral inválido não substitui referências anteriores',()=>{
    [null,{},'incorreto'].forEach(value=>{
      const fake=fakeStorage('anterior'),result=Comparison.save(value,fake);
      assert(!result.saved&&result.available&&!!result.message&&fake.raw==='anterior'&&fake.writes===0);
    });
  });
  test('Falhas do armazenamento não interrompem comparação nem apagam referências da sessão',()=>{
    const loaded=Comparison.load(fakeStorage(null,{failRead:true}));
    assert(!loaded.available&&!!loaded.message);equal(loaded.references,[null,null,null,null,null]);
    const references=[LEVELS[0].solution,null,null,null,null],before=JSON.stringify(references);
    const fake=fakeStorage('anterior',{failWrite:true}),saved=Comparison.save(references,fake);
    assert(!saved.available&&!saved.saved&&!!saved.message&&fake.raw==='anterior');
    assert(JSON.stringify(references)===before&&Comparison.analyse(LEVELS[0],references[0]).complete);
  });
  test('Comparações leem e escrevem somente a própria chave de armazenamento',()=>{
    const progressKey='conecta-umuarama-v1',comparisonKey='conecta-umuarama-comparacoes-v1';
    const original=JSON.stringify(progress([820,755,0,0,0]));
    const data=new Map([[progressKey,original]]),reads=[],writes=[];
    const fake={getItem(key){reads.push(key);return data.get(key)??null;},setItem(key,value){writes.push(key);data.set(key,value);}};
    const references=[LEVELS[0].solution,null,null,null,null];
    Comparison.load(fake);Comparison.save(references,fake);Comparison.load(fake);
    equal(reads,[comparisonKey,comparisonKey]);equal(writes,[comparisonKey]);
    assert(data.get(progressKey)===original&&data.size===2);
  });
  const passed = results.filter(result => result.passed).length;
  return { total:results.length, passed, failed:results.length-passed, results };
};
