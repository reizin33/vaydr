"""p171f: fotos da Etapa 12. Manual de Sobrevivência (receita bloqueada e liberada), mesa de estudo e bancada de desmanche,
o jogador com a armadura de malha (frente e costas), com a jaqueta e a calça reforçadas, com roupa suja, segurando E num carro
abandonado (barra de desmontar), a sala antes e depois de desmontar a mesa e o baú do ferreiro ao lado da fornalha velha."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const RI=f=>X('RECIPES').findIndex(r=>r.faz===f),inv=(id,n,ex)=>X('invAdd')(id,n,ex),veste=id=>{X('invAdd')(id,1);X('vestir')(P.inv.findIndex(q=>q&&q.id===id));},"
     "frente=(d,h,a)=>{const yw=P.body+(a||0);G.camFix={pos:[P.x+Math.sin(yw)*d,P.y+h,P.z+Math.cos(yw)*d],tgt:[P.x,P.y+0.95,P.z],fov:0.8};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;n.cfg.cam='3';")]
# manual: bloqueada e liberada
s += [j("X('abrirManual')('jogo');X('mnSec=\"roupas\"');X('mnSel=\"r'+RI('peitoralMalha')+'\"');X('manualRender')(true);")]
s += foto('p171_manual_bloqueada.png', H + "X('tela')('t-manual');", 0, 2.0)
s += [j("X('acharManual')('tratadoArmeiro');inv('aneisFerro',2);inv('couroCurtido',1,{q:2});inv('linha',2);X('mnCache=null');X('manualRender')(true);")]
s += foto('p171_manual.png', H + "X('tela')('t-manual');", 0, 2.0)
s += [j("X('tela')(null);G.modo='jogo';")]
# mesa de estudo e bancada de desmanche
s += [j("const x=F[0]+10,z=F[2]+13;vai(x,z+4);X('criarObra')('mesaEstudo',x-1.4,z,0.25);X('criarObra')('bancadaDesmanche',x+1.6,z-0.2,-0.2);G.hora=15;"), ["gwait", 0.5]]
s += foto('p171_oficinas.png', H + "const x=F[0]+10,z=F[2]+13,y=X('ground')(x,z);G.camFix={pos:[x+0.3,y+2.3,z+4.2],tgt:[x+0.1,y+0.75,z-0.1],fov:0.9};", 0.5, 4.0)
# armadura de malha
s += [j("G.camFix=null;const x=F[0]+6,z=F[2]+22;vai(x,z);P.yaw=0;P.body=0;P.pitch=0;for(const id of['capaceteMalha','peitoralMalha','calcaMalha'])veste(id);"), ["gwait", 0.6]]
s += foto('p171_malha_frente.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
s += foto('p171_malha_costas.png', H + "frente(2.3,1.5,Math.PI-0.35);", 0.3, 4.0)
# roupas reforçadas
s += [j("G.camFix=null;for(const sl of['cabeca','tronco','pernas'])X('tirarRoupa')(sl);P.inv=P.inv.map(q=>q&&['capaceteMalha','peitoralMalha','calcaMalha'].includes(q.id)?null:q);veste('jaquetaReforcada');veste('calcaReforcada');veste('botasCouro');"), ["gwait", 0.4]]
s += foto('p171_reforcada.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
# roupa suja (casaco grande e calça de couro bem sujos)
s += [j("G.camFix=null;for(const sl of['tronco','pernas'])X('tirarRoupa')(sl);veste('casacoGrande');veste('calcaCouro');X('roupaInfoDe')('tronco').suj=0.95;X('roupaInfoDe')('pernas').suj=0.9;X('roupaInfoDe')('pes').suj=1;"), ["gwait", 0.4]]
s += foto('p171_suja.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
s += [j("X('roupaInfoDe')('tronco').suj=0;X('roupaInfoDe')('pernas').suj=0;X('roupaInfoDe')('pes').suj=0;")]
s += foto('p171_limpa.png', H + "P.body=0;P.yaw=0;frente(2.3,1.45,0.35);", 0.4, 4.0)
# segurando E num carro abandonado (barra de desmontar no HUD)
s += [j("G.camFix=null;X('recupMontar')();const R=X('RECUP'),it=X('INTER').find(i=>i.id==='vila-carro1');let b=null,bd=1e9;for(const p of R.pts){if(p.alvo.tipo!=='carro')continue;const d=Math.hypot(p.x-it.x,p.z-it.z);if(d<bd){bd=d;b=p;}}"
        "window.__pc=b;inv('kitFerramentas',1);vai(b.x+Math.sin(b.alvo.cond)*0.01,b.z);const dx=b.x-P.x,dz=b.z-P.z;"
        "let c=null,cd=9;for(const q of n.COLL){if(q.t!==1||Math.abs(q.hw-0.95)>0.02||Math.abs(q.hd-2.15)>0.02)continue;const d=Math.hypot(q.x-b.x,q.z-b.z);if(d<cd){cd=d;c=q;}}window.__car=c;"
        "const back=Math.atan2(b.x-c.x,b.z-c.z);vai(b.x+Math.sin(back)*0.6,b.z+Math.cos(back)*0.6);P.yaw=Math.atan2(c.x-P.x,c.z-P.z);P.body=P.yaw;P.pitch=-0.25;"), ["gwait", 0.5]]
s += foto('p171_carro.png', H + "n.alvo=X('interAtual')();n.interagir(false);const c=window.__car,yw=P.body+2.4;G.camFix={pos:[P.x+Math.sin(yw)*3.2,P.y+2.0,P.z+Math.cos(yw)*3.2],tgt:[(P.x+c.x)/2,P.y+0.9,(P.z+c.z)/2],fov:0.95};", 0.15, 1.6)
# sala antes e depois de desmontar a mesa
s += [j("G.camFix=null;P.acao=null;const R=X('RECUP');const T=Object.values(R.alvos).find(q=>q.tipo==='movel'&&q.m.k==='mesa'&&q.col&&!q.m.removido&&q.m.p.rural);window.__mv=T;const p=R.pts.find(q=>q.alvo===T);window.__mp=p;"
        "inv('machado',1);vai(p.x,p.z,p.y);"), ["gwait", 0.4]]
s += foto('p171_sala_antes.png', H + "const p=window.__mp,m=window.__mv.m,S=m.s,c=X('pw')(m.p,(S.u0+S.u1)/2,(S.v0+S.v1)/2);vai(c[0],c[1],p.y);const yw=Math.atan2(p.x-c[0],p.z-c[1]);G.camFix={pos:[c[0]-Math.sin(yw)*1.2,p.y+1.7,c[1]-Math.cos(yw)*1.2],tgt:[p.x,p.y+0.5,p.z],fov:1.1};vai(p.x+50,p.z+50);", 0.4, 4.0)
s += [j("X('recupConcluir')(window.__mp);")]
s += foto('p171_sala_depois.png', H + "", 0.3, 4.0)
# baú do ferreiro
s += [j("G.camFix=null;const b=X('BAU_FERREIRO');vai(b.x+3,b.z+3);"), ["gwait", 0.5]]
s += foto('p171_bau_ferreiro.png', H + "const b=X('BAU_FERREIRO'),f=X('EST_MUNDO').find(e=>e.id==='fornalhaSerra');const mx=(b.x+f.x)/2,mz=(b.z+f.z)/2,y=X('ground')(mx,mz);const a=Math.atan2(b.x-f.x,b.z-f.z)+Math.PI/2;"
              "G.camFix={pos:[mx+Math.sin(a)*4.5,y+2.4,mz+Math.cos(a)*4.5],tgt:[mx,y+0.6,mz],fov:0.95};vai(mx+20,mz+20);", 0.5, 4.0)
salvar('p171f.json', s)
# celular: o manual em tela estreita
m = inicio("window.__turbo=6;window.__semRender=true;")
m += [j("vivo();X('abrirManual')('jogo');X('mnSec=\"couros\"');X('mnSel=\"c:couro\"');X('manualRender')(true);")]
m += foto('p171_manual_cel.png', H + "X('tela')('t-manual');", 0.1, 2.0)
salvar('p171m.json', m, (412, 915))
