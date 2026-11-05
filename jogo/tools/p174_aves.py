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
    s += [j("const w=W.__w;if(!X('AVES').includes(w)){W.__falta=true;}const a=X('interAtual')();n.alvo=a;W.__ka=a&&a.k;W.__ta=a&&X('textoInter')(a);n.interagir(false);"), ["gwait", 1.8],
          e("chamou%d" % (i+1), "const w=W.__w;return{alvo:W.__ka,texto:W.__ta&&W.__ta.t,st:w.st,dist:r2(Math.hypot(w.x-P.x,w.z-P.z)),alt:r2(w.y-P.y)};"), ["gwait", 6.0],
          e("comeu%d" % (i+1), "const w=W.__w,G2=GV();return{conf:r2(G2.conf),carne:conta('carneCrua'),st:w.st,domado:G2.domado,braco:r2(P.ch.r[15])};")]
s += [e("domado", "const G2=GV();return{domado:G2.domado,nome:G2.nome,st:G2.st,naLista:X('AVES').includes(W.__w),nivel:X('gavNivel')(),diario:X('diarioD')().ev.slice(-2).map(q=>q.txt)};"),
      j("const i=P.inv.findIndex(q=>q&&q.id==='luvaFalcoaria');const k=(P.sel+1)%6;X('selecionar')(k===i?(k+1)%6:k);"), ["gwait", 3.0],
      e("semLuva", "const G2=GV();return{st:G2.st,alt:r2(G2.y-X('ground')(P.x,P.z)),dist:r2(Math.hypot(G2.x-P.x,G2.z-P.z))};"),
      j("Z.length=0;window.__brs=[];GV().avisoT=-99;const z=ZZ('walker',P.x+26,P.z+12);z.st='vaga';W.__z=z;"), ["gwait", 3.0],
      e("vigiaN1", "const z=W.__z;return{visto:!!z.gavVisto,marca:!!(z.marcaAte>G.t),aviso:GV().avisoT>0};"), j("Z.length=0;")]
# poleiro: painel, comida, treino até o nível 3, vigiar a base
s += [j("inv('carneCrua',8);const p=cria('poleiro',P.x+3,P.z+3,0);W.__p=p;GV().fome=60;X('abrirEstacao')(p);W.__pt=document.getElementById('es-corpo').textContent.slice(0,200);X('estAcao')('comer');W.__f=GV().fome;"
        "for(let i=0;i<3;i++){G.tm+=61;X('estAcao')('treinar');}W.__n2=X('gavNivel')();W.__xp=GV().xp;X('estAcao')('vigiar');W.__modo=GV().modo;X('fecharEstacao')();"), ["gwait", 8.0],
      e("poleiro", "const G2=GV(),p=W.__p;return{texto:W.__pt,fome:r2(W.__f),xp:W.__xp,nivel2:W.__n2,modo:W.__modo,st:G2.st,distPoleiro:r2(Math.hypot(G2.x-p.x,G2.z-p.z)),alt:r2(G2.y-p.y)};"),
      j("const p=W.__p;vai(p.x+60,p.z+60);Z.length=0;GV().avisoT=-99;GV().vigT=0;const z=ZZ('walker',p.x+38,p.z-10);z.st='vaga';W.__z2=z;"), ["gwait", 3.0],
      e("vigiaBaseN2", "const z=W.__z2;return{visto:!!z.gavVisto,marca:!!(z.marcaAte>G.t),diario:X('diarioD')().ev.slice(-1).map(q=>q.txt)};"),
      j("Z.length=0;for(let i=0;i<4;i++){G.tm+=61;GV().treinoTm=-1e9;const f=GV();f.xp++;}W.__n3=X('gavNivel')();const p=W.__p;const z=ZZ('walker',p.x+12,p.z+6);z.st='vaga';W.__z3=z;W.__zh=z.hp;GV().ataqueT=-99;GV().vigT=0;"), ["gwait", 6.0],
      e("ataqueN3", "const z=W.__z3;return{nivel:W.__n3,hp:[r2(W.__zh),r2(z.hp)],st:z.st,ataqueT:GV().ataqueT>0};"), j("Z.length=0;")]
# salvar e carregar; fome demais faz ir embora
s += [j("const sv=JSON.parse(JSON.stringify(X('V8').salvar.gaviao()));W.__sv=sv;X('V8').carregar.gaviao(sv);"),
      e("salvo", "const G2=GV();return{sv:W.__sv,domado:G2.domado,modo:G2.modo,xp:G2.xp,st:G2.st};"),
      j("const g=GV();g.fome=100;g.famTm=700;g.tmUlt=G.tm;G.tm+=60;"), ["gwait", 0.5],
      e("foiEmbora", "return{domado:GV().domado};")]
# ---- peixes ----
s += [e("sorteio", "const L=X('LAGO'),cnt=(x,z)=>{const q={};for(let i=0;i<400;i++){const k=X('peixeSorteia')(x,z);q[k]=(q[k]||0)+1;}return q;};const rp=X('rioPonto')(0.5);G.hora=12;const dia={lago:cnt(L.x,L.z),rio:cnt(rp[0],rp[1])};"
        "const E0=X('E').n;X('E').n=1;const noiteR=cnt(rp[0],rp[1]);X('E').n=E0;return{dia,noiteRio:noiteR};")]
s += [j("const p=W.__marg;vai(p.x,p.z);inv('vara',1);sel('vara');const L=X('LAGO');let w=null;for(let t=0.05;t<1&&!w;t+=0.05){const x=p.x+(L.x-p.x)*t,z=p.z+(L.z-p.z)*t;if(X('aguaNivel')(x,z)!==null&&X('aguaProf')(x,z)>0.4){w={x,z};}}"
        "W.__w8=w;W.__pc=conta('peixeCru');window.__turbo=1;X('pescaComecar')({x:w.x,y:X('aguaNivel')(w.x,w.z),z:w.z});P.pesca.morde=0.6;"), ["until", "__nnc.P.pesca&&__nnc.P.pesca.mordeu", 20],
      j("W.__esp=P.pesca&&P.pesca.esp;W.__kg=P.pesca&&P.pesca.kg;W.__jan=P.pesca&&P.pesca.janela;const a=X('interAtual')();W.__kp=a&&a.k;n.alvo=a;n.interagir(false);window.__turbo=6;"), ["gwait", 0.4],
      e("pescou", "const R=G.peixes||{},e=R[W.__esp];return{alvo:W.__kp,esp:W.__esp,kg:W.__kg,janela:W.__jan,peixesCrus:conta('peixeCru')-W.__pc,esperado:X('peixeRende')(W.__kg||0),registro:e,diario:!!X('diarioD')().desc['peixe:'+W.__esp]};"),
      j("X('puloT=0');"), ["gwait", 0.3], e("pulo", "return{pulos:X('PULOS').length};"), ["gwait", 1.5], e("puloAcabou", "return{pulos:X('PULOS').length};")]
# diário e manual
s += [j("X('abrirDiario')('jogo');X('diarioAba=\"desc\"');X('diarioRender')();W.__d1=document.getElementById('dr-lista').textContent;X('diarioAba=\"est\"');X('diarioRender')();W.__d2=document.getElementById('dr-lista').textContent;G.modo='jogo';X('tela')(null);"),
      e("diario", "return{aves:W.__d1.includes('Aves vistas'),peixes:W.__d1.includes('Peixes pescados'),est:['Maior peixe','Espécies de peixe','Cavalos domados','Gavião'].map(k=>W.__d2.includes(k))};"),
      e("manual", "X('mnCache=null');const L=X('mnEntradas')();return{animais:L.filter(q=>q.sec==='animais').map(q=>q.nome),peixes:!!L.find(q=>q.id==='x:peixes'),secPeixes:(L.find(q=>q.id==='x:peixes')||{}).sec};")]
salvar('p174.json', s)
