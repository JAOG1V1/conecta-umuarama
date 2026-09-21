# Conecta Umuarama — Uma cidade para todos

**[Jogar agora](https://jaog1v1.github.io/conecta-umuarama/)** · [Código-fonte](https://github.com/JAOG1V1/conecta-umuarama) · [Guia de desenvolvimento](DEVELOPMENT.md)

Um jogo de lógica sobre caminhos, pessoas e mobilidade. Construa calçadas, faixas e rampas para conectar moradores aos seus destinos, respeitando o orçamento e as necessidades de cada um.

O bairro é fictício, inspirado em Umuarama. Custos e regras simplificam situações de mobilidade para fins educativos; não representam normas técnicas ou projetos reais da cidade. O jogo usa HTML, CSS e JavaScript, sem bibliotecas externas.

## Como jogar

1. Escolha **Começar a construir** e siga o tutorial.
2. Selecione uma ferramenta e uma célula do mapa.
3. Use **Testar rotas**: todos os moradores precisam chegar dentro do orçamento.

O pontilhado mostra onde a ferramenta selecionada pode agir. Ao passar o ponteiro ou focar uma célula pelo teclado, confira o custo, o reembolso ou o motivo de uma ação indisponível. A prévia mostra o saldo que restará sem alterar sua construção.

| Construção | Onde usar | Custo |
| --- | --- | ---: |
| Calçada | Terreno livre | 1 |
| Faixa | Rua | 3 |
| Rampa | Escada | 2 |

Os caminhos seguem quatro direções, sem diagonais, e podem ser compartilhados. Árvores, água e edifícios intermediários bloqueiam a passagem. Remover uma obra sua devolve o custo; remover uma rampa restaura a escada. Elementos originais do mapa permanecem no lugar.

## Explore soluções

- **Cinco fases**, incluindo o tutorial, sem cronômetro obrigatório ou limite de tentativas.
- **Seu bairro em movimento:** acompanhe fases concluídas, pontos dos recordes e os oito selos da campanha. O resumo indica a próxima fase pendente ou, depois de concluir as cinco, onde buscar um selo restante.
- **Desfazer e Refazer:** experimente mudanças e recupere a construção anterior, com o orçamento recalculado.
- **Pistas de alcance:** veja até onde um morador consegue ir e consulte uma pista sobre uma barreira encontrada.
- **Comparação A/B:** guarde uma construção, experimente outra e compare gasto, conexões e passos de cada pessoa. Recuperar A pode ser desfeito.
- **Guardar e experimentar:** depois de uma vitória nas fases com desafios, guarde a solução como A e continue editando. Se já existir uma referência diferente, o jogo pede confirmação antes de substituí-la.
- **Desafios opcionais**, a partir da segunda fase: Economia e Percursos curtos. A meta de percurso vale para cada morador; encurtar o caminho de um não compensa o desvio de outro.
- **Uma obra por fase:** trocar de fase preserva o tabuleiro em andamento. **Continuar** retoma a última fase; os cartões identificam obras guardadas. Recordes, tabuleiros e referências ficam no navegador quando o armazenamento está disponível.

A pontuação de uma fase concluída é `700 + arredondar(300 × saldo ÷ orçamento inicial)`. A campanha soma o melhor resultado de cada fase. Comparar, recuperar ou guardar uma construção não concede pontos: é preciso testar as rotas. O tutorial não oferece selos; cada uma das outras quatro fases oferece dois, que podem ser conquistados em soluções diferentes.

Reiniciar limpa somente o tabuleiro escolhido, após confirmação, e preserva recordes e referências. O histórico de Desfazer e Refazer vale durante a edição da fase: ele é reiniciado ao reabri-la. Fazer uma nova alteração após desfazer substitui as ações que poderiam ser refeitas.

Trocar de navegador, limpar seus dados ou mudar o endereço dos arquivos pode afetar o progresso salvo. Se o armazenamento estiver bloqueado, é possível continuar jogando na sessão atual.

## Controles e acessibilidade

Use mouse, toque ou teclado.

| Controle | Ação |
| --- | --- |
| Tab | Percorrer controles e entrar no mapa |
| Setas | Escolher uma célula do mapa |
| Enter ou Espaço | Aplicar a ferramenta na célula em foco |
| 1, 2, 3 e 4 | Selecionar Calçada, Faixa, Rampa e Remover |
| Ctrl/Cmd + Z | Desfazer |
| Ctrl/Cmd + Shift + Z ou Ctrl + Y | Refazer |
| Escape | Fechar a janela aberta |

Os atalhos de ferramentas e histórico atuam somente na tela do jogo, sem janela aberta, e não interferem em campos de texto.

A interface inclui foco visível, nomes de linha e coluna nas células, avisos de estado para tecnologias assistivas e suporte à preferência de movimento reduzido. Em telas estreitas, o mapa permite rolagem horizontal. **Concluir chegada** encerra a animação e exibe o resultado imediatamente.

Esses recursos não equivalem a uma auditoria completa de acessibilidade. Compatibilidade com leitores de tela, contraste e uso em diferentes dispositivos precisam de avaliação específica; os limites das verificações estão em [VERIFICACAO.md](docs/VERIFICACAO.md).

## Executar localmente

Baixe e extraia o projeto inteiro e abra [index.html](index.html) no navegador. Mantenha as pastas `assets`, `css` e `js` ao lado desse arquivo. A cópia local funciona sem internet, instalação, servidor ou compilação.

## Testes

Abra [tests/index.html](tests/index.html) no navegador para executar os testes de lógica. Com Node.js instalado, execute na pasta do projeto:

```sh
npm test
```

Não é necessário instalar pacotes. O comando verifica lógica, fluxos de interface simulada e resumo da campanha, com armazenamento de teste separado do progresso do jogador. A simulação não substitui a revisão visual e os testes de uso no navegador.

O projeto inclui um fluxo configurado para executar o mesmo comando no [GitHub Actions](https://github.com/JAOG1V1/conecta-umuarama/actions/workflows/tests.yml), em alterações na branch principal e em pull requests. O resultado de cada execução pode ser consultado nesse endereço.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Desenvolvimento](DEVELOPMENT.md) | Execução, organização dos arquivos e verificações |
| [Arquitetura](docs/ARQUITETURA.md) | Responsabilidades dos módulos e fluxo dos dados |
| [Verificações](docs/VERIFICACAO.md) | Testes realizados, resultados e limites |
| [Histórico de versões](CHANGELOG.md) | Mudanças do projeto |
| [Contribuir](CONTRIBUTING.md) | Relatos de problemas e propostas de alteração |
| [Créditos](docs/CREDITOS.md) | Pessoas, ferramentas e origem dos recursos |
| [Licença MIT](LICENSE) | Termos de uso e distribuição |

## Créditos

| Identificação | Nome |
| --- | --- |
| Estudante | João Gabriel Sabedra Vieira |
| Professor-orientador | LEANDRO MARINS DE BRITO |
| Turma | 1 C ADM |
| Escola | Colégio Estadual Cívico-Militar Douradina — PR |

Código, textos, mapas e elementos SVG desenvolvidos com assistência do Codex. As ilustrações dos moradores foram geradas por IA para o projeto. Consulte a origem dos recursos e os prompts em [CREDITOS.md](docs/CREDITOS.md).
