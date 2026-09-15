/* Regras puras: ações, custos, busca de rotas e pontuação. */
const Core = (() => {
  "use strict";
  const prices = Object.freeze({ path: 1, crossing: 3, ramp: 2 });
  const terrain = Object.freeze({ path: ".", crossing: "=", ramp: "s" });
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const find = (map, symbol) => {
    for (let r = 0; r < map.length; r++) {
      const c = map[r].indexOf(symbol);
      if (c !== -1) return [r, c];
    }
    return null;
  };

  function validLevel(level) {
    if (!level || !Number.isSafeInteger(level.budget) || level.budget <= 0 ||
        !Array.isArray(level.map) || !level.map.length ||
        typeof level.map[0] !== "string" || !level.map[0].length ||
        !level.map.every(row => typeof row === "string" && row.length === level.map[0].length && /^[.t~=spABCXYZ]+$/.test(row)) ||
        !Array.isArray(level.people) || !level.people.length) return false;
    const all = level.map.join("");
    return level.people.every(person => person &&
      typeof person.from === "string" && typeof person.to === "string" &&
      /^[ABC]$/.test(person.from) && /^[XYZ]$/.test(person.to) &&
      typeof person.stairs === "boolean" &&
      all.split(person.from).length === 2 && all.split(person.to).length === 2);
  }

  function cost(edits) {
    if (!record(edits)) return Infinity;
    let total = 0;
    for (const key of Object.keys(edits)) {
      if (!own(prices, edits[key])) return Infinity;
      total += prices[edits[key]];
      if (!Number.isSafeInteger(total)) return Infinity;
    }
    return total;
  }

  function validateSave(level, edits) {
    if (!validLevel(level) || !record(edits) || cost(edits) > level.budget) return false;
    return Object.keys(edits).every(key => {
      if (!/^(0|[1-9]\d*),(0|[1-9]\d*)$/.test(key)) return false;
      const [r, c] = key.split(",").map(Number);
      return Number.isSafeInteger(r) && Number.isSafeInteger(c) &&
        r < level.map.length && c < level.map[0].length &&
        own(terrain, edits[key]) && level.map[r][c] === terrain[edits[key]];
    });
  }

  function routes(level, edits) {
    if (!validLevel(level)) return [];
    if (!validateSave(level, edits)) return level.people.map(person => ({ person, path: null, reachable: [], barriers: [] }));
    const height = level.map.length, width = level.map[0].length;
    return level.people.map(person => {
      const start = find(level.map, person.from), end = find(level.map, person.to);
      const startId = start[0] * width + start[1], endId = end[0] * width + end[1];
      const previous = new Int32Array(height * width).fill(-1);
      const queue = [startId];
      previous[startId] = startId;
      const traversable = (r, c) => {
        const tile = level.map[r][c], piece = edits[r + "," + c];
        if (tile === person.from || tile === person.to || tile === "p") return true;
        if (tile === ".") return piece === "path";
        if (tile === "=") return piece === "crossing";
        if (tile === "s") return person.stairs || piece === "ramp";
        return false;
      };
      // BFS visita primeiro as células próximas, depois as mais distantes.
      for (let head = 0; head < queue.length && previous[endId] === -1; head++) {
        const id = queue[head], r = Math.floor(id / width), c = id % width;
        for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
          const nr = r + dr, nc = c + dc, nextId = nr * width + nc;
          if (nr < 0 || nc < 0 || nr >= height || nc >= width ||
              previous[nextId] !== -1 || !traversable(nr, nc)) continue;
          previous[nextId] = id;
          queue.push(nextId);
        }
      }
      if (previous[endId] === -1) {
        // A busca esgotada conhece todo o alcance, não apenas um trajeto tentado.
        const reachable = queue.map(id => [Math.floor(id / width), id % width]);
        const frontier = new Map();
        for (const [r, c] of reachable) {
          for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nc < 0 || nr >= height || nc >= width || traversable(nr, nc)) continue;
            const kind = ({'.': 'gap', '=': 'road', s: 'stair'})[level.map[nr][nc]];
            if (kind) frontier.set(nr + ',' + nc, {r: nr, c: nc, kind});
          }
        }
        return { person, path: null, reachable, barriers: [...frontier.values()] };
      }
      const path = [];
      for (let at = endId; ; at = previous[at]) {
        path.push([Math.floor(at / width), at % width]);
        if (at === startId) break;
      }
      return { person, path: path.reverse() };
    });
  }

  function score(level, edits) {
    if (!validateSave(level, edits)) return 0;
    const result = routes(level, edits);
    if (!result.length || result.some(route => !route.path)) return 0;
    return economyScore(level, cost(edits));
  }

  function economyScore(level, spent) {
    return 700 + Math.round(300 * (level.budget - spent) / level.budget);
  }

  function apply(level, edits, r, c, tool) {
    const fail = message => ({ ok: false, edits, message });
    if (!validateSave(level, edits)) return fail("O estado desta fase é inválido. Reinicie a fase.");
    if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 ||
        r >= level.map.length || c >= level.map[0].length) return fail("Escolha uma célula dentro do mapa.");
    const key = r + "," + c;
    if (tool === "erase" || tool === "remove") {
      if (!own(edits, key)) return fail("Só é possível remover peças que você construiu.");
      const next = { ...edits };
      delete next[key];
      return { ok: true, edits: next, message: "Peça removida. O custo foi devolvido ao orçamento." };
    }
    if (!own(prices, tool)) return fail("Selecione uma ferramenta de construção.");
    if (own(edits, key)) return fail("Esta célula já tem uma construção. Remova a peça para alterá-la.");
    if (level.map[r][c] !== terrain[tool]) {
      const descriptions = {
        path: "Calçadas só podem ser construídas em terreno livre.",
        crossing: "Faixas só podem ser construídas sobre ruas.",
        ramp: "Rampas só podem substituir escadas."
      };
      return fail(descriptions[tool]);
    }
    if (cost(edits) + prices[tool] > level.budget) return fail("Orçamento insuficiente. Remova uma peça ou procure outro caminho.");
    return { ok: true, edits: { ...edits, [key]: tool }, message: "Peça construída. Teste as rotas para verificar sua solução." };
  }
  // O resumo usa as rotas realmente encontradas. Distância não altera a nota.
  function summary(level, edits) {
    const result = routes(level, edits), spent = cost(edits);
    const connected = result.filter(route => route.path).length;
    const complete = result.length > 0 && connected === result.length;
    const usage = new Map();
    for (const route of result) {
      if (!route.path) continue;
      for (const [r, c] of route.path.slice(1, -1)) {
        const key = r + ',' + c;
        usage.set(key, (usage.get(key) || 0) + 1);
      }
    }
    return {
      connected, total: result.length, complete, spent,
      remaining: level.budget - spent,
      steps: result.reduce((sum, route) => sum + (route.path ? route.path.length - 1 : 0), 0),
      shared: [...usage.values()].filter(count => count > 1).length,
      efficient: complete && Number.isSafeInteger(level.efficiencyCost) && spent <= level.efficiencyCost,
      shortRoutes: complete && result.every(route => Number.isSafeInteger(route.person.stepGoal)
        && route.path.length - 1 <= route.person.stepGoal)
    };
  }
  return Object.freeze({ cost, routes, score, economyScore, apply, validateSave, validatesave: validateSave, summary });
})();
