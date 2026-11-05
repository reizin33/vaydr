"""p230: criação do personagem depois da reforma visual (pedido do Himalaia). Roda no modo rápido (sem desenhar), em PC
1280×720, celular em pé (390×844) e celular deitado (844×390):
1. abre pela tela inicial (Novo jogo) e mede a tela: onde ficam os painéis, a área do personagem (#cr-foco) e o tamanho do
   personagem na tela (pés e topo da cabeça projetados pela câmera do palco); confere que os painéis não cobrem o personagem;
2. clica TODAS as opções de rosto, cabelo e corpo, uma por uma: a escolha fica marcada, entra na aparência (CRIA.ap) e na
   malha 3D do jogador (MESH.jogador.ap), e o resumo muda;
3. abas Roupas e Acessórios, aparência aleatória, nome, câmera (frente/costas/lado, girar, aproximar, resetar, arrastar,
   roda do mouse) e a câmera que chega perto do rosto nas abas Rosto e Cabelo;
4. Voltar leva ao menu e a criação volta com as escolhas; Confirmar → janela → Começar: o jogo começa com a aparência
   escolhida, só de bermuda e com a mochila vazia;
5. salvar, recarregar a página e continuar: a aparência continua a mesma (no save e na malha)."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
R = ("const C=X('CRIA'),J=()=>n.MESH.jogador,vis=el=>!!el&&!el.hidden&&el.getClientRects().length>0&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden',"
     "ret=el=>{if(!el)return null;const r=el.getBoundingClientRect();return[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)];},"
     "cruza=(a,b)=>!!a&&!!b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3],"
     "proj=p=>{const c=X('cam'),W=X('W'),H=X('H'),v=[p[0]-c.pos[0],p[1]-c.pos[1],p[2]-c.pos[2]],d=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],z=d(v,c.fwd),th=Math.tan(c.fov/2);"
     "return[Math.round((1+d(v,c.right)/(z*th*W/H))/2*W),Math.round((1-d(v,c.up)/(z*th))/2*H)];},"
     "corpoTela=()=>{X('criaCamera')('palco');X('poseBones')(P.ch);const s=P.ch.s||1,sp=n.MESH.jogador.spec,hy=X('xf')(P.ch.m.subarray(32,48),0,0,0)[1],topo=hy+(0.06+sp.headH+0.02)*s;"
     "const a=proj([P.x,topo,P.z]),b=proj([P.x,P.y,P.z]);return{topo:a,pes:b,altura:b[1]-a[1],fracao:r2((b[1]-a[1])/X('H'))};},"
     "medir=()=>{const q=s=>document.querySelector(s),pain={abas:ret(q('#cr-nav')),opcoes:ret(q('#cr-opcoes')),lado:ret(q('.cr-lado')),camera:ret(q('.cr-camera')),voltar:ret(q('#cr-voltar')),confirmar:ret(q('#cr-confirmar')),topo:ret(q('.cr-topo'))};"
     "const foco=ret(q('#cr-foco')),ct=corpoTela(),bx=[ct.topo[0]-Math.round(ct.altura*0.17),ct.topo[1],ct.topo[0]+Math.round(ct.altura*0.17),ct.pes[1]];"
     "const cobre=Object.entries(pain).filter(([k,r])=>r&&vis(q(k==='abas'?'#cr-nav':k==='opcoes'?'#cr-opcoes':k==='lado'?'.cr-lado':k==='camera'?'.cr-camera':k==='voltar'?'#cr-voltar':k==='confirmar'?'#cr-confirmar':'.cr-topo'))&&cruza(r,bx)).map(([k])=>k);"
     "return{tela:[X('W'),X('H')],foco,personagem:ct,caixaPersonagem:bx,paineis:pain,painelPorCimaDoPersonagem:cobre};};")
def jr(c): return js(R + c)
def er(nome, c): return ev(nome, R + c)
ABRE = [["wait", 2], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
        ["click", "#m-novo", "criacao"], ["wait", 1.5]]
# todas as opções de uma aba, clicando nos botões de verdade
TODAS = ("const res={abas:{},erros:[]};for(const aba of['rosto','cabelo','corpo']){document.querySelector('#cr-nav [data-aba=\"'+aba+'\"]').click();"
         "const ks=[...new Set([...document.querySelectorAll('#cr-opcoes [data-k]')].map(b=>b.dataset.k))];res.abas[aba]={};"
         "for(const k of ks){const N=document.querySelectorAll('#cr-opcoes [data-k=\"'+k+'\"]').length;let ok=0;const nomes=[];"
         "for(let i=0;i<N;i++){const b=document.querySelector('#cr-opcoes [data-k=\"'+k+'\"][data-i=\"'+i+'\"]');if(!b){res.erros.push(k+i+' sem botão');continue;}"
         "const res0=document.getElementById('cr-resumo').textContent;b.click();const nb=document.querySelector('#cr-opcoes [data-k=\"'+k+'\"][data-i=\"'+i+'\"]');"
         "const marcado=nb&&nb.getAttribute('aria-pressed')==='true',noAp=C.ap[k]===i,naMalha=J().ap&&J().ap[k]===i,sec=nb&&nb.closest('.cr-sec').querySelector('h3 small').textContent;nomes.push(sec);"
         "if(marcado&&noAp&&naMalha)ok++;else res.erros.push(k+' '+i+': marcado '+marcado+' ap '+noAp+' malha '+naMalha);}"
         "res.abas[aba][k]=ok+'/'+N+' ('+nomes.join(', ')+')';}}return res;")
def funcional(vp):
    s = list(ABRE)
    s += [er("abriu", "return Object.assign({modo:G.modo,telaCriacao:vis(document.getElementById('t-criacao')),abas:document.querySelectorAll('#cr-nav [data-aba]').length,"
             "opcoes:document.querySelectorAll('#cr-opcoes .cr-op').length,vistasComCanvas:document.querySelectorAll('#cr-vistas canvas').length,retrato:!!document.getElementById('cr-retrato'),"
             "nomeNoPainel:!!document.querySelector('.cr-lado #cr-nome')},medir());")]
    if vp == 'pc':
        s += [er("todasOpcoes", TODAS),
              jr("document.querySelector('#cr-nav [data-aba=\"roupas\"]').click();window.__roupas={cartao:!!document.querySelector('#cr-opcoes .cr-info-card'),lista:document.querySelectorAll('#cr-opcoes .cr-lista li').length,zoom:C.zoomAlvo};"
                 "document.querySelector('#cr-nav [data-aba=\"acess\"]').click();window.__acess={lista:document.querySelectorAll('#cr-opcoes .cr-lista li').length,zoom:C.zoomAlvo};"
                 "document.querySelector('#cr-nav [data-aba=\"rosto\"]').click();window.__zRosto=C.zoomAlvo;document.querySelector('#cr-nav [data-aba=\"corpo\"]').click();window.__zCorpo=C.zoomAlvo;"
                 "document.querySelector('#cr-nav [data-aba=\"cabelo\"]').click();window.__zCabelo=C.zoomAlvo;"),
              er("roupasAcess", "return{roupas:window.__roupas,acess:window.__acess,zoomNaAbaRosto:window.__zRosto,zoomNaAbaCorpo:window.__zCorpo,zoomNaAbaCabelo:window.__zCabelo};"),
              jr("window.__a0=JSON.stringify(C.ap);document.getElementById('cr-aleatorio').click();const i=document.getElementById('cr-nome');i.value='Himalaia';i.dispatchEvent(new Event('input',{bubbles:true}));"),
              er("aleatorioNome", "const a=JSON.parse(window.__a0);let dif=0;for(const k in a)if(k!=='nome'&&a[k]!==C.ap[k])dif++;return{camposMudaram:dif,malhaIgual:JSON.stringify(J().ap)===JSON.stringify(Object.assign({},C.ap,{nome:J().ap.nome})),nome:C.ap.nome,resumo:document.getElementById('cr-resumo').textContent.slice(0,160)};"),
              jr("const cl=s=>document.querySelector(s).click(),r={};cl('#cr-vistas [data-vista=\"costas\"]');r.costas=[C.vista,r2(C.angAlvo)];cl('#cr-vistas [data-vista=\"lado\"]');r.lado=[C.vista,r2(C.angAlvo)];"
                 "cl('#cr-vistas [data-vista=\"frente\"]');r.frente=[C.vista,r2(C.angAlvo)];cl('#cr-girar');r.girar=C.girar;cl('#cr-girar');r.girar2=C.girar;cl('#cr-zoom');r.zoom=[C.zoomAlvo,document.querySelector('#cr-zoom span').textContent];"
                 "cl('#cr-zoom');r.zoom2=[C.zoomAlvo,document.querySelector('#cr-zoom span').textContent];cl('#cr-vistas [data-vista=\"lado\"]');cl('#cr-reset');r.reset=[C.vista,r2(C.angAlvo),C.zoomAlvo];"
                 "const pal=document.getElementById('cr-palco'),rr=pal.getBoundingClientRect(),x0=rr.left+rr.width*0.55,y0=rr.top+rr.height*0.5,ev=(t,x)=>pal.dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:x,clientY:y0,pointerId:7,pointerType:'mouse',buttons:1}));"
                 "const a0=C.angAlvo;ev('pointerdown',x0);ev('pointermove',x0+120);ev('pointerup',x0+120);r.arrastou=r2(C.angAlvo-a0);"
                 "const z0=C.zoomAlvo;pal.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-120,clientX:x0,clientY:y0}));r.roda=[z0,C.zoomAlvo];window.__cam=r;"),
              ["gwait", 0.6], er("camera", "return Object.assign({},window.__cam,{angAgora:r2(C.ang),zoomAgora:r2(C.zoom)});"),
              # voltar e abrir de novo: as escolhas continuam
              jr("window.__apV=JSON.stringify(C.ap);document.getElementById('cr-voltar').click();window.__menu={modo:G.modo,menu:vis(document.getElementById('t-menu'))};"), ["wait", 0.4],
              ["click", "#m-novo", "criacao"], ["wait", 1.0],
              er("voltarEAbrir", "return{menuDepoisDeVoltar:window.__menu,modo:G.modo,mesmaAparencia:JSON.stringify(C.ap)===window.__apV};"),
              # confirmar e começar
              jr("window.__apF=JSON.stringify(Object.assign({},C.ap,{nome:document.getElementById('cr-nome').value}));document.getElementById('cr-confirmar').click();window.__modal=vis(document.getElementById('cr-modal'));"
                 "window.__mres=document.getElementById('cr-m-resumo').textContent.slice(0,200);document.getElementById('cr-m-sim').click();"), ["gwait", 0.5],
              er("comecou", "const ap=JSON.parse(window.__apF);let iguais=0,tot=0;for(const k in ap){tot++;if(G.aparencia&&G.aparencia[k]===ap[k])iguais++;}"
                 "return{modal:window.__modal,resumoModal:window.__mres,modo:G.modo,aparenciaIgual:iguais+'/'+tot,malhaIgual:JSON.stringify(J().ap)===JSON.stringify(G.aparencia),"
                 "roupa:Object.entries(P.roupa).filter(([k,v])=>v).map(([k,v])=>k+':'+v).join(','),mochila:P.inv.filter(Boolean).length};"),
              jr("sessionStorage.setItem('__apS',JSON.stringify(G.aparencia));X('salvarJogo')();"), ["js", "window.__semRender=true;"], ["wait", 1.0], ["reload"], ["wait", 2.5],
              ["click", "#m-continuar"], ["wait", 1.5],
              er("carregou", "const a=sessionStorage.getItem('__apS');return{modo:G.modo,aparenciaIgual:JSON.stringify(G.aparencia)===a,malhaIgual:JSON.stringify(J().ap)===a,nome:G.aparencia&&G.aparencia.nome};")]
    else:
        s += [jr("document.querySelector('#cr-nav [data-aba=\"cabelo\"]').click();document.querySelector('#cr-opcoes [data-k=\"cabelo\"][data-i=\"3\"]').click();"),
              er("celular", "return{cabelo:C.ap.cabelo,malha:J().ap.cabelo,zoom:C.zoomAlvo,painelRola:(()=>{const p=document.querySelector('.cr-painel');return p.scrollHeight>p.clientHeight;})(),"
                 "botoes:[...document.querySelectorAll('.cr-camera button')].map(b=>vis(b)).filter(Boolean).length};")]
    return s
plan = [["pc", {"viewport": {"width": 1280, "height": 720}}, funcional('pc')],
        ["cel", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True}, funcional('cel')],
        ["deitado", {"viewport": {"width": 844, "height": 390}, "is_mobile": True, "has_touch": True}, funcional('deitado')]]
json.dump(plan, open('tools/p230_criacao.json', 'w')); print('ok', [len(p[2]) for p in plan])
