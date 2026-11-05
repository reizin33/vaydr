"""p192: Etapa 20, porto e naufrágios: abertura no tapume, cais (piso, rampa, carro), prancha até o convés andando de verdade,
contêineres (abertos revistam, com cadeado só com pé de cabra), armário do comandante, altura certa para revistar, tripulação
zumbi, naufrágio do pesqueiro andando na maré baixa e nadando na alta, veleiro só mergulhando, salvar e carregar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=X('CONTS'),I=X('INTER'),inter=id=>I.find(q=>q.id===id),alvo=a=>{window.__a=a;X('alvoInter=window.__a');},"
     "revista=it=>{alvo({k:'inter',o:it});X('interagir')(true);},atual=()=>{const a=X('interAtual')();return a?(a.k==='inter'?a.o.id:a.k):null;},"
     "hora=(d,h)=>{G.dia=d;G.hora=h;G.t+=1e-3;},total=()=>P.inv.reduce((s,q)=>s+(q?q.n||1:0),0);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)if(!z.porto)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      e("abertura", "const pr=X('CID').props.filter(p=>p.k==='cerco'&&p.x>330),abre=pr.filter(p=>p.z>-4&&p.z<20).length,pb=X('pointBlocked');"
        "return{cercoLeste:pr.length,naAbertura:abre,passa:!pb(335.6,8,0.3),tapumeFora:!!pb(335.7,45,0.3),barricada:X('CID').props.filter(p=>(p.k==='jersey'||p.k==='carro')&&p.x>325&&p.z>0&&p.z<16).length};"),
      e("cais", "return{piso:r2(X('chaoEm')(356,8,1)),carro:r2(X('chaoVeic')(356,8)),rampa:r2(X('chaoVeic')(337,8)),profVeic:X('aguaProfVeic')(356,8),aguaDoLado:X('aguaNivel')(380,-40)!==null};"),
      # anda da cidade para o cais
      j("vai(330,8);P.yaw=Math.PI/2;P.body=P.yaw;"), ["down", "KeyW"], ["gwait", 3.0], ["up", "KeyW"],
      e("andouCais", "return{x:r2(P.x),y:r2(P.y),noCais:P.x>338&&Math.abs(P.y-0.35)<0.1};"),
      # sobe a prancha andando
      j("vai(364.5,14);P.yaw=Math.PI/2;P.body=P.yaw;"), ["down", "KeyW"], ["gwait", 6.0], ["up", "KeyW"],
      e("prancha", "const s=X('supEm')(P.x,P.z,P.y,0.3);return{x:r2(P.x),y:r2(P.y),noConves:Math.abs(P.y-3.85)<0.1&&P.x>377.5,dono:s&&s.dono};"),
      e("conteineres", "const nav=C.filter(c=>c.navio);return{total:C.length,navio:nav.length,abertos:C.filter(c=>c.st==='aberto').length,cadeado:C.filter(c=>c.st==='cadeado').length,"
        "pontos:C.filter(c=>c.st==='aberto').every(c=>!!inter(c.id)),altos:nav.filter(c=>c.h>1).length};")]
# revistar um aberto do convés (na frente da porta)
s += [e("revistar", "const c=C.find(c=>c.navio&&c.st==='aberto'),p=X('contPorta')(c,0.6);vai(p[0],p[1],c.y);P.yaw=Math.atan2(c.x-P.x,c.z-P.z);P.body=P.yaw;"
        "const v=atual(),t0=total();revista(inter(c.id));return{alvo:v,ganhou:total()-t0,dia:inter(c.id).dia===G.dia,id:c.id};"),
      e("alturaErrada", "const c=C.find(c=>c.navio&&c.st==='aberto'),p=X('contPorta')(c,0.6);vai(p[0],p[1],c.y-3.6);const v=atual();vai(p[0],p[1],c.y);return{debaixo:v};"),
      # cadeado: sem pé de cabra não abre; com, abre e vira ponto de revistar
      e("cadeadoSem", "const c=C.find(c=>c.navio&&c.st==='cadeado');window.__cc=c;const p=X('contPorta')(c,0.6);vai(p[0],p[1],c.y);P.yaw=Math.atan2(c.x-P.x,c.z-P.z);P.body=P.yaw;"
        "const a=X('interAtual')(),t=a&&X('textoInter')(a);alvo({k:'contCadeado',o:c});X('interagir')(true);return{alvo:a&&a.k,texto:t&&t.t,st:c.st};"),
      e("cadeadoCom", "const c=window.__cc;n.invAdd('peDeCabra',1);const a=X('interAtual')(),t=a&&X('textoInter')(a);alvo({k:'contCadeado',o:c});X('interagir')(true);"
        "return{texto:t&&t.t,st:c.st,ponto:!!inter(c.id),salvo:!!X('G').porto.abertos[c.id],alvoDepois:atual()};"),
      e("capitao", "const it=inter('navio-capitao');vai(it.x,it.z-0.6,it.y);P.yaw=0;P.body=0;const v=atual(),t0=total();revista(it);const t1=total();revista(it);return{alvo:v,ganhou:t1-t0,segunda:total()-t1,once:!!it.once};"),
      e("guarita", "P.inv.fill(null);const it=inter('porto-guarita');vai(it.x-0.5,it.z,it.y);const v=atual(),t0=total();revista(it);return{alvo:v,ganhou:total()-t0};"),
      # tripulação: chega perto do porto e aparecem zumbis no cais e no convés
      j("X('G').porto.povoado=0;Z.length=0;vai(346,40);"), ["gwait", 3.0],
      e("tripulacao", "const q=Z.filter(z=>z.porto&&z.vivo);return{n:q.length,noConves:q.filter(z=>z.y>3).length,noCais:q.filter(z=>Math.abs(z.y-0.35)<0.3).length,doDia:X('G').porto.povoado===G.dia};"),
      j("for(const z of Z)z.vivo=false;Z.length=0;")]
# naufrágio do pesqueiro: maré baixa andando, alta nadando
s += [j("hora(3,8.6);vai(362,101);"), ["gwait", 0.6],
      e("naufragioBaixa", "P.inv.fill(null);const it=inter('naufragio-cabine'),W=X('NAUFRAGIOS')[0];vai(it.x-Math.sin(W.yaw)*1.6,it.z-Math.cos(W.yaw)*1.6);P.yaw=Math.atan2(it.x-P.x,it.z-P.z);P.body=P.yaw;const nada=!!P.nada,prof=r2(X('aguaProf')(P.x,P.z)),v=atual(),t0=total();revista(it);return{nada,prof,alvo:v,ganhou:total()-t0};"),
      j("hora(3,14.8);vai(362,101,X('marNivel')()-1.3);"), ["gwait", 0.8],
      e("naufragioAlta", "const it=inter('naufragio-porao');return{nada:!!P.nada,prof:r2(X('aguaProf')(P.x,P.z)),pertoPorao:r2(Math.hypot(it.x-P.x,it.z-P.z))};"),
      # veleiro: na superfície não alcança o baú; mergulhando, alcança
      j("hora(3,11);const it=inter('veleiro-bau');vai(it.x-1.0,it.z-1.0,X('marNivel')()-1.3);P.yaw=Math.atan2(it.x-P.x,it.z-P.z);P.body=P.yaw;"), ["gwait", 0.6],
      e("veleiroSuperficie", "return{nada:!!P.nada,alvo:atual(),dy:r2(P.y-inter('veleiro-bau').y)};"),
      j("X('IN').keys.KeyC=true;"), ["gwait", 4.0], j("X('IN').keys.KeyC=false;"),
      e("veleiroMergulho", "const it=inter('veleiro-bau'),v=atual(),t0=total();revista(it);return{mergulho:r2(P.mergulho||0),folego:r2(P.folego||0),alvo:v,ganhou:total()-t0,dy:r2(P.y-it.y)};"),
      ["gwait", 6.0],
      e("subiu", "return{mergulho:r2(P.mergulho||0),folego:r2(P.folego||0),nada:!!P.nada};")]
# escada do cais: nadando junto da escada do lado norte, sobe até o piso
s += [j("hora(3,9);P.nada=null;P.mergulho=0;vai(368,-5.0,X('marNivel')()-1.3);P.yaw=0;P.body=0;"), ["gwait", 0.5],
      e("escadaAgua", "const vp=X('viaPerto')(),a=X('interAtual')();window.__vp=vp;return{nada:!!P.nada,via:!!vp,mar:!!(vp&&vp.v.mar),alvo:a&&a.k,dyBase:vp?r2(vp.v.base.y-P.y):null};"),
      j("X('comecarEscalada')(window.__vp);window.__turbo=1;"), ["down", "KeyW"], ["gwait", 4.0], ["up", "KeyW"], ["gwait", 1.5], j("window.__turbo=6;"),
      e("escadaSubiu", "return{nada:!!P.nada,escala:!!P.escala,y:r2(P.y),noCais:Math.abs(P.y-0.35)<0.15&&P.z>-4};")]
# salvar e carregar: contêiner arrombado continua aberto; revistados lembram o dia
s += [j("vai(346,40);"),
      e("salvou", "window.__ab=Object.keys(X('G').porto.abertos);X('salvarJogo')();return{abertos:window.__ab};"),
      j("X('portoReset')();"),
      e("resetou", "return{st:window.__cc.st,abertos:Object.keys(X('G').porto.abertos).length,ponto:!!inter(window.__cc.id)};"),
      j("X('carregarJogo')();"), ["gwait", 1.5],
      e("carregou", "const c=X('CONTS').find(q=>q.id===window.__cc.id);return{st:c.st,ponto:!!inter(c.id),abertos:Object.keys(X('G').porto.abertos),capitaoVazio:X('bauVazio')(inter('navio-capitao')),barco:!!X('VEICS').find(v=>v.id==='barcoPraia'),reboque:!!X('REBOQUES').find(r=>r.id==='reboquePorto')};")]
salvar('p192.json', s, vp=(960, 540))
