/* Referências de construção e comparação de custo e percursos.
   A comparação não concede pontos nem altera o progresso da campanha. */
const Comparison = (() => {
  "use strict";
  const KEY = "conecta-umuarama-comparacoes-v1";
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const empty = () => LEVELS.map(() => null);

  function capture(level, edits) {
    return Core.validateSave(level, edits) ? { ...edits } : null;
  }

  function same(a, b) {
    if (!record(a) || !record(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key =>
      Object.prototype.hasOwnProperty.call(b, key) && a[key] === b[key]);
  }

  function analyse(level, edits) {
    const copy = capture(level, edits);
    if (!copy) return null;
    const report = Core.summary(level, copy);
    const people = Core.routes(level, copy).map(({ person, path }) => ({
      name: person.name, from: person.from, to: person.to,
      steps: path ? path.length - 1 : null
    }));
    return {
      edits: copy, spent: report.spent, remaining: report.remaining,
      connected: report.connected, total: report.total, complete: report.complete,
      efficient: report.efficient, shortRoutes: report.shortRoutes,
      // Sem todos os caminhos, a soma parcial não representa a viagem do grupo.
      steps: report.complete ? report.steps : null, people
    };
  }

  function compare(level, reference, current) {
    const a = analyse(level, reference), b = analyse(level, current);
    if (!a || !b) return null;
    const costDelta = b.spent - a.spent;
    const stepDeltas = a.people.map((person, index) =>
      person.steps === null || b.people[index].steps === null
        ? null : b.people[index].steps - person.steps);
    let verdict;
    if (same(a.edits, b.edits)) verdict = 'identical';
    else if (!a.complete || !b.complete) verdict = 'incomplete';
    else {
      const differences = [costDelta, ...stepDeltas];
      // Uma construção domina a outra apenas se não piorar nenhum critério.
      if (differences.every(value => value === 0)) verdict = 'tie';
      else if (differences.every(value => value >= 0)) verdict = 'a-dominates';
      else if (differences.every(value => value <= 0)) verdict = 'b-dominates';
      else verdict = 'tradeoff';
    }
    return { a, b, verdict, costDelta, stepDeltas };
  }

  function normalize(references) {
    let discarded = references.length !== LEVELS.length;
    const clean = LEVELS.map((level, index) => {
      const entry = references[index];
      if (entry === null || entry === undefined) return null;
      const copy = capture(level, entry);
      if (!copy) discarded = true;
      return copy;
    });
    return { references: clean, discarded };
  }

  function load(storageOverride) {
    let raw;
    try {
      const target = storageOverride === undefined ? globalThis.localStorage : storageOverride;
      raw = target.getItem(KEY);
    } catch (_) {
      return { references: empty(), available: false,
        message: 'O navegador não permitiu carregar as referências. Você pode comparar construções nesta sessão.' };
    }
    if (!raw) return { references: empty(), available: true, message: '' };
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    if (!record(parsed) || parsed.version !== 1 || !Array.isArray(parsed.references)) {
      return { references: empty(), available: true,
        message: 'As referências salvas estavam em um formato inválido e não foram carregadas. O progresso da campanha foi preservado.' };
    }
    const result = normalize(parsed.references);
    return { references: result.references, available: true,
      message: result.discarded ? 'Uma referência incompatível foi descartada. As referências válidas e o progresso da campanha foram preservados.' : '' };
  }

  function save(references, storageOverride) {
    if (!Array.isArray(references)) {
      return { available: true, saved: false,
        message: 'As referências não foram salvas porque o formato era inválido. O salvamento anterior foi mantido.' };
    }
    const result = normalize(references);
    try {
      const target = storageOverride === undefined ? globalThis.localStorage : storageOverride;
      target.setItem(KEY, JSON.stringify({ version: 1, references: result.references }));
      return { available: true, saved: true,
        message: result.discarded ? 'As referências válidas foram salvas; as incompatíveis foram descartadas.' : '' };
    } catch (_) {
      return { available: false, saved: false,
        message: 'O navegador não conseguiu salvar as referências. Elas continuam disponíveis nesta sessão, mas podem se perder ao fechar.' };
    }
  }

  return Object.freeze({ capture, same, analyse, compare, load, save });
})();
