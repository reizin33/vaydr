"""p128: plantar e colher nos canteiros (plantação da fazenda e hortas dos sítios).
Confere: os canteiros existem (na fazenda começam vazios; nos sítios a maioria já está pronta); mirar num canteiro mostra
'Plantar ... aqui'; segurar E planta e gasta 1 semente; a plantação cresce sozinha com o jogo rodando; pronta mostra
'Colher ...'; segurar E colhe (ganha a cultura do canteiro e ele esvazia); sem sementes não planta; o estado fica no save.
Fotos: a plantação da fazenda com fileiras em fases diferentes e uma horta de sítio."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
B = ("const D=X('PLANTIO_DEF'),S=X('plantioD')(),K=X('INTER_K').canteiro,q=id=>D.find(d=>d.id===id),r4=v=>Math.round(v*1e4)/1e4,"
     "inv=()=>({milho:conta('milho'),batata:conta('batata'),abobora:conta('abobora'),sementes:conta('sementes')});")
s = inicio()
s += [js(B + "vivo();Z.length=0;G.hora=10;G.chuva=0;X('invRemove')('sementes',99);X('invAdd')('sementes',3);"
         "const d=q('faz3_1');const mx=(d.ax+d.bx)/2;vai(mx,d.az-0.9);mira(mx,d.y,d.az);"),
      ["gwait", 0.4],
      ev("inicio", B + "const d=q('faz3_1'),a=X('alvoInter');return{faz:D.filter(x=>x.tipo==='fazenda').length,sit:D.filter(x=>x.tipo==='sitio').length,"
         "sitProntos:D.filter(x=>x.tipo==='sitio'&&S[x.id]>=1).length,fazVazios:D.filter(x=>x.tipo==='fazenda'&&S[x.id]<0).length,"
         "alvo:a&&a.k,alvoId:a&&a.o&&a.o.id,texto:K.texto(d),inv:inv()};"),
      ["down", "e"], ["wait", 1.8], ["up", "e"], ["gwait", 0.2],
      ev("plantou", B + "const d=q('faz3_1');let via='tecla';if(!(S[d.id]>=0)){n.alvo={k:'canteiro',o:d};n.interagir(true);via='interagir';}"
         "window.__c0=S[d.id];return{via,c:r4(S[d.id]),inv:inv(),texto:K.texto(d)};"),
      ["gwait", 3],
      ev("cresce", B + "const d=q('faz3_1');return{antes:r4(window.__c0),agora:r4(S[d.id]),subiu:S[d.id]>window.__c0};"),
      js(B + "const f=X('PASSOS').find(f=>f.name==='plantioCresce');for(let i=0;i<40&&S['faz3_1']<1;i++)f(900);"),
      ev("pronto", B + "const d=q('faz3_1');window.__antes=inv();return{c:S[d.id],texto:K.texto(d),cult:d.cult};"),
      ["down", "e"], ["wait", 1.6], ["up", "e"], ["gwait", 0.2],
      ev("colheu", B + "const d=q('faz3_1');let via='tecla';if(S[d.id]>=1){n.alvo={k:'canteiro',o:d};n.interagir(true);via='interagir';}"
         "const a=window.__antes,b=inv();return{via,c:S[d.id],ganhou:{milho:b.milho-a.milho,batata:b.batata-a.batata,abobora:b.abobora-a.abobora,sementes:b.sementes-a.sementes},texto:K.texto(d)};"),
      ev("semSementes", B + "X('invRemove')('sementes',99);const d=q('faz3_0');const t=K.texto(d);K.usar(d);return{texto:t,c:S[d.id],sem:conta('sementes')};")]
# a plantação da fazenda com fileiras em fases diferentes: 2 prontas, 2 crescendo, 2 de mudas, 1 vazia
s += foto("710_plantio_fazenda.png", B + "G.hora=10;G.chuva=0;Z.length=0;for(const d of D)if(d.tipo==='fazenda'){const r=+d.id.slice(3).split('_')[0];S[d.id]=r<2?1:r<4?0.7:r===4?0.3:r===5?0.1:-1;}"
          "const F=D.filter(d=>d.tipo==='fazenda'),x0=Math.min(...F.map(d=>d.ax)),x1=Math.max(...F.map(d=>d.bx)),z0=Math.min(...F.map(d=>d.az)),z1=Math.max(...F.map(d=>d.az));"
          "vai(x0-2,z0-3);mira((x0+x1)/2,F[0].y+0.3,(z0+z1)/2);", antes=0.5, esp=4.0)
# uma horta de sítio (canteiros girados junto com o sítio)
s += foto("711_plantio_sitio.png", B + "G.hora=10;G.chuva=0;Z.length=0;const d=q('sit0');const L=Math.hypot(d.bx-d.ax,d.bz-d.az),ux=(d.bx-d.ax)/L,uz=(d.bz-d.az)/L,mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;"
          "let k=3.2;try{if(X('pointBlocked')(mx-uz*k,mz+ux*k))k=-3.2;}catch(e){}vai(mx-uz*k,mz+ux*k);mira(mx,d.y,mz);", antes=0.5, esp=4.0)
s += [js(B + "S['faz3_0']=0.5;S['sit0']=0.25;X('salvarJogo')();"),
      ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.0],
      ev("carregou", B + "return{faz3_0:r4(S['faz3_0']),sit0:r4(S['sit0']),faz3_1:S['faz3_1'],total:Object.keys(S).length,defs:D.length};")]
salvar('p128.json', s)
