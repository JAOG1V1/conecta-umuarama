# Arquitetura

O jogo separa regras, conteúdo, persistência e interface. `Core` calcula e valida sem acessar a página; `Building` consulta essas regras para oferecer uma prévia; `LEVELS` define as fases; `Storage` e `Comparison` isolam os salvamentos; `Views` apresenta os dados e `main.js` coordena eventos e estado. A estrutura dos arquivos e os comandos de verificação estão em [Desenvolvimento](../DEVELOPMENT.md).

## Mapa e estado

Cada fase contém uma grade de caracteres: `.` é terreno livre, `t` árvore, `~` água, `=` rua, `s` escada, `p` calçada existente, `A/B/C` casas e `X/Y/Z` destinos. O mapa original permanece separado das peças construídas.

`state.edits` guarda peças por coordenada, como `{"2,3":"path"}`. As coordenadas do código começam em zero; a interface apresenta linhas e colunas a partir de um. O estado também mantém fase, ferramenta, foco, históricos de desfazer e refazer, rotas e controle das animações.

Uma edição segue este fluxo:

1. O evento do mapa identifica a célula e chama `editCell`.
2. `Core.apply` valida ferramenta, terreno e orçamento. Uma ação inválida preserva as peças anteriores.
3. Uma ação válida devolve um novo objeto; `main.js` guarda o anterior em `state.undo`, limpa `state.redo` e cancela rotas e resultados pendentes.
4. A interface redesenha mapa e painéis; `saveProgress` solicita a gravação do progresso.

Construir ou restaurar uma referência não concede pontos. **Testar rotas** calcula os caminhos, registra uma conclusão válida e inicia a chegada dos moradores.

## Prévia e histórico de edição

`Building.preview` chama `Core.apply` sem substituir `state.edits`. Se a ação for válida, calcula a diferença de custo e o saldo resultante; se não for, devolve a mesma mensagem de impedimento da construção real. A prévia não grava dados, não acrescenta histórico e não registra conquistas.

`renderBuildOptions` destaca as células em que a ferramenta pode agir e atualiza suas descrições. Eventos de ponteiro e foco mostram a prévia da célula; ao sair do mapa, a orientação volta para a ferramenta selecionada.

`travelHistory` transfere cópias do tabuleiro entre `state.undo` e `state.redo`, invalida rotas e resultados pendentes e recalcula o orçamento ao renderizar. Uma nova edição válida ou restauração de A limpa Refazer; uma ação inválida preserva o histórico. Abrir ou reiniciar uma fase começa um novo histórico, que não é persistido.

Os botões e atalhos usam a mesma função. Ctrl/Cmd + Z desfaz; Ctrl/Cmd + Shift + Z ou Ctrl/Cmd + Y refaz. As teclas 1–4 selecionam Calçada, Faixa, Rampa e Remover. O manipulador ignora esses comandos fora da tela de jogo, com diálogo aberto, com Alt ou em campos editáveis.

## Rotas e diagnóstico

`Core.routes` executa uma busca em largura (BFS) para cada morador, com fila, posições visitadas e registro de predecessores. A busca considera quatro direções, sem diagonais, e encontra o caminho com menos passos entre as células já transitáveis. Ela não calcula a construção mais barata.

Calçadas existentes, a própria casa e o próprio destino permitem passagem. Terrenos livres exigem calçada, ruas exigem faixa e escadas exigem rampa quando `person.stairs` é falso. Árvores, água e outros edifícios permanecem bloqueados.

Se a busca esgotar a região permitida sem encontrar o destino, o resultado contém `path: null`, as células alcançáveis em `reachable` e as barreiras construíveis da fronteira em `barriers`. A interface mostra o alcance do morador selecionado; uma edição invalida esse diagnóstico.

`Views.hintBarrier` prioriza escada sem rampa, rua sem faixa e terreno sem calçada, nessa ordem. Entre barreiras do mesmo tipo, prefere a menor distância Manhattan até o destino, depois linha e coluna. Texto e marca visual usam a mesma barreira. Essa pista ignora obstáculos intermediários e não garante uma solução completa ou o menor custo.

## Pontuação e objetivos

`Core.score` só pontua quando todos os moradores têm caminho: `700 + round(300 × saldo / orçamento inicial)`. A campanha conserva o melhor resultado de cada fase.

`Core.summary` reúne custo, conexões, passos e células intermediárias compartilhadas por pelo menos dois moradores. O selo de economia exige conclusão e gasto dentro de `efficiencyCost`; o de percursos curtos exige que cada pessoa cumpra seu próprio `stepGoal`. A soma dos passos não substitui essa avaliação individual.

As construções `solution` e `alternatives` em `levels.js` são referências usadas nos testes. Demonstram metas alcançáveis, sem provar um ótimo global, e não são aplicadas automaticamente durante a partida.

`Views.campaignSummary` reúne conquistas registradas, sem avaliar o tabuleiro em edição: são cinco fases e oito selos possíveis, pois o tutorial não oferece selos. A economia vem do melhor resultado e o percurso de `shortBest`; podem ter sido conquistados em soluções diferentes. A sugestão prioriza a primeira fase não concluída e, depois, a primeira fase com selo pendente. `campaignProgress` apresenta esse resumo na tela inicial, no seletor e no resultado da última fase. Os cartões distinguem conclusão e obra guardada, sem transformar rascunhos em conquistas.

## Comparação de construções

Em **Comparar soluções**, A é uma cópia guardada pelo jogador e B é a construção atual. `Comparison.capture` valida e copia as peças; `analyse` recalcula custo e caminhos. Uma rota ausente recebe `null` e aparece como “Sem caminho”, nunca como zero passos.

`compare` avalia custo e passos de cada pessoa. Só indica vantagem sem perdas entre construções completas quando nenhum critério piora e pelo menos um melhora. Se há ganhos e perdas, informa a troca envolvida; construções incompletas não recebem um vencedor por métricas. Construções idênticas são reconhecidas mesmo antes da conclusão.

Reiniciar a fase preserva A. Restaurar A substitui B por uma cópia, cancela o resultado pendente, guarda a construção anterior para Desfazer e limpa Refazer. Guardar A ou consultar a comparação não altera recordes.

Após uma vitória fora do tutorial, **Guardar e experimentar** captura a construção concluída como A e mantém o tabuleiro para novas edições. Se houver uma referência diferente, `experimentAfterWin` pede confirmação antes de substituí-la. Recusar preserva A; confirmar usa a mesma validação e gravação da comparação. Se a gravação falhar, a referência capturada continua disponível durante a sessão.

## Persistência

| Chave de `localStorage` | Conteúdo |
| --- | --- |
| `conecta-umuarama-v1` | Melhores pontuações, selos de percurso, última fase ativa e rascunhos por fase |
| `conecta-umuarama-v1-recovery` | Cópia do conteúdo original quando o progresso precisa de recuperação |
| `conecta-umuarama-comparacoes-v1` | Uma referência de construção por fase, separada da campanha |

O código valida versão, pontuações, desbloqueio, coordenadas, tipos de peças, terrenos e orçamento antes de usar ou gravar o progresso. `drafts` contém uma cópia das peças de cada fase visitada; `active` identifica a última fase em andamento. `saveProgress` atualiza ambos em memória antes de tentar gravar no navegador, permitindo trocar de fase e usar Continuar mesmo se o armazenamento falhar.

O formato mantém `version: 1`. Ao ler um salvamento anterior à versão 1.7, sem `drafts`, `validateProgress` cria a lista e copia `active.edits` para a posição correspondente. Rascunhos, fase ativa e entrada da validação não compartilham o mesmo objeto de peças. Dados danificados passam pela recuperação, que tenta copiar o conteúdo original, mantém recordes e tabuleiros válidos e descarta partes incompatíveis. Um rascunho inválido não elimina os demais. As referências de comparação também são validadas por fase.

Falhas de armazenamento são informadas e permitem continuar na sessão, mas as mudanças podem se perder ao fechar a página. Os dados não são enviados pelo código do jogo a um servidor. A disponibilidade depende do navegador e do endereço usado para abrir o jogo. Como recordes, rascunhos e referências são associados ao índice da fase, reordenar fases exige uma migração explícita.

## Animações e resultado pendente

`animateRoutes` usa `requestAnimationFrame` para deslocar imagens estáticas pelos caminhos calculados. O CSS acrescenta a oscilação da caminhada. Com preferência por movimento reduzido, os personagens chegam sem percorrer a animação.

`finishMotion` conclui a chegada imediatamente pelo botão ou ao mudar a visibilidade da aba. Um temporizador também permite concluir caso os quadros parem. `pendingResult` conserva a ação de exibir a vitória enquanto a aba estiver oculta, um diálogo estiver aberto ou a tela do jogo estiver escondida. `showPendingResult` remove a ação pendente antes de executá-la, evitando repetições.

`cancelMotion` cancela quadro e temporizador, limpa o resultado pendente e incrementa `state.generation`, invalidando retornos de animações anteriores. Edições, Desfazer, Refazer, reinício, restauração de A e troca de fase usam esse mecanismo. Se o navegador suspender toda a execução, a conclusão depende de sua retomada.

## Conteúdo e inserção de textos

`portrait`, `movement` e `destinationTypes` escolhem imagens, movimento e desenho dos destinos sem depender dos nomes em português. `Story.arrival` usa a rota encontrada: uma fala sobre rampa exige que a rampa faça parte do caminho, não apenas da construção.

Os textos dinâmicos usam `textContent` ou são escapados por `Views.escape` antes de entrar nos modelos HTML. Preserve essa distinção ao alterar nomes, falas e painéis: conteúdo textual não deve ser interpretado como marcação. A origem das imagens e da assistência por IA está em [Créditos](CREDITOS.md).
