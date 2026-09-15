# Conecta Umuarama — Uma cidade para todos

Jogo de lógica e construção de caminhos em HTML, CSS e JavaScript. Em cinco fases, conecte moradores aos seus destinos respeitando orçamento e necessidades de mobilidade.

O bairro é fictício, inspirado em Umuarama. As regras simplificam situações de mobilidade para fins educativos.

## Abrir e jogar

1. Abra a pasta do projeto que você extraiu.
2. Abra index.html no navegador.
3. Comece uma partida e siga o tutorial.

Mantenha index.html ao lado das pastas css, js e assets. O jogo não exige instalação, internet, servidor ou compilação. Os scripts clássicos são carregados em ordem usando defer.

No teclado, Tab entra no mapa, as setas escolhem uma célula e Enter ou Espaço executam a ferramenta. Com mouse ou toque, selecione uma ferramenta e clique no mapa.

## Comparar soluções — versão 1.6

Durante uma fase, use **Comparar** no alto da tela. Guarde sua construção como **A — Referência**, volte ao mapa e experimente outros caminhos. O tabuleiro atual aparece como **B**. A referência permanece ao reiniciar, trocar de fase e reabrir o jogo no mesmo navegador, quando o salvamento está disponível.

Os mapas e a tabela mostram gasto, moradores com caminho e passos de cada pessoa. Uma rota ausente aparece como “Sem caminho”. A comparação considera cada morador individualmente: uma caminhada menor de Lia não compensa automaticamente um desvio maior para Caio. Guardar ou consultar uma referência não concede pontos; use Testar rotas para concluir a fase.

**Usar A no mapa** recupera a referência e permite Desfazer para voltar à construção anterior. Substituir A pede confirmação. Se o navegador bloquear o salvamento, um aviso informa que a referência está disponível apenas na sessão atual.

## Apresentação da versão 1.5.2

- A ilustração de abertura e sua legenda ficam alinhadas, sem inclinação decorativa.
- O botão Estudar foi retirado da interface. As explicações, exercícios e perguntas para a banca continuam em docs/ESTUDO.md.

## Acabamento da versão 1.5.1

- Ao abrir “Ver pista” no computador, a página rola o necessário para mostrar a explicação, mantendo o foco no controle.
- O foco de teclado no mapa usa uma borda escura, separada da marca laranja da pista. Quando ambos estão na mesma célula, as duas bordas e o “?” continuam presentes.

## Novidades da versão 1.5

- O diagnóstico fica junto dos controles, mantendo o mapa na mesma posição após uma falha. Escolha o morador pelo nome e abra “Ver pista” para ler a explicação.
- Uma marca laranja com “?” identifica no mapa a célula citada. No tutorial, o desempate agora aponta para a escola.
- As pistas priorizam escadas, depois ruas e terrenos. Entre barreiras do mesmo tipo, preferem a mais próxima do destino em distância geométrica. Isso não garante a construção mais barata nem revela uma solução completa.
- Textos distinguem o morador preso na própria casa e usam “e” entre os últimos nomes de uma lista.

Regras, fases, orçamentos e salvamento foram preservados. O guia de estudo explica a seleção da pista; VERIFICACAO.md registra as medidas de tela e os testes desta atualização.

## Recursos da versão 1.4

- Um teste com falha mostra imediatamente o alcance do morador e uma pista sobre uma barreira na borda dessa área. O tracejado não revela uma solução completa.
- Concluir chegada permite encurtar a animação e ver o resultado; quem preferir pode acompanhar o percurso inteiro.
- Escolher a própria fase no seletor preserva a partida e uma vitória pendente.
- A dica de rolagem fica acima do mapa no celular. A legenda curta fica junto das ferramentas.
- A última fase informa que os dois selos podem ser conquistados juntos e termina com uma pergunta sobre os caminhos do dia a dia.
- As três imagens passaram de 2.172.461 para 219.436 bytes, com transparência e os mesmos desenhos.

O guia de estudo explica o alcance da busca e a preservação da vitória. O roteiro de apresentação usa a fase 4 para comparar economia e distância.

## Regras

- Calçada em terreno livre: custo 1.
- Faixa em uma célula de rua: custo 3.
- Rampa substituindo uma escada: custo 2.
- Árvores e água são obstáculos fixos.
- Há quatro direções; não existem diagonais.
- Edifícios intermediários não podem servir de atalho.
- Moradores podem compartilhar caminhos.
- Remover uma construção devolve seu custo integral; remover uma rampa restaura a escada.
- Elementos originais não podem ser apagados.

Use “Testar rotas”. Se alguém não conseguir chegar, ajuste o mapa e tente novamente. Não há limite de tentativas nem cronômetro obrigatório. Todos precisam chegar dentro do orçamento para concluir a fase.

## Pontuação e salvamento

Cada fase concluída recebe:

700 + arredondar(300 × saldo ÷ orçamento inicial)

A campanha soma a melhor pontuação de cada fase, sem duplicar pontos em repetições. Os pontos medem economia; não são uma nota percentual da qualidade do bairro. A interface apresenta o total conquistado, sem um teto fictício.

A primeira fase é um tutorial. A partir da segunda, existem dois selos opcionais: Economia, por cumprir a meta de gasto, e Percursos curtos, por cumprir a meta de passos de cada morador. É possível conquistar os selos em partidas diferentes; ambos ficam salvos. As fases 3, 4 e 5 oferecem rotas alternativas. Compare o orçamento e os passos de cada morador no resultado.

As dicas começam fechadas. Abra “Preciso de uma dica” quando quiser uma ajuda.

Na versão 1.3, os desafios mostram o gasto atual e, depois de testar as rotas, os passos de cada morador. No computador ficam junto do orçamento; em telas menores ficam junto dos controles. Editar o mapa marca os percursos como não testados. Os símbolos + (obra sua), E (escada) e R (rampa) ficam visíveis sem abrir a legenda. Quando o mapa não cabe na largura da tela, aparece uma indicação de rolagem.

Abrir ajuda, créditos ou fases durante a chegada preserva a vitória. O resultado aparece ao fechar a janela. A animação também possui um temporizador de proteção, cancelado ao editar, reiniciar ou trocar de fase.

O navegador tenta guardar o progresso localmente. A gravação valida os dados antes de substituir o salvamento. A recuperação preserva recordes válidos, mesmo quando o tabuleiro está danificado ou novas fases são acrescentadas ao final. O conteúdo recuperado ganha uma cópia local antes da substituição. Limpar seus dados, trocar de navegador ou mover arquivos pode afetar esse salvamento. Se o armazenamento for bloqueado, ainda é possível jogar na sessão atual.

## Estrutura

index.html — telas, controles e carregamento dos arquivos  
css/style.css — cores, componentes, acessibilidade visual e telas pequenas  
js/core.js — ações, custos, BFS e pontuação  
js/levels.js — cinco mapas e soluções de referência  
js/storage.js — validação e persistência  
js/comparison.js — análise e referências de comparação, salvas separadamente por fase  
js/comparison-view.js — mapas e tabela de comparação  
js/characters.js — ilustrações dos personagens e elementos de animação  
js/story.js — falas que respondem ao trajeto percorrido  
js/views.js — montagem segura dos painéis e resultados  
js/art.js — desenhos SVG dos elementos do mapa  
js/help.js — conteúdo de ajuda e créditos  
js/main.js — eventos, estado, desfazer e animações  
assets/characters/ — três ilustrações PNG locais e registro dos prompts  
tests/ — verificações automáticas da lógica  
docs/ESTUDO.md — explicações e exercícios  
docs/APRESENTACAO.md — roteiro de três minutos  
docs/VERIFICACAO.md — resultados e limites da verificação  
docs/CREDITOS.md — origem das ilustrações e recursos  
docs/DIARIO.md — espaço para registrar suas contribuições

## Executar os testes

Abra tests/index.html no navegador. Se o Node.js estiver instalado, também pode usar:

node tests/run-tests.cjs

Para testar também os fluxos da interface simulada:

node tests/interface.cjs

Ou use npm test para executar ambos. A interface simulada verifica o comportamento do código, sem abrir um navegador.

Os testes usam armazenamento simulado e não alteram o progresso do jogo.

Confira manualmente: início, rota bloqueada, rampas, faixas, desfazer, reinício, vitória nas cinco fases, recarregamento, teclado e tela pequena. Testes de lógica não substituem essa revisão visual.

## Publicar no GitHub Pages

1. Crie um repositório público.
2. Envie o conteúdo da pasta, mantendo index.html na raiz e preservando as subpastas.
3. Abra Settings → Pages.
4. Em Build and deployment, escolha Deploy from a branch.
5. Selecione a branch principal e a pasta / (root), depois salve.
6. Aguarde a publicação, abra o endereço gerado e teste o jogo.
7. Adicione o endereço no campo Website de About do repositório.

Não envie somente o ZIP: os arquivos precisam ser extraídos no repositório. O arquivo .nojekyll identifica este projeto como arquivos estáticos.

Referências: [Criar um site no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) e [configurar a origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Créditos e autoria

Versão inicial desenvolvida com assistência do Codex. Código, textos e elementos SVG produzidos para este projeto, sem bibliotecas externas ou fontes baixadas. As três ilustrações PNG dos moradores foram geradas por IA para este projeto; origem e prompts em docs/CREDITOS.md.

Aluno: João Gabriel Sabedra Vieira  
Professor-orientador: LEANDRO MARINS DE BRITO  
Turma: 1 C ADM  
Escola: Colégio Estadual Cívico-Militar Douradina — PR  
Contribuições realizadas pelo aluno: [descrever alterações verificáveis]

Estude o projeto, registre suas modificações e utilize apenas recursos de terceiros com licença compatível. Este registro não declara autoria exclusiva do aluno.
