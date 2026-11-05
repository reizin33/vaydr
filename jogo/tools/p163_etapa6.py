"""p163: sobreviventes e comércio (Etapa 6).
Parte 1 — os oito no acampamento, de dia, com estações na base e material nos baús: a cozinheira colhe a horta e enche o defumador;
os dois que consertam trabalham na fornalha, consertam o machado gasto do baú e fazem tábuas; a enfermeira costura bandagens na
estação de costura; quem descansa deita no colchão; o ferido deita no outro colchão e sara; quem transporta leva a caixa de trocas
para os baús; a vigia fica de guarda. Cada um trabalha perto da estação (distância medida a cada passo). Depois: recolhem o que
ficou pronto no defumador e na fornalha; o painel da pessoa mostra o que faz e o que fez; no fim da tarde sai o resumo no registro;
salvar e carregar mantém tarefas, estações e baús.
Parte 2 — rádio com os quatro grupos: sem antena, três no ar e uma oferta de cada; com a antena, os quatro e duas ofertas de cada,
estoque maior e notícias; tela com sintonia, notícias, ofertas, estoque e pedido (quantidade e pagamento); pedido aos Mercadores da
Estrada leva duas manhãs; troca do dia chega na manhã seguinte; estrada fechada atrasa o pedido de longe até liberar; o que chega
na caixa de trocas o transportador leva para os baús; segurar E na bancada abre o rádio e tocar abre a fabricação; salvar e carregar;
jogo salvo de antes do rádio novo (troca pendente sem número) continua funcionando."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cr=X('criarObra'),gr=(x,z)=>X('ground')(x,z),S=id=>X('SOBREV').find(s=>s.id===id),OBt=t=>X('OB').filter(o=>o.tipo===t),"
     "nb=id=>X('contarBase')(it=>it.id===id),"
     "livre=(x,z,r)=>{for(let k=0;k<80;k++){const a=k*2.39,rr=k*0.3,xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr;if(X('pontoLivre')(xx,zz,r||1.3)&&Math.hypot(xx-F[0],zz-F[2])<27)return[xx,zz];}return[x,z];},"
     "est=s=>({of:s.of?s.of.J.id+':'+s.of.fase:null,hoje:s.ofHoje&&s.ofHoje.dia===G.dia?s.ofHoje.txt.slice():[],hp:Math.round(s.hp),st:s.st,tarefa:s.tarefa}),"
     "baus=()=>X('bausBase')().map(b=>b.itens.filter(Boolean).map(i=>i.id+'x'+i.n+(i.dur!==undefined?'@'+i.dur:'')).join(',')).join(' | '),"
     "caixa=()=>(X('terrD')().caixaTrocas||[]).filter(Boolean).map(i=>i.id+'x'+i.n).join(','),"
     "pend=()=>X('terrD')().trocasPendentes.map(t=>({id:t.id,tipo:t.tipo,g:t.g,da:t.da.join('x'),falta:t.chega-G.dia,st:t.st})),"
     "radio=()=>{const D=X('terrD')(),R=X('radioD')();return{ofertas:D.ofertas.length,porGrupo:Object.fromEntries(X('TERR_GRUPOS').map(g=>[g.id,D.ofertas.filter(o=>o.g===g.id).length])),"
     "noAr:Object.values(R.ar).filter(Boolean).length,estoque:Object.fromEntries(Object.entries(R.est).map(([k,v])=>[k,Object.values(v).reduce((a,b)=>a+b,0)])),antena:X('temAntenaBase')()};};")
ZUMBIS = ("window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;const L=n.SOBREV;for(const s of L){const j=s.of;if(!j||j.fase!=='trab')continue;"
          "const a=j.o||j.bau;const T=window.__trab[s.id]||(window.__trab[s.id]={});const d=a?Math.hypot(s.x-a.x,s.z-a.z):Math.hypot(s.x-j.pos[0],s.z-j.pos[1]);const k=j.J.id;T[k]=Math.min(T[k]??99,Math.round(d*100)/100);}};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
def recarrega():
    return [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;window.__trab={};" + ZUMBIS), ["gwait", 0.3]]
MONTA = ("vivo();Z.length=0;window.__trab={};" + ZUMBIS + "G.hora=10;G.m.etapa=Math.max(2,G.m.etapa);"
         "const poe=(t,x,z,yaw)=>{const p=livre(x,z,1.5);return cr(t,p[0],p[1],yaw||0,undefined,false,gr(p[0],p[1]));};"
         "const b1=poe('bau',F[0]+6,F[2]-6),b2=poe('bau',F[0]+8.5,F[2]-6),def=poe('defumador',F[0]-8,F[2]+3),forn=poe('fornalha',F[0]-9,F[2]-5),"
         "banc=poe('bancadaTrab',F[0]+9,F[2]+5),arm=poe('bancadaArmas',F[0]+12.5,F[2]+1),cou=poe('estacaoCouro',F[0]-4,F[2]+10);"
         "const c1=poe('cama',F[0]-13,F[2]+9),c2=poe('cama',F[0]-17,F[2]+5),ho=poe('horta',F[0]+4,F[2]+16);ho.ext.cresce=1;"
         "const NI=X('newItem'),put=(b,id,k)=>{const i=b.itens.indexOf(null);b.itens[i]=NI(id,k);return b.itens[i];};"
         "put(b1,'carneCrua',4);put(b1,'madeira',20);put(b1,'minerioFerro',4);put(b1,'carvao',2);put(b1,'pano',6);put(b1,'fibra',8);put(b1,'graveto',4);"
         "const m=put(b2,'machadoPedra',1);m.dur=10;window.__mach=m;"
         "const D=X('terrD')();D.caixaTrocas=new Array(X('BAU_N')).fill(null);D.caixaTrocas[0]=NI('municao9',6);D.caixaTrocas[1]=NI('feijao',3);"
         "const set=(id,tar,dx,dz,hp)=>{const s=S(id);s.st='base';s.tarefa=tar;s.hp=hp||100;s.fome=0;s.x=F[0]+dx;s.z=F[2]+dz;s.y=X('chaoEm')(s.x,s.z,5);s.ch.vis=true;s.of=null;s.ofT=0;s.ofHoje=null;s.danoT=hp?30:0;return s;};"
         "set('cida','cozinhar',1.5,2);set('jorge','consertar',2,1);set('pedro','consertar',-2,1);set('lucia','curar',-1,-2.5);set('marina','vigiar',3,3);"
         "set('bia','descansar',-3,3);set('tiao','transportar',2.5,-2);set('rafa','buscar',0,3.5,30);"
         "window.__antes={madeira:nb('madeira'),tabuas:nb('tabuas'),pano:nb('pano'),bandagem:nb('bandagem'),carneCrua:nb('carneCrua')};")
TODOS = "return{cida:est(S('cida')),jorge:est(S('jorge')),pedro:est(S('pedro')),lucia:est(S('lucia')),bia:est(S('bia')),tiao:est(S('tiao')),rafa:est(S('rafa')),marina:est(S('marina')),"
s = inicio("window.__turbo=6;window.__semRender=true;")
# ---------------- parte 1: trabalho nas estações ----------------
s += [j(MONTA), ["gwait", 0.5],
      e("montou", "return{estacoes:['bau','defumador','fornalha','bancadaTrab','bancadaArmas','estacaoCouro','cama','horta'].map(t=>t+':'+OBt(t).length).join(' '),"
                  "naBase:X('ofObras')('defumador').length+X('ofObras')('fornalha').length+X('ofObras')('bancadaTrab').length,baus:baus(),caixa:caixa(),antes:window.__antes};"),
      ["gwait", 55],
      e("trabalho", TODOS + "trab:window.__trab,horta:r2(OBt('horta')[0].ext.cresce),defumador:(OBt('defumador')[0].ext.proc||[]).map(c=>c.r),fornalha:(OBt('fornalha')[0].ext.proc||[]).map(c=>c.r),"
                    "machado:[window.__mach.dur,X('durMaxDe')(window.__mach)],madeira:[window.__antes.madeira,nb('madeira')],tabuas:[window.__antes.tabuas,nb('tabuas')],pano:[window.__antes.pano,nb('pano')],"
                    "bandagem:[window.__antes.bandagem,nb('bandagem')],carneCrua:[window.__antes.carneCrua,nb('carneCrua')],caixa:caixa(),municaoBaus:nb('municao9'),feijaoBaus:nb('feijao'),"
                    "naCama:['bia','rafa'].map(id=>{const q=S(id);return id+':'+r2(Math.min(...OBt('cama').map(o=>Math.hypot(o.x-q.x,o.z-q.z))));}).join(' ')};"),
      # o que ficou pronto: recolhem e guardam nos baús
      j("for(const o of OBt('defumador').concat(OBt('fornalha')))for(const c of(o.ext.proc||[]))c.fim=G.tm-1;"), ["gwait", 30],
      e("recolheu", TODOS + "carneDefumada:nb('carneDefumada'),barraFerro:nb('barraFerro'),carvao:nb('carvao'),defumador:(OBt('defumador')[0].ext.proc||[]).map(c=>c.r+(G.tm>=c.fim?'(pronto)':'')),"
                    "fornalha:(OBt('fornalha')[0].ext.proc||[]).map(c=>c.r+(G.tm>=c.fim?'(pronto)':'')),trab:window.__trab};"),
      # painel da pessoa
      j("X('abrirGrupo')(S('cida'));"), ["wait", 0.3],
      e("painelCida", "const a=document.getElementById('g-agora');return{visivel:!a.hidden,texto:a.textContent};"),
      j("X('fecharGrupo')();X('abrirGrupo')(S('marina'));"), ["wait", 0.3],
      e("painelMarina", "const a=document.getElementById('g-agora');return{visivel:!a.hidden,texto:a.textContent};"),
      j("X('fecharGrupo')();")]
s += foto('p163_painel_grupo.png', H + "X('abrirGrupo')(S('jorge'));", 0.1, 3.0)
s += [j("X('fecharGrupo')();for(const b of X('bausBase')()){const i=b.itens.indexOf(null);if(i>=0){b.itens[i]=X('newItem')('carneCrua',2);break;}}"), ["gwait", 20],
      # fim da tarde: resumo do trabalho no registro
      j("G.hora=19.0;"), ["gwait", 12],
      e("resumoTarde", "const R=X('terrD')().registro.filter(x=>x.txt.startsWith('Trabalho do grupo hoje'));return{n:R.length,txt:R.length?R[R.length-1].txt:null,defumador:(OBt('defumador')[0].ext.proc||[]).length};"),
      # salvar e carregar
      e("antesSalvar", "const d=OBt('defumador')[0];window.__salvo={proc:(d.ext.proc||[]).map(c=>c.r+'@'+Math.round(c.fim)).join(','),tar:X('SOBREV').map(q=>q.id+':'+q.tarefa+':'+q.st).join(' '),"
                       "bandagem:nb('bandagem'),tabuas:nb('tabuas'),carneDefumada:nb('carneDefumada')};X('salvarJogo')();return window.__salvo;")]
s += recarrega()
s += [e("carregou", "const d=OBt('defumador')[0];return{proc:(d.ext.proc||[]).map(c=>c.r+'@'+Math.round(c.fim)).join(','),tar:X('SOBREV').map(q=>q.id+':'+q.tarefa+':'+q.st).join(' '),"
                    "bandagem:nb('bandagem'),tabuas:nb('tabuas'),carneDefumada:nb('carneDefumada'),estacoes:['defumador','fornalha','bancadaTrab','bancadaArmas','estacaoCouro','cama','horta'].map(t=>t+':'+OBt(t).length).join(' ')};")]
# ---------------- parte 2: rádio ----------------
s += [j("G.hora=10;G.noite=false;G.m.etapa=Math.max(2,G.m.etapa);for(const o of OBt('antenaBase'))o.hp=0;X('terrOfertas')();"),
      e("semAntena", "return radio();"),
      j("const p=livre(F[0]-14,F[2]-11,1.5);cr('antenaBase',p[0],p[1],0,undefined,false,gr(p[0],p[1]));X('terrOfertas')();"),
      e("comAntena", "return radio();"),
      j("X('abrirRadio')();"), ["wait", 0.5],
      e("tela", "const q=sel=>[...document.querySelectorAll(sel)];return{tela:!document.getElementById('t-terr').hidden,aba:document.querySelector('.tr-aba[aria-pressed=\"true\"]').dataset.aba,"
                "nomeAba:document.querySelector('.tr-aba[data-aba=\"troca\"]').textContent,grupos:q('.rd-g').map(b=>b.dataset.sint+(b.getAttribute('aria-pressed')==='true'?'*':'')+':'+b.querySelector('small').textContent).join(' / '),"
                "noticias:q('.rd-not small').map(x=>x.textContent),ofertas:q('#tr-lista [data-oferta]').length,pedir:q('#tr-lista [data-pedir]').length,titulos:q('.rd-tit').map(x=>x.textContent).join(' | '),resumo:document.getElementById('tr-resumo').textContent,"
                "icones:['i-antena','i-relogio','i-troca','i-radio','i-mochila'].filter(i=>!document.getElementById(i))};"),
      ["click", ".rd-g[data-sint='estrada']"], ["wait", 0.3],
      e("estrada", "return{sint:X('radioD')().sint,resumo:document.getElementById('tr-resumo').textContent,noticias:[...document.querySelectorAll('.rd-not small')].map(x=>x.textContent),estoque:X('radioD')().est.estrada};"),
      ["click", "#tr-lista [data-pedir]"], ["wait", 0.3],
      e("editor", "return{ped:X('radioPed'),editor:!!document.querySelector('.rd-ped'),formas:[...document.querySelectorAll('#tr-lista [data-pagar]')].map(b=>b.dataset.pagar+(b.disabled?'(x)':'')+': '+b.textContent)};"),
      ["click", "#tr-lista [data-qtd='1']"], ["wait", 0.2],
      e("mais", "return{ped:X('radioPed'),qtd:document.querySelector('.rd-qtd output').textContent,formas:X('radioFormas')(X('radioPed').g,X('radioPed').id,X('radioPed').n)};")]
s += foto('p163_radio.png', H + "", 0.05, 3.0)
s += [j("const P0=X('radioPed'),F0=X('radioFormas')(P0.g,P0.id,P0.n)[0];window.__pg=F0;window.__ped=Object.assign({},P0);window.__est0=X('radioD')().est[P0.g][P0.id];window.__tem0=conta(F0[0]);"
        "n.invAdd(F0[0],F0[1]);X('terrRender')();document.querySelector('#tr-lista [data-pagar=\"'+F0[0]+'\"]').click();"), ["wait", 0.3],
      e("pediu", "const R=X('radioD')();return{msg:X('radioMsg'),pend:pend(),estoque:[window.__est0,R.est[window.__ped.g][window.__ped.id]],pago:window.__pg,ficou:conta(window.__pg[0])-window.__tem0,"
                 "lista:[...document.querySelectorAll('#tr-lista li b')].map(l=>l.textContent).filter(x=>x.startsWith('#')),status:[...document.querySelectorAll('#tr-lista li small')].map(l=>l.textContent).filter(x=>/encomenda|oferta do dia/.test(x))};"),
      j("const D=X('terrD')(),o=D.ofertas.find(o=>!o.aceita&&!X('RADIO_INFO')[o.g].longe)||D.ofertas.find(o=>!o.aceita);window.__of=o;n.invAdd(o.quer[0],o.quer[1]);X('terrAceitar')(o);"),
      e("aceitou", "return{oferta:window.__of.g+': '+window.__of.da.join('x')+' por '+window.__of.quer.join('x'),aceita:window.__of.aceita,pend:pend()};"),
      j("X('tela')(null);G.modo='jogo';G.dia++;X('terrAmanhece')();"),
      e("manha1", "return{caixa:caixa(),pend:pend(),hist:X('radioD')().pedidos.map(p=>p.id+':'+p.tipo+':'+p.st).join(' ')};"),
      j("window.__nEstr=X('mundoD')().ev.filter(e=>e.tipo==='estrada'&&!e.fim).length;X('estradaComecar')();"),
      e("estradaFechada", "return{antes:window.__nEstr,bloqueio:X('radioBloqueio')(),eventos:X('mundoD')().ev.filter(e=>!e.fim).map(e=>e.tipo).join(',')};"),
      j("G.dia++;X('terrAmanhece')();"),
      e("manha2", "return{pend:pend(),hist:X('radioD')().pedidos.map(p=>p.id+':'+p.tipo+':'+p.st).join(' '),registro:X('terrD')().registro.slice(-3).map(r=>r.txt)};"),
      j("for(const ev of X('mundoD')().ev)if(ev.tipo==='estrada'&&!ev.fim)for(const t of ev.troncos)X('troncoRemover')(t);"), ["gwait", 2],
      e("liberou", "return{bloqueio:X('radioBloqueio')()};"),
      j("G.dia++;X('terrAmanhece')();G.hora=10;G.noite=false;"),
      e("manha3", "return{caixa:caixa(),pend:pend(),hist:X('radioD')().pedidos.map(p=>p.id+':'+p.tipo+':'+p.st).join(' ')};"),
      # o transportador leva o que chegou para os baús
      j("const t=S('tiao');t.st='base';t.tarefa='transportar';t.hp=100;t.of=null;t.ofT=0;window.__cx=caixa();window.__bx=baus();"), ["gwait", 30],
      e("transportou", "const t=S('tiao');let acha=null;try{acha=X('OFICIOS').transportar[0].acha(t);}catch(er){acha='ERRO '+er.message;}"
                       "return{caixaAntes:window.__cx,caixaDepois:caixa(),tiao:est(t),trab:window.__trab.tiao||null,hora:r2(G.hora),noite:G.noite,modo:G.modo,pos:[r2(t.x),r2(t.z)],acha,ofT:t.ofT,"
                       "cabe:(X('terrD')().caixaTrocas||[]).filter(Boolean).map(it=>it.id+':'+X('ofBauCabe')(it)),nBaus:X('bausBase')().length,vis:t.ch.vis};"),
      # notícias: um ninho novo aparece no rádio e fica marcado como ouvido
      j("X('infestacaoComecar')();X('abrirRadio')();"), ["wait", 0.4],
      e("noticias", "const R=X('radioD')(),ev=X('mundoD')().ev.filter(e=>!e.fim);return{eventos:ev.map(e=>e.id+':'+e.tipo).join(','),ouvidos:R.ouvidos,noticias:[...document.querySelectorAll('.rd-not small')].map(x=>x.textContent)};"),
      # bancada: segurar abre o rádio, tocar abre a fabricação
      j("X('tela')(null);G.modo='jogo';const b=X('INTER').find(i=>i.id==='bancada');window.__bi=b;"),
      e("bancadaTexto", "return X('textoInter')({k:'inter',o:window.__bi});"),
      j("n.alvo={k:'inter',o:window.__bi};X('interagir')(true);"), ["wait", 0.3],
      e("segurou", "return{tela:!document.getElementById('t-terr').hidden,aba:document.querySelector('.tr-aba[aria-pressed=\"true\"]').dataset.aba,modo:G.modo};"),
      j("X('tela')(null);G.modo='jogo';P.acao={tipo:'revistar',t:0.1,dur:0.7,alvo:{k:'inter',o:window.__bi},alt:true};X('usarSolta')();"), ["wait", 0.3],
      e("tocou", "const r={modo:G.modo,mochila:!document.getElementById('inv').hidden,aba:X('invAba')};X('fecharMochila')();return r;"),
      # salvar e carregar o rádio
      e("radioAntes", "const R=X('radioD')();window.__r={sint:R.sint,pedidos:R.pedidos.length,seq:R.seq,pend:JSON.stringify(pend())};X('salvarJogo')();return window.__r;")]
s += recarrega()
s += [e("radioCarregou", "const R=X('radioD')();return{sint:R.sint,pedidos:R.pedidos.length,seq:R.seq,pend:JSON.stringify(pend())};"),
      # jogo salvo de antes do rádio novo: troca pendente sem número nem grupo
      j("const D=X('terrD')();D.trocasPendentes=[{grupo:'Grupo do Rio Claro',da:['pilhas',2]}];delete D.radio;"),
      e("antigo", "const R=X('radioD')(),t=X('terrD')().trocasPendentes[0];return{id:t.id,g:t.g,tipo:t.tipo,st:t.st,pedidos:R.pedidos.length};"),
      j("G.dia++;X('terrAmanhece')();"),
      e("antigoChegou", "return{caixa:caixa(),pend:pend()};")]
salvar('p163.json', s)
