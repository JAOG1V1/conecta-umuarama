# Como contribuir

O **Conecta Umuarama — Uma cidade para todos** é um jogo de lógica sobre mobilidade. Para conhecer o projeto, veja o [README](README.md); para entender o código, consulte [DEVELOPMENT.md](DEVELOPMENT.md) e a [arquitetura](docs/ARQUITETURA.md).

## Relatar um problema

Abra uma [issue](https://github.com/JAOG1V1/conecta-umuarama/issues) com:

- Fase e passos necessários para reproduzir o problema.
- Resultado esperado e resultado observado.
- Navegador, sistema e dispositivo, indicando se usou a cópia local ou o jogo publicado.
- Captura de tela, quando ajudar a explicar o comportamento.

Para problemas de salvamento, informe se houve recarregamento, troca de navegador ou limpeza dos dados. Evite incluir dados pessoais nas imagens ou no relato.

## Propor uma alteração

Mantenha cada pull request focado em um problema ou melhoria. Descreva o que mudou, o motivo e como o comportamento foi verificado. Para sugestões, explique a dificuldade do jogador e dê um exemplo de como a mudança ajudaria.

Preserve o funcionamento com arquivos locais, a ausência de dependências externas, os controles por teclado e a preferência de movimento reduzido. Use a organização existente de regras, fases, persistência e interface.

Antes de enviar uma alteração de código, execute:

```sh
npm test
```

O comando requer Node.js e não precisa de instalação de pacotes. Verifique também o fluxo afetado em um navegador; os testes de interface simulada não comprovam aparência nem acessibilidade completa. Inclua um teste de regressão quando houver uma falha de lógica ou de fluxo que possa ser reproduzida automaticamente.

Preserve a [licença](LICENSE) e os [créditos](docs/CREDITOS.md). Identifique a origem de novos recursos e a assistência de ferramentas quando houver. Não inclua credenciais, salvamentos pessoais ou arquivos temporários no pull request.
