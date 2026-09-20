# Arquitetura

O jogo separa regras, conteúdo, persistência e interface. `Core` calcula e valida sem acessar a página; `LEVELS` define as fases; `Storage` e `Comparison` isolam os salvamentos; `main.js` coordena eventos e estado. A estrutura dos arquivos e os comandos de verificação estão em [Desenvolvimento](../DEVELOPMENT.md).

## Mapa e estado

Cada fase contém uma grade de caracteres: `.` é terreno livre, `t` árvore, `~` água, `=` rua, `s` escada, `p` calçada existente, `A/B/C` casas e `X/Y/Z` destinos. O mapa original permanece separado das peças construídas.

`state.edits` guarda peças por coordenada, como `{"2,3":"path"}`. As coordenadas do código começam em zero; a interface apresenta linhas e colunas a partir de um. O estado também mantém fase, ferramenta, foco, histórico de desfazer, rotas e controle das animações.

Uma edição segue este fluxo:

1. O evento do mapa identifica a célula e chama `editCell`.
2. `Core.apply` valida ferramenta, terreno e orçamento. Uma ação inválida preserva as peças anteriores.
3. Uma ação válida devolve um novo objeto; `main.js` guarda o anterior em `state.undo` e cancela rotas e resultados pendentes.
4. A interface redesenha mapa e painéis; `saveProgress` solicita a gravação do progresso.

Construir ou restaurar uma referência não concede pontos. **Testar rotas** calcula os caminhos, registra uma conclusão válida e inicia a chegada dos moradores.

## Rotas e diagnóstico

`Core.routes` executa uma busca em largura (BFS) para cada morador, com fila, posições visitadas e registro de predecessores. A busca considera quatro direções, sem diagonais, e encontra o caminho com menos passos entre as células já transitáveis. Ela não calcula a construção mais barata.

Calçadas existentes, a própria casa e o próprio destino permitem passagem. Terrenos livres exigem calçada, ruas exigem faixa e escadas exigem rampa quando `person.stairs` é falso. Árvores, água e outros edifícios permanecem bloqueados.

Se a busca esgotar a região permitida sem encontrar o destino, o resultado contém `path: null`, as células alcançáveis em `reachable` e as barreiras construíveis da fronteira em `barriers`. A interface mostra o alcance do morador selecionado; uma edição invalida esse diagnóstico.

`Views.hintBarrier` prioriza escada sem rampa, rua sem faixa e terreno sem calçada, nessa ordem. Entre barreiras do mesmo tipo, prefere a menor distância Manhattan até o destino, depois linha e coluna. Texto e marca visual usam a mesma barreira. Essa pista ignora obstáculos intermediários e não garante uma solução completa ou o menor custo.

## Pontuação e objetivos

`Core.score` só pontua quando todos os moradores têm caminho: `700 + round(300 × saldo / orçamento inicial)`. A campanha conserva o melhor resultado de cada fase.

`Core.summary` reúne custo, conexões, passos e células intermediárias compartilhadas por pelo menos dois moradores. O selo de economia exige conclusão e gasto dentro de `efficiencyCost`; o de percursos curtos exige que cada pessoa cumpra seu próprio `stepGoal`. A soma dos passos não substitui essa avaliação individual.

As construções `solution` e `alternatives` em `levels.js` são referências usadas nos testes. Demonstram metas alcançáveis, sem provar um ótimo global, e não são aplicadas automaticamente durante a partida.

## Comparação de construções

Em **Comparar soluções**, A é uma cópia guardada pelo jogador e B é a construção atual. `Comparison.capture` valida e copia as peças; `analyse` recalcula custo e caminhos. Uma rota ausente recebe `null` e aparece como “Sem caminho”, nunca como zero passos.

`compare` avalia custo e passos de cada pessoa. Só indica vantagem sem perdas entre construções completas quando nenhum critério piora e pelo menos um melhora. Se há ganhos e perdas, informa a troca envolvida; construções incompletas não recebem um vencedor por métricas. Construções idênticas são reconhecidas mesmo antes da conclusão.

Reiniciar a fase preserva A. Restaurar A substitui B por uma cópia, cancela o resultado pendente e guarda a construção anterior para Desfazer. Guardar A ou consultar a comparação não altera recordes.

## Persistência

| Chave de `localStorage` | Conteúdo |
| --- | --- |
| `conecta-umuarama-v1` | Melhores pontuações, selos de percurso e fase em andamento |
| `conecta-umuarama-v1-recovery` | Cópia do conteúdo original quando o progresso precisa de recuperação |
| `conecta-umuarama-comparacoes-v1` | Uma referência de construção por fase, separada da campanha |

O código valida versão, pontuações, desbloqueio, coordenadas, tipos de peças, terrenos e orçamento antes de usar ou gravar o progresso. A recuperação tenta copiar o conteúdo original, preserva recordes válidos e descarta partes incompatíveis. As referências também são validadas por fase.

Falhas de armazenamento são informadas e permitem continuar na sessão. Os dados não são enviados pelo código do jogo a um servidor. A disponibilidade depende do navegador e do endereço usado para abrir o jogo. Como os recordes e referências são associados ao índice da fase, reordenar fases exige uma migração explícita.

## Animações e resultado pendente

`animateRoutes` usa `requestAnimationFrame` para deslocar imagens estáticas pelos caminhos calculados. O CSS acrescenta a oscilação da caminhada. Com preferência por movimento reduzido, os personagens chegam sem percorrer a animação.

`finishMotion` conclui a chegada imediatamente pelo botão ou ao mudar a visibilidade da aba. Um temporizador também permite concluir caso os quadros parem. `pendingResult` conserva a ação de exibir a vitória enquanto a aba estiver oculta, um diálogo estiver aberto ou a tela do jogo estiver escondida. `showPendingResult` remove a ação pendente antes de executá-la, evitando repetições.

`cancelMotion` cancela quadro e temporizador, limpa o resultado pendente e incrementa `state.generation`, invalidando retornos de animações anteriores. Edições, Desfazer, reinício, restauração de A e troca de fase usam esse mecanismo. Se o navegador suspender toda a execução, a conclusão depende de sua retomada.

## Conteúdo e inserção de textos

`portrait`, `movement` e `destinationTypes` escolhem imagens, movimento e desenho dos destinos sem depender dos nomes em português. `Story.arrival` usa a rota encontrada: uma fala sobre rampa exige que a rampa faça parte do caminho, não apenas da construção.

Os textos dinâmicos usam `textContent` ou são escapados por `Views.escape` antes de entrar nos modelos HTML. Preserve essa distinção ao alterar nomes, falas e painéis: conteúdo textual não deve ser interpretado como marcação. A origem das imagens e da assistência por IA está em [Créditos](CREDITOS.md).
