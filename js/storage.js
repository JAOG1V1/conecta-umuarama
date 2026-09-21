/* Persistência separada da interface. Os testes podem fornecer um armazenamento simulado. */
const Storage = (() => {
  "use strict";
  const KEY = "conecta-umuarama-v1";
  const empty = () => ({ version: 1, best: LEVELS.map(() => 0), active: null, drafts: LEVELS.map(() => null) });
  const validScore = n => Number.isInteger(n) && (n === 0 || n >= 700 && n <= 1000);

  function isUnlocked(data, index) {
    const next = data.best.findIndex(points => points === 0);
    return Number.isInteger(index) && index >= 0 && index < LEVELS.length
      && (data.best[index] > 0 || next === -1 || index <= next);
  }

  function validateProgress(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.best) || data.best.length !== LEVELS.length)
      throw new Error("Formato de salvamento inválido.");
    if (!Array.from(data.best).every(validScore))
      throw new Error("Pontuação inválida.");
    if (data.shortBest !== undefined && (!Array.isArray(data.shortBest)
      || data.shortBest.length !== LEVELS.length
      || !Array.from(data.shortBest).every((value, i) => typeof value === 'boolean' && (!value || data.best[i] > 0))))
      throw new Error('Selos inválidos.');
    if (data.active !== null) {
      const active = data.active;
      if (!active || !isUnlocked(data, active.index) ||
          !Core.validateSave(LEVELS[active.index], active.edits))
        throw new Error("Tabuleiro salvo inválido.");
    }
    // O campo é opcional apenas para migrar partidas anteriores à versão 1.7.
    if (data.drafts !== undefined && (!Array.isArray(data.drafts) || data.drafts.length !== LEVELS.length
      || !Array.from(data.drafts).every((edits, index) => edits === null
        || isUnlocked(data, index) && Core.validateSave(LEVELS[index], edits))))
      throw new Error('Rascunhos de fases inválidos.');
    const drafts = LEVELS.map((_, index) => data.drafts?.[index] == null ? null : {...data.drafts[index]});
    // A partida ativa também precisa estar disponível no seletor de fases.
    // Nunca compartilha o mesmo objeto editável com active ou com a entrada.
    if (data.active) drafts[data.active.index] = {...data.active.edits};
    return {
      version: 1,
      best: data.best.slice(),
      ...(data.shortBest ? {shortBest: data.shortBest.slice()} : {}),
      active: data.active ? { index: data.active.index, edits: { ...data.active.edits } } : null,
      drafts
    };
  }

  // Recupera partes independentes. Acrescentar uma fase ao final não apaga recordes.
  function recover(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.best)) return empty();
    const recovered = empty();
    recovered.best = LEVELS.map((_, i) => validScore(data.best[i]) ? data.best[i] : 0);
    if (Array.isArray(data.shortBest)) {
      recovered.shortBest = LEVELS.map((_, i) => recovered.best[i] > 0 && data.shortBest[i] === true);
    }
    // Uma fase danificada não descarta os tabuleiros válidos das outras fases.
    if (Array.isArray(data.drafts)) {
      recovered.drafts = LEVELS.map((level, index) => isUnlocked(recovered, index)
        && Core.validateSave(level, data.drafts[index]) ? {...data.drafts[index]} : null);
    }
    const active = data.active;
    if (active && isUnlocked(recovered, active.index) && Core.validateSave(LEVELS[active.index], active.edits)) {
      recovered.active = {index: active.index, edits: {...active.edits}};
      recovered.drafts[active.index] = {...active.edits};
    }
    return recovered;
  }

  function load(storageOverride) {
    let target, raw;
    try {
      target = storageOverride === undefined ? globalThis.localStorage : storageOverride;
      raw = target.getItem(KEY);
    } catch (_) {
      return { data: empty(), available: false, message: "O navegador não permitiu o salvamento. Você pode jogar normalmente nesta sessão." };
    }
    if (!raw) return { data: empty(), available: true, message: "" };
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    try {
      return { data: validateProgress(parsed), available: true, message: "" };
    } catch (_) {
      // Mantém uma cópia antes de permitir que uma nova partida substitua o original.
      let available = true;
      try { target.setItem(KEY + '-recovery', raw); } catch (_) { available = false; }
      return { data: recover(parsed), available,
        message: 'Parte do salvamento precisava de recuperação. Os recordes e tabuleiros válidos foram mantidos.' };
    }
  }

  function save(data, storageOverride) {
    let validated;
    try { validated = validateProgress(data); } catch (_) {
      return {available: true, saved: false, message: 'A partida não foi salva porque contém dados inválidos. O salvamento anterior foi mantido.'};
    }
    try {
      const target = storageOverride === undefined ? globalThis.localStorage : storageOverride;
      target.setItem(KEY, JSON.stringify(validated));
      return { available: true, saved: true, message: "" };
    } catch (_) {
      return { available: false, message: "O navegador não conseguiu salvar. Você ainda pode jogar nesta sessão; o progresso pode se perder ao fechar." };
    }
  }
  return Object.freeze({ empty, validateProgress, recover, isUnlocked, load, save });
})();
