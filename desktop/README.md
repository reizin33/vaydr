# VAYDR para PC (Windows)

O jogo dentro de uma janela própria (Electron). É a mesma página do jogo (`jogo/`), com:

- **Instalador**: `VAYDR-Setup-<versão>.exe`. Ele instala na pasta do usuário, sem pedir senha de administrador, e cria atalhos.
- **Sem internet**: as fontes vão dentro da página (`preparar.mjs`).
- **Tela cheia**: F11 ou Alt+Enter alternam, e o jogo lembra a escolha.
- **Salvar ao fechar**: o jogo salva antes de a janela fechar.
- **Saves**: ficam no PC, na pasta de dados do VAYDR (`%APPDATA%\VAYDR`). Eles passam de uma versão para a outra.
- **Fotos e cópias do save**:
  - As fotos vão para `Imagens\VAYDR`.
  - A cópia do save abre a janela de salvar, já em `Documentos\VAYDR`.
- **Atualização automática**:
  - O jogo procura versão nova nas Releases do GitHub e baixa sozinho.
  - A atualização entra quando o jogo fecha. Também dá para reiniciar na hora pelo menu.
- **Registro de problemas**: fica em `%APPDATA%\VAYDR\vaydr.log`.

## Como sai uma versão nova

1. Mude o jogo normalmente, em `jogo/src`.
2. No GitHub, abra **Actions > VAYDR para Windows > Run workflow** e escreva a versão (ex.: `9.9.1`).
   Enviar a etiqueta `v9.9.1` faz a mesma coisa.
3. O GitHub monta o instalador e testa o jogo aberto num Windows da nuvem. O teste começa um jogo, salva, fecha, reabre e continua. Se tudo passar, ele publica a versão em Releases.
4. Quem já tem o VAYDR instalado recebe a versão nova sozinho.

Com a versão vazia, o workflow só monta e testa, sem publicar. O instalador e as fotos do teste ficam nos artefatos da execução.

O workflow **Teste da atualização automática** instala uma versão antiga num Windows da nuvem e confere que ela se atualiza sozinha para a mais nova publicada.

## Steam

A Steam atualiza os jogos por conta própria, então a versão da Steam é montada **sem** a atualização automática:

- Rode o workflow com a opção **steam** marcada. Assim ele monta e testa, sem publicar em Releases.
- Ou monte com `-c.extraMetadata.vaydr.atualizacaoAutomatica=false`.

## Testes de fumaça (usados pelo GitHub)

`VAYDR.exe --smoke=1`, `--smoke=2`, `--smoke=atualizacao` e `--smoke=versao` gravam os relatórios e as fotos na pasta da variável `VAYDR_TESTE_SAIDA`. Num computador sem placa de vídeo, use também `VAYDR_GL=swiftshader`.

`VAYDR.exe --depurar` abre as ferramentas do Chromium para investigar problemas.

## Assinatura

O instalador ainda não tem assinatura digital, porque ela é paga. Por isso, na primeira vez, o Windows mostra "O Windows protegeu o computador". É só clicar em **Mais informações** e depois em **Executar assim mesmo**.
