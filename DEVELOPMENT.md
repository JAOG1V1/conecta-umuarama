# Desenvolvimento

O **Conecta Umuarama — Uma cidade para todos** usa HTML, CSS e JavaScript, sem dependências externas ou etapa de compilação. As regras do jogo estão no [README](README.md); os detalhes técnicos estão em [Arquitetura](docs/ARQUITETURA.md).

## Executar localmente

Abra [index.html](index.html) em um navegador atualizado, mantendo as pastas `css`, `js` e `assets` ao lado do arquivo. Não é necessário instalar pacotes, executar `npm install` ou iniciar um servidor.

A cópia local funciona sem internet. O projeto não usa Service Worker; visitar a página hospedada não garante que ela fique disponível offline. Node.js é opcional e serve para executar os testes pelo terminal.

## Estrutura

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `index.html` | Telas, controles, diálogo e carregamento dos scripts |
| `css/` | Estilos do jogo e da página 404, foco, movimento reduzido e adaptação a telas pequenas |
| `js/core.js` | Regras, validação, custos, rotas e pontuação |
| `js/levels.js` | Cinco fases, moradores, metas, falas e construções de referência |
| `js/storage.js` | Validação, recuperação e gravação do progresso |
| `js/comparison.js` | Referências de construção e comparação de custo e percursos |
| `js/characters.js`, `js/art.js` | Personagens e desenhos das peças, casas e destinos |
| `js/story.js` | Falas conforme o percurso realizado |
| `js/views.js`, `js/comparison-view.js`, `js/help.js` | Painéis, comparação, pistas, resultados, ajuda e créditos |
| `js/main.js` | Estado da partida, eventos, renderização, desfazer, diálogos e animações |
| `assets/` | Ícone, imagens locais e registro dos prompts dos personagens |
| `tests/` | Testes de lógica e da interface simulada |
| `docs/` | Arquitetura, créditos e registro de verificações |

Os 11 scripts clássicos usam `defer` nesta ordem: `core`, `levels`, `storage`, `comparison`, `characters`, `story`, `views`, `art`, `comparison-view`, `help` e `main`. Preserve a sequência de dependências.

## Verificar alterações

Abra [tests/index.html](tests/index.html) para executar os testes de lógica no navegador, com armazenamento simulado. Com Node.js disponível, execute na raiz do projeto:

```sh
npm test
```

Para executar os grupos separadamente:

```sh
node tests/run-tests.cjs
node tests/interface.cjs
```

Os testes não modificam o progresso real. A interface simulada verifica eventos e estado; ela não abre um navegador nem comprova aparência, contraste ou uso com tecnologia assistiva. Confira também os fluxos afetados no navegador, incluindo teclado, telas pequenas e movimento reduzido. Use uma cópia ou perfil separado para verificar recuperação de dados.

Mantenha regras em `core.js`, conteúdo em `levels.js` e interação nos arquivos de interface. Mudanças na ordem ou no formato das fases exigem revisão da compatibilidade dos salvamentos. Registre alterações em [CHANGELOG.md](CHANGELOG.md), verificações em [docs/VERIFICACAO.md](docs/VERIFICACAO.md) e origem dos recursos em [docs/CREDITOS.md](docs/CREDITOS.md). Consulte também [CONTRIBUTING.md](CONTRIBUTING.md).

## Página 404

[404.html](404.html) usa CSS próprio e não executa scripts do jogo. Seu `<base href="/conecta-umuarama/">` resolve ícone, estilo e botão de retorno a partir desse prefixo, inclusive em endereços aninhados. O prefixo deve corresponder ao caminho público do projeto. `index.html` mantém caminhos relativos para funcionar como arquivo local.

Abrir `404.html` diretamente não reproduz esse comportamento: a verificação depende de um servidor que associe o prefixo ao projeto e devolva a página com status HTTP 404 para endereços inexistentes.
