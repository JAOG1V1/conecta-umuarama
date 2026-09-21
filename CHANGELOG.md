# Histórico de versões

Mudanças do Conecta Umuarama, da mais recente para a mais antiga. As datas aparecem quando estão registradas nas verificações do projeto. Este histórico foi organizado a partir da documentação existente; não representa uma sequência de commits antigos no GitHub.

## 1.7.0 — 21/09/2026

### Adicionado

- Prévia de construção ao apontar ou focar uma célula, com custo, reembolso, saldo resultante e motivo de impedimento. O módulo Building reutiliza as regras do jogo sem alterar o tabuleiro.
- Indicação das células disponíveis para a ferramenta selecionada.
- Refazer, com botão e atalhos de teclado, além dos atalhos 1–4 para selecionar ferramentas. Atalhos respeitam diálogos abertos e campos editáveis.
- Um rascunho por fase, preservado ao alternar entre tabuleiros, com indicação de obra guardada no seletor.
- Resumo da campanha com cinco fases, oito selos, pontos dos recordes e sugestão da próxima conquista.
- Ação Guardar e experimentar após vitórias fora do tutorial, com confirmação antes de substituir uma referência diferente.
- Testes específicos do resumo e dos cartões da campanha em `tests/campaign.cjs`, incluídos em `npm test`.

### Alterado

- Salvamentos anteriores são migrados para preservar o tabuleiro ativo como rascunho da fase correspondente; a recuperação conserva os rascunhos válidos mesmo se outra parte estiver danificada.
- Continuar e os tabuleiros por fase permanecem disponíveis em memória quando o navegador não permite gravar o progresso.
- Reiniciar pede confirmação e limpa apenas a obra da fase escolhida, preservando outros tabuleiros, referências e recordes.
- Documentação atualizada para os controles, a prévia, os rascunhos e os 12 scripts do jogo.

## 1.6.2 — 20/09/2026

### Alterado

- Documentação pública organizada por finalidade: jogar, compreender o código, contribuir e consultar créditos e verificações.
- Conteúdo técnico do guia de estudo consolidado em ARQUITETURA.md, com estado, busca de rotas, comparação e persistência.
- Créditos do jogo revisados, mantendo responsáveis e origem dos recursos, sem campos pendentes ou orientações de preparação.
- Roteiro de apresentação, modelo de diário, exercícios e instruções de publicação retirados da distribuição pública.
- Histórico de melhorias consolidado neste arquivo.

### Adicionado

- Verificação automática dos testes existentes em alterações enviadas ao GitHub e em pull requests.
- Metadados de licença e endereço do projeto em package.json.

## 1.6.1 — 16/09/2026

### Adicionado

- Guias de desenvolvimento e contribuição, com a estrutura real do código e os comandos de teste.
- Histórico resumido de versões neste arquivo.
- Página 404 com a identidade visual do jogo e retorno à página inicial no GitHub Pages, incluindo endereços inexistentes em subpastas.
- Cópia local da licença MIT já publicada no repositório.

### Alterado

- README reorganizado com acesso direto ao jogo, instruções, regras, responsáveis e links para a documentação.
- Separação entre os registros históricos de melhorias e as instruções atuais de verificação.

Esta atualização organiza a documentação e a página de endereço não encontrado. A jogabilidade e o formato de salvamento continuam os mesmos da versão 1.6.0.

## 1.6.0 — 15/09/2026

### Adicionado

- Comparação entre A, uma construção guardada, e B, o tabuleiro atual, com mapas, gasto e passos por morador.
- Referências salvas separadamente para cada fase e recuperação de A no mapa, com confirmação e possibilidade de desfazer.
- Tratamento de comparações incompletas e de armazenamento bloqueado ou danificado.
- Testes da comparação e documentação do recurso.

## 1.5.2 — 14/09/2026

### Alterado

- Ilustração de abertura e legenda alinhadas, sem a inclinação decorativa.
- Botão Estudar retirado da interface; as explicações técnicas estão em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).
- Remoção do teste exclusivo da janela Estudar, preservando os demais fluxos.

## 1.5.1

### Corrigido

- Abrir uma pista no computador passou a trazer sua explicação para a área visível, mantendo o foco no controle.
- Contorno de teclado no mapa separado da marca laranja da pista, preservando o símbolo “?” quando ambos aparecem na mesma célula.

## 1.5.0 — 13/09/2026

### Alterado

- Diagnóstico de rota bloqueada movido para os controles, evitando deslocar o mapa ao falhar.
- Moradores selecionáveis pelo nome e explicação recolhível em Ver pista.
- Marca laranja com “?” na célula citada e limpeza do diagnóstico depois de editar.
- Desempate das pistas por proximidade ao destino, depois por linha e coluna, mantendo a prioridade de tipo de barreira.
- Mensagens mais claras para moradores sem saída da própria casa e para listas de nomes.

## 1.4.0 — 12/09/2026

### Adicionado

- Alcance do morador e pista de uma barreira adjacente quando uma rota falha.
- Botão Concluir chegada para encurtar a animação.
- Alternativa da fase 5 que conquista os dois selos na mesma solução e pergunta final sobre caminhos reais.

### Corrigido

- Escolher a fase já aberta passou a preservar a partida e uma vitória pendente.
- Dica de rolagem e legenda curta reposicionadas para facilitar o uso em telas pequenas.

### Otimizado

- Três imagens reduzidas de 1254 × 1254 para 320 × 320 pixels, preservando transparência e desenhos. O conjunto passou de 2.172.461 para 219.436 bytes.

## 1.3.0

### Adicionado

- Metas de gasto e passos visíveis durante a partida, com percursos reavaliados após Testar rotas.
- Legenda curta com símbolos de obra, escada e rampa; foco visível e indicação de rolagem do mapa.
- Temporizador de proteção para a conclusão da animação.

### Corrigido

- Vitória preservada ao abrir e fechar janelas informativas durante a chegada.
- Cancelamento de resultados antigos ao editar, reiniciar ou trocar de fase.
- Layout mais compacto em computadores com pouca altura e tratamento de resultados com rotas incompletas.
- Novas vitórias no tutorial deixaram de gravar o selo oculto de percurso, mantendo compatibilidade com dados antigos.

## 1.2.0

### Adicionado

- Selos distintos de Economia e Percursos curtos, avaliando cada morador e preservando conquistas de partidas anteriores.
- Falas de chegada relacionadas ao caminho realmente percorrido.
- Recuperação parcial do salvamento, preservação de recordes válidos e cópia local dos dados recuperados.

### Alterado

- Interface reorganizada para computador e celular, com obras do jogador identificadas e mapa rolável quando necessário.
- Separação dos textos, desenhos, falas e painéis nos módulos Help, Art, Story e Views.
- Validação do desbloqueio das fases, gravação dos dados e inserção segura de textos nos painéis.

## Registros complementares

- [Arquitetura e decisões técnicas](docs/ARQUITETURA.md)
- [Testes, datas, medidas e limites da verificação](docs/VERIFICACAO.md)
