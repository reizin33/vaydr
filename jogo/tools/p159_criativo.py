"""p159: modo criativo (Etapa 2). Começa escondido; o jogo normal salva normalmente; ligado nos Ajustes, o menu mostra o botão;
o jogo criativo fica em chaves separadas (nnc_adm_...); painel com a tecla '; voar, imortal, sem gastar material e liberar tudo;
ir para o hospital; hora e clima; criar item, bicho, zumbi, chefe e veículo; eventos; inspecionar; sair volta ao jogo normal intacto;
recarregar a página não deixa o criativo ligado; desligar nos Ajustes esconde o botão."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const ADM=X('ADM'),raw=k=>{const t=localStorage[k];return t?JSON.parse(t):null;},"
     "aba=a=>{const b=document.querySelector('#ad-abas button[data-aba=\"'+a+'\"]');b&&b.click();},"
     "acao=a=>{const b=document.querySelector('#ad-corpo button[data-a=\"'+a+'\"]');if(!b)return'sem botão '+a;b.click();return document.getElementById('ad-msg').textContent;},"
     "frente=(d)=>[P.x+Math.sin(P.yaw)*d,P.z+Math.cos(P.yaw)*d];")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = [["wait", 2],
     e("menuAntes", "return{botao:!document.getElementById('m-criativo')||document.getElementById('m-criativo').hidden,cfg:n.cfg.criativo??null};"),
     ["click", "#m-novo"], ["wait", 1.5],
     j("n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;window.__turbo=6;window.__semRender=true;"), ["gwait", 0.3],
     # jogo normal: marca 3 latas de feijão e salva
     e("normal", "n.invAdd('feijao',3);X('salvarJogo')();const s=raw('nnc_jogo_v1');return{ativo:ADM.ativo,feijaoSalvo:s&&s.P.inv.filter(q=>q&&q.id==='feijao').reduce((a,q)=>a+q.n,0),admSave:!!raw('nnc_adm_jogo_v1')};"),
     j("X('salvarJogo')();X('mostrarMenu')();"), ["wait", 0.5],
     # liga nos Ajustes
     ["click", "#m-ajustes"], ["wait", 0.3], ["click", "#aj-criativo button[data-v='1']"], ["click", "#aj-ok"], ["wait", 0.3],
     e("ligado", "X('mostrarMenu')();return{cfg:n.cfg.criativo,botao:!document.getElementById('m-criativo').hidden,pausaBotao:document.getElementById('p-criativo').hidden};"),
     ["click", "#m-criativo"], ["wait", 1.5], j("window.__turbo=6;window.__semRender=true;Z.length=0;"), ["gwait", 0.3],
     e("entrou", "return{ativo:ADM.ativo,modo:G.modo,selo:document.body.classList.contains('criativo'),dia:G.dia,feijao:conta('feijao'),pausaBotao:!document.getElementById('p-criativo').hidden};"),
     # painel pela tecla '
     ["press", "Backquote"], ["wait", 0.3],
     e("painel", "return{modo:G.modo,aberto:!document.getElementById('t-criativo').hidden,abas:document.querySelectorAll('#ad-abas button').length,botoes:document.querySelectorAll('#ad-corpo button[data-a]').length};"),
     # imortal, sem gastar, liberar tudo
     e("imortal", "acao('imortal');const v0=P.vida;X('ferirJogador')(500);X('morrer')();return{ligado:ADM.imortal,vida:P.vida,vivo:P.alive,v0};"),
     e("gratis", "acao('gratis');acao('liberar');const i=X('RECIPES').findIndex(r=>r.faz==='tabuas');const m0=conta('madeira'),t0=conta('tabuas');const ok=X('fabricar')(i,true);"
                 "return{gratis:ADM.gratis,liberar:ADM.liberar,fabricou:ok,tabuas:conta('tabuas')-t0,madeiraGasta:m0-conta('madeira'),muroFerroLiberado:X('obraLiberada')('muroFerro'),temCustoMuroFerro:X('invHas')(X('OBRAS').muroFerro.custo)};"),
     # voar: Espaço sobe, Z desce
     e("voarLiga", "acao('voar');return{voar:ADM.voar};"),
     ["press", "Backquote"], ["wait", 0.2], j("window.__y0=P.y;window.__turbo=2;"), ["down", "Space"], ["gwait", 0.6], ["up", "Space"], j("window.__turbo=6;"), ["gwait", 0.2],
     e("subiu", "return{subiu:Math.round((P.y-window.__y0)*10)/10,noChao:P.noChao,modo:G.modo};"),
     ["gwait", 1.0], e("parado", "return{altura:Math.round((P.y-n.chaoEm(P.x,P.z,P.y))*10)/10};"),
     j("window.__turbo=2;"), ["down", "KeyZ"], ["until", "(()=>{const n=__nnc;return n.P.y<=n.chaoEm(n.P.x,n.P.z,n.P.y)+0.05;})()", 30], ["up", "KeyZ"], j("window.__turbo=6;"),
     e("desceu", "return{altura:Math.round((P.y-n.chaoEm(P.x,P.z,P.y))*100)/100};"),
     # tempo e clima
     ["press", "Backquote"], ["wait", 0.2],
     e("tempo", "aba('tempo');const m1=acao('hora:21');const m2=acao('clima:chuva');return{hora:G.hora,clima:X('climaAgora')(),m1,m2};"),
     # ir para o hospital
     e("ir", "aba('ir');const L=X('admLugares')(),i=L.findIndex(l=>l.nome==='Hospital São Lucas');const m=acao('ir:'+i);const H=X('CID').predios.find(p=>p.nome==='Hospital São Lucas');"
             "return{achou:i>=0,msg:m,dist:Math.round(Math.hypot(P.x-(H.x0+H.x1)/2,P.z-(H.z0+H.z1)/2)),lugares:L.length};"),
     j("const f=X('admIr');f(10,14);G.hora=10;"),
     # criar: item com busca, bicho, zumbi, chefe e veículo
     e("item", "aba('criar');const b=document.getElementById('ad-busca');b.value='pistola';b.dispatchEvent(new Event('input'));"
               "const lista=[...document.querySelectorAll('#ad-corpo .ad-itens button')].map(x=>x.dataset.a);const m=acao('item:pistola');return{lista:lista.slice(0,5),pistolas:conta('pistola'),msg:m};"),
     e("bicho", "const n0=X('BICHOS').length;const m=acao('bicho:cervo');const b=X('BICHOS')[X('BICHOS').length-1];return{novos:X('BICHOS').length-n0,tipo:b&&b.tipo,dist:b&&Math.round(Math.hypot(b.x-P.x,b.z-P.z)),msg:m};"),
     e("zumbi", "const n0=Z.length;const m=acao('zumbi:policial');const z=Z[Z.length-1];return{novos:Z.length-n0,tipo:z&&z.tipo,dist:z&&Math.round(Math.hypot(z.x-P.x,z.z-P.z)),msg:m};"),
     e("chefe", "const n0=Z.length;const m=acao('zumbi:sargento');const z=Z[Z.length-1];return{novos:Z.length-n0,tipo:z&&z.tipo,msg:m};"),
     j("for(const z of Z)z.vivo=false;Z.length=0;"),
     e("veiculo", "const n0=X('VEICS').length;const m=acao('veic:caminhonete');const v=X('VEICS')[X('VEICS').length-1];return{novos:X('VEICS').length-n0,tipo:v&&v.tipo,comb:v&&v.comb,motor:v&&v.pecas&&v.pecas.motor,oleo:v&&v.pecas&&v.pecas.oleo,msg:m};"),
     e("barcoSeco", "return{msg:acao('veic:barco')};"),
     *(foto("840_painel_criativo.png", H + "aba('criar');const b=document.getElementById('ad-busca');b.value='';b.dispatchEvent(new Event('input'));", 0.1, 1.5) if os.environ.get('SEMFOTO') != '1' else []),
     # eventos
     e("eventos", "aba('eventos');const r={};for(const k of['frutas','cardume','aviao','enchente','incendio','estrada','comboio','infestacao'])r[k]=acao('ev:'+k);"
                  "const M=X('mundoD')();return{msgs:r,frutas:M.frutas===G.dia,cardume:M.cardume>G.tm,aviao:!!(G.aereo&&G.aereo.lancamento),enchente:M.cheia.ativa,fogo:!!M.fogo,eventos:M.ev.map(e=>e.tipo)};"),
     # inspecionar: olha para a caminhonete
     e("inspLiga", "aba('jogador');acao('inspecionar');return{insp:ADM.inspecionar};"),
     ["press", "Backquote"], ["wait", 0.2],
     j("const v=X('VEICS')[X('VEICS').length-1];const dx=v.x-P.x,dz=v.z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;"), ["gwait", 0.3],
     e("inspecao", "const el=document.getElementById('ad-insp');return{visivel:!el.hidden,texto:el.textContent.slice(0,90)};"),
     # salva o criativo e confere as chaves separadas
     e("salvouCriativo", "X('salvarJogo')();const a=raw('nnc_adm_jogo_v1'),nrm=raw('nnc_jogo_v1');"
                         "return{admSave:!!a,admPistola:a&&a.P.inv.some(q=>q&&q.id==='pistola'),normalPistola:nrm&&nrm.P.inv.some(q=>q&&q.id==='pistola'),normalFeijao:nrm&&nrm.P.inv.filter(q=>q&&q.id==='feijao').reduce((s,q)=>s+q.n,0),"
                         "chaves:Object.keys(localStorage).filter(k=>k.startsWith('nnc_')).sort()};"),
     # sair: volta ao menu e ao jogo normal
     ["press", "Backquote"], ["wait", 0.2], ["click", "#ad-corpo button[data-a='sair']"], ["wait", 0.6],
     e("saiu", "return{ativo:ADM.ativo,modo:G.modo,selo:document.body.classList.contains('criativo'),continuar:!document.getElementById('m-continuar').hidden};"),
     ["click", "#m-continuar"], ["wait", 1.5], j("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.3],
     e("normalVoltou", "return{ativo:ADM.ativo,feijao:conta('feijao'),pistola:conta('pistola'),voar:ADM.voar,imortal:ADM.imortal};"),
     # recarregar a página: o criativo não fica ligado sozinho
     j("X('salvarJogo')();"), ["reload"], ["wait", 3],
     e("recarregou", "return{ativo:ADM.ativo,botao:!document.getElementById('m-criativo').hidden};"),
     # desligar nos Ajustes esconde o botão
     ["click", "#m-ajustes"], ["wait", 0.3], ["click", "#aj-criativo button[data-v='0']"], ["click", "#aj-ok"], ["wait", 0.3],
     e("desligado", "X('mostrarMenu')();return{cfg:n.cfg.criativo,botao:!document.getElementById('m-criativo').hidden};")]
salvar('p159.json', s)
