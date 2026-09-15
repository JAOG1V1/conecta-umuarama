# Verificação da versão 1.6.0

Data: 15/09/2026.

## Comparar soluções

- Passaram 83/83 testes de lógica e 52/52 de integração, totalizando 135. São 31 novos casos sobre cópias independentes, custo e passos individuais, construções incompletas, referências por fase, recarga, armazenamento danificado ou bloqueado, confirmação, desfazer e vitória pendente.
- A sintaxe de todos os scripts passou. As 25 referências locais, os IDs de HTML e os três PNGs foram conferidos. Core, os dados das fases e Storage permanecem idênticos aos arquivos da versão 1.5.2.
- No navegador embutido, a fase 3 sem rampa foi guardada como A: gasto 6, Lia com 8 passos e Caio sem caminho. Construir a rampa gerou B com gasto 8 e ambos com 8 passos. A referência permaneceu após recarregar a página.
- Usar A no mapa restaurou a construção sem rampa. Desfazer recuperou B, incluindo a rampa e o orçamento. Testar rotas, abrir Comparar durante a chegada e fechar com Escape apresentou a vitória de 760 pontos.
- Em 1280 × 720, os mapas ficaram lado a lado e os três botões da comparação permaneceram visíveis, entre 603 e 650 pixels de altura. O conteúdo da janela usa rolagem própria.
- Em 390 × 844, os mapas ficaram empilhados. A área de conteúdo mediu 280 pixels de largura e não apresentou transbordamento horizontal. Os três botões couberam na janela; Tab e End permitiram acessar o conteúdo e rolar até a tabela. A comparação também foi conferida visualmente na dimensão normal da prévia.

Os testes automatizados usam armazenamento simulado. A conferência visual foi feita no navegador embutido; não houve validação com leitor de tela nem teste em aparelhos físicos ou outros navegadores.

## Registro da versão 1.5.2

Data: 14/09/2026.

## Ajustes de apresentação da versão 1.5.2

- O botão Estudar e suas referências na interface foram removidos, incluindo a janela e seus estilos exclusivos. O guia ESTUDO.md permanece na documentação.
- A ilustração de abertura e sua legenda tiveram as rotações decorativas retiradas. As imagens e as animações de caminhada foram preservadas.
- Passaram 64/64 testes de regras e 40/40 testes de integração, totalizando 104. O caso exclusivo da janela Estudar foi retirado da suíte porque esse controle deixou de existir; os demais fluxos continuam cobertos.
- A sintaxe dos scripts alterados e 22 referências locais foram verificadas. A busca não encontrou referências ativas a study ou showStudy no HTML, CSS, scripts ou testes.

Esta rodada foi conferida por leitura do código, verificações estáticas e testes automatizados. As medições e conferências visuais abaixo pertencem às versões indicadas em cada seção.

## Acabamento da versão 1.5.1

As suítes foram executadas novamente: 64/64 testes de regras e 41/41 de integração passaram, totalizando 105. A sintaxe de main.js, 22 referências locais e os três PNGs também foram conferidos. Regras, fases, salvamento e escolha de pistas são idênticos aos arquivos da versão 1.5.

Na fase 5 vazia, a explicação foi aberta por clique na posição visível de “Ver pista de Lia”, a partir do topo da página. No navegador embutido, o texto completo ficou na tela, o mapa continuou inteiro visível e o foco permaneceu em reachSummary:

| Janela | Rolagem ao abrir | Topo e fim do mapa | Fim da explicação |
| --- | --- | --- | --- |
| 1280 × 720 | 193 px | 96,05 a 500,05 px | 711,81 px |
| 1366 × 768 | 145 px | 144,05 a 584,05 px | 759,81 px |
| 1280 × 650 | 199 px | 26,36 a 430,36 px | 642,13 px |

Fechar a pista preservou a posição da rolagem nos três casos. Em 390 × 844, abrir a explicação não solicitou rolagem automática; o painel permaneceu recolhível e o texto coube na tela, mantendo o comportamento do celular.

Na fase 3 sem a rampa, setas reais moveram o foco para a árvore ao lado da escada marcada, depois para a própria escada e para uma célula do alcance. O contorno escuro #233c32 ficou separado do laranja #b45309, e a marca “?” e a letra E foram preservadas. Houve conferência visual e leitura dos estilos aplicados; não foi usado leitor de tela.

## Verificação da versão 1.5, em 13/09/2026

- Passaram 64/64 testes de regras e 41/41 testes de integração: 105 ao todo. Os quatro novos casos verificam a pista do tutorial, o desempate sem alterar os dados, a troca de morador e a limpeza da marca, do anúncio e da explicação após uma edição válida.
- A verificação de sintaxe dos scripts passou; 22 referências locais, os três PNGs e os IDs de HTML foram conferidos. Core, os dados das fases e o salvamento são idênticos aos arquivos da versão 1.4.
- O painel de alcance passou para os controles. Os nomes ficam em uma linha rolável; a explicação pode ser aberta em “Ver pista”. Desfazer e Reiniciar dividem uma linha no computador para manter os controles compactos.
- A marca laranja com “?” coincide com a barreira citada no texto. Na fase 1 vazia, indica linha 3, coluna 3. Na fase 3 sem rampa central, indica a escada na linha 4, coluna 4, e o alcance contém cinco células. Esses casos foram conferidos no navegador embutido.
- Construir a rampa removeu o painel e todas as marcas anteriores. A fase 3 terminou com 760 pontos. Abrir Como jogar durante outra chegada e fechar com Escape apresentou a vitória pendente.
- O anúncio de alcance fica fora do conteúdo recolhido. Sua presença e texto foram conferidos no DOM; não houve teste com leitor de tela.

Na fase 5 vazia, as medidas abaixo foram tomadas antes e depois de Testar rotas, mantendo a página no topo. Em seguida, foi selecionado o alcance de Rosa. Os cliques de medição usaram as posições visíveis dos botões, pois os cliques por localizador deste navegador podem rolar a página automaticamente.

| Janela | Fim do mapa antes | Fim do mapa depois | Fim da célula de Rosa | Fim do painel recolhido |
| --- | --- | --- | --- | --- |
| 1280 × 720 | 693,05 px | 693,05 px | 645,05 px | 707,88 px |
| 1366 × 768 | 729,05 px | 729,05 px | 677,05 px | 707,88 px |
| 1280 × 650 | 629,36 px | 629,36 px | 581,36 px | 644,19 px |

Em 390 × 844, o topo do mapa permaneceu em 381,61 px antes e depois da falha. Os controles fixos passaram de 161,97 para 275,97 px de altura, com a pista recolhida. Ficaram visíveis cerca de quatro fileiras do mapa, contra cerca de duas na regressão da versão 1.4. A página mediu 375 px de largura, sem transbordar a janela. A pista de Rosa foi aberta e seu texto ficou legível. Essa tela pequena ainda exige rolagem vertical e horizontal para explorar todo o mapa; não se afirma que ele inteiro caiba junto dos controles.

## Histórico da versão 1.4

As observações abaixo foram registradas em 12/09/2026 e continuam como histórico. As medidas de layout atuais estão na tabela acima.

### Resultados anteriores

- 64/64 testes de regras passaram com Node.js: cinco soluções originais, quatro alternativas, metas de economia e percurso, alcance, fronteiras bloqueadas, custos, resultados e salvamento.
- 37/37 testes de integração com interface simulada passaram. Os novos casos cobrem Concluir chegada, escolha da própria fase, diagnóstico sem animação, troca de alcance mantendo foco, remoção de pistas após editar e fechamento da campanha com os dois selos.
- Todos os arquivos JavaScript passaram pela verificação de sintaxe.
- As imagens e referências locais de HTML foram verificadas no disco.
- O servidor local respondeu HTTP 200. Nesta atualização, as fases 3 e 5 foram concluídas no navegador embutido por cliques nas ferramentas e no tabuleiro.
- Na fase 3 sem rampa, o alcance de Caio destacou exatamente cinco células e a pista indicou linha 4, coluna 4. Não houve animação obrigatória nem botão bloqueado. Construir a rampa removeu o diagnóstico anterior; Concluir chegada abriu a vitória.
- Durante uma nova vitória na fase 3, escolher a própria fase no seletor preservou o resultado. Em outra tentativa, abrir Como jogar e pressionar Escape também mostrou a vitória pendente.
- A fase 5 foi concluída com custo 20, percursos de 6, 8 e 10 passos, 760 pontos e os dois selos. A pergunta final sobre caminhos do dia a dia foi exibida.

## Como repetir

No navegador, abra tests/index.html para executar os 64 testes de regras.

Com Node.js, execute na raiz do projeto:

```powershell
node tests/run-tests.cjs
node tests/interface.cjs
```

Também é possível usar npm test para executar os dois grupos. O armazenamento é simulado nos testes; eles não alteram o progresso real do jogador.

## Casos de comparação confirmados

| Fase | Solução | Gasto | Passos por morador |
| --- | --- | --- | --- |
| 3 | Rampa central | 8 | Lia 8; Caio 8 |
| 3 | Passagem lateral | 8 | Lia 4; Caio 12 |
| 4 | Faixa e rampa | 11 | Caio 10 |
| 4 | Passeio no contorno | 7 | Caio 12 |
| 5 | Com rampa | 22 | Lia 10; Caio 8; Rosa 10 |
| 5 | Pela passagem existente | 20 | Lia 10; Caio 10; Rosa 10 |
| 5 | Dois selos juntos | 20 | Lia 6; Caio 8; Rosa 10 |

As metas de gasto 3, 9, 8, 7 e 20 são alcançáveis, respectivamente. Estes exemplos não provam um mínimo global.

## Compatibilidade

Nesta atualização, regras, mapas, orçamentos, soluções e salvamento não foram alterados. As soluções originais continuam nos dados. O formato de salvamento continua na versão 1. Pontuações anteriores são preservadas. O selo de Economia usa o recorde de pontos; os selos de Percursos curtos ficam em shortBest. Dados danificados são recuperados por partes, sem apagar todos os recordes.

## Limites e conferência manual

A tabela da versão 1.5 mede o diagnóstico com a explicação recolhida. Na versão 1.5.1, abrir a explicação no computador solicita a rolagem necessária para lê-la, como registrado na primeira tabela. Isso não desloca o mapa dentro da página. O destaque identifica uma barreira real; a escolha por tipo e distância geométrica não prova a solução mais barata nem um caminho completo.

Os 105 testes cobrem regras e fluxos simulados. A interrupção de requestAnimationFrame sem evento de visibilidade é simulada de forma determinística; isso não reproduz toda forma de suspensão de um navegador real. Nenhum código da página pode agir enquanto toda a execução estiver congelada.

As três imagens PNG foram inspecionadas antes e depois do redimensionamento. Os arquivos de 320 × 320 pixels preservam o canal alfa e somam 219.436 bytes, contra 2.172.461 bytes dos originais. Elas foram conferidas também dentro do jogo; a inspeção dos arquivos no tamanho nativo permite observar os detalhes em 320 pixels, mas não equivale a testar toda a interface com zoom de 200%.

Esta conferência não substitui testes com leitores de tela nem garante compatibilidade com todos os navegadores. Escape foi verificado no navegador embutido; não foi repetido em Firefox ou Chrome externo. As demais fases foram cobertas pelos testes e pelas verificações das versões anteriores, sem repetir toda a campanha manualmente nesta rodada.

- Reabra index.html ou atualize a página que já estava aberta.
- Confira os três personagens na abertura e a chegada deles ao destino.
- Teste escadas, rampas, travessias e caminhos alternativos.
- Confira se as falas, orçamento, passos e selo correspondem à solução.
- Recarregue a página e use Continuar.
- Teste Tab, setas, Enter, Espaço e Escape; experimente uma tela pequena.
- Durante uma vitória, abra ajuda ou fases e feche a janela: o resultado deve aparecer. Confirme também que trocar de fase não reapresenta a vitória anterior.
- Faça uma tentativa incompleta, observe o alcance e corrija uma peça. O destaque antigo deve desaparecer.
- Use Concluir chegada e verifique que o resultado aparece apenas uma vez.
- Ative movimento reduzido nas preferências do sistema e confira a chegada sem animação.
- Abra a cópia baixada sem internet, mantendo assets, css e js junto do HTML.
