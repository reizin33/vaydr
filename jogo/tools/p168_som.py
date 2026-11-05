"""p168: som ambiente (Etapa 9). Camadas novas criadas com o som do jogo; a região é reconhecida (mata, cidade, vila, rio, lago,
subsolo, dentro de prédio); o som antigo muda com a região (subsolo sem vento e sem chuva, cidade com menos folhas e pássaro,
teto abafando a chuva); cada lugar toca os seus sons (chapa e latido na cidade, galo de manhã na vila, cigarra no verão, sapo à
noite no rio, gotas no subsolo, rajadas na tempestade); dia com pássaros e noite com coruja; aviso de ameaça (acorde quando um
zumbi começa a caçar, pulsação com ele atrás). Os nomes dos sons tocados são anotados por um registro em volta de sfx()."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const reg=()=>{const r=X('SOM').reg;return Object.fromEntries(Object.entries(r).map(([k,v])=>[k,r2(v)]));},aj=()=>{const a=X('somAjuste')();for(const k in a)if(typeof a[k]==='number')a[k]=r2(a[k]);return a;},"
     "sons=()=>{const c={};for(const s of window.__sons||[])c[s]=(c[s]||0)+1;window.__sons=[];return c;},"
     "lugar=(x,z,y)=>{vai(x,z,y);X('SOM').regT=0;X('SOM').prox={cidade:0,rural:0,sapo:0,sub:0,cigarra:0,rajada:0,coro:0};window.__sons=[];},"
     "dia=(d,h)=>{G.dia=d;G.hora=h;G.noite=h>=20||h<6;G.clima.dia=d;G.clima.segs=[];G.clima.atual='limpo';G.clima.k=1;};")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)if(!z.teste)z.vivo=false;P.vida=100;};"
REG = ("n.ev(\"{const _s=sfx;sfx=function(nome){(window.__sons||(window.__sons=[])).push(nome);return _s.apply(this,arguments);};}\");")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;" + LIMPA + REG + "X('audioInit')();"), ["gwait", 0.5],
      e("camadas", "const A=X('AU'),S=X('SOM');return{ctx:!!A.ctx,estado:A.ctx&&A.ctx.state,camadas:S.beds?Object.keys(S.beds):null};"),
      # mata, de dia
      j("dia(9,10);lugar(F[0]-40,F[2]+30);"), ["gwait", 14],
      e("mata", "return{reg:reg(),ajuste:aj(),sons:sons()};"),
      # cidade
      j("const p=X('CID').predios.find(q=>q.nome==='Hotel Imperial')||X('CID').predios[2];lugar(p.x0-6,(p.z0+p.z1)/2);"), ["gwait", 30],
      e("cidade", "return{reg:reg(),ajuste:aj(),sons:sons()};"),
      # dentro de um prédio, chovendo
      j("const p=X('CID').predios.find(q=>q.nome==='Mercado Bom Preço');const c=X('pw')(p,p.W/2,3);lugar(c[0],c[1],p.y0);G.clima.segs=[[6,30,'chuva']];G.clima.atual='chuva';G.clima.k=1;G.chuva=0.8;"), ["gwait", 3],
      e("dentroChuva", "return{reg:reg(),ajuste:aj(),abrigado:X('abrigado')()};"),
      # vila, de manhã cedo (galo)
      j("G.clima.segs=[];G.clima.atual='limpo';G.chuva=0;dia(9,5.6);const v=X('placeById')('vila');lugar(v.x+6,v.z+4);"), ["gwait", 20],
      e("vilaManha", "return{reg:reg(),hora:r2(G.hora),sons:sons()};"),
      # verão ao meio-dia na fazenda (cigarras)
      j("dia(9,13);const f=X('placeById')('fazenda');lugar(f.x+8,f.z+8);"), ["gwait", 14],
      e("veraoFazenda", "return{reg:reg(),temp:Math.round(X('temperatura')()),sons:sons()};"),
      # rio à noite (sapos) e lago
      j("dia(9,22);let best=null;for(let k=0;k<400&&!best;k++){const a=k*0.7,rr=40+k*0.9,x=F[0]+Math.cos(a)*rr,z=F[2]+Math.sin(a)*rr;if(X('aguaPerto')(x,z,3)&&!X('aguaPerto')(x,z,0.5)&&X('lagoR')(x,z)>2)best=[x,z];}window.__rio=best;if(best)lugar(best[0],best[1]);"), ["gwait", 14],
      e("rioNoite", "return{achou:!!window.__rio,reg:reg(),sons:sons()};"),
      # subsolo
      j("dia(9,11);const L=X('SUB')&&X('SUB').salas?X('SUB').salas:null;const s=L&&L[0];if(s){lugar((s.x0+s.x1)/2,(s.z0+s.z1)/2,s.y);}window.__sub=!!s;"), ["gwait", 10],
      e("subsolo", "return{temSub:window.__sub,y:r2(P.y),reg:reg(),ajuste:aj(),sons:sons()};"),
      # tempestade ao ar livre (rajadas)
      j("lugar(F[0]+20,F[2]-20);G.clima.segs=[[6,30,'tempestade']];G.clima.atual='tempestade';G.clima.k=1;G.chuva=1;"), ["gwait", 24],
      e("tempestade", "return{reg:reg(),sons:sons()};"),
      # dia x noite na mata
      j("G.clima.segs=[];G.clima.atual='limpo';G.chuva=0;dia(3,10);lugar(F[0]-40,F[2]+30);"), ["gwait", 12], e("diaMata", "return{sons:sons()};"),
      j("dia(3,23);lugar(F[0]-40,F[2]+30);X('AU').proxCoruja=0;"), ["gwait", 30], e("noiteMata", "return{sons:sons()};"),
      # ameaça: zumbi começa a caçar; depois fica atrás de você
      j("dia(3,11);lugar(F[0]+3,F[2]+3);P.yaw=0;P.body=0;const z=ZZ('walker',P.x+14,P.z+2);z.teste=true;z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;window.__zt=z;"), ["gwait", 1.5],
      e("comecouCacar", "return{sons:sons()};"),
      j("const z=window.__zt;z.x=P.x-Math.sin(P.yaw)*5;z.z=P.z-Math.cos(P.yaw)*5;z.st='caca';X('SOM').pulsoT=0;"), ["gwait", 2.5],
      e("atras", "const r={sons:sons()};window.__zt.vivo=false;return r;")]
salvar('p168.json', s)
