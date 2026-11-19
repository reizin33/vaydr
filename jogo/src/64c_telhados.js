/* ================= Telhados da cidade para correr por cima (v10.5.1, 19/11/2026) =================
   Pedido do Himalaia: mapa e jogabilidade parecidos com o Dying Light, "correr por cima". Os prédios já tinham telhado de
   andar (a escada de dentro, a escada de incêndio e as passarelas de tábua); as casas da cidade não: o telhado de duas águas
   (14b, cumeeira paralela à fachada, 1,5 m de altura) era só desenho. Agora as duas águas são chão inclinado: correndo, dá
   para subir no telhado da casa de 1 andar (64_parkour sobe até 3,6 m correndo), andar até a cumeeira, descer do outro lado e
   pular para a casa vizinha. Zumbi não sobe: em cima dos telhados é o lugar seguro da cidade. Em cima do telhado o lugar conta
   como rua (14_cidade: salaEm), para a câmera não achar que está dentro da casa. A cidade nasce no buildWorld (50_render),
   depois de todos os arquivos: os telhados entram logo depois. */
PK_CFG.maxCorrendo=3.6;   // a beira do telhado de uma casa da cidade fica a uns 3,2 m da calçada
const TELHADOS={casas:0,hr:1.5};
function telhadosCasas(){if(typeof CID==='undefined'||!CID.predios)return;const hr=TELHADOS.hr,e=0.06;
  for(const p of CID.predios){if(!p.casa||p.rural||p.lajeTopo||typeof p.yTopo!=='number')continue;const yT=p.yTopo,D=p.D,W=p.W;
    /* as duas águas: da beira (-0,45 m na frente, D+0,45 atrás) até a cumeeira no meio, na altura de cima das telhas */
    p.lajeTopo=[ramL(p,-0.4,W+0.4,-0.45,D/2,yT+e,yT+hr+e),ramL(p,-0.4,W+0.4,D/2,D+0.45,yT+hr+e,yT+e)];TELHADOS.casas++;}}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{telhadosCasas();}catch(e){console.error('telhados',e);}return r;};}
