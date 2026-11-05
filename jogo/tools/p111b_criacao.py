"""p111: criação do personagem (testes 1 a 7 do pedido).
1 criação antes da campanha (tela, opções mudando a malha 3D de verdade, câmera, aleatório, confirmação)
2 começa só de bermuda  3 nada proibido no inventário nem no corpo  4 roupas achadas vestem e trocam
5 primeira e terceira pessoa  6 salvar/carregar preserva aparência, roupas e inventário  7 sem itens duplicados, peças invisíveis ou erros."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
R = ("const C=X('CRIA'),J=()=>n.MESH.jogador,vis=id=>{const e=document.getElementById(id);return!!e&&!e.hidden&&e.getClientRects().length>0;},"
     "pix=cv=>{try{const g=cv.getContext('2d'),d=g.getImageData(0,0,cv.width,cv.height).data;let s=0,k=0;for(let i=0;i<d.length;i+=37*4){s+=d[i]+d[i+1]+d[i+2];k++;}return Math.round(s/k);}catch(e){return 'ERR '+e.message;}},"
     "ids=()=>P.inv.filter(Boolean).map(q=>q.id+(q.n>1?'x'+q.n:'')).join(','),"
     "visto=()=>{const o={};for(const k of X('ROUPA_SLOTS'))if(P.roupa[k])o[k]=P.roupa[k];return o;},"
     "malhas=()=>{const o={};for(const k of X('ROUPA_SLOTS')){const id=P.roupa[k];if(id){const m=X('roupaMeshJ')(id);o[id]=m?m.count:0;}}return o;},"
     "fren=(d,h,ty)=>{const a=P.ch.yaw;G.camFix={pos:[P.x+Math.sin(a)*d,P.y+h,P.z+Math.cos(a)*d],tgt:[P.x,P.y+ty,P.z],fov:0.75};},"
     "tras=(d,h,ty)=>{const a=P.ch.yaw+Math.PI;G.camFix={pos:[P.x+Math.sin(a)*d,P.y+h,P.z+Math.cos(a)*d],tgt:[P.x,P.y+ty,P.z],fov:0.75};},"
     "veste=id=>{const r=X('invAdd')(id,1);const i=P.inv.findIndex(q=>q&&q.id===id);if(i<0)return'nao entrou';X('vestir')(i);return P.roupa[X('ITEMS')[id].slot]===id;},"
     "vesteJa=id=>{const i=P.inv.findIndex(q=>q&&q.id===id);if(i<0)return'nao tem';X('vestir')(i);return P.roupa[X('ITEMS')[id].slot]===id;};")
def foto2(nome, setup, esp=3.0):
    return [js(R + setup), ["gwait", 0.3], js("G.modo='pausa';" + VER), ["wait", esp], ["shot", nome], js("G.modo='jogo';window.__semRender=true;window.__turbo=6;")]
def jr(c): return js(R + c)
def er(nome, c): return ev(nome, R + c)
VER = "window.__semRender=false;window.__turbo=1;"
R2 = R

AP = "{rosto:2,pele:3,olhos:3,sobr:4,nariz:1,boca:3,barba:2,cabelo:5,corCab:5,altura:3,porte:2,nome:'Rafa'}"
s = [["wait", 2], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
     ["click", "#m-novo", "criacao"], ["wait", 0.5],
     jr("C.ap=X('aparLimpa')(" + AP + ");X('aplicarAparencia')(C.ap);document.getElementById('cr-nome').value='Rafa';"), ["click", "#cr-confirmar"], ["wait", 0.3], ["click", "#cr-m-sim"], ["wait", 1.0],
     er("inicio", "return{modo:G.modo,ap:G.aparencia,vestido:visto(),inv:ids()};"),
     jr("G.hora=11;G.chuva=0;Z.length=0;X('FAUNA_POP').ativosMax=0;n.cfg.cam='3';document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);const Fi=X('FIRE');vai(Fi[0]+5,Fi[2]+4);P.yaw=P.body=0.6;"), ["gwait", 0.4]]
s += foto2("618_jogo_1p_bermuda.png", "G.camFix=null;n.cfg.cam='1';P.pitch=-0.35;")
s += [jr("n.cfg.cam='3';P.pitch=-0.06;window.__r=[veste('camiseta'),veste('calcaCargo'),veste('camisaLeve'),veste('botasTrilha'),veste('cinto'),veste('mochilaPequena')];")]
s += foto2("619_jogo_1p_camisa.png", "G.camFix=null;n.cfg.cam='1';P.pitch=-0.35;")
s += [jr("n.cfg.cam='3';P.pitch=-0.06;")]
s += foto2("620_jogo_roupas_frente.png", "fren(2.7,1.3,0.95);")
s += foto2("621_jogo_roupas_costas.png", "tras(2.7,1.35,0.95);")
# 6: salvar e carregar (recarrega a página e continua)
s += [jr("G.camFix=null;X('invAdd')('pedra',3);X('invAdd')('graveto',4);sessionStorage.setItem('__antes',JSON.stringify({ap:G.aparencia,v:visto(),inv:ids()}));X('salvarJogo')();"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 1.0],
      er("carregou", "const a=JSON.parse(sessionStorage.getItem('__antes')||'null');return{modo:G.modo,ap:G.aparencia,vestido:visto(),inv:ids(),"
         "igualAp:!!a&&JSON.stringify(a.ap)===JSON.stringify(G.aparencia),igualRoupa:!!a&&JSON.stringify(a.v)===JSON.stringify(visto()),igualInv:!!a&&a.inv===ids(),malha:JSON.stringify(J().ap)===JSON.stringify(G.aparencia),escala:P.ch.s,proc:P.ch.proc,malhas:malhas()};"),
      jr("G.hora=11;Z.length=0;n.cfg.cam='3';document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);"), ["gwait", 0.3]]
s += foto2("622_carregado.png", "fren(2.7,1.3,0.95);")
s += [jr("G.camFix=null;"),
      jr("const K=X('SAVE_KEY'),s=JSON.parse(localStorage.getItem(K));delete s.x8.aparencia;localStorage.setItem(K,JSON.stringify(s));window.__ok=X('carregarJogo')();"),
      er("saveAntigo", "return{abriu:window.__ok,ap:G.aparencia,padrao:JSON.stringify(G.aparencia)===JSON.stringify(X('aparLimpa')(X('APAR_PADRAO'))),vestido:visto()};"),
      er("travada", "return{botoesDeAparenciaForaDaCriacao:[...document.querySelectorAll('button')].filter(b=>/apar[eê]ncia|personagem/i.test(b.textContent)&&!b.closest('#t-criacao')).map(b=>b.id)};")]
s += [jr("X('salvarJogo')();X('mostrarMenu')();"), ["wait", 0.3], ["click", "#m-novo", "criacao"], ["wait", 0.4], ["click", "#c-sim", "criacao"], ["wait", 0.6],
      er("criacaoComSave", "return{modo:G.modo,tela:vis('t-criacao'),apagar:C.apagar,temSave:X('temSave')()};"),
      ["click", "#cr-voltar"], ["wait", 0.4], er("voltou", "return{modo:G.modo,menu:vis('t-menu'),temSave:X('temSave')(),continuar:vis('m-continuar'),zumbisDoMenu:Z.length};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 760}}, s],
        ["cel", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2},
         [["wait", 2.5], ["click", "#m-novo", "criacao"], ["wait", 0.5], js(VER), ["wait", 6], ["shot", "615_criacao_celular.png"],
          ["click", "#cr-nav [data-aba='cabelo']"], ["wait", 2], ["shot", "616_criacao_celular_cabelo.png"],
          ev("celular", "const r=e=>{const q=document.querySelector(e);if(!q)return null;const b=q.getBoundingClientRect();return[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};"
             "return{largura:document.documentElement.scrollWidth,palco:r('#cr-foco'),opcoes:r('.cr-painel'),rodape:r('.cr-rodape'),confirmar:r('#cr-confirmar')};")]],
        ["tab", {"viewport": {"width": 1280, "height": 800}},
         [["wait", 2.5], ["click", "#m-novo", "criacao"], ["wait", 0.5], js(VER), ["wait", 7], ["shot", "617_criacao_1280.png"],
          ["click", "#cr-zoom"], ["wait", 5], ["shot", "617b_criacao_zoom.png"]]]]
import json
json.dump(plan, open('p111b.json', 'w'), ensure_ascii=False)
print('ok', len(s))
