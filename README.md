# Conecta Umuarama — Uma cidade para todos

**[Jogar agora](https://jaog1v1.github.io/conecta-umuarama/)** · [Código-fonte](https://github.com/JAOG1V1/conecta-umuarama) · [Guia de desenvolvimento](DEVELOPMENT.md)

Um jogo de lógica sobre caminhos, pessoas e mobilidade. Construa calçadas, faixas e rampas para conectar moradores aos seus destinos, respeitando o orçamento e as necessidades de cada um.

O bairro é fictício, inspirado em Umuarama. Custos e regras simplificam situações de mobilidade para fins educativos; não representam normas técnicas ou projetos reais da cidade. O jogo usa HTML, CSS e JavaScript, sem bibliotecas externas.

## Como jogar

1. Escolha **Começar a construir** e siga o tutorial.
2. Selecione uma ferramenta e uma célula do mapa.
3. Use **Testar rotas**: todos os moradores precisam chegar dentro do orçamento.

| Construção | Onde usar | Custo |
| --- | --- | ---: |
| Calçada | Terreno livre | 1 |
| Faixa | Rua | 3 |
| Rampa | Escada | 2 |

Os caminhos seguem quatro direções, sem diagonais, e podem ser compartilhados. Árvores, água e edifícios intermediários bloqueiam a passagem. Remover uma obra sua devolve o custo; remover uma rampa restaura a escada. Elementos originais do mapa permanecem no lugar.

## Explore soluções

- **Cinco fases**, incluindo o tutorial, sem cronômetro obrigatório ou limite de tentativas.
- **Pistas de alcance:** veja até onde um morador consegue ir e consulte uma pista sobre uma barreira encontrada.
- **Comparação A/B:** guarde uma construção, experimente outra e compare gasto, conexões e passos de cada pessoa. Recuperar A pode ser desfeito.
- **Desafios opcionais**, a partir da segunda fase: Economia e Percursos curtos. A meta de percurso vale para cada morador; encurtar o caminho de um não compensa o desvio de outro.
- **Progresso local:** melhores resultados e referências de comparação ficam no navegador, quando o armazenamento está disponível.

A pontuação de uma fase concluída é `700 + arredondar(300 × saldo ÷ orçamento inicial)`. A campanha soma o melhor resultado de cada fase. Comparar ou recuperar uma construção não concede pontos: é preciso testar as rotas. Os dois selos podem ser conquistados em soluções diferentes.

Trocar de navegador, limpar seus dados ou mudar o endereço dos arquivos pode afetar o progresso salvo. Se o armazenamento estiver bloqueado, é possível continuar jogando na sessão atual.

## Controles e acessibilidade

Use mouse, toque ou teclado. **Tab** leva aos controles e ao mapa; **setas** escolhem a célula; **Enter** ou **Espaço** aplicam a ferramenta. **Escape** fecha as janelas de ajuda e comparação.

A interface inclui foco visível, nomes de linha e coluna nas células, avisos de estado para tecnologias assistivas e suporte à preferência de movimento reduzido. Em telas estreitas, o mapa permite rolagem horizontal. **Concluir chegada** encerra a animação e exibe o resultado imediatamente.

Esses recursos não equivalem a uma auditoria completa de acessibilidade. Compatibilidade com leitores de tela, contraste e uso em diferentes dispositivos precisam de avaliação específica; os limites das verificações estão em [VERIFICACAO.md](docs/VERIFICACAO.md).

## Executar localmente

Baixe e extraia o projeto inteiro e abra [index.html](index.html) no navegador. Mantenha as pastas `assets`, `css` e `js` ao lado desse arquivo. A cópia local funciona sem internet, instalação, servidor ou compilação.

## Testes

Abra [tests/index.html](tests/index.html) no navegador para executar os testes de lógica. Com Node.js instalado, execute na pasta do projeto:

```sh
npm test
```

Não é necessário instalar pacotes. O comando verifica lógica e fluxos de interface simulada, com armazenamento de teste separado do progresso do jogador. A simulação não substitui a revisão visual e os testes de uso no navegador.

O mesmo comando é executado automaticamente no [GitHub Actions](https://github.com/JAOG1V1/conecta-umuarama/actions/workflows/tests.yml) a cada alteração na branch principal e em pull requests.

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
