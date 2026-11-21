# Etapa 5b (armas) e atualização automática — trabalho em andamento (21/11/2026)

Parado a pedido do Himalaia até o limite renovar. Nada disto está em `godot/` ainda: são cópias dos arquivos como estavam.
Para continuar, copie `godot/` desta pasta por cima de `godot/` do repositório (e mude `VERSAO` em `scripts/telas.gd`).

## O que já está escrito (sem teste na nuvem)
- `scripts/armas.gd`: números do balanço do jogo antigo (pistola, espingarda, rifle, besta, arco, arremessos), região do corpo
  pelo ponto do tiro, queda com a distância, abertura do tiro.
- `scripts/projeteis.gd`: flechas e virotes (voam, cravam, recolhe passando por cima), molotov (fogo no chão), bomba caseira
  (pavio 2,5 s, explosão 5,2 m), isca (12 s chamando zumbis).
- `scripts/modelos_armas.gd`: modelos feitos de peças (espingarda, rifle com luneta, besta, arco, molotov, bomba, isca).
- `scripts/jogador.gd`: atirar (botão esquerdo), mirar (direito), recarregar (R), coice, arco (segura e solta), arremesso.
- `scripts/zumbi.gd`: pegar fogo (16/s, passa para o do lado), flechas cravadas caem quando morre.
- `scripts/hud.gd`: munição "8 / 24", mira que abre e fecha, X do acerto (vermelho na cabeça), tela da luneta.
- `scripts/atualizador.gd` (+ `telas.gd`, autoload `Atualiza` no `project.godot`, teste `_teste_atualiza` no `main.gd`):
  atualização automática pelas versões `godot-vX.Y.Z` do GitHub.

## Falta
1. Ler as falhas do teste dos zumbis (etapa 5a, commit 5b3b9e7): o registro se perdeu nos cancelamentos. Rodar de novo.
2. Atualização automática: o Godot deixa o próprio .exe aberto (o pacote do jogo fica dentro dele) sem permitir renomear;
   trocar o .exe só depois de o jogo fechar, com um PowerShell que espera o processo sair, move o .novo por cima e abre de novo.
3. Teste das armas (`_teste_armas`) e fotos (pistola mirando, luneta, voadora, tipos de zumbi).
4. Etapa 5c (Colosso da lua de sangue) e a etapa 6.
