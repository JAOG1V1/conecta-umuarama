/* Falas dependem da rota percorrida, não apenas das peças compradas. */
const Story = (() => {
  function arrival(person, path, edits) {
    if (!path) return person.name + ' ainda precisa de um caminho.';
    const reactions = person.reactions || {};
    const usesRamp = path.some(([r, c]) => edits[r + ',' + c] === 'ramp');
    if (usesRamp && reactions.ramp) return reactions.ramp;
    if (path.length - 1 > person.stepGoal && reactions.detour) return reactions.detour;
    if (path.length - 1 <= person.stepGoal && reactions.short) return reactions.short;
    return person.arrival;
  }
  return Object.freeze({ arrival });
})();
