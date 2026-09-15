/* Ilustrações locais e sua apresentação. A lógica de mobilidade fica em Core. */
const Characters = (() => {
  const files = new Set(['lia', 'caio', 'rosa']);

  function portrait(person) {
    const file = files.has(person.portrait) ? person.portrait : null;
    return file ? '<img src="assets/characters/' + file + '.png" alt="" width="320" height="320" draggable="false">' : '';
  }

  function walker(person) {
    const node = document.createElement('span');
    node.className = 'walker ' + (person.movement === 'wheelchair' ? 'wheelchair' : 'pedestrian');
    node.style.setProperty('--resident-color', person.color);
    node.innerHTML = '<span class="walker-body">' + portrait(person) + '</span><span class="walker-letter">' + person.from + '</span>';
    return node;
  }

  return Object.freeze({ portrait, walker });
})();
