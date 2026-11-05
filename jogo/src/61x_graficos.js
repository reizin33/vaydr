/* ================= Etapa 21: gráficos feitos por código — opções e contador de quadros =================
   O que mudou no desenho (00_core, 40_game, 50_render, 15_cidade_geo):
   · materiais: no Alto e no Ultra as superfícies ganham relevo (a luz rasante mostra a textura do ruído), brilho de verdade
     por material (metal e pedra brilham, folha e madeira quase nada), tijolo com argamassa, folha com luz atravessando
     contra o sol, pedra com grão e trinca; o chão ganha relevo (mais na rocha) e a areia da praia tem grão e marcas de vento;
     com chuva, o que está ao ar livre molha (escurece e brilha).
   · níveis de gráfico (GRAF): cada um muda de verdade as distâncias (árvores com detalhe de perto e versão leve de longe,
     prédios com o modelo de perto, construções, zumbis e bichos), a quantidade de mato, as luzes ao mesmo tempo, a resolução
     e o alcance das sombras, o detalhe dos materiais e os efeitos (MSAA, bloom, oclusão, raios de sol).
   · Ajustes: explicação do que cada nível muda e o contador de quadros por segundo. */
{const g=$('aj-graf'),op=g&&g.closest('.opcao');
 if(op&&!$('aj-fps'))op.insertAdjacentHTML('afterend','<p class="aj-nota" id="aj-graf-nota" style="margin:2px 0 10px;font-size:.85em;opacity:.78;line-height:1.35">Baixo: sem sombra, menos mato e vista mais curta. Médio: sombra simples. Alto: sombra em duas distâncias, relevo e brilho nos materiais, oclusão e raios de sol. Ultra: mais longe, mais mato, sombras maiores e mais nítidas.</p>'
   +'<div class="opcao"><span class="rot">Mostrar quadros por segundo (FPS)</span><div class="segs" id="aj-fps"><button type="button" data-v="0">Não</button><button type="button" data-v="1">Sim</button></div></div>');}
{const _aj=ajustesUI;ajustesUI=function(){const r=_aj.apply(this,arguments);const el=$('aj-fps');if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(cfg.fps?1:0))));return r;};
 const el=$('aj-fps');if(el)el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg.fps=b.dataset.v==='1';saveCfg();ajustesUI();sfx('clique');});}
{const d=document.createElement('div');d.id='fps-hud';d.hidden=true;
  d.style.cssText='position:fixed;right:max(10px,env(safe-area-inset-right,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:6;font:600 12px/1.2 system-ui,sans-serif;color:#e8e4d8;background:rgba(10,14,12,.6);padding:3px 7px;border-radius:6px;pointer-events:none';
  document.body.appendChild(d);}
let fpsN=0,fpsT0=performance.now();
HUDS.push(()=>{const el=$('fps-hud');if(!el)return;const on=!!cfg.fps&&(G.modo==='jogo'||G.modo==='morto');if(el.hidden===on)el.hidden=!on;if(!on)return;fpsN++;
  const t=performance.now(),dt=t-fpsT0;if(dt<500)return;const q=fpsN,fps=q*1000/dt;fpsN=0;fpsT0=t;el.textContent=Math.round(fps)+' FPS · '+(dt/Math.max(1,q)).toFixed(1)+' ms · '+({baixo:'Baixo',medio:'Médio',alto:'Alto',ultra:'Ultra'}[cfg.graf]||cfg.graf);});

const PX_SYNC=new Uint8Array(4);   // testes: lê um pixel depois do desenho para medir o tempo da placa de vídeo junto
