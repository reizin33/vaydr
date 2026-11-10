# VAYDR

Jogo de sobrevivência em mundo aberto com zumbis: mata, cidade abandonada, subsolo, veículos, construção de base,
fabricação, caça, criação de animais, clima e estações. Motor 3D próprio em WebGL2, sem engine externa.

## Como está organizado

- `jogo/src/` — o jogo inteiro, em módulos numerados (`00_core.js` … `70_main.js`) e a página (`page.html`).
  A ordem do nome é a ordem em que os módulos entram no jogo.
- `jogo/build.py` — junta os módulos numa página só: gera `vaydr.html` (o jogo), `jogo/test.html` (para os testes)
  e a pasta `site/` (versão instalável pelo navegador, que sai quando o jogo virar programa de PC).
- `jogo/run.py` e `jogo/tools/` — testes automáticos: cada `pNNN_*.py` monta um roteiro que joga de verdade
  (Playwright + Chromium) e grava o resultado em `.out.json`.
- `ferramentas/choques.py` — confere nomes definidos mais de uma vez entre os módulos.

## Gerar o jogo

```bash
cd jogo
python3 build.py              # vaydr.html, test.html e site/
SAIDA=x.html python3 build.py # só uma página de teste (x.html)
```

## Rodar um teste

```bash
cd jogo
python3 tools/p205_salvar.py              # gera o roteiro p205.json
SEMFOTO=1 SRC=test.html python3 run.py p205.json rapido
```

## Comparar duas versões

Em toda etapa roda a bateria rápida (25 testes, um ou dois de cada sistema) na versão anterior e na nova, e o comparador
mostra só o que mudou:

```bash
cd jogo
git worktree add ../../vaydr-main main && (cd ../../vaydr-main/jogo && SAIDA=x_base.html python3 build.py) && cp ../../vaydr-main/jogo/x_base.html .
SAIDA=x_novo.html python3 build.py
python3 tools/bateria.py rapida base=x_base.html novo=x_novo.html   # saídas em logs/base e logs/novo
python3 tools/comparar.py logs/base logs/novo
```

`python3 tools/bateria.py borda ...` roda os testes da borda do mapa, do anel da cidade, das regiões e da Mata dos Morros.

## Próximos passos

O plano (versão de PC com Electron, instalador, atualização automática, telas novas e multiplayer por LAN e Radmin VPN)
está no documento "VAYDR — Documento de design", aba Etapas.
