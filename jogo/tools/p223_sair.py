"""p223: sair do veículo (pedido do Himalaia: "quando você está num veículo não tem como sair dele"). Para cada veículo do jogo,
no lugar onde ele nasce: entra parado e confere cada lugar de descida (o que bloqueia), depois sai pela função do jogo e pela
tecla E de verdade. Depois repete com o veículo encostado em árvores e paredes (lugar apertado)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;window.__vp=n.ev('veicPode');n.ev('veicPode=()=>null');")]
DIAG = ("const diag=(v)=>{const T=X('VT')(v),pb=X('pointBlocked'),cl=X('carroLocal');const op=T.agua?[]:T.moto?[[0.9,0],[-0.9,0],[0,-1.6],[1.4,0],[-1.4,0],[0,1.6],[0,-2.3]]:[[T.hw+0.7,0.3],[-T.hw-0.7,0.3],[0,-T.hd-0.85],[0,T.hd+0.85]];"
        "return op.map(([lx,lz])=>{const q=cl(lx,0,lz,v),c=pb(q[0],q[2],0.4);if(!c)return'livre';const k=Object.keys(c).filter(k=>!['x','z','r','t','c','s','hw','hd','solid','y0','y1','id','cx','cz','i','j'].includes(k));"
        "return'bloq:'+k.join('/')+(c.t===0?' r'+r2(c.r):' '+r2(c.hw)+'x'+r2(c.hd));});};")
TECLA_E = "const ev=(t)=>{const e=new KeyboardEvent(t,{code:'KeyE',key:'e',bubbles:true,cancelable:true});window.dispatchEvent(e);};"
s += [js("const V=X('VEICS');const tipos={};for(const v of V){const t=X('VT')(v);const k=(t&&t.nome)||v.tipo||'?';if(!tipos[k])tipos[k]=v;}window.__tipos=Object.entries(tipos);window.__res={};"),
      ev("tipos", "return{tipos:window.__tipos.map(([k,v])=>[k,r2(v.x),r2(v.z)]),desencalhados:X('VEIC_DESENC')};")]
for i in range(7):
    s += [js("const T=window.__tipos[" + str(i) + "];if(!T){window.__pula=true;return;}window.__pula=false;const v=T[1];if(X('CARRO')&&X('CARRO').ativo)X('sairCarro')();"
             "vai(v.x+3,v.z+3);v.v=0;if(v.alt!==undefined)v.alt=0;if(v.hp!==undefined&&v.hp<=0)v.hp=50;X('entrarVeic')(v);"), ["gwait", 0.6],
          js("if(window.__pula)return;" + DIAG + "const T=window.__tipos[" + str(i) + "],C=X('CARRO');window.__d=C?diag(C):null;window.__dentro=!!(C&&C.ativo);if(C)C.v=0;" + TECLA_E + "ev('keydown');setTimeout(()=>ev('keyup'),60);"), ["gwait", 0.6],
          js("if(window.__pula)return;const T=window.__tipos[" + str(i) + "],C=X('CARRO');window.__res[T[0]]={entrou:window.__dentro,saiu:!(C&&C.ativo),lugares:window.__d,aviso:[...document.getElementById('feed').children].map(s=>s.textContent).slice(-1)[0],"
             "dist:C?r2(Math.hypot(P.x-C.x,P.z-C.z)):null,alturaPe:C?r2(P.y-X('ground')(P.x,P.z)):null};")]
s += [ev("no_lugar", "return window.__res;")]
# lugar apertado: carro e triciclo entre árvores (árvores de colisão criadas em volta, sobrando só um vão de 1,1 m atrás)
APERTO = ("const T=window.__tipos.find(t=>t[0]===%r);if(!T)return;const v=T[1];if(X('CARRO')&&X('CARRO').ativo)X('sairCarro')();const cc=X('colCircle'),cl=X('carroLocal'),VT=X('VT')(v);"
          "window.__aperto=window.__aperto||[];for(const[lx,lz]of[[VT.hw+0.55,0],[-VT.hw-0.55,0],[VT.hw+0.55,VT.hd*0.6],[-VT.hw-0.55,VT.hd*0.6],[VT.hw+0.55,-VT.hd*0.6],[-VT.hw-0.55,-VT.hd*0.6],[0,VT.hd+0.6],[VT.hw*0.6,VT.hd+0.6],[-VT.hw*0.6,VT.hd+0.6]]){"
          "const q=cl(lx,0,lz,v);window.__aperto.push(cc(q[0],q[2],0.35,{tree:{teste:1}}));}"
          "vai(v.x+3,v.z+3);v.v=0;X('entrarVeic')(v);")
for nome in ['Carro', 'Triciclo', 'Moto']:
    s += [js(APERTO % nome), ["gwait", 0.5],
          js("const C=X('CARRO');window.__dentro=!!(C&&C.ativo);if(C)C.v=0;" + TECLA_E + "ev('keydown');setTimeout(()=>ev('keyup'),60);"), ["gwait", 0.6],
          js("const C=X('CARRO');window.__res2=window.__res2||{};window.__res2[%r]={entrou:window.__dentro,saiu:!(C&&C.ativo),aviso:[...document.getElementById('feed').children].map(s=>s.textContent).slice(-1)[0],"
             "dist:C?r2(Math.hypot(P.x-C.x,P.z-C.z)):null,preso:!!X('pointBlocked')(P.x,P.z,0.3)};for(const c of window.__aperto)X('colRemove')(c);window.__aperto=[];" % nome)]
s += [ev("apertado", "return window.__res2;"), js("n.ev('veicPode=window.__vp');")]
salvar('tools/p223_sair.json', s, vp=(640, 360))
