"""p171g: refaz as fotos da Etapa 12 que mudaram: o manual com o índice na lateral, a malha com as fileiras de anéis (frente e costas),
a roupa suja com a cor nova e a sala de uma casa antes e depois de desmontar a mesa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const RI=f=>X('RECIPES').findIndex(r=>r.faz===f),inv=(id,n,ex)=>X('invAdd')(id,n,ex),veste=id=>{X('invAdd')(id,1);X('vestir')(P.inv.findIndex(q=>q&&q.id===id));},"
     "frente=(d,h,a)=>{const yw=P.body+(a||0);G.camFix={pos:[P.x+Math.sin(yw)*d,P.y+h,P.z+Math.cos(yw)*d],tgt:[P.x,P.y+0.95,P.z],fov:0.8};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);G.hora=10;G.noite=false;n.cfg.cam='3';"
        "X('acharManual')('tratadoArmeiro');inv('aneisFerro',2);inv('couroCurtido',1,{q:2});inv('linha',2);X('abrirManual')('jogo');X('mnSec=\"roupas\"');X('mnSel=\"r'+RI('peitoralMalha')+'\"');X('manualRender')(true);")]
s += foto('p171_manual.png', H + "X('tela')('t-manual');", 0, 2.0)
s += [j("X('mnSec=\"agua\"');X('mnSel=\"x:aguaAuto\"');X('manualRender')(true);")]
s += foto('p171_manual_agua.png', H + "X('tela')('t-manual');", 0, 2.0)
s += [j("X('tela')(null);G.modo='jogo';const x=F[0]+6,z=F[2]+22;vai(x,z);P.yaw=0;P.body=0;P.pitch=0;for(const id of['capaceteMalha','peitoralMalha','calcaMalha'])veste(id);"), ["gwait", 0.6]]
s += foto('p171_malha_frente.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
s += foto('p171_malha_costas.png', H + "frente(2.3,1.5,Math.PI-0.35);", 0.3, 4.0)
s += [j("G.camFix=null;for(const sl of['cabeca','tronco','pernas'])X('tirarRoupa')(sl);P.inv=P.inv.map(q=>q&&['capaceteMalha','peitoralMalha','calcaMalha'].includes(q.id)?null:q);veste('casacoGrande');veste('calcaCouro');"
        "X('roupaInfoDe')('tronco').suj=0.95;X('roupaInfoDe')('pernas').suj=0.9;"), ["gwait", 0.4]]
s += foto('p171_suja.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
# sala de um prédio: a mesa antes e depois de desmontar
s += [j("G.camFix=null;X('recupMontar')();const R=X('RECUP');const L=Object.values(R.alvos).filter(q=>q.tipo==='movel'&&q.m.k==='mesa'&&q.col&&!q.m.removido);"
        "const T=L.find(q=>{const S=q.m.s;return(S.u1-S.u0)>3.2&&(S.v1-S.v0)>3.2;})||L[0];window.__mv=T;const p=R.pts.find(q=>q.alvo===T);window.__mp=p;inv('machado',1);"
        "const m=T.m,S=m.s,c=X('pw')(m.p,(S.u0+S.u1)/2,(S.v0+S.v1)/2);window.__sc=c;vai(p.x+40,p.z+40);"), ["gwait", 0.4]]
s += foto('p171_sala_antes.png', H + "const p=window.__mp,c=window.__sc;const yw=Math.atan2(p.x-c[0],p.z-c[1]),d=Math.hypot(p.x-c[0],p.z-c[1])+1.6;"
              "G.camFix={pos:[p.x-Math.sin(yw)*d,p.y+1.9,p.z-Math.cos(yw)*d],tgt:[p.x,p.y+0.45,p.z],fov:1.15};", 0.4, 4.0)
s += [j("X('recupConcluir')(window.__mp);")]
s += foto('p171_sala_depois.png', H + "", 0.3, 4.0)
salvar('p171g.json', s)
