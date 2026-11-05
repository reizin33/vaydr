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
s = [["wait", 2], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
     ["click", "#m-novo", "criacao"], ["wait", 0.8],
     jr("window.__m0=J().mesh.count;window.__ap0=JSON.stringify(J().ap);" + VER), ["wait", 9],
     er("abriu", "return{modo:G.modo,tela:vis('t-criacao'),menu:vis('t-menu'),abas:document.querySelectorAll('#cr-nav [data-aba]').length,secoes:[...document.querySelectorAll('#cr-opcoes .cr-sec h3')].map(h=>h.firstChild.textContent).join('|'),"
        "opcoes:document.querySelectorAll('#cr-opcoes .cr-op').length,ap:J().ap,proc:P.ch.proc,roupaPreview:visto(),retratoPix:pix(document.getElementById('cr-retrato')),vistaPix:pix(document.querySelector('#cr-vistas canvas')),resumo:document.getElementById('cr-resumo').textContent.slice(0,160)};"),
     ["shot", "600_criacao.png"]]
# as escolhas mudam a malha 3D (vértices, escala, ombros)
s += [["click", "#cr-opcoes [data-k='rosto'][data-i='2']"], ["click", "#cr-opcoes [data-k='pele'][data-i='3']"], ["click", "#cr-opcoes [data-k='olhos'][data-i='5']"],
      ["click", "#cr-opcoes [data-k='barba'][data-i='4']"], ["click", "#cr-opcoes [data-k='nariz'][data-i='2']"],
      er("mudouRosto", "return{ap:J().ap,verts:J().mesh.count,antes:window.__m0,pele:J().spec.c.skin.toString(16),cabeca:[J().spec.headW,J().spec.headH].map(r2),pressionado:document.querySelector('#cr-opcoes [data-k=\"rosto\"][aria-pressed=\"true\"]').dataset.i};"),
      ["click", "#cr-nav [data-aba='cabelo']"], ["click", "#cr-opcoes [data-k='cabelo'][data-i='5']"], ["click", "#cr-opcoes [data-k='corCab'][data-i='5']"],
      ["click", "#cr-nav [data-aba='corpo']"], ["click", "#cr-opcoes [data-k='altura'][data-i='4']"], ["click", "#cr-opcoes [data-k='porte'][data-i='2']"],
      er("mudouCorpo", "return{ap:J().ap,verts:J().mesh.count,escala:P.ch.s,ombro:P.ch.procOmbro,peito:J().spec.chestW,cabelo:J().spec.cabelo.toString(16),estilo:J().spec.cabeloEst};"),
      ["wait", 2.5], ["shot", "601_criacao_mudou.png"],
      ["click", "#cr-zoom"], ["wait", 2.0], ["shot", "602_criacao_zoom.png"], er("zoom", "return{zoom:r2(C.zoom),botao:document.getElementById('cr-zoom').getAttribute('aria-pressed')};"),
      ["click", "#cr-vistas [data-vista='costas']"], ["wait", 2.0], ["shot", "603_criacao_costas.png"], er("costas", "return{ang:r2(C.ang),alvo:r2(C.angAlvo)};"),
      ["click", "#cr-reset"], ["click", "#cr-girar"], ["wait", 1.0], er("girar", "return{girando:C.girar,ang:r2(C.ang)};"), ["click", "#cr-reset"],
      jr("window.__apA=JSON.stringify(C.ap);"), ["click", "#cr-aleatorio"],
      er("aleatorio", "const a=JSON.parse(window.__apA);let dif=0;for(const k in a)if(k!=='nome'&&a[k]!==C.ap[k])dif++;return{mudouCampos:dif,malhaIgual:JSON.stringify(J().ap)===JSON.stringify(C.ap)};"),
      # aparência escolhida para a campanha (diferente da padrão) e nome
      jr("C.ap=X('aparLimpa')({rosto:2,pele:3,olhos:3,sobr:4,nariz:1,boca:3,barba:2,cabelo:5,corCab:5,altura:3,porte:2});X('aplicarAparencia')(C.ap);X('criaAba')('rosto');X('criaResumo')();C.sujo=G.t;"
         "const i=document.getElementById('cr-nome');i.value='Rafa';i.dispatchEvent(new Event('input',{bubbles:true}));"),
      ["wait", 2.5], ["shot", "604_criacao_escolhida.png"],
      ["click", "#cr-confirmar"], ["wait", 0.5], er("confirmacao", "return{modal:vis('cr-modal'),resumo:document.getElementById('cr-m-resumo').textContent};"), ["shot", "605_confirmar.png"],
      ["click", "#cr-m-nao"], er("cancelou", "return{modal:vis('cr-modal'),modo:G.modo};"),
      ["click", "#cr-confirmar"], ["wait", 0.3], ["click", "#cr-m-sim"], ["wait", 1.0]]
# 2 e 3: começa só de bermuda, mochila vazia, nada mais
s += [er("inicio", "return{modo:G.modo,ap:G.aparencia,malha:JSON.stringify(J().ap)===JSON.stringify(G.aparencia),vestido:visto(),info:P.roupaInfo,inv:ids(),itens:P.inv.filter(Boolean).length,sel:P.sel,"
         "escala:P.ch.s,proc:P.ch.proc,criacaoAberta:vis('t-criacao'),hud:!document.getElementById('hud').classList.contains('oculto'),malhas:malhas()};"),
      jr("G.hora=11;G.chuva=0;Z.length=0;X('FAUNA_POP').ativosMax=0;n.cfg.cam='3';document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);P.yaw=P.body=0.6;"), ["gwait", 0.4]]
s += foto2("606_jogo_frente.png", "fren(2.6,1.25,0.95);")
s += foto2("607_jogo_costas.png", "tras(2.6,1.35,0.95);")
s += foto2("608_jogo_1p.png", "G.camFix=null;n.cfg.cam='1';")
s += [er("primeiraPessoa", "return{cam:n.cfg.cam,braco:!!X('bracoFPMesh')(),bracoVerts:X('bracoFPMesh')().count};"), jr("n.cfg.cam='3';")]
# 4: roupas achadas vestem, trocam e aparecem; a peça tirada volta para a mochila
s += [jr("window.__r=[veste('camiseta'),veste('calcaCargo'),veste('camisaLeve'),veste('botasTrilha'),veste('bone'),veste('cinto'),veste('mochilaPequena'),veste('luvasCouro')];"),
      er("vestiu", "return{ok:window.__r,vestido:visto(),inv:ids(),bermudas:X('invCount')('bermuda'),malhas:malhas(),chapeu:P.ch.mesh===J().meshChapeu};"),
      ]
s += foto2("609_roupas_frente.png", "fren(2.7,1.25,0.95);")
s += foto2("610_roupas_costas.png", "tras(2.7,1.35,0.95);")
s += foto2("611_roupas_1p.png", "G.camFix=null;n.cfg.cam='1';")
s += [jr("n.cfg.cam='3';"),
      jr("window.__r2=[veste('casacoGrande'),veste('bandana')];"),
      er("trocou", "return{ok:window.__r2,vestido:visto(),inv:ids(),camisaNaMochila:X('invCount')('camisaLeve'),malhas:malhas()};"),
      ]
s += foto2("612_casaco_frente.png", "fren(2.7,1.25,0.95);")
s += [# tirar a calça: fica a cueca (nunca sem roupa de baixo); volta a bermuda
      jr("window.__t=X('tirarRoupa')('pernas');"),
      er("semCalca", "return{tirou:window.__t,pernas:P.roupa.pernas,inv:ids(),cueca:!!J().spec.cueca};"),
      ]
s += foto2("613_cueca.png", "fren(2.4,1.0,0.75);")
s += [jr("window.__r3=vesteJa('bermuda');"),
      er("bermudaDeVolta", "return{ok:window.__r3,pernas:P.roupa.pernas,inv:ids(),bermudas:X('invCount')('bermuda')+(P.roupa.pernas==='bermuda'?1:0)};")]
# 6: salvar e carregar (recarrega a página e continua)
s += [jr("G.camFix=null;X('invAdd')('pedra',3);X('invAdd')('graveto',4);sessionStorage.setItem('__antes',JSON.stringify({ap:G.aparencia,v:visto(),inv:ids()}));X('salvarJogo')();"),
      ["js", "window.__semRender=true;"], ["wait", 1.0],   # sem desenhar antes de recarregar (no nível Alto da Etapa 21, sem placa de vídeo, cada quadro leva segundos e a página demorava a sair)
      ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.0],
      er("carregou", "const a=JSON.parse(sessionStorage.getItem('__antes')||'null');return{modo:G.modo,ap:G.aparencia,vestido:visto(),inv:ids(),"
         "igualAp:!!a&&JSON.stringify(a.ap)===JSON.stringify(G.aparencia),igualRoupa:!!a&&JSON.stringify(a.v)===JSON.stringify(visto()),igualInv:!!a&&a.inv===ids(),malha:JSON.stringify(J().ap)===JSON.stringify(G.aparencia),escala:P.ch.s,proc:P.ch.proc,malhas:malhas()};"),
      jr("G.hora=11;Z.length=0;n.cfg.cam='3';P.yaw=P.body=0.6;"), ["gwait", 0.3]]
s += foto2("614_carregado.png", "fren(2.7,1.25,0.95);")
s += [jr("G.camFix=null;"),
      # save antigo, sem aparência: abre com a padrão (não sorteia)
      jr("const K=X('SAVE_KEY'),s=JSON.parse(localStorage.getItem(K));delete s.x8.aparencia;localStorage.setItem(K,JSON.stringify(s));window.__ok=X('carregarJogo')();"),
      er("saveAntigo", "return{abriu:window.__ok,ap:G.aparencia,padrao:JSON.stringify(G.aparencia)===JSON.stringify(X('aparLimpa')(X('APAR_PADRAO'))),vestido:visto()};"),
      # a aparência não pode mais ser editada: a criação só abre pelo Novo jogo
      er("travada", "return{pausaTemCriacao:!!document.querySelector('#t-pausa [id^=cr-]'),telasComCriacao:[...document.querySelectorAll('button')].filter(b=>/apar[eê]ncia|personagem/i.test(b.textContent)&&!b.closest('#t-criacao')).map(b=>b.id)};")]
# voltar da criação sem começar não apaga nada
s += [jr("X('salvarJogo')();X('mostrarMenu')();"), ["wait", 0.3], ["click", "#m-novo", "criacao"], ["wait", 0.4], ["click", "#c-sim", "criacao"], ["wait", 0.6],
      er("criacaoComSave", "return{modo:G.modo,tela:vis('t-criacao'),apagar:C.apagar,temSave:X('temSave')()};"),
      ["click", "#cr-voltar"], ["wait", 0.4], er("voltou", "return{modo:G.modo,menu:vis('t-menu'),temSave:X('temSave')(),continuar:vis('m-continuar'),zumbisDoMenu:Z.length};")]
plan = [["desk", {"viewport": {"width": 1440, "height": 900}}, s],
        ["cel", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2},
         [["wait", 2.5], ["click", "#m-novo", "criacao"], ["wait", 0.5], js(VER), ["wait", 4], ["shot", "615_criacao_celular.png"],
          ["click", "#cr-nav [data-aba='cabelo']"], ["wait", 1.5], ["shot", "616_criacao_celular_cabelo.png"],
          ev("celular", "const r=e=>{const q=document.querySelector(e);if(!q)return null;const b=q.getBoundingClientRect();return[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};"
             "return{largura:document.documentElement.scrollWidth,palco:r('#cr-foco'),opcoes:r('.cr-painel'),rodape:r('.cr-rodape'),confirmar:r('#cr-confirmar')};")]],
        ["tab", {"viewport": {"width": 1280, "height": 800}},
         [["wait", 2.5], ["click", "#m-novo", "criacao"], ["wait", 0.5], js(VER), ["wait", 4], ["shot", "617_criacao_1280.png"]]]]
import json
json.dump(plan, open('p111.json', 'w'), ensure_ascii=False)
print('ok', len(s))
