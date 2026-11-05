"""p164: zumbis e desafios (Etapa 7), parte A.
1 ondas da noite reequilibradas: quantidade por noite (normal, fácil, difícil, base fortificada, lua de sangue) comparada com a
  fórmula antiga; brutamontes por onda; uma onda de verdade na noite 8 (tipos e vida).
2 brutamontes derrubam pilares: você em cima de uma plataforma sobre 4 pilares; o brutamontes vai nos pilares, bate, derruba
  e o piso desaba (e você cai). Com paredes no térreo, ele quebra a parede primeiro.
3 caixa militar com cronômetro: trancada; segurar liga; o alarme chama ondas; a linha do tempo aparece no quadro da missão;
  salvar e carregar no meio mantém o tempo; abre com coisas; esvaziada, tranca de novo 3 dias depois (com você longe)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cr=X('criarObra'),gr=(x,z)=>X('ground')(x,z),OBt=t=>X('OB').filter(o=>o.tipo===t),"
     "antiga=(n,dif,fat,sangue)=>Math.round((2+n*1.8)*X('DIF')[dif].horda*(sangue?1.5:1)*fat),"
     "cxm=()=>X('CXM_DEF')[0],cst=()=>X('cxmD')()[cxm().id];")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};"
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__casa3=true;window.__turbo=6;window.__semRender=true;")
# 1) ondas
s += [j("vivo();Z.length=0;" + LIMPA),
      e("ondasTabela", "const L=[];const salva=[n.cfg.dif,G.baseNv,G.luaSangue,G.final];G.final=false;"
                       "for(const nn of[1,2,3,4,5,6,8,10,12,15,20,30]){n.cfg.dif='normal';G.baseNv=1;G.luaSangue=false;const nova=X('ondaQtd')(nn),velha=antiga(nn,'normal',1,false);"
                       "n.cfg.dif='facil';const fa=X('ondaQtd')(nn);n.cfg.dif='dificil';const di=X('ondaQtd')(nn);n.cfg.dif='normal';G.baseNv=3;const b3=X('ondaQtd')(nn),br3=X('ondaBrutos')(nn);G.baseNv=1;"
                       "G.luaSangue=true;const ls=X('ondaQtd')(nn);G.luaSangue=false;L.push({n:nn,nova,velha,facil:fa,dificil:di,base3:b3,sangue:ls,brutos:X('ondaBrutos')(nn),brutosBase3:br3,forca:r2(X('ondaForca')(nn))});}"
                       "[n.cfg.dif,G.baseNv,G.luaSangue,G.final]=salva;return L;"),
      j("window.__cadaPasso=null;Z.length=0;vai(F[0]+2,F[2]+2);G.noite=true;G.noiteN=8;G.luaSangue=false;G.final=false;G.baseNv=1;window.__z0=Z.length;X('ondaNoturna')();"
        "const L=Z.filter(z=>z.vivo&&z.noturno);window.__onda=L.map(z=>z.tipo+':'+Math.round(z.hp));"),
      e("ondaNoite8", "const c={};for(const t of window.__onda.map(x=>x.split(':')[0]))c[t]=(c[t]||0)+1;const b=window.__onda.filter(x=>x.startsWith('brute:'));return{total:window.__onda.length,tipos:c,vidaBrute:b,vidaBrutoBase:X('ZS').brute.hp,forca:r2(X('ondaForca')(8)),esperado:X('ondaQtd')(8)};"),
      j("G.noite=false;G.noiteN=0;Z.length=0;" + LIMPA)]
# 2) pilares
PILARES = ("const C=[F[0]+9,F[2]+9];window.__C=C;const T=gr(C[0]+1.5,C[1]+1.5)+2.6;for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,gr(C[0]+i,C[1]+k),{top:T});"
           "cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,T,{apoio:'pilar',nivel:0});")
s += [j("window.__cadaPasso=null;Z.length=0;" + PILARES), ["gwait", 0.3],
      e("montou", "const p=OBt('plataforma')[0];return{pilares:OBt('pilar').map(o=>Math.round(o.hp)+'@'+r2(o.ext.top)),plat:p&&r2(p.y),sob:!!X('pilarSob')(p.x,p.z,p.yaw,p.y)};"),
      j("const p=OBt('plataforma')[0];vai(p.x,p.z,p.y);P.vy=0;const C=window.__C;const z=ZZ('brute',C[0]-6,C[1]+1.5);z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;window.__bz=z;"
        "window.__log=[];window.__cadaPasso=()=>{const n=__nnc,b=window.__bz;if(!b||!b.vivo)return;const k=b.st+(b.obra?':'+b.obra.tipo:'');if(window.__log[window.__log.length-1]!==k)window.__log.push(k);for(const z of n.Z)if(z!==b)z.vivo=false;P.vida=100;};"),
      ["gwait", 8],
      e("bateu8s", "const b=window.__bz;return{st:b.st,alvo:b.obra&&b.obra.tipo,derrubando:!!b.derrubando,pilares:OBt('pilar').map(o=>Math.round(o.hp)),log:window.__log.slice(0,12),vy:r2(P.y)};"),
      ["gwait", 70],
      e("derrubou", "const b=window.__bz;return{st:b.st,pilares:OBt('pilar').map(o=>Math.round(o.hp)),plataforma:OBt('plataforma').length,playerY:r2(P.y),chao:r2(gr(P.x,P.z)),log:window.__log.slice(-10),avisou:!!G.derrubaT};"),
      # com paredes no térreo: quebra a parede primeiro
      j("for(const z of Z)z.vivo=false;Z.length=0;for(const o of X('OB').slice())if(['pilar','plataforma','paredeCasa'].includes(o.tipo))X('destruirObraSilenciosa')(o);window.__cadaPasso=null;"
        "const C=[F[0]+9,F[2]-9];window.__C=C;const T=gr(C[0]+1.5,C[1]+1.5)+2.6;for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,gr(C[0]+i,C[1]+k),{top:T});"
        "cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,T,{apoio:'pilar',nivel:0});for(const[x,z,y]of[[C[0],C[1]+1.5,Math.PI/2],[C[0]+3,C[1]+1.5,Math.PI/2],[C[0]+1.5,C[1],0],[C[0]+1.5,C[1]+3,0]])cr('paredeCasa',x,z,y,undefined,false,gr(x,z));"
        "const p=OBt('plataforma')[0];vai(p.x,p.z,p.y);const z=ZZ('brute',C[0]-6,C[1]+1.5);z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;window.__bz=z;window.__log=[];"
        "window.__cadaPasso=()=>{const n=__nnc,b=window.__bz;if(!b||!b.vivo)return;const k=b.st+(b.obra?':'+b.obra.tipo:'');if(window.__log[window.__log.length-1]!==k)window.__log.push(k);for(const z of n.Z)if(z!==b)z.vivo=false;P.vida=100;};"),
      ["gwait", 14],
      e("parede", "const b=window.__bz;return{st:b.st,alvo:b.obra&&b.obra.tipo,paredes:OBt('paredeCasa').map(w=>Math.round(w.hp)),pilares:OBt('pilar').map(o=>Math.round(o.hp)),log:window.__log.slice(0,10)};"),
      ["gwait", 20],
      e("parede2", "const b=window.__bz;return{st:b.st,alvo:b.obra&&b.obra.tipo,paredes:OBt('paredeCasa').map(w=>Math.round(w.hp)),pilares:OBt('pilar').map(o=>Math.round(o.hp)),log:window.__log.slice(0,14)};"),
      j("for(const z of Z)z.vivo=false;Z.length=0;vai(F[0]+3,F[2]+3);" + LIMPA)]
# 3) caixa militar
s += [e("cxmInicio", "const d=cxm();return{lugares:X('CXM_DEF').map(q=>q.id+'@'+r2(q.x)+','+r2(q.z)+' livre:'+!X('pointBlocked')(q.x+1.4,q.z,0.3)),st:cst().st,itens:cst().itens};"),
      j("const d=cxm();vai(d.x+1.6,d.z,X('chaoEm')(d.x+1.6,d.z,5));mira(d.x,d.y+0.4,d.z);"), ["gwait", 0.4],
      e("cxmTexto", "const d=cxm();const a=X('interAtual')();return{alvo:a&&a.k,pos:[r2(d.x),r2(d.z)],texto:X('INTER_K').cxm.texto(d),visto:cst().visto};"),
      j("const d=cxm();X('INTER_K').cxm.usar(d,false);window.__antes=cst().st;X('INTER_K').cxm.usar(d,true);window.__z0=Z.filter(z=>z.vivo).length;"
        "window.__cxmZ=0;window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)if(z.vivo&&z.cxm){window.__cxmZ++;z.vivo=false;}n.Z.length=0;P.vida=100;};"),
      ["gwait", 1],
      e("ligou", "return{tocouSemSegurar:window.__antes,st:cst().st,resta:Math.round(cst().resta),hud:document.getElementById('missao-cxm').hidden?null:document.getElementById('missao-cxm').textContent,"
                 "texto:X('INTER_K').cxm.texto(cxm()).t};"),
      ["gwait", 17],
      e("primeiraOnda", "return{resta:Math.round(cst().resta),onda:cst().onda,zumbisDaCaixa:window.__cxmZ};"),
      j("X('salvarJogo')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;" + LIMPA), ["gwait", 0.5]]
s += [e("carregouContando", "return{st:cst().st,resta:Math.round(cst().resta),onda:cst().onda};"),
      j("cst().resta=1.5;"), ["gwait", 3],
      e("abriu", "const c=cst();return{st:c.st,itens:(c.itens||[]).filter(Boolean).map(i=>i.id+'x'+i.n),dia:c.dia,hud:document.getElementById('missao-cxm').hidden};"),
      j("const d=cxm();vai(d.x+1.6,d.z,X('chaoEm')(d.x+1.6,d.z,5));G.modo='jogo';X('INTER_K').cxm.usar(d,false);"), ["wait", 0.4],
      e("abriuBau", "const r={modo:G.modo,inv:!document.getElementById('inv').hidden,aba:X('invAba')};X('fecharMochila')();return r;"),
      j("const c=cst();for(let i=0;i<c.itens.length;i++)c.itens[i]=null;G.dia+=3;vai(F[0]+3,F[2]+3);"), ["gwait", 1],
      e("trancouDeNovo", "const c=cst();return{st:c.st,itens:c.itens,texto:X('INTER_K').cxm.texto(cxm()).t};")]
salvar('p164.json', s)
