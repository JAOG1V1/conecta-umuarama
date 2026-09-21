# Verificações

Versão 1.7.0 · verificações locais em 21/09/2026.

## Testes automatizados

| Grupo | Resultado | Cobertura |
| --- | ---: | --- |
| Lógica | 94/94 | Soluções das cinco fases, alternativas, custos, metas, rotas, pontuação, migração e recuperação isolada de rascunhos |
| Interface simulada | 67/67 | Prévia, construção, desfazer/refazer, atalhos, diálogos, animações, troca de fase, recarga e comparação A/B |
| Campanha | 15/15 | Resumo de fases e selos, próxima conexão, cartões, dados inválidos e ausência de mutações |

Os **176 testes passaram** em execução local com Node.js. A sintaxe dos 12 scripts do jogo e dos cinco scripts de testes também foi verificada. Os testes usam armazenamento simulado e não modificam o progresso do jogador.

O workflow [Testes do jogo](https://github.com/JAOG1V1/conecta-umuarama/actions/workflows/tests.yml) está configurado para executar `npm test` em alterações da branch principal e em pull requests, com Node.js 24. O estado de cada execução remota deve ser consultado no GitHub Actions; os números acima são da execução local.

## Conferência da versão

- 68 referências locais de HTML, documentação, CSS e JavaScript conferidas, incluindo nomes de arquivos e subpastas. Sem IDs duplicados ou estilos inline nos arquivos HTML.
- Prévia de custo e navegação por teclado conferidas no navegador, incluindo construção, Desfazer e Refazer.
- Segunda fase concluída pela interface: nove unidades gastas, oito passos por morador e dois selos conquistados.
- Ação Guardar e experimentar conferida após a vitória; a referência A aparece na comparação e o tabuleiro permanece disponível.
- Partida da segunda fase recuperada após recarregar a página.
- Tabuleiro e controles conferidos em 1280 × 800 e 390 × 844 pixels; comparação em tela estreita com rolagem interna. Sem erros ou avisos no console durante essa sessão.
- Página 404 e créditos permanecem como na versão 1.6.2, na qual foram conferidos no navegador em computador e tela estreita.

As regras e as cinco fases foram preservadas. A persistência passa a guardar um rascunho por fase, mantendo compatibilidade com o salvamento anterior. A migração, a recuperação de dados danificados e o funcionamento durante a sessão sem armazenamento disponível são cobertos pelos testes automatizados.

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
