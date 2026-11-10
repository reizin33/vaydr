"""p233 (Parte 2): a borda de fora aberta (Mata dos Morros).
1 forma do mapa: pontos dentro e fora (oeste, sul, noroeste abrem; leste, norte do corredor e cidade continuam como antes)
2 a parede de mato fechado está na beira nova (e não mais no círculo, nos lados que abriram)
3 andar para oeste até a beira: passa do antigo limite e para na mata fechada, sem atravessar
4 dirigir a caminhonete para oeste até a beira: para na mata fechada
5 mata nova: árvores com colisão, pedras, moitas, coletáveis, capim; distância entre árvores
6 bichos nas três regiões novas e zumbis andando de dia na faixa
7 região nova reconhecida, salvar e carregar dentro da faixa, mapa grande desenhado sem erro
8 o que já existia continua igual: número de árvores antigas, primeiras árvores no mesmo lugar"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=34;")
s += [js("vivo();window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;};")]
s += [ev("forma", """const dm=X('dentroMapa'),R=X('raioMapaEm'),pts={oeste190:[-190,0],oeste215:[-215,0],sul185:[0,185],sul215:[0,220],noroeste180:[-125,-130],
 norte170:[0,-170],leste170:[0,0],sudeste170:[120,120],corredorAlto:[38,-152],lagoFundo:[86,128]};const r={};
 for(const k in pts){const[x,z]=pts[k];if(k==='leste170'){r[k]={dentro:dm(170*0.95,-60),raio:+R(170*0.95,-60).toFixed(1)};continue;}r[k]={dentro:dm(x,z),raio:+R(x,z).toFixed(1)};}
 return r;""")]
s += [ev("borda", """const B=X('BORDA_PTS'),cnt=(f)=>B.filter(f).length,ang=(q)=>(Math.atan2(q[1],q[0])*180/Math.PI+360)%360,r=q=>Math.hypot(q[0],q[1]);
 return{total:B.length,circuloNoOeste:cnt(q=>Math.abs(ang(q)-180)<20&&Math.abs(r(q)-150)<2),beiraNovaNoOeste:cnt(q=>Math.abs(ang(q)-180)<20&&r(q)>185),
  circuloNoLeste:cnt(q=>(ang(q)<30||ang(q)>330)&&Math.abs(r(q)-150)<2),mataFechada:X('BRENHA').length,colisoresBrenha:X('COLL').filter(c=>c.brenha).length};""")]
# 3 andar para oeste
s += [js("vai(-140,4);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=0;window.__turbo=6;"), ["gwait", 0.3], ["down", "w"], ["gwait", 40], ["up", "w"], ["gwait", 0.3]]
s += [ev("andou", "const r=Math.hypot(P.x,P.z),R=X('raioMapaEm')(P.x,P.z);return{x:r2(P.x),z:r2(P.z),r:r2(r),raioAqui:r2(R),passouCirculo:r>152,naBeira:Math.abs(r-R)<4,dentro:X('dentroMapa')(P.x,P.z),altura:r2(P.y),reg:(X('regiaoEm')(P.x,P.z)||{}).id};")]
# 4 dirigir para oeste
s += [js("const t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');window.__t=t;if(t){t.x=-150;t.z=-14;t.yaw=-Math.PI/2;t.comb=80;X('veicColisor')(t);vai(t.x+2,t.z+2);X('entrarVeic')(t);X('IN').mz=1;}"),
      ["gwait", 12], js("X('IN').mz=0;X('IN').freio=true;"), ["gwait", 2], js("X('IN').freio=false;")]
s += [ev("dirigiu", "const t=window.__t;if(!t)return null;const r=Math.hypot(t.x,t.z),R=X('raioMapaEm')(t.x,t.z);return{x:r2(t.x),z:r2(t.z),r:r2(r),raioAqui:r2(R),passouCirculo:r>152,dentro:X('dentroMapa')(t.x,t.z,-1),ativo:X('CARRO').ativo};"),
      js("X('sairCarro')&&X('sairCarro')();")]
# 5 mata nova
s += [ev("mata", """const T=X('TREES'),inf=X('MORROS_INFO'),noAnel=T.filter(t=>t.morros);let viz=1e9;for(let i=0;i<Math.min(400,noAnel.length);i++){const a=noAnel[i];for(const b of noAnel){if(a===b)continue;const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<viz)viz=d;}}
 const col=X('COLL').filter(c=>c.tree&&c.tree.morros).length;return{info:inf,arvoresNovas:noAnel.length,comColisao:col,menorDistancia:r2(viz),pedras:X('ROCKS').filter(q=>q.morros).length,moitas:X('BUSHES').filter(q=>q.morros).length,coletaveis:X('PICKS').filter(q=>q.morros).length};""")]
# 6 bichos e zumbis
s += [js("const B=X('BICHOS');B.length=0;vai(-160,-6);P.yaw=Math.PI/2;"), ["gwait", 0.4]]
s += [ev("bichos", """for(let k=0;k<8;k++)X('faunaMaterializar')();const B=X('BICHOS'),c={};for(const b of B)if(b.vivo&&String(b.zona).startsWith('morros'))c[b.zona+':'+b.tipo]=(c[b.zona+':'+b.tipo]||0)+1;
 const fora=B.filter(b=>b.vivo&&!X('dentroMapa')(b.x,b.z)).length;return{contagem:c,foraDoMapa:fora};""")]
s += [ev("zumbis", "Z.length=0;vai(F[0]+3,F[2]+3);X('popularDia')();const m=Z.filter(z=>z.vivo&&Math.hypot(z.x,z.z)>150&&X('dentroMapa')(z.x,z.z));return{noAnelNovo:m.length,total:Z.filter(z=>z.vivo).length};")]
# 7 região, salvar e carregar, mapa
s += [js("Z.length=0;vai(-185,-4);G.hora=11;"), ["gwait", 1.5]]
s += [ev("regiao", "const r=X('regiaoEm')(P.x,P.z);const D=X('regD')();return{id:r&&r.id,nome:r&&r.nome,descoberta:D.morros&&D.morros.descoberta};")]
s += [ev("salvou", "window.__pos=[r2(P.x),r2(P.z)];return{ok:X('salvarJogo')()!==false};")]
s += [js("X('novoJogo')();"), ["gwait", 0.5], js("X('carregarJogo')();"), ["gwait", 1.5]]
s += [ev("carregou", "return{pos:[r2(P.x),r2(P.z)],antes:window.__pos,igual:Math.hypot(P.x-window.__pos[0],P.z-window.__pos[1])<0.6,noChao:P.noChao,vida:Math.round(P.vida)};")]
s += [ev("mapa", "try{X('abrirMapa')();}catch(e){return{erro:String(e)};}const c=document.getElementById('mapa-g');const r={aberto:G.modo==='mapa',w:c&&c.width};try{X('fecharMapa')();}catch(e){}return r;")]
# 8 o que já existia
s += [ev("antigas", "const T=X('TREES');return{total:T.length,antigas:T.filter(t=>!t.morros&&!t.anel&&!t.alto).length,primeiras:T.slice(0,3).map(t=>[r2(t.x),r2(t.z)]),maiorId:T.reduce((m,t)=>Math.max(m,t.id|0),0)};")]
salvar('tools/p233_morros.json', s, vp=(800, 450))
