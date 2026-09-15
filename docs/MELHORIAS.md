# Melhorias da versão 1.6.0

## Comparar soluções

- Durante uma fase, o botão Comparar permite guardar A e confrontá-la com a construção atual B. Cada referência sobrevive ao reinício da fase e à recarga quando o armazenamento está disponível.
- Dois mapas mostram as obras e rotas, com tabela de gasto e passos por morador. Percursos ausentes aparecem como Sem caminho. A comparação distingue empate, vantagem sem perdas e escolhas com benefícios diferentes.
- Usar A no mapa permite recuperar a referência, com confirmação e Desfazer. Consultar, guardar ou recuperar não concede pontos nem desbloqueia fases.
- A janela mantém os botões visíveis, organiza os mapas lado a lado no computador e empilhados no celular e permite rolar o conteúdo pelo teclado.
- comparison.js concentra análise e salvamento separado; comparison-view.js apresenta os mapas e dados. O roteiro de apresentação e o guia de estudo explicam o recurso.

## Histórico da versão 1.5.2

## Ajustes para apresentação

- O botão Estudar, seu evento, a janela técnica e os estilos exclusivos dela foram retirados da interface. O guia completo permanece em ESTUDO.md.
- A rotação decorativa da ilustração inicial e a contrarrotação de sua legenda foram removidas. Os desenhos e personagens são os mesmos.
- O teste específico da janela retirada foi removido; os testes dos demais diálogos continuam ativos.

## Acabamento após a quinta revisão

- Abrir reachDetails em uma janela com mais de 600 px de largura traz reachNote para a área visível com scrollIntoView. A rolagem é imediata, tem margem inferior e preserva o foco. Fechar a pista não solicita rolagem. O evento ignora painéis ocultos e diálogos abertos.
- O foco das células comuns e das células alcançáveis usa var(--ink), com contorno interno separado da borda laranja da pista. A marca “?” e a letra da célula são preservadas.
- As regras, as pistas escolhidas e os dados do jogo permanecem iguais aos da versão 1.5. A documentação de verificação registra a conferência em navegador.

## Correções da quarta revisão

- O painel de alcance saiu de cima do mapa e passou para os controles. Os nomes dos moradores ficam em uma linha rolável, e “Ver pista” abre a explicação. No computador, Desfazer e Reiniciar dividem uma linha. A falha não altera a posição do mapa nas resoluções verificadas.
- Uma marca laranja com “?” e descrição acessível identifica a barreira citada. Trocar de morador move a marca; editar limpa o diagnóstico. O foco continua no botão escolhido. O anúncio textual fica fora da explicação recolhida.
- Views.hintBarrier escolhe uma barreira real da fronteira. Mantém a prioridade escada, rua e terreno; desempata pela distância Manhattan até o destino, depois por linha e coluna. Ordena uma cópia dos dados. Não calcula o caminho nem a obra mais barata.
- O tutorial vazio aponta para linha 3, coluna 3. A fase 3 sem rampa mantém a indicação da escada central na linha 4, coluna 4.
- A mensagem usa “Lia, Caio e Rosa”, e um alcance de apenas uma célula é descrito como estar sem saída da casa.
- Não houve alteração nas regras, mapas, custos, metas ou salvamento. VERIFICACAO.md registra os testes e os limites da conferência em navegador.

## Recursos anteriores, da versão 1.4

## Correções da terceira revisão

- Ao falhar, a BFS devolve o alcance completo do morador e as barreiras adjacentes. A interface destaca esse alcance com tracejado e cor e oferece uma pista localizada. Não constrói peças nem revela uma solução.
- Quando vários moradores não chegam, o jogador escolhe qual alcance observar. A seleção mantém o foco de teclado. Editar remove o diagnóstico anterior.
- Testes com falha não impõem animação. Durante uma chegada, o botão principal permite concluir imediatamente; o temporizador e os quadros pendentes são cancelados.
- Escolher a própria fase no seletor fecha a janela e preserva a partida e a vitória pendente.
- A dica de rolagem foi movida para cima do mapa; a legenda curta foi colocada junto dos controles. As medidas e os limites estão em VERIFICACAO.md.
- O painel usa “Complete as rotas para avaliar” quando o gasto está na meta, mas a conexão ainda não foi concluída. Como jogar explica os selos, os símbolos, a pista de alcance e a conclusão da animação.
- A fase 5 recebeu uma segunda alternativa nos dados, validada com ambos os selos: custo 20, Lia 6 passos, Caio 8 e Rosa 10. A interface anuncia a possibilidade sem revelar as construções. A conclusão convida a relacionar o jogo aos caminhos reais do jogador.
- As três imagens foram reduzidas de 1254 para 320 pixels de lado, com transparência e sem redesenho. O conjunto passou de 2.172.461 para 219.436 bytes, redução de 89,9%.
- APRESENTACAO.md agora usa a fase 4; ESTUDO.md explica reachable, barriers, finishMotion, motionTimer, pendingResult e showPendingResult. Os créditos registram o redimensionamento.

## Melhorias anteriores, da versão 1.3

## Correções da segunda revisão

- Abrir Como jogar, Estudar, Créditos ou Fases durante a chegada conclui o desenho e guarda a vitória. Fechar a janela, inclusive com Escape, permite mostrar o resultado pendente.
- Confirmar um reinício, editar o tabuleiro ou trocar de fase cancela o resultado anterior. Cancelar a confirmação de reinício preserva a vitória.
- Um temporizador de proteção conclui o movimento se os quadros de animação pararem. Ele é removido na conclusão e no cancelamento; um quadro atrasado não repete a vitória.
- O foco da região rolável do mapa tem contorno visível. Texto e sombras nas bordas indicam as colunas que continuam fora da tela.
- Uma legenda curta com +, E e R fica visível sem abrir a legenda completa.
- Os desafios mostram gasto e metas de passos durante a partida. Os percursos só são avaliados depois de Testar rotas. Editar uma construção invalida a avaliação anterior.
- No computador, os indicadores ficam junto do orçamento. Em telas menores, aparecem junto dos controles, com apenas uma apresentação visível por vez.
- A interface fica mais compacta em janelas de computador com pouca altura. A fase 5 coube em 1280 × 650, mantendo células de 44 pixels. Janelas menores ainda podem exigir rolagem vertical.
- Foram removidas seis regras CSS vazias e uma sobrescrita de tamanho de fonte. O botão Remover usa uma descrição curta. Fases com um único morador não mostram a contagem de células compartilhadas.
- A tela de resultado trata chamadas com rotas incompletas sem falhar. Novas vitórias no tutorial não gravam o selo oculto de percurso; dados antigos continuam compatíveis.
- O repositório Git local foi inicializado. Ainda não existe um repositório público nem publicação nesta atualização.

## O que estudar nesta atualização

Em main.js, acompanhe animateRoutes, cancelMotion e showPendingResult. O movimento pode terminar, mas a apresentação aguarda a janela informativa fechar. O evento close do diálogo ocorre depois da ação do botão; assim, trocar de fase pode cancelar a vitória antiga antes de sua apresentação. Os testes simulam essa ordem.

O temporizador protege contra a interrupção dos quadros, mas nenhum código da página executa enquanto o navegador congela completamente sua execução. Ao retomar, o temporizador pode concluir a animação. Isso não é uma promessa de prazo absoluto durante uma suspensão do navegador ou do computador.

Em Views.challenges, compare o custo atual com a meta de economia e os passos de CADA morador com sua própria meta. A interface não altera a fórmula dos pontos nem as regras do mapa.

## Situação registrada ao concluir a versão 1.3

Na versão 1.3, as três imagens originais ainda tinham 1254 × 1254 pixels e somavam 2.172.461 bytes (2,07 MiB). Essa pendência foi resolvida na versão 1.4. Os campos de autoria e o diário continuam reservados a dados e contribuições reais do estudante.

## Melhorias anteriores, da versão 1.2

## Jogabilidade e interface

- Mensagens ficam acima do tabuleiro, com saldo repetido junto dos controles.
- Em computadores, ferramentas e ações ficam ao lado do mapa.
- Em celulares, o tabuleiro vem antes dos painéis. Mapas maiores usam rolagem horizontal para preservar células de pelo menos 44 pixels.
- Obras do jogador têm borda e sinal de mais; a legenda diferencia peças existentes, construções, escadas, rampas e faixas.
- Economia e Percursos curtos são desafios diferentes. O segundo avalia a meta de CADA morador, sem compensar o desvio de um pelo trajeto curto de outro.
- Os selos podem ser conquistados juntos ou em partidas diferentes. Um resultado posterior pior não apaga a conquista.
- As falas de Caio nas fases 3, 4 e 5 respondem ao caminho percorrido. Comprar uma rampa fora da rota não ativa uma fala sobre usá-la.

## Robustez e organização

- Trocar de aba conclui a animação e guarda a apresentação da vitória para o retorno.
- A gravação valida o progresso antes de substituir o conteúdo anterior.
- A recuperação preserva recordes válidos e cria uma cópia local dos dados que precisaram de recuperação.
- O desbloqueio também é verificado ao iniciar uma fase, além do seletor visual.
- Personagens definem ilustração, movimento e meta nos dados. Os destinos possuem tipos de ícone explícitos.
- Views separa a montagem dos painéis; Story separa as falas; Art separa os desenhos; Help separa os textos de ajuda.
- Textos dos personagens e destinos são escapados antes de entrar no HTML dos painéis.
- A fórmula do recorde de economia é compartilhada entre as regras e a tela de fases.

## Decisões sobre a análise recebida

A primeira fase continua sendo um tutorial curto, agora sem apresentar um selo automático como desafio extra. As metas de economia continuam sendo objetivos alcançáveis, não afirmações de custo mínimo. Por isso, encontrar uma solução mais barata pode ser um bom desafio para o jogador sem invalidar a fase.

Os pontos continuam medindo economia, e os percursos passaram a ter uma conquista própria. Não foram adicionados bônus por comprar uma rampa: o que importa para os moradores é o caminho que realmente utilizam. Uma rota acessível também pode aproveitar um passeio existente.

## Para preparar a apresentação

Estude primeiro Core.summary, Story.arrival e o tratamento de visibilitychange em main.js. Demonstre duas soluções da fase 4: uma conquista o selo de Economia e a outra o de Percursos curtos. Mostre a fala de Caio e explique a diferença.

O diário e os campos de autoria devem registrar contribuições realmente realizadas pelo estudante. O repositório público e a hospedagem ainda precisam ser preparados antes da inscrição. As imagens originais foram mantidas nesta atualização.
