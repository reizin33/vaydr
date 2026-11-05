"""p174: Etapa 14, aves, gavião e peixes. Espécies e malhas; aparecem sozinhas no campo de dia; bando foge de você em pé (revoada faz
barulho) e não foge de você agachado e devagar; quero-quero dá rasante gritando (o grito faz barulho); urubus rodam em cima de carcaça e
descem quando você se afasta; garça na beira da água; de noite só o quero-quero; diário. Gavião: luva travada até ver um gavião;
domar pela interação de verdade (luva na mão, carne, segurar E, ele desce e come na luva, 3 vezes); pousa na luva; voa em cima de
você sem a luva; vigia (avisa de zumbi); poleiro: comida, treino (níveis), vigiar a base, marca no minimapa (nível 2), ataca zumbi
(nível 3); salvar e carregar; fome faz ir embora. Peixes: espécies por lugar e hora, pesca de verdade com espécie e peso, recorde,
peixe pulando, diário e manual."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),AV=()=>X('AVES'),GV=()=>X('GAV'),"
     "rec=id=>X('RECIPES').find(r=>r.faz===id),est=id=>X('receitaEstado')(rec(id)),conta2=()=>{const q={};for(const b of AV())q[b.sp+':'+b.st]=(q[b.sp+':'+b.st]||0)+1;return q;},"
     "dirLivre=(x,z)=>{let best=0,bl=-1;for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "if(!X('dentroMapa')(px,pz,4)||X('pointBlocked')(px,pz,0.9)||X('salaEm')(px,X('ground')(px,pz)+0.6,pz)||(X('aguaNivel')(px,pz)!==null&&X('aguaProfVeic')(px,pz)>0.4)||Math.abs(X('ground')(px,pz)-X('ground')(x,z))>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=10;G.noite=false;G.chuva=0;n.cfg.cam='3';X(\"barulho=(function(o){return function(x,z,r){(window.__brs=window.__brs||[]).push(Math.round(r*10)/10);return o.apply(this,arguments);};})(barulho)\");"
        "const Zl=X('ZONAS_FAUNA').find(z=>z.id==='leste');let c=null;for(let k=0;k<40&&!c;k++){const a=k*0.9,r=k*0.6,x=Zl.x+Math.cos(a)*r,z=Zl.z+Math.sin(a)*r;const d=dirLivre(x,z);if(d.l>=40)c={x,z,a:d.a};}"
        "W.__c=c;vai(c.x+Math.sin(c.a)*12,c.z+Math.cos(c.a)*12);AV().length=0;")]
s += [e("especies", "const M=X('MESH').ave;return{sp:Object.keys(X('AVE_SP')),malhas:Object.keys(M||{}).map(k=>k+':'+['pousada','corpo','asaD','asaE'].filter(q=>M[k][q]).length).join(' '),peixes:Object.keys(X('PEIXES')),malhaPeixe:Object.keys(X('MESH').peixe||{}).length};")]
# aparecem sozinhas de dia no campo
s += [j("for(let i=0;i<8;i++)X('aveSpawn')();"), ["gwait", 1.0],
      e("aparecem", "const q=conta2();return{n:AV().length,q,longe:AV().map(b=>Math.round(Math.hypot(b.x-P.x,b.z-P.z))).sort((a,b)=>a-b).slice(0,6)};")]
# bando de pardais: em pé foge (revoada faz barulho); agachado e devagar, não
s += [j("AV().length=0;const g=999;W.__b=[];for(let i=0;i<5;i++)W.__b.push(X('criarAve')('pardal',P.x+3+i*0.3,P.z+0.5,{g}));P.agachado=false;P.agK=0;window.__brs=[];"), ["gwait", 0.6],
      e("pardaisFogem", "return{st:W.__b.map(b=>b.st),barulho:(window.__brs||[]).slice(0,6)};"),
      j("AV().length=0;W.__b=[];for(let i=0;i<4;i++)W.__b.push(X('criarAve')('pardal',P.x+4+i*0.3,P.z,{g:998}));P.agachado=true;P.agK=1;P.vx=P.vz=0;"), ["gwait", 1.5],
      e("agachadoNaoFoge", "return{st:W.__b.map(b=>b.st)};"), j("P.agachado=false;P.agK=0;")]
# quero-quero: rasante gritando, e o grito faz barulho
s += [j("AV().length=0;window.__brs=[];W.__q=[X('criarAve')('queroquero',P.x+9,P.z,{g:997}),X('criarAve')('queroquero',P.x+10,P.z+1,{g:997})];"), ["gwait", 3.0],
      e("queroquero", "const q=W.__q;return{st:q.map(b=>b.st),altura:q.map(b=>r2(b.y-X('ground')(b.x,b.z))),barulho:(window.__brs||[]).filter(r=>r>=9).length};")]
# urubus em cima de carcaça; descem quando você se afasta
s += [j("AV().length=0;const b=X('criarBicho')('cervo',P.x+20,P.z+20,{});X('ferirBicho')(b,999,0,0,'tiro');W.__carc=b;for(let i=0;i<3;i++)X('aveSpawn')();"), ["gwait", 1.0],
      e("urubus", "const U=AV().filter(b=>b.sp==='urubu'&&b.carc===W.__carc);return{n:U.length,st:U.map(b=>b.st),alt:U.map(b=>r2(b.y-X('ground')(b.x,b.z)))};"),
      j("const c=W.__carc;vai(c.x+40,c.z+40);c.carc.t0=G.tm-120;for(const b of AV())if(b.carc===c)b.t=0;"), ["gwait", 14.0],
      e("urubusDescem", "const c=W.__carc,U=AV().filter(b=>b.sp==='urubu'&&b.carc===c);return{n:U.length,st:U.map(b=>b.st),dist:U.map(b=>r2(Math.hypot(b.x-c.x,b.z-c.z)))};"),
      j("const c=W.__carc;vai(c.x+4,c.z+4);"), ["gwait", 1.5],
      e("urubusFogem", "const c=W.__carc,U=AV().filter(b=>b.sp==='urubu'&&b.carc===c);return{st:U.map(b=>b.st)};")]
# garça na beira da água
s += [j("AV().length=0;const L=X('LAGO');let p=null;for(let k=0;k<64&&!p;k++){const a=k/64*6.283;for(let r=0.6;r<1.3;r+=0.02){const x=L.x+Math.cos(a)*L.a*r,z=L.z+Math.sin(a)*L.b*r;if(X('lagoR')(x,z)>=1.02&&X('dentroMapa')(x,z,6)&&!X('pointBlocked')(x,z,0.6)){p={x,z,a};break;}}}"
        "W.__marg=p;vai(p.x+Math.cos(p.a)*6,p.z+Math.sin(p.a)*6);let g=null;for(let i=0;i<30&&!g;i++)g=X('avePontoPara')('garca');W.__gp=g;if(g)W.__g=X('criarAve')('garca',g[0],g[1],{});"), ["gwait", 1.0],
      e("garca", "const g=W.__g;return{ponto:!!W.__gp,prof:g?r2(X('aguaProf')(g.x,g.z)):null,st:g&&g.st,perto:g?X('aguaPerto')(g.x,g.z,2.2):null};")]
# diário de aves
s += [e("diarioAves", "const D=X('diarioD')();return Object.keys(D.desc).filter(k=>k.startsWith('ave:'));")]
# de noite: só o quero-quero aparece
s += [j("AV().length=0;G.hora=23;G.noite=true;"), ["gwait", 2.0], j("for(let i=0;i<12;i++)X('aveSpawn')();"), ["gwait", 0.5],
      e("noite", "return{q:conta2(),En:r2(X('E').n||0)};"), j("G.hora=10;G.noite=false;AV().length=0;"), ["gwait", 2.0]]
# ---- gavião ----
s += [j("const c=W.__c;vai(c.x+Math.sin(c.a)*12,c.z+Math.cos(c.a)*12);W.__antes=est('luvaFalcoaria');AV().length=0;const w=X('criarAve')('gaviao',P.x+10,P.z+8,{st:'plana',cx:P.x+10,cz:P.z+8,ch:X('ground')(P.x,P.z)+20,raio:12});w.y=w.ch;W.__w=w;"), ["gwait", 2.5],
      e("luvaTravada", "return{antes:W.__antes,depois:est('luvaFalcoaria'),viu:!!X('diarioD')().desc['ave:gaviao']};"),
      j("inv('luvaFalcoaria',1);inv('carneCrua',6);sel('luvaFalcoaria');P.vx=P.vz=0;")]
for i in range(3):
    s += [j("const w=W.__w;if(!X('AVES').includes(w)){W.__falta=true;}const a=X('interAtual')();W.__ka=a&&a.k;W.__ta=a&&X('textoInter')(a);"), ["down", "e"], ["gwait", 1.8], ["up", "e"],
          e("chamou%d" % (i+1), "const w=W.__w;return{alvo:W.__ka,texto:W.__ta&&W.__ta.t,st:w.st,dist:r2(Math.hypot(w.x-P.x,w.z-P.z)),alt:r2(w.y-P.y)};"), ["gwait", 6.0],
          e("comeu%d" % (i+1), "const w=W.__w,G2=GV();return{conf:r2(G2.conf),carne:conta('carneCrua'),st:w.st,domado:G2.domado,braco:r2(P.ch.r[15])};")]
s += [e("domado", "const G2=GV();return{domado:G2.domado,nome:G2.nome,st:G2.st,naLista:X('AVES').includes(W.__w),nivel:X('gavNivel')(),diario:X('diarioD')().ev.slice(-2).map(q=>q.txt)};")]
salvar('tools/p232g_gaviao.json', s, vp=(640, 360))
