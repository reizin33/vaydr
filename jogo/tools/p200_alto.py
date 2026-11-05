"""p200: Etapa 22, Alto do Rio Claro: regiões com nome; terreno (patamares planos, serra em volta, leito do córrego); andando de
verdade pela Trilha da Serra, da rua da vila até a pousada no planalto; prédios (pousada, chalés, galpão, posto); prédio-desafio do
galpão completo (fusível do posto, alavanca do gerador, sirene, cartão do gerente, sala do cofre); caixa militar do bloqueio; balão
caído (revistar e desmontar); mirante (subir a escada e observar); esconderijo do marco; nascente; fauna do planalto."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const I=X('INTER'),inter=id=>I.find(q=>q.id===id),alvo=a=>{window.__a=a;X('alvoInter=window.__a');},"
     "revista=it=>{alvo({k:'inter',o:it});X('interagir')(true);},atual=()=>{const a=X('interAtual')();return a?(a.k==='inter'?a.o.id:a.k):null;},"
     "total=()=>P.inv.reduce((s,q)=>s+(q?q.n||1:0),0),GA=X('GALP'),AL=X('ARC_LAY'),gr=X('ground'),"
     "plano=(x,z,r)=>{let a=1e9,b=-1e9;for(let k=0;k<9;k++){const t=k/9*6.283,h=gr(x+Math.cos(t)*r*(k?1:0),z+Math.sin(t)*r*(k?1:0));a=Math.min(a,h);b=Math.max(b,h);}return r2(b-a);};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)if(Math.hypot(z.x-__nnc.P.x,z.z-__nnc.P.z)<14)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      e("regioes", "const re=X('regiaoEm'),q=(x,z)=>{const r=re(x,z);return r?r.id:null;};return{n:X('REGIOES').length,alto:q(50,-244),corredor:q(46,-160),mata:q(0,0),vila:q(62,-80),cidade:q(254,5),litoral:q(372,8),fora:q(0,-320),dentroMapa:X('dentroMapa')(50,-244),serraFora:X('dentroMapa')(50,-320)};"),
      e("terreno", "const L=X('ARC_L');return{pousada:plano(L.pousada.x,L.pousada.z,14),galpao:plano(L.galpao.x,L.galpao.z,9),posto:plano(L.posto.x,L.posto.z,5),bloqueio:plano(L.bloqueio.x,L.bloqueio.z,5),"
        "serra:r2(gr(50,-330)-gr(50,-300)),serraOeste:r2(gr(-30,-244)-gr(-6,-244)),leito:r2(Math.min(gr(43,-202),gr(47,-202))-gr(X('ARC_CORREGO')[1][0],-202)),bordaSul:r2(gr(80,-187))};"),
      e("predios", "const A=X('ARC_P'),R=X('RURAIS'),o={};for(const k in A){const p=A[k];o[k]={rural:R.includes(p),salas:(p.salas[0]||[]).length,portas:X('CID').portas.filter(d=>d.p===p).length,y0:r2(p.y0)};}"
        "const D=X('CID').portas.filter(d=>d.p===A.galpao&&d.desafio);return{o,desafio:D.map(d=>d.desafio+':'+d.estado)};")]
# andando pela trilha: da rua da vila até a pousada
s += [j("const L=X('ARC_L');window.__rota=L.trilha.slice(1).concat(L.degraus.slice(1),[[72,-210],[64,-222],[54,-228]]);window.__ri=0;vai(28,-80);P.yaw=0;"
        "const cp=window.__cadaPasso;window.__cadaPasso=()=>{cp();const R=window.__rota;if(window.__ri<R.length){const w=R[window.__ri],dx=w[0]-P.x,dz=w[1]-P.z;if(Math.hypot(dx,dz)<1.3)window.__ri++;else{P.yaw=Math.atan2(dx,dz);P.body=P.yaw;}}else P.travaAnda=0.2;};"),
      ["down", "KeyW"], ["gwait", 75.0], ["up", "KeyW"],
      e("trilha", "const R=window.__rota,fim=R[R.length-1];return{chegou:window.__ri>=R.length,distFim:r2(Math.hypot(P.x-fim[0],P.z-fim[1])),limpa:X('ARC_LAY').trilhaLimpa,ponto:window.__ri+' de '+R.length,x:r2(P.x),z:r2(P.z),y:r2(P.y),noChao:Math.abs(P.y-gr(P.x,P.z))<0.3,regiao:X('regiaoEm')(P.x,P.z).id,descobriu:!!X('regD')().alto.descoberta};"),
      j("window.__cadaPasso=()=>{for(const z of __nnc.Z)if(!z.arc)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};")]
# prédio-desafio do galpão
s += [e("quadroSem", "const w=X('pdsPos')(GA.quadro);vai(w[0]-0.6,w[1],GA.ya);P.inv.fill(null);alvo({k:'pds_quadro',o:GA.quadro});const t=X('INTER_K').pds_quadro.texto();X('interagir')(false);return{texto:t.t,fus:X('pdsD')().fus};"),
      e("fusivelPosto", "const c=GA.caixa;X('contEncher')(c);const tem=(c.itens||[]).some(q=>q&&q.id==='fusivel');return{caixa:c.tipo,predio:c.p.nome,temFusivel:tem};"),
      e("fusivelPor", "n.invAdd('fusivel',1);const w=X('pdsPos')(GA.quadro);vai(w[0]-0.6,w[1],GA.ya);alvo({k:'pds_quadro',o:GA.quadro});X('interagir')(false);return{fus:X('pdsD')().fus,sobrou:conta('fusivel')};"),
      e("alavanca", "const z0=Z.filter(z=>z.vivo).length;alvo({k:'pds_alavanca',o:GA.alavanca});X('interagir')(true);return{luz:X('pdsD')().luz,portao:GA.portao.estado,zumbis:Z.filter(z=>z.vivo).length-z0};"),
      j("for(const z of Z)z.vivo=false;"),
      e("cartao", "const c=GA.mesa;c.itens=null;X('contEncher')(c);const tem=(c.itens||[]).some(q=>q&&q.id==='cartaoPousada');n.invAdd('cartaoPousada',1);const d=GA.cofre;vai(d.x-1.2,d.z,GA.ya);alvo({k:'porta',o:d});"
        "const t=X('dsfPortaTexto')(d);X('interagir')(false);return{naMesa:tem,texto:t.t,cofre:d.estado,cartaoUsado:conta('cartaoPousada')===0,D:X('pdsD')().cartao};"),
      e("cofre", "const c=GA.armario;c.itens=null;X('contEncher')(c);return{itens:(c.itens||[]).filter(Boolean).map(q=>q.id)};"),
      e("cxm", "const d=X('CXM_DEF').find(q=>q.id==='cxmAlto'),c=X('cxmD')().cxmAlto;return{existe:!!d,x:d&&r2(d.x),z:d&&r2(d.z),noAlto:d&&X('dentroARC')(d.x,d.z,0),st:c&&c.st};"),
      e("cxmLiga", "const d=X('CXM_DEF').find(q=>q.id==='cxmAlto');X('cxmLigar')(d);const c=X('cxmD')().cxmAlto;const st=c.st;c.st='trancada';c.resta=0;return{st};")]
# balão, mirante, marco e nascente
s += [e("balaoCesto", "const it=inter('alto-cesto');P.inv.fill(null);vai(it.x,it.z);const v=atual(),t0=total();revista(it);const t1=total();revista(it);return{alvo:v,ganhou:t1-t0,segunda:total()-t1};"),
      e("balaoDesmonta", "const L=AL.balao,c=Math.cos(L.yaw),s=Math.sin(L.yaw);vai(L.x+4.6*c-1,L.z-4.6*s);P.inv.fill(null);const a=X('interAtual')(),k=a&&a.k;alvo({k:'arcBalao',o:L});X('interagir')(true);"
        "return{alvo:k,desmontado:!!X('arcD')().balaoDesm,pano:conta('pano'),corda:conta('corda'),cano:conta('cano'),sucata:conta('sucata'),naFila:X('ARC_FILA').some(q=>q.id==='balao')||!!X('ARC_BALAO').mesh};"),
      e("mirantePe", "const L=AL.mirante;vai(L.x,L.z+L.meio+0.85,L.g);const vp=X('viaPerto')();window.__vp=vp;return{via:!!vp,topo:r2(L.top-L.g)};"),
      j("X('comecarEscalada')(window.__vp);window.__turbo=1;"), ["down", "KeyW"], ["gwait", 9.0], ["up", "KeyW"], ["gwait", 1.0], j("window.__turbo=6;"),
      e("mirante", "const L=AL.mirante,noTopo=Math.abs(P.y-L.top)<0.3&&!P.escala;const a=X('interAtual')(),k=a&&a.k;if(!noTopo)vai(L.x,L.z,L.top);alvo({k:'arcMirante',o:L});X('interagir')(true);const D=X('arcD')();"
        "return{subiu:noTopo,y:r2(P.y),alvo:k,mapeada:!!D.mapeada,vistos:Object.keys(D.vistos).length,obs:G.obsAte>G.t};"),
      e("marco", "const it=inter('alto-marco');P.inv.fill(null);vai(it.x,it.z);const v=atual(),t0=total();revista(it);return{alvo:v,ganhou:total()-t0};"),
      e("nascente", "const it=inter('alto-nascente');vai(it.x,it.z);return{kind:it.kind,alvo:atual(),agua:X('aguaPerto')?true:null};"),
      e("fauna", "const Zf=X('ZONAS_FAUNA').find(q=>q.id==='alto'),FE=X('faunaEstado')();return{zona:!!Zf,estado:!!FE.z.alto,especies:Zf?Object.keys(Zf.f):[]};"),
      e("mapa", "let ok=true;try{G.modo='jogo';X('abrirMapa')();X('fecharMapa')();}catch(e){ok=String(e);}return{ok,z0:X('MAPA_Z0')};")]
salvar('p200.json', s, vp=(640, 360))
