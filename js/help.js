/* Conteúdo das janelas de ajuda e créditos. */
function showHelp() {
  openModal('Como jogar',[
    '<ol>',
    '<li>Encontre a casa de cada morador e seu destino, identificados por letras.</li>',
    '<li>Selecione uma ferramenta e clique nas células do mapa.</li>',
    '<li>Construa calçadas em terreno livre (1), faixas sobre ruas (3) e rampas sobre escadas (2).</li>',
    '<li>Use “Testar rotas” para observar os moradores. Todos precisam chegar dentro do orçamento.</li>',
    '</ol>',
    '<p>',
    '<b>Compartilhar ajuda:</b> diferentes moradores podem usar as mesmas calçadas.</p>',
    '<p>',
    '<b>Rotas sem degraus:</b> Caio precisa de rampas ou de um caminho alternativo. Todas as calçadas novas são acessíveis nas regras deste jogo.</p>',
    '<p>Árvores, água e edifícios que não sejam a origem ou o destino bloqueiam a passagem. Não há diagonais.</p>',
    '<p><b>Dois desafios:</b> Economia pede que você complete as rotas dentro da meta de gasto. Percursos curtos pede que cada morador cumpra sua própria meta de passos. Você pode ganhar os selos em soluções diferentes.</p>',
    '<p><b>Símbolos:</b> + marca uma obra sua, que pode ser removida e reembolsada; E é uma escada; R é uma rampa.</p>',
    '<p><b>Quando faltar caminho:</b> o tracejado mostra onde o morador consegue chegar agora. Escolha seu nome junto dos controles e abra “Ver pista” para ler a explicação. A marca laranja com ? aponta a célula citada no mapa. A pista não entrega uma solução completa.</p>',
    '<p><b>Seu ritmo:</b> durante a animação, clique em Concluir chegada para ver o resultado imediatamente. Um teste com falha mostra as pistas sem esperar uma animação.</p>',
    '<p><b>Comparar soluções:</b> durante uma fase, abra Comparar e guarde sua construção como A. Volte ao mapa e experimente outra solução, que aparece como B. Compare gasto e passos de cada morador. Reiniciar preserva a referência; Usar A no mapa permite retomá-la e pode ser desfeito.</p>',
    '<p>',
    '<b>Teclado:</b> Tab chega ao mapa; setas escolhem células; Enter ou Espaço executam a ferramenta. Remover devolve o custo completo. Não há limite de tentativas.</p>'
  ].join(''),[{label:'Entendi',primary:true,action:()=>{}}]);
}
function showCredits() {
  openModal('Créditos e autoria',[
    '<p>',
    '<b>Conecta Umuarama — Uma cidade para todos</b>',
    '</p>',
    '<p><b>Estudante:</b> João Gabriel Sabedra Vieira<br><b>Professor orientador:</b> LEANDRO MARINS DE BRITO<br><b>Turma:</b> 1 C ADM<br><b>Escola:</b> Colégio Estadual Cívico-Militar Douradina — PR</p>',
    '<p>Projeto educativo com bairro fictício. Código, textos e desenhos SVG desta versão foram produzidos com assistência do Codex. As ilustrações de Lia, Caio e Rosa foram geradas por IA para o projeto e estão salvas na pasta assets/characters. A origem e os prompts estão documentados em docs/CREDITOS.md. O jogo usa fontes do sistema e não depende de bibliotecas externas.</p>',
    '<p>Antes de apresentar, estude, personalize e registre suas próprias contribuições. Registre no seu projeto quais alterações foram feitas por você e o que aprendeu com elas.</p>',
    '<p>Autoria da versão inicial: desenvolvimento assistido pelo Codex. Contribuições do estudante: a preencher após as personalizações.</p>',
    '<p>Os custos e regras de mobilidade são uma simplificação para fins de jogo; não representam normas técnicas nem projetos reais da cidade.</p>'
  ].join(''),[{label:'Voltar ao jogo',primary:true,action:()=>{}}]);
}
