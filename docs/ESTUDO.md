# Guia de estudo

## Como funciona Comparar soluções

O botão Comparar guarda uma cópia das construções como referência A. A construção atual é B. Cada fase tem sua própria referência, em uma chave de armazenamento separada do progresso. Reiniciar esvazia B, preservando A.

Em js/comparison.js, capture valida as peças e cria uma cópia. analyse recalcula custos e caminhos com Core; uma pessoa sem caminho recebe passos null, nunca zero. compare considera custo e os passos de CADA pessoa. Só indica vantagem sem perdas quando ninguém tem um percurso maior e o gasto não aumenta.

Na fase 4, compare o contorno que custa 7 e exige 12 passos com a solução de faixa e rampa que custa 11 e exige 10 passos. A segunda economiza dois passos para Caio, mas exige quatro unidades a mais. Esse é um dilema, não uma vencedora automática.

Em main.js, guardar A preserva a chegada que estiver pendente. Restaurar A conta como edição: cancela o resultado antigo, guarda B no histórico e recalcula a interface. Por isso Desfazer consegue recuperar B. Restaurar não conquista pontos nem desbloqueia fases; isso continua dependendo de Testar rotas.

Exercício: guarde uma construção incompleta, complete B e compare. Explique por que “Sem caminho” não pode ser tratado como “zero passos”. Depois recupere A e use Desfazer para conferir a independência das duas cópias.

## Comece pelo tabuleiro

Comece jogando. Depois acompanhe uma ação simples no código: construir uma calçada.

## Como as partes se conectam

O HTML organiza botões, mapa e textos. O CSS define a aparência. O JavaScript recebe comandos, aplica regras e atualiza a interface.

Os scripts são carregados com defer na ordem core, levels, storage, comparison, characters, story, views, art, comparison-view, help e main. Assim, as dependências estão disponíveis quando a interface começa a funcionar. Não são necessárias importações, servidor ou compilação.

## Mapa e estado

Cada fase é uma grade de caracteres:

- . terreno livre
- t árvore
- ~ água
- = rua
- s escada
- p calçada existente
- A, B, C casas
- X, Y, Z destinos

As coordenadas do código começam em zero. Uma peça construída é registrada em state.edits, por exemplo: {"2,3":"path"}. A interface exibe linhas e colunas começando em um para facilitar a leitura.

O estado reúne os dados da partida; a interface representa esses dados. Ao construir, Core.apply verifica terreno, ferramenta e orçamento e devolve um novo conjunto de peças.

## Acompanhar uma construção

1. Em main.js, o evento click do mapa identifica linha e coluna.
2. editCell chama Core.apply.
3. Uma ação inválida produz uma mensagem e mantém o estado anterior.
4. Uma ação válida guarda o estado anterior em state.undo e aplica o novo.
5. render atualiza mapa, orçamento e moradores.
6. saveProgress solicita o salvamento.

## Rotas com BFS

Core.routes usa busca em largura (BFS). Começa na origem, coloca vizinhos permitidos em uma fila, marca visitados e registra de onde veio cada posição.

Exemplo: A p X representa uma casa, uma calçada existente e um destino. A busca encontra A → p → X em dois passos.

São considerados quatro vizinhos. O perfil stairs altera a passagem por escadas. Para quem precisa de rota sem degraus, uma escada só entra na busca se tiver recebido uma rampa.

BFS encontra o caminho com menos passos no mapa já construído. Não calcula automaticamente a construção mais barata.

Quando o destino não é alcançado, a busca percorreu toda a região permitida. Core.routes devolve reachable com essas células e barriers com terrenos sem calçada, ruas sem faixa e escadas sem rampa adjacentes a elas. Nenhuma construção que resolveria o mapa é adicionada automaticamente. Árvores e água continuam bloqueadas.

Na fase 3, retire a rampa da solução central. O alcance de Caio é 1,5; 1,4; 1,3; 1,2; 2,3, em coordenadas do código. A escada 3,3 fica na fronteira, fora do alcance. Na tela ela é linha 4, coluna 4. A mensagem indica uma barreira presente nessa fronteira; ela não afirma que a barreira seja a única causa nem que exista uma única solução.

renderReach destaca o alcance do morador selecionado com tracejado e cor. Selecionar outro morador troca o destaque. Editar o mapa invalida o diagnóstico anterior. Um teste com falha mostra essa informação imediatamente, sem impor uma animação.

Views.hintBarrier(route, level) seleciona a barreira citada. Primeiro prioriza escada sem rampa, depois rua sem faixa e terreno sem calçada. Entre barreiras do mesmo tipo, usa a distância Manhattan até o destino: diferença absoluta das linhas mais diferença absoluta das colunas. Se ainda houver empate, usa linha e coluna. A função ordena uma cópia de barriers, preservando o resultado original da busca.

Essa distância ignora os obstáculos intermediários. Portanto, a pista não garante o menor custo nem uma rota completa. Na fase 1 vazia, escolhe o terreno 2,2 (linha 3, coluna 3 na tela), na direção da escola. Na fase 3 sem a rampa central, a prioridade da escada preserva a indicação 3,3 mesmo que outro terreno esteja geometricamente mais perto do destino.

O mesmo objeto de barreira alimenta Views.reachExplanation e a classe hint-barrier no mapa, evitando divergência entre texto e marca. A marca tem contorno laranja, “?” e aria-description, sem trocar o foco do jogador. O painel fica nos controles, e reachDetails permite recolher a explicação. reachStatus mantém o anúncio textual fora da parte recolhida. Ao limpar o diagnóstico, a interface também fecha a explicação e remove as descrições e marcas anteriores.

O evento toggle de reachDetails traz o texto para a tela quando a explicação abre em janelas com mais de 600 px de largura. scrollIntoView rola a página, mas não altera a posição dos elementos dentro dela nem muda o foco. No tabuleiro, o foco de teclado tem borda escura e a pista tem borda laranja; ao coincidir na mesma célula, a borda escura fica mais para dentro.

## Funções importantes

- Core.cost: soma o custo das construções.
- Core.validateSave: confere coordenadas, tipos de peças, terrenos e orçamento.
- Core.apply: valida construir ou remover sem modificar o objeto anterior.
- Core.routes: calcula uma rota para cada morador.
- Core.score: verifica a conclusão e calcula pontos.
- Core.summary: conta moradores conectados, passos e células compartilhadas; verifica as metas opcionais de gasto e percurso de cada morador.
- Characters.walker: cria o personagem ilustrado com a letra de identificação.
- Storage.empty: cria um progresso vazio.
- Storage.validateProgress: verifica versão, pontos, desbloqueio e tabuleiro.
- Storage.load e Storage.save: isolam o acesso ao localStorage.
- renderBoard e renderHud: atualizam desenho e informações.
- animateRoutes: usa requestAnimationFrame para mover personagens ilustrados.
- cancelMotion: impede uma animação antiga de continuar após uma edição.

## Pontuação e persistência

Saldo = orçamento inicial menos o custo das peças mantidas.

Pontos = 700 + round(300 × saldo / orçamento inicial), somente quando todos os moradores estão conectados.

A campanha considera apenas o melhor resultado de cada fase. O salvamento tem uma versão: se você modificar a estrutura das fases ou do progresso, revise também essa versão e a recuperação de dados antigos.

Não confie em dados salvos sem validá-los. Eles podem estar incompletos ou corrompidos. A falha de armazenamento não deve impedir o jogo.

## Escolhas, histórias e animações

Cada fase em levels.js tem story (contexto), hint (dica opcional), efficiencyCost (meta alcançável) e arrival de cada morador (fala na chegada). solution e alternatives são exemplos usados nos testes, nunca revelados automaticamente durante a partida.

Na fase 3, duas soluções de custo 8 podem produzir distâncias diferentes: 8 e 8 passos, ou 4 e 12. Na fase 4, o trajeto de custo 11 usa 10 passos, enquanto o de custo 7 usa 12. Na fase 5, a rampa opcional custa mais, mas encurta o percurso de Caio. Uma solução com menos gasto nem sempre produz o menor caminho.

A segunda alternativa da fase 5 demonstra os dois selos juntos: custo 20 e percursos de 6, 8 e 10 passos. A solução original e a primeira alternativa continuam disponíveis para comparar. Elas não são afirmações de mínimo global.

Core.summary conta uma célula como compartilhada se ela aparece nos percursos de pelo menos dois moradores. Os pontos representam economia. O comprimento de cada rota determina outro objetivo: o selo de Percursos curtos. Ele exige que TODOS os moradores cumpram seu próprio stepGoal, para que um trajeto muito curto não esconda o desvio de outra pessoa. As metas são testemunhadas por soluções válidas; não são prova de um ótimo global.

Characters cuida das imagens, main calcula as posições intermediárias com requestAnimationFrame, e o CSS cuida da oscilação de caminhada. Os sprites são imagens estáticas que se deslocam; não são sequências de quadros de pernas ou rodas. Quem escolheu movimento reduzido no sistema recebe a chegada sem animação. Ao ocultar a aba, o percurso é concluído e o resultado fica pendente até o retorno. Editar o mapa ou reiniciar cancela esse resultado pendente.

## Como a vitória é preservada

- finishMotion leva os personagens até o final do percurso sem esperar todos os quadros. O botão Concluir chegada chama essa função.
- motionTimer usa setTimeout como proteção caso os quadros de animação parem sem um evento de visibilidade. Ele é limpo ao concluir ou cancelar.
- pendingResult guarda a ação de apresentar a vitória enquanto uma janela informativa está aberta ou a aba está oculta.
- showPendingResult verifica se o jogo está visível e o diálogo está fechado. Retira a ação da fila antes de executá-la, evitando repetições.
- cancelMotion invalida callbacks antigos. Editar, reiniciar ou trocar de fase cancela a vitória antiga. Escolher a própria fase no seletor apenas fecha a janela e preserva a partida.

Se o navegador congelar toda a execução da página, tanto o temporizador quanto a animação param. A recuperação depende de a execução ser retomada. Não existe garantia de prazo absoluto com o navegador ou computador suspenso.

## Dados, falas e recuperação

portrait escolhe a ilustração; movement escolhe a animação. Nenhuma dessas escolhas depende do nome do morador. destinationTypes escolhe o desenho do destino sem comparar seu nome em português.

Story.arrival usa o caminho encontrado pela BFS. Uma fala sobre rampa só é escolhida se a rampa aparece nesse caminho; comprar uma rampa sem usá-la não basta. reactions guarda falas para rampa, desvio e trajeto curto.

Views.escape transforma os sinais especiais dos textos em entidades HTML antes de mostrar nomes e falas. Assim, escrever um sinal de menor que em uma fala não cria uma tag.

Storage.save valida antes de gravar. Storage.recover preserva notas válidas e descarta somente partes inválidas. shortBest guarda os selos de percurso conquistados. A versão 1 permanece compatível com os salvamentos anteriores; acrescentar fases ao final preserva o prefixo de recordes. Reordenar fases exige uma migração explícita.

## Cinco exercícios

1. Mude uma cor e um texto. Confira contraste, teclado e celular.
2. Altere o orçamento de uma fase. Verifique pontuação, construção e reembolso.
3. Crie uma sexta fase com solução de referência. Atualize os textos de quantidade de fases, total da campanha e versão do salvamento.
4. Acrescente uma peça com regra pequena e clara. Atualize custos, ação, remoção, desenho, legenda e testes.
5. Crie um teste de rota bloqueada; introduza um erro temporário, veja o teste falhar e restaure a regra correta.

Registre o que mudou, por que mudou e como verificou.

## Dez perguntas da banca

1. Por que uma grade? Ela organiza posições e facilita localizar vizinhos.
2. O que é estado? Os dados da partida naquele momento.
3. Por que separar regras e interface? Para testar regras sem depender do desenho.
4. Como a BFS funciona? Explora posições por distância usando uma fila.
5. Por que marcar visitados? Para evitar ciclos e trabalho repetido.
6. Como a acessibilidade muda a solução? O perfil de cada morador altera células permitidas.
7. Como impedir gasto excessivo? Validando o custo antes de aplicar a ação.
8. Por que cancelar animações ao editar? A rota anterior pode ter deixado de existir.
9. Como provar que uma fase é possível? Aplicando e verificando sua solução de referência.
10. Qual foi sua contribuição? Mostre uma alteração real e explique o código correspondente.

Responda com suas palavras. Saber modificar o projeto é mais útil do que decorar essas respostas.
