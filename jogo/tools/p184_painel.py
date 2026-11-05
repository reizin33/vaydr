"""p184: Etapa 17, interface da energia: textos de interação (interruptor alterna no toque; geladeira abre no toque e mostra o painel
segurando; gerador abastece/liga no toque e painel segurando), painel de energia (estado da peça e da rede, botões de cada peça,
ligar na fonte mais perto, cortar os fios, abrir a tela de fios; o painel normal da fornalha continua o mesmo depois), tela de fios
com o MOUSE de verdade (tecla U abre e fecha; arrastar de uma peça até outra liga e gasta fio e alicate; arrastar de quem não tem
saída avisa; clicar num fio escolhe e o botão corta e devolve; sem alicate não liga), botão Fios no modo de construção."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=window.__C,g=(x,z)=>X('ground')(x,z),ob=t=>X('OB').filter(o=>o.tipo===t),E=()=>X('ENER'),pe=window.__pe||{},"
     "cria=(t,dx,dz,eid,yaw)=>{const o=X('criarObra')(t,C[0]+dx,C[1]+dz,yaw||0,undefined,undefined,g(C[0]+dx,C[1]+dz));if(eid&&o.ext)o.ext.eid=eid;return o;},"
     "W=()=>{X('energiaResolver')(0);X('energiaEfeitos')(0);},"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "vis=id=>{const e=document.getElementById(id);return!!e&&!e.hidden;},txt=id=>{const e=document.getElementById(id);return e?e.textContent.trim():'';},"
     "acoes=()=>[...document.querySelectorAll('#es-acoes [data-ea]')].map(b=>b.dataset.ea+(b.disabled?'(x)':'')),clica=id=>{const b=document.querySelector('#es-acoes [data-ea=\"'+id+'\"]');if(b&&!b.disabled)b.click();return txt('es-msg');},"
     "alvo=a=>X('alvoInter=window.__a').k,frente=(o,d)=>{const yaw=o.yaw||0;vai(o.x+Math.sin(yaw)*(d||1.3),o.z+Math.cos(yaw)*(d||1.3),o.y);P.yaw=yaw+Math.PI;P.body=P.yaw;P.pitch=-0.2;},"
     "alic=()=>{const s=P.inv.find(q=>q&&q.id==='alicate');return s?s.dur:null;},fl=()=>txt('fios-msg');")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"),
      ev("lugar", "const livre=(x,z,g0)=>Math.abs(X('ground')(x,z)-g0)<1.5&&!(X('RIO').ok&&X('aguaPerto')(x,z,1.5));let C=null,bl=1e9;"
         "for(let r=16;r<80;r+=4)for(let a=0;a<6.28;a+=0.3){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;if(!X('dentroMapa')(x,z,25))continue;const g0=X('ground')(x,z);let ok=true,nb=0;"
         "for(let i=-9;i<=9&&ok;i+=3)for(let k=-6;k<=9&&ok;k+=3){if(!livre(x+i,z+k,g0))ok=false;else if(X('pointBlocked')(x+i,z+k,0.6))nb++;}if(ok&&nb<bl){bl=nb;C=[x,z];}}window.__C=C;return{achou:!!C,bloqueados:bl};"),
      j("dar({fio:30,alicate:1,gasolina:2});pe.ger=cria('gerador',0,0,'tger');pe.ger.ext.comb=0.4;pe.ger.ext.ligado=true;pe.itr=cria('interruptor',2,-1.5,'titr');pe.lum=cria('luminaria',4.5,-1.5,'tlum');"
        "pe.gel=cria('geladeira',-3,-1.5,'tgel');pe.sen=cria('sensor',-2.5,3,'tsen');pe.tmp=cria('temporizador',0,3.5,'ttmp');pe.est=cria('esteira',3.5,3.5,'test');pe.solta=cria('luminaria',6,2,'tsol');"
        "pe.div=cria('divisor',1.5,-4,'tdiv');pe.forn=cria('fornalha',-7,2,'tforn');pe.ger2=cria('gerador',-7,5,'tger2');pe.ger2.ext.comb=1;pe.ger2.ext.ligado=true;window.__pe=pe;"
        "const L=X('ligarFio');L(pe.ger,pe.itr);L(pe.itr,pe.lum);L(pe.ger,pe.gel);L(pe.ger2,pe.forn,true);W();"),
      ["gwait", 1.0],
      # textos de interação
      e("textos", "const T=a=>{const t=X('textoInter')(a);return t?{t:t.t,s:t.s,alt:!!t.alt,hold:!!t.hold}:null;};return{interruptor:T({k:'eletr',o:pe.itr}),lampada:T({k:'eletr',o:pe.lum}),"
        "geladeira:T({k:'guarda',o:pe.gel}),gerador:T({k:'baseObra',o:pe.ger}),bau:T({k:'guarda',o:cria('bau',-5,-5)})};"),
      e("miraNaFrente", "frente(pe.itr,1.2);const a=X('interAtual')();frente(pe.gel,1.3);const b=X('interAtual')();return{interruptor:a&&a.k+':'+(a.o&&a.o.tipo),geladeira:b&&b.k+':'+(b.o&&b.o.tipo)};"),
      # interruptor: toque alterna (com a mão, como no jogo: E solto antes do tempo)
      e("interruptorToque", "window.__a={k:'eletr',o:pe.itr};alvo();X('interagir')(false);X('usarSolta')();W();const r={on:pe.itr.ext.on,lum:!!pe.lum.energ,aviso:ult()};window.__a={k:'eletr',o:pe.itr};alvo();X('interagir')(false);X('usarSolta')();W();r.deNovo={on:pe.itr.ext.on,lum:!!pe.lum.energ};return r;"),
      # geladeira: toque abre o baú; segurar abre o painel de energia
      e("geladeiraToque", "window.__a={k:'guarda',o:pe.gel};alvo();X('interagir')(false);X('usarSolta')();const r={modo:G.modo,bau:X('bauAberto')===pe.gel};X('fecharMochila')();return r;"),
      e("geladeiraSegura", "G.modo='jogo';window.__a={k:'guarda',o:pe.gel};alvo();X('interagir')(true);return{modo:G.modo,tela:vis('t-estacao'),nome:txt('es-nome'),sub:txt('es-sub'),corpo:txt('es-corpo').slice(0,240),acoes:acoes()};"),
      e("geladeiraAbrir", "const m=clica('abrir');const r={modo:G.modo,bau:X('bauAberto')===pe.gel,estTipo:pe.gel.estTipo===undefined?'normal':pe.gel.estTipo};X('fecharMochila')();G.modo='jogo';return r;"),
      # gerador: toque abastece (tanque baixo e gasolina na mochila); segurar abre o painel
      e("geradorToque", "const c0=pe.ger.ext.comb;window.__a={k:'baseObra',o:pe.ger};alvo();X('interagir')(false);X('usarSolta')();return{antes:c0,depois:pe.ger.ext.comb,gasolina:conta('gasolina')};"),
      e("geradorPainel", "G.modo='jogo';window.__a={k:'baseObra',o:pe.ger};alvo();X('interagir')(true);const r={modo:G.modo,nome:txt('es-nome'),acoes:acoes(),corpo:txt('es-corpo').slice(0,260)};r.desligar=clica('tog');W();r.rodando=!!pe.ger.rodando;r.ligar=clica('tog');W();r.rodandoDeNovo=!!pe.ger.rodando;return r;"),
      ["press", "Escape"],
      e("fechou", "return{modo:G.modo,estTipo:pe.ger.estTipo===undefined?'normal':pe.ger.estTipo};"),
      # painel das peças de lógica
      e("temporizador", "G.modo='jogo';X('abrirEnergia')(pe.tmp);const r={nome:txt('es-nome'),acoes:acoes()};r.dia=clica('t_dia');r.h=[pe.tmp.ext.h0,pe.tmp.ext.h1];clica('t_h0');r.h2=[pe.tmp.ext.h0,pe.tmp.ext.h1];clica('t_noite');r.h3=[pe.tmp.ext.h0,pe.tmp.ext.h1];X('fecharEstacao')();return r;"),
      e("sensor", "X('abrirEnergia')(pe.sen);const r={acoes:acoes(),modo:[pe.sen.ext.modo||'zumbi']};clica('s_modo');r.modo.push(pe.sen.ext.modo);clica('s_modo');r.modo.push(pe.sen.ext.modo);clica('s_r');r.r=pe.sen.ext.r;clica('s_seg');r.seg=pe.sen.ext.seg;X('fecharEstacao')();return r;"),
      e("esteira", "X('abrirEnergia')(pe.est);const r={acoes:acoes(),filtros:[pe.est.ext.filtro||'tudo']};for(let i=0;i<5;i++){clica('filtro');r.filtros.push(pe.est.ext.filtro);}X('fecharEstacao')();return r;"),
      e("autoLigar", "X('abrirEnergia')(pe.solta);const r={antes:acoes(),msg:clica('auto')};W();r.ligada=X('energiaFiado')(pe.solta);r.energ=!!pe.solta.energ;r.depois=acoes();X('fecharEstacao')();return r;"),
      e("cortarTudo", "X('abrirEnergia')(pe.solta);const f0=conta('fio'),a0=alic();const r={msg:clica('cortar')};r.fiada=X('energiaFiado')(pe.solta);r.devolveu=conta('fio')-f0;r.alicate=[a0,alic()];X('fecharEstacao')();return r;"),
      # fornalha: painel de energia e, depois, o painel normal dela continua o mesmo
      e("fornalha", "X('abrirEnergia')(pe.forn);const r={nome:txt('es-nome'),acoes:acoes()};X('fecharEstacao')();X('abrirEstacao')(pe.forn);r.normal={nome:txt('es-nome'),tipo:X('estTipo')(pe.forn)};X('fecharEstacao')();return r;"),
      # ---- tela de fios com o mouse ----
      j("G.modo='jogo';vai(C[0]+1,C[1]+7);"), ["press", "KeyU"], ["wait", 0.3],
      e("telaAbriu", "return{modo:G.modo,tela:vis('t-fios'),nos:document.querySelectorAll('#fios-nos .fio-no').length,lado:txt('fios-lado').slice(0,160),msg:fl()};"),
      # aproximar (+), arrastar o fundo (move a vista) e voltar (⌖)
      ["click", "#fios-zoom [data-fz=\"mais\"]"], ["wait", 0.1],
      e("zoom", "const T=X('FT');window.__k1=T.k;return{zoom:r2(T.zoom)};"),
      ["dragxy", "(()=>{const r=document.getElementById('fios-area').getBoundingClientRect();return[r.left+30,r.bottom-30,r.left+130,r.bottom-60];})()"], ["wait", 0.1],
      e("arrastouFundo", "const T=X('FT');return{panX:r2(T.panX),panZ:r2(T.panZ),fioEscolhido:!!T.selFio};"),
      ["click", "#fios-zoom [data-fz=\"centro\"]"], ["wait", 0.1],
      e("centro", "const T=X('FT');return{zoom:T.zoom,panX:T.panX,panZ:T.panZ};"),
      ["drag", "#fios-nos [data-eid=\"tger\"]", "#fios-nos [data-eid=\"tdiv\"]", 12], ["wait", 0.2],
      e("arrastou", "const f=E().fios.find(f=>f.a==='tger'&&f.b==='tdiv');window.__f0=conta('fio');return{ligou:!!f,custo:f&&f.n,msg:fl(),sel:document.querySelector('#fios-nos .fio-no.sel')?document.querySelector('#fios-nos .fio-no.sel').dataset.eid:null,alicate:alic()};"),
      ["drag", "#fios-nos [data-eid=\"tdiv\"]", "#fios-nos [data-eid=\"tsol\"]", 12], ["wait", 0.2],
      e("arrastou2", "W();return{ligou:!!E().fios.find(f=>f.a==='tdiv'&&f.b==='tsol'),energ:!!pe.solta.energ,msg:fl()};"),
      ["drag", "#fios-nos [data-eid=\"tlum\"]", "#fios-nos [data-eid=\"tgel\"]", 12], ["wait", 0.2],
      e("semSaida", "return{msg:fl(),fios:E().fios.length};"),
      ["clickxy", "(()=>{const n=__nnc,X=s=>n.ev(s),E=X('ENER'),f=E.fios.find(f=>f.a==='tdiv'&&f.b==='tsol'),p=X('fioPontos')(f),r=document.getElementById('fios-area').getBoundingClientRect();"
                  "const nos=[...document.querySelectorAll('#fios-nos .fio-no')].map(b=>{const q=b.getBoundingClientRect();return[q.left+q.width/2-r.left,q.top+q.height/2-r.top];});let bt=0.5,bd=-1;"
                  "for(let t=0.12;t<=0.88;t+=0.02){const x=p[0]+(p[2]-p[0])*t,y=p[1]+(p[3]-p[1])*t,d=Math.min(...nos.map(q=>Math.hypot(q[0]-x,q[1]-y)));if(d>bd){bd=d;bt=t;}}"
                  "return[r.left+p[0]+(p[2]-p[0])*bt,r.top+p[1]+(p[3]-p[1])*bt];})()"], ["wait", 0.2],
      e("fioEscolhido", "const T=X('FT');window.__f0=conta('fio');return{escolhido:!!T.selFio&&T.selFio.a==='tdiv',lado:txt('fios-lado').slice(0,200),botao:!!document.querySelector('[data-fa=\"cortarSel\"]')};"),
      ["click", "[data-fa=\"cortarSel\"]"], ["wait", 0.2],
      e("cortou", "W();return{existe:!!E().fios.find(f=>f.a==='tdiv'&&f.b==='tsol'),msg:fl(),devolveu:conta('fio')-window.__f0,energ:!!pe.solta.energ};"),
      # clique simples numa peça: escolhe; o painel lateral mostra os fios dela e o botão de ligar
      ["click", "#fios-nos [data-eid=\"tger\"]"], ["wait", 0.2],
      e("escolheuPeca", "const T=X('FT');return{sel:T.sel&&T.sel.ext.eid,botoes:[...document.querySelectorAll('#fios-lado [data-fa]')].map(b=>b.dataset.fa+(b.disabled?'(x)':''))};"),
      # sem alicate: não liga
      j("const i=P.inv.findIndex(q=>q&&q.id==='alicate');window.__alic=P.inv[i];P.inv[i]=null;"),
      ["drag", "#fios-nos [data-eid=\"tdiv\"]", "#fios-nos [data-eid=\"tsol\"]", 12], ["wait", 0.2],
      e("semAlicate", "return{ligou:!!E().fios.find(f=>f.a==='tdiv'&&f.b==='tsol'),msg:fl()};"),
      j("const i=P.inv.findIndex(q=>!q);P.inv[i]=window.__alic;"),
      ["press", "Escape"], ["wait", 0.2],
      e("esc", "return{modo:G.modo,tela:vis('t-fios')};"),
      ["press", "KeyU"], ["wait", 0.2], e("uAbre", "return{modo:G.modo};"), ["press", "KeyU"], ["wait", 0.2], e("uFecha", "return{modo:G.modo,tela:vis('t-fios')};"),
      # botão Fios no modo de construção (aba Energia)
      e("construcao", "G.modo='jogo';X('modoObra')(true);X('OBRA').tipo='luminaria';X('hudObraAlvo')(true);return{botao:vis('o-fios'),kbd:(document.querySelector('#o-fios kbd')||{}).textContent};"),
      ["click", "#o-fios"], ["wait", 0.2],
      e("construcaoAbriu", "const r={modo:G.modo,tela:vis('t-fios')};X('fecharFios')();X('modoObra')(false);r.depois=G.modo;return r;"),
      e("teclas", "const a=X('ACOES_TECLA').find(a=>a.id==='telaFios');return{tecla:a&&a.pad,nome:a&&a.nome};")]
salvar('p184.json', s)
