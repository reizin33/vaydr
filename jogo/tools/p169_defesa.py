"""p169: defesa e interiores (Etapa 10). Menu (abas Muros, Defesa, Casa e a nova Móveis); porta de madeira com cadeado de senha
(teclado para escolher a senha, senha errada e certa por fora, abre sem senha por dentro), tranca por dentro (não abre de fora e
segura 40% do dano), reforço com chapas e a porta reforçada construída pelo menu; janela com persiana (tampa o vão para tiro) e
tábuas empilhadas e em X (levam o dano antes da janela); tábuas em X numa janela da cidade; paliçada, portão grande e muralha
encaixando na ponta; portão grande abre perto de você e segura o zumbi; revestimento de metal numa parede; lamparina de parede
(acende, apaga e cai junto com a parede); luz saindo pela janela à noite; armadilha de mandíbula prendendo o zumbi; consertar
tudo (com e sem material); móveis e conforto do sono; passos no assoalho; salvar e carregar mantém tudo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const SS=window.__S,S=SS.casa,M=SS.muro,RV=SS.rev,LZ=SS.luz,AR=SS.arm,MV=SS.mov,O=X('OBRAS'),cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),ach=(t)=>X('OB').filter(o=>o.tipo===t),"
     "acoes=()=>[...document.querySelectorAll('#es-acoes button')].map(b=>(b.disabled?'x ':'')+b.querySelector('span').textContent),"
     "mirar=(tx,tz,yaw)=>{const f=[Math.sin(yaw),0,Math.cos(yaw)];vai(tx-f[0]*3.2,tz-f[2]*3.2);P.yaw=yaw;P.body=yaw;P.pitch=0;},"
     "obraEm=(t,yaw,tx,tz)=>{const O2=X('OBRA');O2.ativo=true;O2.tipo=t;O2.rot=0;mirar(tx,tz,yaw);X('obraAlvo')();return{ok:O2.ok,motivo:O2.motivo,x:r2(O2.x),z:r2(O2.z),yaw:r2(O2.yaw)};},"
     "tecla=s=>{for(const c of s)X('tecladoTecla')(c);};")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)if(!z.teste)z.vivo=false;P.vida=Math.max(P.vida,1);};"
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__casa3=true;window.__turbo=6;window.__semRender=true;")
s += [js("vivo();Z.length=0;" + LIMPA + "n.cfg.cam='1';G.fab.noite1=true;P.inv.fill(null);for(const[k,q]of[['chapaFerro',8],['tabuas',60],['pregos',40],['sucata',30],['madeira',20],['pedra',20],['corda',10],['pano',5],['graveto',6]])n.invAdd(k,q);"
         # lugar plano e livre perto da clareira para as construções
         "const gr=X('ground'),bl=X('bloqueadoChao'),usados=[];const livre=(hx,hz)=>{for(let k=0;k<1100;k++){const a=k*0.47,r=11+k*0.055,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r),g=gr(x,z);if(!X('dentroMapa')(x,z,20)||X('aguaPerto')(x,z,Math.max(hx,hz)+2))continue;if(usados.some(u=>Math.abs(u.x-x)<u.hx+hx+3&&Math.abs(u.z-z)<u.hz+hz+3))continue;let ok=true;for(let i=-hx;i<=hx+1e-6&&ok;i+=1.5)for(let q=-hz;q<=hz+1e-6&&ok;q+=1.5){const y=gr(x+i,z+q);if(Math.abs(y-g)>0.8||bl(x+i,z+q,0.4,y))ok=false;}if(ok){const L={x,z,y:g,hx,hz};usados.push(L);return L;}}return null;};window.__S={casa:livre(6,4),muro:livre(9,5),rev:livre(6,3),luz:livre(4,3),arm:livre(6,3),mov:livre(4,4)};")]
s += [e("lugar", "return{inv:P.inv.filter(Boolean).map(q=>q.id+'x'+q.n).join(','),lugares:Object.fromEntries(Object.entries(SS).map(([k,v])=>[k,v&&[v.x,v.z,r2(Math.hypot(v.x-F[0],v.z-F[2]))]]))};"),
      e("menu", "const C=X('OBRA_CATS');return{abas:C.map(c=>c.id+':'+c.nome).join(' '),moveis:C.find(c=>c.id==='moveis').t.join(','),base:C.find(c=>c.id==='base').t.join(','),muros:C.find(c=>c.id==='muros').t.join(','),"
                "chaoTem:['palicada','muralha','portaoGrande','portaReforcada','revestimento','armadilhaUrso','camaMadeira','mesa','cadeira','prateleira','lampParede'].filter(k=>X('obrasVisiveis')().includes(k)).length,"
                "predioTem:X('OBRAS_PREDIO').includes('tabuasJanelaX'),catDe:{palicada:X('obraCat')('palicada'),lampParede:X('obraCat')('lampParede'),bau:X('obraCat')('bau')}};")]
# ---- porta: cadeado com senha ----
s += [j("const o=cria('portaMadeira',S.x,S.z,0);window.__po=o;vai(S.x+0.3,S.z+1.3);P.yaw=Math.PI;n.alvo={k:'portaMad',o};n.interagir(true);"), ["gwait", 0.2],
      e("painelPorta", "return{modo:G.modo,nome:document.getElementById('es-nome').textContent,acoes:acoes(),texto:X('INTER_K').portaMad.texto(window.__po).t};"),
      j("X('estAcao')('cadPor');"), ["gwait", 0.2],
      e("tecladoSenha", "return{modo:G.modo,titulo:document.querySelector('#t-teclado h2').textContent,cad:window.__po.ext.cad};"),
      j("tecla('47');X('tecladoTecla')('ok');"),
      e("senhaCurta", "return{modo:G.modo,msg:document.getElementById('tc-msg').textContent};"),
      j("tecla('19');X('tecladoTecla')('ok');"), ["gwait", 0.2],
      e("senhaDefinida", "const E=window.__po.ext;return{modo:G.modo,cad:E.cad,senha:E.senha,dentro:E.dentro,sucata:conta('sucata'),aberta:!!E.aberta};"),
      # por fora (lado +z, onde está o teclado): toque abre o teclado; senha errada e depois a certa
      j("X('INTER_K').portaMad.curto(window.__po);"), ["gwait", 0.2],
      e("foraToque", "return{modo:G.modo,titulo:document.querySelector('#t-teclado h2').textContent,aberta:!!window.__po.ext.aberta};"),
      j("tecla('1111');X('tecladoTecla')('ok');"),
      e("senhaErrada", "return{modo:G.modo,msg:document.getElementById('tc-msg').textContent,aberta:!!window.__po.ext.aberta};"),
      j("tecla('4719');X('tecladoTecla')('ok');"), ["gwait", 0.2],
      e("senhaCerta", "return{modo:G.modo,aberta:!!window.__po.ext.aberta,folhaSolida:window.__po.folha.solid};"),
      j("X('INTER_K').portaMad.curto(window.__po);vai(S.x+0.3,S.z-1.3);P.yaw=0;X('INTER_K').portaMad.curto(window.__po);"), ["gwait", 0.2],
      e("dentroAbre", "return{modo:G.modo,aberta:!!window.__po.ext.aberta,texto:X('INTER_K').portaMad.texto(window.__po).t};"),
      # tranca por dentro
      j("X('INTER_K').portaMad.curto(window.__po);n.alvo={k:'portaMad',o:window.__po};n.interagir(true);X('estAcao')('trPor');X('estAcao')('trAlt');"),
      e("trancaPassada", "const o=window.__po;return{tr:o.ext.tr,aberta:!!o.ext.aberta,acoes:acoes(),msg:document.getElementById('es-msg').textContent};"),
      j("X('fecharEstacao')();vai(S.x+0.3,S.z+1.3);P.yaw=Math.PI;X('INTER_K').portaMad.curto(window.__po);"), ["gwait", 0.2],
      e("trancadaFora", "const o=window.__po,h0=o.hp;X('danoObra')(o,100);return{modo:G.modo,aberta:!!o.ext.aberta,texto:X('INTER_K').portaMad.texto(o).t,danoCom100:r2(h0-o.hp)};"),
      j("vai(S.x+0.3,S.z-1.3);P.yaw=0;X('INTER_K').portaMad.curto(window.__po);"),
      e("dentroLevanta", "const o=window.__po;return{tr:o.ext.tr,aberta:!!o.ext.aberta};"),
      # reforço com chapas pelo painel
      j("n.alvo={k:'portaMad',o:window.__po};n.interagir(true);window.__ch0=conta('chapaFerro');X('estAcao')('reforcar');"),
      e("reforco", "const o=window.__po;return{reforco:o.ext.reforco,hpMax:o.hpMax,hp:r2(o.hp),chapas:window.__ch0-conta('chapaFerro'),nome:document.getElementById('es-nome').textContent,msg:document.getElementById('es-msg').textContent};"),
      j("X('fecharEstacao')();"),
      # porta reforçada pelo menu, encaixando na ponta da porta (grade de 3 m)
      e("portaRefMenu", "const r=obraEm('portaReforcada',Math.PI/2,S.x+3,S.z);const n0=ach('portaMadeira').length;X('colocarObra')();const L=ach('portaMadeira');const o=L.find(q=>q!==window.__po);"
                        "X('OBRA').ativo=false;return{alvo:r,criou:L.length-n0,reforco:o&&o.ext.reforco,hpMax:o&&o.hpMax,pos:o&&[r2(o.x-S.x),r2(o.z-S.z)]};")]
# ---- janela: persiana e tábuas ----
s += [j("const o=cria('janela',S.x-3,S.z,0);window.__ja=o;vai(S.x-3,S.z+1.4);P.yaw=Math.PI;"),
      e("janelaNova", "const o=window.__ja,bt=X('bloqueiaTiro');return{fechada:!!o.ext.fechada,tampa:!!o.colTampa,tiroPassa:!bt(o.x,o.y+1.45,o.z),texto:X('INTER_K').janelaObra.texto(o).t};"),
      j("X('INTER_K').janelaObra.curto(window.__ja);"), ["gwait", 0.5],
      e("persianaFechada", "const o=window.__ja,bt=X('bloqueiaTiro');return{fechada:!!o.ext.fechada,tampa:!!o.colTampa,tiroPassa:!bt(o.x,o.y+1.45,o.z),pers:r2(o.pers)};"),
      j("X('INTER_K').janelaObra.curto(window.__ja);n.alvo={k:'janelaObra',o:window.__ja};n.interagir(true);"),
      e("painelJanela", "return{modo:G.modo,acoes:acoes()};"),
      j("vai(S.x-3,S.z-1.4);P.yaw=0;X('estAcao')('tab:pilha');"),
      e("tabuasPilha", "const o=window.__ja,bt=X('bloqueiaTiro');return{tab:o.ext.tab,tabHp:o.ext.tabHp,lado:o.ext.tabLado,tampa:!!o.colTampa,tiroPassa:!bt(o.x,o.y+1.45,o.z),acoes:acoes()};"),
      e("danoNasTabuas", "const o=window.__ja,h0=o.hp;X('danoObra')(o,100);const a={tabHp:o.ext.tabHp,hpJanela:o.hp-h0};X('danoObra')(o,250);return{depois100:a,quebrou:!o.ext.tab,tampa:!!o.colTampa,hpJanela:o.hp,hpMax:o.hpMax};"),
      j("vai(S.x-3,S.z+1.4);P.yaw=Math.PI;X('estAcao')('tab:x');"),
      e("tabuasX", "const o=window.__ja,bt=X('bloqueiaTiro');return{tab:o.ext.tab,tabHp:o.ext.tabHp,lado:o.ext.tabLado,tiroPassa:!bt(o.x,o.y+1.45,o.z),presa:X('INTER_K').janelaObra.texto(o).t};"),
      j("X('persianaAlternar')(window.__ja);X('estAcao')('tirarTab');"),
      e("tirouTabuas", "const o=window.__ja;return{tab:o.ext.tab||null,fechada:!!o.ext.fechada,msg:document.getElementById('es-msg').textContent};"),
      j("X('fecharEstacao')();")]
# ---- tábuas em X numa janela da cidade (pelo menu) ----
s += [j("const J=X('CID').janelas.filter(q=>!q.quebrada&&q.f===0);let jj=null;for(const q of J){const c=X('chaoEm')(q.x,q.z,q.y+0.5);if(Math.abs(c-q.y)<0.3&&!X('OB').some(o=>o.ext&&o.ext.janela===q.id)){jj=q;break;}}window.__cj=jj;"
        "if(jj){const a=jj.yaw+Math.PI/2;let best=null;for(const s2 of[1,-1]){const x=jj.x+Math.sin(a)*s2*0.9,z=jj.z+Math.cos(a)*s2*0.9;if(X('salaEm')(x,jj.y+0.3,z)&&!X('pointBlocked')(x,z,0.25)){best=[x,z];break;}}"
        "const p=best||[jj.x+Math.sin(a)*0.9,jj.z+Math.cos(a)*0.9];vai(p[0],p[1],jj.y);P.yaw=Math.atan2(jj.x-p[0],jj.z-p[1]);P.body=P.yaw;P.pitch=0;const O2=X('OBRA');O2.ativo=true;O2.tipo='tabuasJanelaX';X('obraAlvo')();}"),
      e("cidadeX", "const jj=window.__cj;if(!jj)return{semJanela:true};const O2=X('OBRA'),r={ok:O2.ok,motivo:O2.motivo};X('colocarObra')();const o=X('OB').find(q=>q.tipo==='tabuasJanelaX'&&q.ext.janela===jj.id);"
                   "O2.tipo='tabuasJanela';X('obraAlvo')();const de2=O2.motivo;O2.ativo=false;return{alvo:r,criou:!!o,tapada:X('janelaTapada')(jj),hp:o&&o.hp,colisor:!!(o&&o.col&&o.col.solid),empilhadasNaMesma:de2};")]
# ---- muros: paliçada, portão grande e muralha encaixando ----
s += [j("vai(M.x,M.z-4);const o=cria('palicada',M.x-3,M.z,0);window.__pa=o;"),
      e("palicadaEncaixe", "const p=window.__pa;const r=obraEm('palicada',0,p.x+3.2,p.z+0.3);X('colocarObra')();const L=ach('palicada');const r2_=obraEm('portaoGrande',0,p.x+3+4.6,p.z+0.2);X('colocarObra')();const g=ach('portaoGrande')[0];"
                           "const r3=obraEm('muralha',0,p.x-3.2,p.z);X('colocarObra')();const m=ach('muralha')[0];X('OBRA').ativo=false;"
                           "return{palicada:r,palicadas:L.length,dx2:L[1]&&r2(L[1].x-p.x),colY1:r2(p.col.y1-p.y),portao:r2_,portaoDx:g&&r2(g.x-p.x),colisores:g&&g.cols.map(c=>(c.portao?'P':'s')+r2(c.hw)).join(','),muralha:r3,muralhaDx:m&&r2(m.x-p.x),muralhaHp:m&&m.hpMax};"),
      j("vai(S.x,S.z+2);"), ["gwait", 1.5],
      e("portaoLonge", "const g=ach('portaoGrande')[0];return{abre:r2(g.abre||0)};"),
      j("const g=ach('portaoGrande')[0];vai(g.x,g.z-3.5);"), ["gwait", 2.5],
      e("portaoPerto", "const g=ach('portaoGrande')[0];return{abre:r2(g.abre||0)};"),
      # zumbi do lado de fora tentando chegar em você do outro lado do portão
      j("const g=ach('portaoGrande')[0];vai(g.x,g.z-4);const z=ZZ('walker',g.x+0.5,g.z+3.5);z.teste=true;z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;window.__zg=z;"), ["gwait", 8],
      e("zumbiNoPortao", "const g=ach('portaoGrande')[0],z=window.__zg;const lz=(z.x-g.x)*Math.sin(g.yaw)+(z.z-g.z)*Math.cos(g.yaw);const r={ladoDeFora:lz>0,lz:r2(lz),st:z.st,batendo:z.obra===g,hp:r2(g.hp),hpMax:g.hpMax};z.vivo=false;return r;")]
# ---- revestimento de metal numa parede ----
s += [j("const w=cria('paredeCasa',RV.x-3,RV.z,0);window.__pc=w;"),
      e("revestir", "const w=window.__pc,c0=conta('chapaFerro'),s0=conta('sucata');const O2=X('OBRA');O2.ativo=true;O2.tipo='revestimento';vai(w.x,w.z+1.2);P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;X('obraAlvo')();const r={ok:O2.ok,motivo:O2.motivo};"
                    "X('colocarObra')();O2.ativo=false;const h=w.hp;X('danoObra')(w,100);return{alvo:r,metal:w.ext.metal,lado:w.ext.metalLado,hpMax:w.hpMax,chapasGastas:c0-conta('chapaFerro'),sucataGasta:s0-conta('sucata'),dano100:r2(h-w.hp)};")]
# ---- lamparina de parede ----
s += [j("const w=cria('paredeCasa',RV.x+3,RV.z,0);window.__pl=w;const O2=X('OBRA');O2.ativo=true;O2.tipo='lampParede';vai(w.x+0.4,w.z-1.0);P.yaw=0;P.body=0;P.pitch=0;X('obraAlvo')();window.__la={ok:O2.ok,motivo:O2.motivo};X('colocarObra')();O2.ativo=false;"),
      e("lampada", "const w=window.__pl,l=ach('lampParede')[0];return{alvo:window.__la,criou:!!l,altura:l&&r2(l.y-w.y),dist:l&&r2(Math.hypot(l.x-w.x,l.z-w.z)),lado:l&&X('ladoDe')(w,l.x,l.z),fogo:l&&X('FIRES').some(f=>f.obra===l),presa:l&&X('lampHost')(l)===w};"),
      j("const l=ach('lampParede')[0];n.alvo={k:'lamp',o:l};n.interagir(false);"),
      e("lampApagada", "const l=ach('lampParede')[0];return{apagada:!!l.ext.apagada,fogo:X('FIRES').some(f=>f.obra===l)};"),
      j("const l=ach('lampParede')[0];n.alvo={k:'lamp',o:l};n.interagir(false);")]
# ---- luz pela janela à noite: lamparina do lado de dentro de uma janela ----
s += [j("const ja=cria('janela',LZ.x-1.5,LZ.z,0),pw=cria('paredeCasa',LZ.x+1.5,LZ.z,0);window.__jl=ja;"
        "const O2=X('OBRA');O2.ativo=true;O2.tipo='lampParede';vai(pw.x-0.4,pw.z-1.0);P.yaw=0;P.body=0;P.pitch=0;X('obraAlvo')();X('colocarObra')();O2.ativo=false;window.__ll=ach('lampParede').find(q=>Math.abs(q.x-pw.x)<1.5);"
        "G.hora=10;G.noite=false;"), ["gwait", 0.5],
      e("luzDia", "X('computeEnv')();const o=window.__jl;o.luzT=undefined;return{n:r2(X('E').n),luz:r2(X('janelaLuz')(o)),lado:o.luzLado};"),
      j("G.hora=22.5;G.noite=true;"), ["gwait", 0.8],
      e("luzNoite", "X('computeEnv')();const o=window.__jl;o.luzT=undefined;const k=X('janelaLuz')(o);const l=window.__ll;l.ext.apagada||0;X('lampAlternar')(l);o.luzT=undefined;const apagada=X('janelaLuz')(o);X('lampAlternar')(l);o.luzT=undefined;"
                    "return{n:r2(X('E').n),luz:r2(k),lado:o.luzLado,lampadaDoLado:X('ladoDe')(o,l.x,l.z),comLampadaApagada:r2(apagada)};"),
      j("G.hora=10;G.noite=false;")]
# ---- a parede cai e a lamparina cai junto ----
s += [e("lampCaiJunto", "const w=window.__pl,l=ach('lampParede').find(q=>Math.abs(q.x-w.x)<1.5&&Math.abs(q.z-w.z)<1.5);const antes=!!l;X('destruirObra')(w);return{antes,depois:X('OB').includes(l),fogo:X('FIRES').some(f=>f.obra===l)};")]
# ---- armadilha de mandíbula ----
s += [j("const t=cria('armadilhaUrso',AR.x,AR.z,0);window.__tr=t;vai(t.x-5,t.z);const z=ZZ('walker',t.x+4,t.z);z.teste=true;z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;window.__zt=z;window.__zh=z.hp;"), ["gwait", 6],
      e("armadilha", "const t=window.__tr,z=window.__zt;window.__zx=[z.x,z.z];return{armada:t.ext.armada,preso:r2(z.presoT||0),perdeuVida:r2(window.__zh-z.hp),dist:r2(Math.hypot(z.x-t.x,z.z-t.z)),texto:X('INTER_K').armadilha.texto(t).t};"),
      ["gwait", 1.5],
      e("presoParado", "const z=window.__zt;return{moveu:r2(Math.hypot(z.x-window.__zx[0],z.z-window.__zx[1])),preso:r2(z.presoT||0)};"),
      j("window.__zt.vivo=false;const t=window.__tr;n.alvo={k:'armadilha',o:t};n.interagir(true);"),
      e("rearmou", "return{armada:window.__tr.ext.armada};")]
# ---- consertar tudo ----
s += [j("for(const[k,q]of[['tabuas',40],['pregos',20],['sucata',20],['madeira',10],['pedra',10],['corda',6]])n.invAdd(k,q);vai(S.x,S.z+2);for(const o of X('OB'))if(X('sobBase')(o.x,o.z,40)&&o.hp>0)o.hp=Math.max(1,o.hp*0.5);X('modoObra')(true);for(let i=0;i<3;i++)for(const f of X('HUDS'))f(0.6);"),
      e("consertarPrevia", "const r=X('consertarTudo')(true);return{n:r.n,total:r.total,falta:r.falta,gasto:r.gasto,botao:document.getElementById('o-consertar-t').textContent,desab:document.getElementById('o-consertar').disabled};"),
      e("consertarTudo", "const t0=conta('tabuas'),p0=conta('pregos');const r=X('consertarTudoUI')();const dan=X('OB').filter(o=>X('sobBase')(o.x,o.z,40)&&o.hp<o.hpMax-0.5).length;return{n:r.n,falta:r.falta,tabuasGastas:t0-conta('tabuas'),pregosGastos:p0-conta('pregos'),aindaDanificadas:dan};"),
      j("for(const k of['tabuas','pregos','madeira','pedra','sucata','chapaFerro','corda'])X('invRemove')(k,999);const o=window.__po;o.hp=o.hpMax*0.4;"),
      e("semMaterial", "const r=X('consertarTudo')(true);for(let i=0;i<3;i++)for(const f of X('HUDS'))f(0.6);const u=X('consertarTudoUI')();return{n:r.n,falta:r.falta,hpPorta:r2(window.__po.hp/window.__po.hpMax),botao:document.getElementById('o-consertar').title};"),
      j("X('modoObra')(false);for(const[k,q]of[['tabuas',60],['pregos',30],['pano',10],['sucata',20]])n.invAdd(k,q);")]
# ---- móveis e conforto ----
s += [j("const x=MV.x,z=MV.z+0.5,y=X('ground')(x,z);const c=cria('camaMadeira',x,z,0);cria('mesa',x+2.2,z,0);cria('cadeira',x+2.2,z+1,0);const es=cria('prateleira',x-1.6,z,0);"
        "const pw=cria('paredeCasa',x,z-1.9,0);cria('lampParede',x,z-1.9+0.31,0,y+1.62);cria('plataforma',x,z,0,y+2.6,{apoio:'pilar'});window.__cm=c;window.__es=es;"),
      e("moveis", "const c=window.__cm,es=window.__es,cf=X('confortoCama')(c);return{conforto:cf.n,tem:cf.tem.join(','),teto:cf.teto,texto:X('textoInter')({k:'camaObra',o:c}).s,estante:X('textoInter')({k:'guarda',o:es}).t,vagas:es.itens.length,nome:es.nome,colCama:r2(c.col.y1-c.y)};"),
      j("G.hora=21;G.noite=true;P.sono=40;P.vida=60;const c=window.__cm;X('sonoComecar')({cama:true,x:c.x,y:c.y,z:c.z});"),
      e("dormiu", "const d=G.dormindo;return{dormindo:!!d,conforto:d&&d.conforto,taxa:d&&r2(d.taxa)};"),
      j("X('sonoAcordar')();"),
      e("acordou", "return{vida:r2(P.vida),dormindo:!!G.dormindo};"),
      e("sobrevivente", "return{descansaNaCama:X('OFICIOS').descansar[0].acha.toString().includes('camaMadeira'),repouso:X('OF_REPOUSO').acha.toString().includes('camaMadeira')};"),
      # passos no assoalho: em cima da plataforma é madeira; no chão não
      j("G.hora=10;G.noite=false;const c=window.__cm;vai(c.x+0.6,c.z+0.6,c.y+2.6);"), ["gwait", 0.3],
      e("assoalho", "const em=X('noAssoalho')();vai(S.x,S.z+2);P.noChao=true;const chao=X('noAssoalho')();return{naPlataforma:em,noChao:chao,som:typeof X('SONS').passoMadeira};")]
# ---- salvar e carregar ----
s += [j("const o=window.__po;o.ext.aberta=false;o.folha.solid=true;window.__ja.ext.fechada=true;X('janelaTampa')(window.__ja);X('salvarJogo')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;" + LIMPA), ["gwait", 0.5]]
s += [ev("carregou", "const OB=X('OB'),pm=OB.filter(o=>o.tipo==='portaMadeira'),pc=pm.find(o=>o.ext.cad),jl=OB.filter(o=>o.tipo==='janela'&&o.ext.fechada),w=OB.find(o=>o.tipo==='paredeCasa'&&o.ext.metal),es=OB.find(o=>o.tipo==='prateleira');"
                  "const c=t=>OB.filter(o=>o.tipo===t).length;return{portaCadeado:pc&&{cad:pc.ext.cad,senha:pc.ext.senha,tr:pc.ext.tr,reforco:pc.ext.reforco,hpMax:pc.hpMax,dentro:pc.ext.dentro,folhaSolida:pc.folha.solid},"
                  "reforcadas:pm.filter(o=>o.ext.reforco).length,janelaFechada:jl.length,tampa:jl.length?!!jl[0].colTampa:null,metal:w&&{hpMax:w.hpMax,lado:w.ext.metalLado},estante:es&&es.nome,"
                  "pecas:{palicada:c('palicada'),portaoGrande:c('portaoGrande'),muralha:c('muralha'),camaMadeira:c('camaMadeira'),mesa:c('mesa'),cadeira:c('cadeira'),prateleira:c('prateleira'),lampParede:c('lampParede'),armadilhaUrso:c('armadilhaUrso'),tabuasJanelaX:c('tabuasJanelaX')},"
                  "armada:(OB.find(o=>o.tipo==='armadilhaUrso')||{ext:{}}).ext.armada,lampFogo:OB.filter(o=>o.tipo==='lampParede').every(l=>l.ext.apagada||X('FIRES').some(f=>f.obra===l))};")]
salvar('p169.json', s)
