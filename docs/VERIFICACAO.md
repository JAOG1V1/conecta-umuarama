# Verificações

Versão 1.6.2 · verificações locais em 19/09/2026 e revisão da distribuição em 20/09/2026.

## Testes automatizados

| Grupo | Resultado | Cobertura |
| --- | ---: | --- |
| Lógica | 83/83 | Soluções das cinco fases, alternativas, custos, metas, rotas, diagnóstico, pontuação, persistência e comparação |
| Interface simulada | 52/52 | Início, edição, desfazer, reinício, diálogos, animações, resultado pendente, troca de fase e comparação A/B |

Os **135 testes passaram** em execução local com Node.js. A sintaxe dos 11 scripts do jogo também foi verificada. Os testes usam armazenamento simulado e não modificam o progresso do jogador.

O workflow [Testes do jogo](https://github.com/JAOG1V1/conecta-umuarama/actions/workflows/tests.yml) executa `npm test` em alterações da branch principal e em pull requests, com Node.js 24. O resultado de cada execução fica registrado no GitHub Actions.

## Conferência da versão

- Links locais de HTML e documentação conferidos, incluindo nomes de arquivos e subpastas.
- Créditos revisados na interface, com responsáveis e origem dos recursos, sem campos pendentes.
- Janela de créditos conferida no navegador embutido em computador e em 390 × 844 pixels, sem transbordamento horizontal; o conteúdo comprido usa rolagem.
- Página 404 conferida com endereços inexistentes na raiz do projeto e em subpastas, usando servidor local com o mesmo prefixo do site. CSS, ícone e botão de retorno resolvem a partir de `/conecta-umuarama/`.
- Retorno da página 404 ao início conferido por teclado. A página de erro não executa scripts nem acessa o salvamento.

As regras, fases e persistência da campanha foram preservadas. Esta revisão altera a documentação, os textos de créditos e a verificação automática, além de incorporar a página 404 da versão 1.6.1.

## Exemplos de soluções verificados

| Fase | Construção | Gasto | Passos por morador |
| --- | --- | ---: | --- |
| 3 | Rampa central | 8 | Lia 8; Caio 8 |
| 3 | Passagem lateral | 8 | Lia 4; Caio 12 |
| 4 | Faixa e rampa | 11 | Caio 10 |
| 4 | Passeio no contorno | 7 | Caio 12 |
| 5 | Com rampa | 22 | Lia 10; Caio 8; Rosa 10 |
| 5 | Passagem existente | 20 | Lia 10; Caio 10; Rosa 10 |
| 5 | Dois selos juntos | 20 | Lia 6; Caio 8; Rosa 10 |

Esses exemplos demonstram metas alcançáveis; não provam o menor custo global. Pontuação e passos são critérios distintos e a comparação mantém os resultados de cada morador.

## Escopo e limites

A interface simulada verifica lógica de eventos e estado, sem renderizar a página. A conferência visual foi feita no navegador embutido do ambiente de desenvolvimento, não em aparelhos físicos ou em todos os navegadores.

Há suporte implementado a teclado, foco visível, avisos de estado e movimento reduzido. Não foi realizada auditoria completa de acessibilidade, validação com leitores de tela ou medição formal de desempenho. Os testes não constituem certificação de conformidade.

O salvamento depende da disponibilidade do armazenamento do navegador. Se toda a execução da página for suspensa, animações e temporizadores só podem prosseguir depois da retomada.

Os comandos para repetir as verificações estão em [DEVELOPMENT.md](../DEVELOPMENT.md). As mudanças de cada versão estão em [CHANGELOG.md](../CHANGELOG.md).
