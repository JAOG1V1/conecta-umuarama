/* Desenhos já existentes do mapa, separados da lógica da partida. */
function svg(content) { return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + content + '</svg>'; }
const ART = {
  tree: svg('<ellipse cx="32" cy="54" rx="17" ry="5" fill="#497141" opacity=".18"/><path d="M32 31v23" stroke="#6b7950" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="25" r="20" fill="#6d9851"/><circle cx="26" cy="18" r="10" fill="#86ac60"/>'),
  water: svg('<path d="M6 20q7 5 14 0t14 0t14 0t12 0M3 35q7 5 14 0t14 0t14 0t14 0M8 49q7 5 14 0t14 0t14 0" fill="none" stroke="#7aafb5" stroke-width="3" stroke-linecap="round"/>'),
  road: svg('<path d="M31 4v13m0 10v13m0 10v10" stroke="#d2d7bd" stroke-width="3" stroke-linecap="round"/>'),
  path: svg('<path d="M6 20h52M6 42h52M25 0v20m15 0v22M23 42v22" stroke="#d1cab2" stroke-width="1.5" opacity=".65"/>'),
  stair: svg('<path d="M10 50V40h11V29h11V18h12V8h11" fill="none" stroke="#6a7560" stroke-width="4" stroke-linejoin="round"/><path d="M10 54h46" stroke="#90967b" stroke-width="3"/>'),
  ramp: svg('<path d="M9 48L53 17v31Z" fill="#8ba679"/><path d="M8 41L54 10M13 38v16M48 14v40" stroke="#4b715a" stroke-width="3"/><path d="M10 53h45" stroke="#4b715a" stroke-width="3"/>'),
  crossing: svg('<path d="M9 9h46M9 20h46M9 31h46M9 42h46M9 53h46" stroke="#fffbea" stroke-width="6"/>')
};
function house(color) {
  return svg('<ellipse cx="32" cy="56" rx="24" ry="5" fill="#254d32" opacity=".12"/><rect x="12" y="25" width="40" height="31" rx="3" fill="#f9efd7"/><path d="M6 28L32 7l26 21Z" fill="'+color+'"/><rect x="28" y="38" width="10" height="18" rx="2" fill="#53715e"/><rect x="17" y="34" width="8" height="9" fill="#91bab8"/>');
}
function destination(type,color) {
  if (!['park','health','school'].includes(type)) throw new Error('Tipo de destino desconhecido: '+type);
  if (type === 'park') return svg('<path d="M11 46h29m-29-7h29M16 45v12m21-12v12" stroke="#7a7b51" stroke-width="4"/><path d="M47 28v25" stroke="#6b7950" stroke-width="4"/><circle cx="46" cy="20" r="13" fill="#689452"/><circle cx="42" cy="16" r="7" fill="#89ae64"/>');
  if (type === 'health') return svg('<rect x="10" y="17" width="44" height="39" rx="4" fill="#f8edda"/><rect x="7" y="12" width="50" height="10" rx="3" fill="'+color+'"/><path d="M32 27v16m-8-8h16" stroke="'+color+'" stroke-width="5"/><rect x="27" y="45" width="11" height="11" fill="#86a59b"/>');
  return svg('<rect x="9" y="22" width="47" height="33" rx="3" fill="#ead092"/><path d="M5 24L32 8l28 16" fill="'+color+'"/><path d="M17 34h7m8 0h7m8 0h4" stroke="#fff9e8" stroke-width="7"/><rect x="28" y="43" width="11" height="13" fill="#517960"/>');
}
