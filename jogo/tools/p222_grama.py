"""p222: capim, baú, galhos secos e pinheiro novos (Poly Haven). Confere no jogo:
· capim: os 4 tufos montados com textura e recorte; os tufos desenhados são os mesmos escolhidos para o capim de antes (MESH.grass),
  ~65% deles, repartidos nos 4 tipos, sem repetir;
· pinheiro: os 3 modelos montados; os pinheiros de perto (MESH.pineN) repartidos entre eles (madeira e agulhas com o mesmo número);
· galhos secos: espalhados no chão da mata, perto do jogador, nos 3 modelos;
· baú: a obra 'bau' e o baú do ferreiro usam o modelo novo (com textura);
· sem erro de WebGL; tempo de desenho (mesma cena) com tudo novo, capim antigo, pinheiro antigo e tudo antigo, no Alto e no Baixo;
· fotos: campo de capim (novo e antigo), de perto em 1ª pessoa, mata de pinheiros (nova e antiga), galhos secos, baú, Baixo, cidade."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
GR = "const gr=(x,z)=>X('ground')(x,z),va=(x,z)=>vai(x,z,gr(x,z));"
# lugares: o quadrado com mais capim e o com mais pinheiros (fora da cidade, dentro do mapa)
ACHA = ("const dm=X('dentroMapa'),dc=X('dentroCidade'),pb=X('pointBlocked');"
        "const melhor=(L,ok)=>{const c=new Map();for(const g of L){if(!ok(g))continue;const k=Math.floor(g.x/12)+','+Math.floor(g.z/12);c.set(k,(c.get(k)||0)+1);}"
        "let b=null,bn=0;for(const[k,v]of c){const[i,j]=k.split(',').map(Number),x=i*12+6,z=j*12+6;if(v>bn&&dm(x,z,-3)&&!dc(x,z,8)&&!pb(x,z,0.6)){bn=v;b=[x,z];}}return[b,bn];};"
        "const c1=melhor(X('GRASS'),g=>!g.anel&&!g.alto),c2=melhor(X('TREES'),t=>t.kind===0&&t.alive&&!t.agua&&!t.alto);"
        "window.__campo=c1[0];window.__campoN=c1[1];window.__mata=c2[0];window.__mataN=c2[1];")
s += [js("vivo();Z.length=0;G.hora=13;" + GR + ACHA + "va(window.__campo[0],window.__campo[1]);"), ["gwait", 1.5]]
s += [ev("capim", GR + "const M=X('MESH'),GM=X('GRAMA'),V=GM.v;const soma=V.reduce((a,m)=>a+m.n,0);"
          "return{campo:window.__campo,capimNoQuadrado:window.__campoN,altura:r2(P.y),chao:r2(gr(P.x,P.z)),info:X('GRAMA_INFO'),pronta:X('gramaPronta')(),"
          "antigoN:M.grass.n,novoN:V.map(m=>m.nome+':'+m.n),soma,fracao:r2(soma/Math.max(1,M.grass.n)),alfa:V.every(m=>m.alfa&&m.tex===GM.tex),"
          "triCena:V.reduce((a,m)=>a+m.n*m.tri,0),triAntigo:M.grass.n*M.grass.count/3,erroGL:X('gl').getError()};")]
s += [ev("capim_mesmos", "const M=X('MESH'),GM=X('GRAMA');const A=new Set();for(let i=0;i<M.grass.n;i++){const a=M.grass.arr;A.add([a[i*8],a[i*8+2],a[i*8+3],a[i*8+4]].map(v=>v.toFixed(3)).join());}"
          "let fora=0,rep=0;const vistos=new Set();for(const m of GM.v)for(let i=0;i<m.n;i++){const a=m.arr,k=[a[i*8],a[i*8+2],a[i*8+3],a[i*8+4]].map(v=>v.toFixed(3)).join();if(!A.has(k))fora++;if(vistos.has(k))rep++;vistos.add(k);}"
          "return{fora,repetidos:rep,total:vistos.size};")]
# mata de pinheiros
s += [js(GR + "va(window.__mata[0],window.__mata[1]);X('rebuildVeg')(true);X('rebuildGrass')();"), ["gwait", 0.8]]
s += [ev("pinheiro", GR + "const M=X('MESH'),PI=X('PINHO');const v=PI.v;"
          "const iguais=v.every(q=>q.madeira.n===q.agulha.n);const soma=v.reduce((a,q)=>a+q.madeira.n,0);"
          "const A=new Set();for(let i=0;i<M.pineN.n;i++){const a=M.pineN.arr;A.add([a[i*8],a[i*8+2]].map(x=>x.toFixed(2)).join());}let fora=0;for(const q of v)for(let i=0;i<q.madeira.n;i++){const a=q.madeira.arr;if(!A.has([a[i*8],a[i*8+2]].map(x=>x.toFixed(2)).join()))fora++;}"
          "return{mata:window.__mata,pinheirosNoQuadrado:window.__mataN,pronto:X('pinhoPronto')(),info:X('MODX_INFO'),pertoAntigo:M.pineN.n,porModelo:v.map(q=>q.madeira.n),soma,iguais,fora,"
          "triPinheirosNovos:v.reduce((a,q)=>a+q.madeira.n*(q.madeira.tri+q.agulha.tri),0),triPinheirosAntigos:M.pineN.n*M.pineN.count/3,longe:M.pine.n,erroGL:X('gl').getError()};")]
s += [ev("galhos", "const GM=X('GALHO_M');return{info:X('GALHOS_INFO'),prontos:X('galhosProntos')(),perto:GM.map(m=>m.n),tri:GM.map(m=>m.tri),triCena:GM.reduce((a,m)=>a+m.n*m.tri,0),"
          "maisPerto:r2(Math.min(...X('GALHOS_SECOS').map(g=>Math.hypot(g.x-P.x,g.z-P.z)))),erroGL:X('gl').getError()};")]
# tempo de desenho: mesma cena (mata), alternando o que é novo (lê um pixel no fim para esperar a placa de vídeo)
TEMPO = ("const gl=X('gl'),M=X('MESH'),GM=X('GRAMA'),PI=X('PINHO'),GA=X('GALHO_M'),px=X('PX_SYNC'),uc=X('updateCamera'),rd=X('render');P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;for(let i=0;i<30;i++)uc(0.05);"
         "const med=(modo,k)=>{const g0=GM.ok,p0=PI.ok,gn=GA.map(m=>m.n);if(modo==='capimAntigo'||modo==='tudoAntigo')GM.ok=false;if(modo==='pinhoAntigo'||modo==='tudoAntigo')PI.ok=false;if(modo==='tudoAntigo')GA.forEach(m=>m.n=0);"
         "rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<k;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}"
         "const t=(performance.now()-t0)/k;GM.ok=g0;PI.ok=p0;GA.forEach((m,i)=>m.n=gn[i]);return r2(t);};"
         "const R={novo:[],capimAntigo:[],pinhoAntigo:[],tudoAntigo:[]};for(let r=0;r<2;r++)for(const m in R)R[m].push(med(m,3));"
         "const md=a=>r2((a[0]+a[1])/2);return{msPorQuadro:R,media:Object.fromEntries(Object.entries(R).map(([k,a])=>[k,md(a)])),graf:n.cfg.graf,"
         "pinheirosPerto:M.pineN.n,capim:M.grass.n,erroGL:gl.getError()};")
s += [ev("tempo_alto", TEMPO)]
# fotos: mata (nova e antiga), campo de capim (novo e antigo), 1ª pessoa, galhos, baú
MATA = GR + "va(window.__mata[0],window.__mata[1]);n.cfg.cam='3';P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;G.hora=13;"
s += foto("e27_mata_nova.png", MATA + "X('PINHO').ok=true;")
s += foto("e27_mata_antiga.png", MATA + "X('PINHO').ok=false;X('GRAMA').ok=false;X('GALHO_M').forEach(m=>m.n=0);")
s += [js("X('PINHO').ok=true;X('GRAMA').ok=true;X('rebuildVeg')(true);X('rebuildGrass')();")]
CAMPO = GR + "va(window.__campo[0],window.__campo[1]);n.cfg.cam='3';P.yaw=0.6;P.body=P.yaw;P.pitch=-0.12;G.hora=13;"
s += foto("e27_capim_novo.png", CAMPO + "X('rebuildVeg')(true);X('rebuildGrass')();")
s += foto("e27_capim_1p.png", GR + "va(window.__campo[0],window.__campo[1]);n.cfg.cam='1';P.yaw=2.2;P.body=P.yaw;P.pitch=-0.45;G.hora=13;")
s += foto("e27_galhos.png", GR + "const L=X('GALHOS_SECOS');let g=L[0],bd=1e9;for(const q of L){const d=Math.hypot(q.x-window.__mata[0],q.z-window.__mata[1]);if(d<bd){bd=d;g=q;}}"
          "va(g.x-1.6,g.z-1.6);X('rebuildVeg')(true);X('rebuildGrass')();n.cfg.cam='1';P.yaw=Math.atan2(g.x-P.x,g.z-P.z);P.body=P.yaw;P.pitch=-0.5;G.hora=13;window.__galho=[r2(g.x),r2(g.z),g.k];")
s += [js(GR + "va(window.__campo[0],window.__campo[1]);X('rebuildVeg')(true);X('rebuildGrass')();window.__bau=X('criarObra')('bau',P.x+2.2,P.z+1.2,0.5);")]
s += [ev("bau", "const M=X('MESH'),o=window.__bau;return{criado:!!o&&o.tipo==='bau',noOB:X('OB').includes(o),malhaNova:M.obra.bau.mod3d==='bau',comTextura:!!M.obra.bau.tex,tri:M.obra.bau.count/3,"
          "ferreiro:!!X('BAU_FERREIRO'),info:X('MODX_INFO').bau,galhoFoto:window.__galho,erroGL:X('gl').getError()};")]
s += foto("e27_bau.png", "n.cfg.cam='3';const o=window.__bau;P.yaw=Math.atan2(o.x-P.x,o.z-P.z);P.body=P.yaw;P.pitch=-0.25;G.hora=13;")
# gráfico Baixo: tempo e foto
s += [js("n.cfg.graf='baixo';n.aplicarCfg&&n.aplicarCfg();" + MATA + "X('rebuildVeg')(true);X('rebuildGrass')();"), ["gwait", 1.0], ev("tempo_baixo", TEMPO)]
s += foto("e27_mata_baixo.png", MATA)
s += [js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();"), ["gwait", 0.8]]
# faixa de capim da cidade (beira de calçada)
s += foto("e27_capim_cidade.png", GR + "let b=null;for(const g of X('GRASS')){if(X('dentroCidade')(g.x,g.z,4)&&Math.abs(g.x-250)<40&&Math.abs(g.z)<40){b=g;break;}}"
          "if(b)vai(b.x-2.5,b.z-2.5);n.cfg.cam='3';P.yaw=0.78;P.body=P.yaw;P.pitch=-0.2;G.hora=13;")
s += [ev("fim", "return{erroGL:X('gl').getError(),capim:X('gramaPronta')(),pinheiro:X('pinhoPronto')(),galhos:X('galhosProntos')()};")]
salvar('tools/p222_grama.json', s, vp=(960, 540))
