"""p129: canteiros com 6 culturas (toque E troca a cultura, segure E planta; milho, batata, abóbora, tomate, cenoura e feijão),
árvores de fruta das casas e sítios (segurar E colhe; a fruta volta com o tempo), macieira plantada pelo menu de construção (B)
com 1 maçã (cresce, dá fruta, segurar E colhe), sem sementes não planta, save e load de tudo.
Fotos: plantação da fazenda com as 6 culturas, árvore de fruta do sítio ao lado de uma macieira plantada, horta de sítio."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
B = ("const D=X('PLANTIO_DEF'),S=X('plantioD')(),PC=X('plantioC')(),K=X('INTER_K').canteiro,q=id=>D.find(d=>d.id===id),r4=v=>Math.round(v*1e4)/1e4,"
     "FR=X('FRUTEIRAS'),W=X('pomarD')(),cresce=()=>{const f=X('PASSOS').find(f=>f.name==='plantioCresce');for(let i=0;i<40&&D.some(d=>S[d.id]>=0&&S[d.id]<1);i++)f(900);},"
     "inv=()=>{const o={};for(const k of['milho','batata','abobora','tomate','cenoura','feijaoVerde','sementes','maca','laranja','manga','acerola'])o[k]=conta(k);return o;},"
     "dif=(a,b)=>{const o={};for(const k in b)if(b[k]!==a[k])o[k]=b[k]-a[k];return o;};")
s = inicio()
# --- canteiro: tocar E troca a cultura, segurar E planta ---
s += [js(B + "vivo();Z.length=0;G.hora=10;G.chuva=0;X('invRemove')('sementes',99);X('invAdd')('sementes',6);"
         "const d=q('faz3_1');const mx=(d.ax+d.bx)/2;vai(mx,d.az-0.9);mira(mx,d.y,d.az);window.__turbo=1;"),
      ["gwait", 0.4],
      ev("alvo", B + "const a=X('alvoInter');return{alvo:a&&a.k,id:a&&a.o&&a.o.id,texto:K.texto(q('faz3_1')),sel:G.plantioSel,"
         "itens:['tomate','cenoura','feijaoVerde','maca','laranja','manga','acerola'].filter(k=>!X('ITEMS')[k]),"
         "iconesFaltando:['i-tomate','i-cenoura','i-vagem','i-maca','i-laranja','i-manga','i-acerola','i-muda'].filter(i=>!document.getElementById(i))};"),
      ["down", "e"], ["wait", 0.08], ["up", "e"], ["gwait", 0.3],
      ev("toque", B + "return{sel:G.plantioSel,c:S['faz3_1'],texto:K.texto(q('faz3_1'))};"),
      ["down", "e"], ["wait", 1.8], ["up", "e"], ["gwait", 0.3],
      ev("segurou", B + "return{c:r4(S['faz3_1']),cult:PC['faz3_1'],sementes:conta('sementes'),texto:K.texto(q('faz3_1'))};"),
      js(B + "window.__a=inv();cresce();"),
      ev("pronto", B + "return{c:S['faz3_1'],texto:K.texto(q('faz3_1'))};"),
      ["down", "e"], ["wait", 1.6], ["up", "e"], ["gwait", 0.3],
      ev("colheu", B + "return{c:S['faz3_1'],cult:PC['faz3_1'],ganhou:dif(window.__a,inv())};"),
      # as outras culturas, direto pela ação do canteiro
      ev("outras", B + "X('invAdd')('sementes',5);const r={};for(const[id,ci]of[['faz3_0',2],['faz3_2',3],['faz2_0',4],['faz2_1',5],['faz2_2',0]]){G.plantioSel=ci;K.usar(q(id));r[id]={c:S[id],cult:PC[id]};}"
         "window.__a=inv();cresce();for(const id of['faz3_0','faz3_2','faz2_0','faz2_1','faz2_2'])K.usar(q(id));r.ganhou=dif(window.__a,inv());r.vazios=['faz3_0','faz3_2','faz2_0','faz2_1','faz2_2'].every(id=>S[id]===-1);return r;"),
      ev("semSementes", B + "X('invRemove')('sementes',99);const d=q('faz3_0');const t=K.texto(d);K.usar(d);return{texto:t,c:S[d.id]};")]
# --- árvores de fruta das casas e dos sítios ---
s += [js(B + "G.hora=10;Z.length=0;const f=FR[0];vai(f.x+1.3,f.z);mira(f.x,f.y+1.2,f.z);window.__a=inv();"),
      ["gwait", 0.4],
      ev("fruteira", B + "const f=FR[0],a=X('alvoInter'),tipos={};for(const x of FR)tipos[x.fruta]=(tipos[x.fruta]||0)+1;"
         "return{n:FR.length,tipos,maduras:FR.filter(x=>W[x.id]>=1).length,alvo:a&&a.k,id:a&&a.o&&a.o.id,quer:f.id,texto:X('INTER_K').fruteira.texto(f)};"),
      ["down", "e"], ["wait", 1.8], ["up", "e"], ["gwait", 0.3],
      ev("colheuFruta", B + "const f=FR[0];return{w:W[f.id],ganhou:dif(window.__a,inv()),texto:X('INTER_K').fruteira.texto(f)};")]
# --- plantar uma macieira pelo menu de construção (B) ---
s += [js(B + "X('invAdd')('maca',1);const f=FR[0];vai(f.x+4.5,f.z+3);P.yaw=0;P.body=0;P.pitch=-0.3;"),
      ["gwait", 0.3], ["press", "b"], ["gwait", 0.3],
      js("const b=document.querySelector('#obras [data-o=\"macieira\"]');window.__btn=!!b;if(b)b.click();"), ["gwait", 0.4],
      ev("menuObra", B + "const O=X('OBRA');return{ativo:O.ativo,tipo:O.tipo,ok:O.ok,motivo:O.motivo||null,botao:window.__btn,custo:X('OBRAS').macieira.custo,maca:conta('maca')};"),
      js(B + "const O=X('OBRA');window.__via='menu';if(O.ativo&&O.tipo==='macieira'&&O.ok)X('colocarObra')();"
         "if(!X('OB').some(o=>o.tipo==='macieira')){window.__via='criarObra';X('criarObra')('macieira',P.x+1.5,P.z+1.5,0);}"),
      ["press", "b"], ["gwait", 0.3],
      ev("plantouArvore", B + "const o=X('OB').find(o=>o.tipo==='macieira');return{via:window.__via,existe:!!o,maca:conta('maca'),ext:o&&o.ext,texto:o&&X('INTER_K').pomarObra.texto(o),modoObra:X('OBRA').ativo};"),
      ev("cresceArvore", B + "const o=X('OB').find(o=>o.tipo==='macieira');const f=X('PASSOS').find(f=>f.name==='pomarCresce');X('pomarExt')(o);const c0=o.ext.cresce;f(30);const c1=o.ext.cresce;"
         "for(let i=0;i<200&&!(o.ext.fruto>=1);i++)f(300);window.__a=inv();vai(o.x+1.2,o.z);mira(o.x,o.y+1.2,o.z);return{c0:r4(c0),c1:r4(c1),cresce:o.ext.cresce,fruto:o.ext.fruto,texto:X('INTER_K').pomarObra.texto(o)};"),
      ["gwait", 0.4],
      ev("alvoArvore", B + "const a=X('alvoInter');return{alvo:a&&a.k,tipo:a&&a.o&&a.o.tipo};"),
      ["down", "e"], ["gwait", 1.6], ["up", "e"], ["gwait", 0.3],   # segurar medido no tempo do jogo (com o desenho do nível Alto, 1,8 s de relógio davam poucos quadros)
      ev("colheuArvore", B + "const o=X('OB').find(o=>o.tipo==='macieira');return{fruto:r4(o.ext.fruto),ganhou:dif(window.__a,inv()),texto:X('INTER_K').pomarObra.texto(o)};")]
# --- fotos ---
s += foto("712_canteiros_6.png", B + "G.hora=10;G.chuva=0;Z.length=0;for(const d of D)if(d.tipo==='fazenda'){const r=+d.id.slice(3).split('_')[0];if(r<6){S[d.id]=1;PC[d.id]=r;}else S[d.id]=0.2;}"
          "const FF=D.filter(d=>d.tipo==='fazenda'),x0=Math.min(...FF.map(d=>d.ax)),x1=Math.max(...FF.map(d=>d.bx)),z0=Math.min(...FF.map(d=>d.az)),z1=Math.max(...FF.map(d=>d.az));"
          "vai((x0+x1)/2,z0-2.4);mira((x0+x1)/2,FF[0].y,(z0+z1)/2);", antes=0.5, esp=4.0)
s += foto("713_pomar.png", B + "G.hora=10;G.chuva=0;Z.length=0;const o=X('OB').find(o=>o.tipo==='macieira');o.ext.fruto=1;const f=FR[0];W[f.id]=1;"
          "const mx=(o.x+f.x)/2,mz=(o.z+f.z)/2,dx=o.x-f.x,dz=o.z-f.z,L=Math.hypot(dx,dz)||1;vai(mx-dz/L*6.5,mz+dx/L*6.5);mira(mx,f.y+1.6,mz);", antes=0.5, esp=4.0)
s += foto("714_horta_sitio.png", B + "G.hora=10;G.chuva=0;Z.length=0;const d=q('sit0');S['sit0']=1;PC['sit0']=1;const L=Math.hypot(d.bx-d.ax,d.bz-d.az),ux=(d.bx-d.ax)/L,uz=(d.bz-d.az)/L,mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;"
          "let k=3.2;try{if(X('pointBlocked')(mx-uz*k,mz+ux*k))k=-3.2;}catch(e){}vai(mx-uz*k,mz+ux*k);mira(mx,d.y,mz);", antes=0.5, esp=4.0)
# --- save e load ---
s += [js(B + "S['faz3_0']=0.5;PC['faz3_0']=4;G.plantioSel=5;W[FR[0].id]=0.3;const o=X('OB').find(o=>o.tipo==='macieira');o.ext.fruto=0.6;X('salvarJogo')();"),
      ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.0],
      ev("carregou", B + "const o=X('OB').find(o=>o.tipo==='macieira');return{faz3_0:r4(S['faz3_0']),cult:PC['faz3_0'],sel:G.plantioSel,fruteira:r4(W[FR[0].id]),arvore:o&&{cresce:o.ext.cresce,fruto:r4(o.ext.fruto)},nFr:FR.length};")]
salvar('p129.json', s)
