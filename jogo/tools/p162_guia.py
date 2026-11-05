"""p162: missões iniciais — guia "Primeira casa" (Etapa 5). Aparece no quadro da missão; avança passo a passo conforme o jogador
junta material, faz o machado, a bancada, as tábuas, pregos e cordas, pilares e plataforma, paredes e porta, escada e telhado;
salvar e carregar no meio mantém o passo; no fim some do quadro e dá experiência (sem itens); um jogo salvo de antes do guia,
com a casa pronta, carrega com o guia concluído e sem prêmio."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=[6,-16],g=(x,z)=>X('ground')(x,z),cr=X('criarObra'),gd=()=>X('guiaD')(),el=()=>document.getElementById('missao-guia'),"
     "est=()=>({passo:gd().passo,feito:gd().feito,hud:el().hidden?null:el().textContent,xp:G.xp,nivel:G.nivel,itens:P.inv.filter(Boolean).length});")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
MONTA_PISO = ("for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
              "cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});")
MONTA_PAREDES = ("cr('portaMadeira',C[0]+1.5,C[1],0,undefined,false,g(C[0]+1.5,C[1]));cr('paredeCasa',C[0],C[1]+1.5,Math.PI/2,undefined,false,g(C[0],C[1]+1.5));"
                 "cr('paredeCasa',C[0]+1.5,C[1]+3,Math.PI,undefined,false,g(C[0]+1.5,C[1]+3));")
s = inicio("window.__casa3=true;window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};for(let i=0;i<P.inv.length;i++)P.inv[i]=null;"), ["gwait", 1.5],
      e("inicio", "return est();"),
      j("n.invAdd('graveto',4);n.invAdd('pedra',2);n.invAdd('fibra',5);"), ["gwait", 1.5], e("material", "return est();"),
      j("n.invAdd('machadoPedra',1);"), ["gwait", 1.5], e("machado", "return est();"),
      j("n.invAdd('madeira',10);"), ["gwait", 1.5], e("madeira", "return est();"),
      j("cr('bancadaTrab',C[0]-4,C[1]-3,0,undefined,false,g(C[0]-4,C[1]-3));"), ["gwait", 1.5], e("bancada", "return est();"),
      j("n.invAdd('tabuas',12);"), ["gwait", 1.5], e("tabuas", "return est();"),
      # salvar e carregar no meio
      j("X('salvarJogo')();"), ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2],
      js("window.__turbo=6;window.__semRender=true;window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};"), ["gwait", 1.5],
      e("carregou", "return est();"),
      j("n.invAdd('pregos',10);n.invAdd('corda',3);"), ["gwait", 1.5], e("pregos", "return est();"),
      j(MONTA_PISO), ["gwait", 1.5], e("piso", "return est();"),
      j(MONTA_PAREDES), ["gwait", 1.5], e("paredes", "return est();"),
      j("cr('escadaMadeira',C[0]-0.9,C[1]+1.5,-Math.PI/2,undefined,false,g(C[0]-0.9,C[1]+1.5),{px:C[0]+1.5,pz:C[1]+1.5,py:2.4,k:0,d:-1});"), ["gwait", 1.5], e("escada", "return est();"),
      j("window.__xp0=G.xp+G.nivel*1000;cr('telhado',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4+0.05);"), ["gwait", 1.5],
      e("pronta", "return Object.assign(est(),{xpGanho:G.xp+G.nivel*1000-window.__xp0});"),
      # jogo salvo de antes do guia (sem a parte "guia"), com a casa pronta: carrega concluído e sem prêmio
      j("X('salvarJogo')();const s=JSON.parse(localStorage.getItem('nnc_jogo_v1'));delete s.x8.guia;localStorage.setItem('nnc_jogo_v1',JSON.stringify(s));"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 1.5],
      e("jogoAntigo", "return est();")]
salvar('p162.json', s)
