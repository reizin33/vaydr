"""p218e: sair do veículo. Para cada tipo de veículo do jogo: entra (parado), aperta E de verdade (evento de teclado, pelo mesmo
caminho da tecla) e confere se saiu; se não saiu, guarda as mensagens da tela. Também com o mouse "solto" e com a 1ª pessoa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;window.__vp=n.ev('veicPode');n.ev('veicPode=()=>null');"
         "const V=X('VEICS');const tipos={};for(const v of V){const t=X('VT')(v);const k=(t&&t.nome)||v.tipo||'?';if(!tipos[k])tipos[k]=v;}window.__tipos=Object.entries(tipos);window.__res={};window.__i=0;"),
      ev("tipos", "return window.__tipos.map(([k,v])=>k);")]
TECLA_E = ("const ev=(t)=>{const e=new KeyboardEvent(t,{code:'KeyE',key:'e',bubbles:true,cancelable:true});window.dispatchEvent(e);};")
for i in range(8):
    s += [js("const T=window.__tipos[" + str(i) + "];if(!T){window.__pula=true;return;}window.__pula=false;const v=T[1];if(X('CARRO')&&X('CARRO').ativo)X('sairCarro')();"
             "vai(v.x+3,v.z+3);v.v=0;if(v.alt!==undefined)v.alt=0;if(v.hp!==undefined&&v.hp<=0)v.hp=50;X('entrarVeic')(v);"), ["gwait", 0.8],
          js("if(window.__pula)return;const C=X('CARRO');window.__dentro=!!(C&&C.ativo);if(C)C.v=0;X('updateHUD')(0.016,0);const ps=document.querySelector('#painel-carro .pc-sair');window.__dica=ps&&ps.textContent;" + TECLA_E + "ev('keydown');setTimeout(()=>ev('keyup'),60);"), ["gwait", 0.8],
          js("if(window.__pula)return;const T=window.__tipos[" + str(i) + "],C=X('CARRO');window.__res[T[0]]={entrou:window.__dentro,saiu:!(C&&C.ativo),alvo:X('alvoInter')&&X('alvoInter').k,acao:P.acao&&P.acao.tipo,modo:G.modo,avisos:[...document.getElementById('feed').children].map(s=>s.textContent).slice(-3),dicaPainel:window.__dica};")]
s += [ev("resultado", "return window.__res;"), js("n.ev('veicPode=window.__vp');")]
salvar('p218e_veiculos.json', s, vp=(640, 360))
