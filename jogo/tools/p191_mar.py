"""p191: Etapa 20, o mar: costa e praia (terreno e fundo), maré (nível, estados, horários, lua), água do mar nas funções de
água (nível, profundidade, perto), área jogável, malhas (água e fundo) e o relógio mostrando a maré perto do mar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const M=X('MAR'),cd=X('costaD'),gr=X('ground'),an=X('aguaNivel'),ap=X('aguaProf'),pe=X('aguaPerto'),dm=X('dentroMapa'),"
     "nv=()=>{G.t+=1e-4;return X('marNivel')();},hora=h=>{G.hora=h;G.t+=1e-4;};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      e("costa", "return{d0:r2(cd(352,0)),cidade:r2(cd(336,0)),mar:r2(cd(360,0)),xN200:r2(X('costaX')(-200)),xS300:r2(X('costaX')(300)),praiaLeste:r2(X('marLarg')(0)),praiaPonta:r2(X('marLarg')(250))};"),
      e("chao", "const L=[[330,0],[338,0],[344,0],[350,0],[356,0],[366,0],[400,0],[600,0],[383,8],[372,112],[296,-204],[300,-150]];return L.map(p=>[p[0],p[1],r2(gr(p[0],p[1]))]);"),
      e("shader", "const a=X('AGUA_FS'),b=X('MAR_FS');return{difere:a!==b,onda:b.includes('uOndaA'),fundo:b.includes('prof/7.0'),espuma:b.includes('smoothstep(0.0,0.42'),alfa:b.includes('0.55+prof*0.16')};"),
      e("malhas", "const m=X('MARM');return{ok:!!m,agua:m&&m.agua.count,fundo:m&&m.fundo.count};"),
      # maré ao longo do dia 1: baixa ~08:37, alta ~14:48, baixa ~21:00
      e("mare", "G.dia=1;const out=[];for(const h of[6,8.6,11,14.8,17,21]){hora(h);out.push([h,r2(nv()),X('mareEstado')()]);}hora(10);const p=X('mareProx')();return{dia1:out,prox:[r2(p.alta),r2(p.baixa)]};"),
      e("lua", "const o={};for(const d of[1,3,5,7]){G.dia=d;o['dia'+d]=r2(X('mareAmp')());}G.dia=1;return o;"),
      # água: no mar sempre; na areia só quando a maré cobre; na cidade nunca
      e("agua", "G.dia=1;hora(8.6);const baixa={mar:an(380,0)!==null,beira:an(352,0)!==null,areia:an(343,0)!==null,cidade:an(330,0),prof:r2(ap(380,0)),perto352:pe(352,0,0),perto342:pe(342,0,0)};"
        "hora(14.8);const alta={beira:an(352,0)!==null,areia:an(343,0)!==null,prof:r2(ap(380,0)),perto342:pe(342,0,0),linha:r2(X('marLinhaD')(0))};hora(10);"
        "return{baixa,alta,salgada:X('aguaDoMar')(380,0),lago:X('aguaDoMar')(66,104),lagoNivel:an(66,104)!==null};"),
      e("ondas", "G.t=100;const a=X('marOnda')(380,0);G.t=101.3;const b=X('marOnda')(380,0);G.chuva=0.9;G.t+=1e-4;const A1=X('marOndaA')();G.chuva=0;G.t+=1e-4;const A0=X('marOndaA')();return{mexe:r2(Math.abs(a-b)),calmo:r2(A0),chuva:r2(A1)};"),
      e("jogavel", "return{praia:dm(340,0),mar:dm(420,0),longe:dm(640,0),pontaN:dm(300,-200),fundoMorro:dm(250,-150),norte:dm(380,-400)};"),
      # o relógio mostra a maré perto do mar (e some longe)
      j("vai(344,30);window.__semRender=false;window.__turbo=1;"), ["gwait", 1.0], j("window.__semRender=true;window.__turbo=6;"),
      e("relogioPerto", "const el=document.getElementById('dia-mare');return{visivel:!!el&&!el.hidden,texto:el&&el.textContent.trim(),dica:el&&el.title};"),
      j("vai(F[0]+3,F[2]+3);window.__semRender=false;window.__turbo=1;"), ["gwait", 1.0], j("window.__semRender=true;window.__turbo=6;"),
      e("relogioLonge", "const el=document.getElementById('dia-mare');return{visivel:!!el&&!el.hidden};")]
# ---- nadar no mar e voltar ----
s += [j("G.dia=1;hora(10);vai(400,80,X('marNivel')()-1.3);P.yaw=-Math.PI/2;P.body=P.yaw;"), ["gwait", 0.6],
      e("nadando", "return{nada:!!P.nada,dy:r2(P.y-X('marNivel')()),sal:X('aguaDoMar')(P.x,P.z)};"),
      ["down", "KeyW"], ["gwait", 6.0], ["up", "KeyW"],
      e("voltou", "return{nada:!!P.nada,x:r2(P.x),d:r2(cd(P.x,P.z))};")]
salvar('p191.json', s, vp=(960, 540))
