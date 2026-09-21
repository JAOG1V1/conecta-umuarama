/* Prévia sem efeitos: usa as mesmas regras de uma construção de verdade. */
const Building = (() => {
  const labels = {path:'Calçada', crossing:'Faixa', ramp:'Rampa', erase:'Remover'};
  const instructions = {
    path:'Use nos terrenos livres.', crossing:'Use nas células de rua.',
    ramp:'Use nas escadas.', erase:'Use nas obras marcadas com +.'
  };
  function preview(level, edits, r, c, tool) {
    const action = Core.apply(level, edits, r, c, tool);
    if (!action.ok) return {allowed:false, message:action.message};
    const delta = Core.cost(action.edits) - Core.cost(edits);
    const remaining = level.budget - Core.cost(action.edits);
    const change = delta < 0 ? 'Devolve '+(-delta) : 'Custa '+delta;
    return {allowed:true, delta, remaining,
      message:change+' · saldo depois: '+remaining+'.'};
  }
  function guide(tool, available) {
    const label = labels[tool] || 'Ferramenta';
    return {label, message:available
      ? instructions[tool]+' O pontilhado indica onde pode agir.'
      : tool==='erase' ? 'Ainda não há obras suas para remover.'
      : 'Nenhuma célula disponível com esta ferramenta e este saldo.'};
  }
  return Object.freeze({preview, guide, labels:Object.freeze(labels)});
})();
