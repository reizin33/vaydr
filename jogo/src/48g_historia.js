/* ================= história depois do resgate: a Dra. Helena, o laboratório e a Base Militar Serra Velha =================
   Capítulo 2 · O laboratório: pelo rádio, a Dra. Helena pede o caderno de pesquisa (laboratório, último andar do Hospital São Lucas)
     e uma amostra do Paciente Zero (o chefe de lá; se ele já caiu, a amostra está no freezer do laboratório).
   Capítulo 3 · A base: na Base Militar Serra Velha, a oeste da mata, abasteça o gerador com 2 galões e leve tudo à centrífuga da tenda.
   Capítulo 4 · A vacina: a centrífuga roda a noite inteira e o barulho chama os mortos. Fique na base e não deixe o gerador cair.
     Ao amanhecer a vacina fica pronta: quem toma não pega mais o vírus. É o segundo final.
   A base existe desde o começo: dá para explorar e saquear as caixas militares antes da história chegar lá. */
Object.assign(ITEMS,{
  caderno:{nome:'Caderno da Dra. Helena',icon:'i-caderno',max:1,tipo:'missao',desc:'Anotações da pesquisa da vacina. A Dra. Helena precisa dele.'},
  amostra:{nome:'Amostra do Paciente Zero',icon:'i-amostra',max:1,tipo:'missao',desc:'Frasco com sangue do primeiro infectado. Vai para a centrífuga da base.'},
  vacina:{nome:'Vacina',icon:'i-vacina',max:3,tipo:'cura',trata:'vacina',vida:20,desc:'A cura. Quem toma não pega mais o vírus.'},
  racao:{nome:'Ração militar',icon:'i-racao',max:10,tipo:'comida',fome:55,sede:6,desc:'Comida de soldado em pacote. Rende muito.'}});
LOOT.militar=[['municao9',4,10,0.6],['cartucho',3,8,0.4],['balaRifle',2,5,0.25],['kit',1,1,0.25],['bandagem',1,3,0.5],['seringa',1,1,0.3],['racao',1,2,0.65],['mascaraGas',1,1,0.08],
  ['bombaCaseira',1,1,0.12],['pilhas',1,2,0.3],['lanterna',1,1,0.06],['rifle',1,1,0.04],['espingarda',1,1,0.05],['agua',1,2,0.4]];
Object.assign(OBRAS,{geradorBase:{nome:'Gerador da base',icon:'i-gerador',custo:{},hp:420,hw:0.9,hd:0.6,solid:true,etapa:3,gerador:true,base:true}});
const BASEM={x:-108,z:-30};
const HIST_FALAS={
  c2a:'...alguém na escuta? Aqui é a Dra. Helena Prado, do Hospital São Lucas. O helicóptero levou o grupo de vocês, mas eu fiquei. Eu estava trabalhando numa vacina.',
  c2b:'Meu caderno de pesquisa ficou no laboratório, no último andar do hospital. E preciso de uma amostra do Paciente Zero, o primeiro infectado. Ele ainda anda por lá.',
  c2c:'Você está com o caderno e a amostra? Então ainda dá. Preciso de um laboratório que funcione: a Base Militar Serra Velha, a oeste da mata, tem gerador e centrífuga.',
  c3a:'Na base: o gerador precisa de 2 galões de gasolina. Depois leve o caderno e a amostra para a centrífuga, na tenda branca.',
  c3b:'A centrífuga vai rodar a noite inteira e faz barulho. Eles vão vir. Fique na base e não deixe o gerador cair até o sol nascer.',
  c4a:'O sol nasceu e a centrífuga terminou! A vacina está na tenda. Tome uma dose: você nunca mais pega o vírus. Leve as outras para quem precisar.',
  falhou:'O gerador da base caiu e a centrífuga parou. Conserte o gerador, ponha gasolina e tente de novo na próxima noite.',
  fim2:'Funcionou. Você é o primeiro imune. Daqui pra frente, cada noite que você aguenta é uma noite a mais para o mundo. Obrigada.'};
/* ---------- geometria da base (estática, em coordenadas do mundo) ---------- */
let BASEM_PRONTA=false;
function baseMilitarGeo(){const R=rng(808),g=new GB(16384,8),X=BASEM.x,Zc=BASEM.z,G0=ground(X,Zc),oli=lin(0x4a5236),oli2=lin(0x3c4430),aco=lin(0x6a7076),aco2=lin(0x8a9096),con=lin(0x8c8a84),
    lona=lin(0xd8d6cc),areia=lin(0xa99a72),preto=lin(0x1c1c1c),madeira=lin(0x6b4e30),W=(lx,lz)=>[X+lx,Zc+lz],M=(lx,ly,lz,ry,rx,rz,sx,sy,sz)=>mat(X+lx,G0+ly,Zc+lz,rx||0,ry||0,rz||0,sx??1,sy??(sx??1),sz??(sx??1));
  const P=(lx,lz,ly)=>ground(X+lx,Zc+lz)-G0+(ly||0);
  /* v10.2.2: a cerca de palitos, o portão, a guarita, os dois alojamentos de caixa, o caminhão de caixa, as caixas verdes e os tambores
     saíram. No lugar entram modelos escaneados (62u_lugares.js, "Base Militar destruída"): bloco de garagens em ruína, helicóptero
     caído no heliponto, blindado e caminhão-baú abandonados, muros de sacos de areia com trechos caídos, barreiras de concreto
     na entrada e caixas militares de madeira onde ficam as caixas de saquear. Aqui ficam o heliponto, a tenda do laboratório
     (a centrífuga da história) e o mastro com a bandeira rasgada. */
  // heliponto
  {const y=P(-4,0)+0.02;add(g,cylTris(4.2,4.2,0.06,28),M(-4,y,0),lin(0x55575a));add(g,cylTris(3.9,3.9,0.07,28,{top:true}),M(-4,y+0.005,0),lin(0x4b4d50));
    for(const s of[-1,1])add(g,boxTris(0.45,0.02,3.0),M(-4+s*1.0,y+0.075,0),lin(0xd8d0b0));add(g,boxTris(2.0,0.02,0.45),M(-4,y+0.075,0),lin(0xd8d0b0));
    for(let i=0;i<12;i++){const a=i/12*6.283;add(g,boxTris(0.5,0.02,0.18),M(-4+Math.cos(a)*3.55,y+0.075,Math.sin(a)*3.55,-a),lin(0xd8c060));}}
  // tenda do laboratório (lona branca com cruz) e mesa
  {const lx=5,lz=8.5,y=P(lx,lz);add(g,boxTris(6.2,0.06,4.4),M(lx,y+0.03,lz),lin(0x6a6862));for(const s of[-1,1])add(g,boxTris(6.0,0.05,2.6),mm(M(lx,y+2.35,lz+s*1.05),mat(0,0,0,s*0.55,0,0)),lona,{j:0.03,rnd:R});
    add(g,boxTris(6.0,1.7,0.05),M(lx,y+0.85,lz+2.15),lona,{j:0.03,rnd:R});for(const s of[-1,1])add(g,boxTris(0.05,2.2,4.3,{tz:0.02}),M(lx+s*3.0,y+1.1,lz),lona,{j:0.03,rnd:R});
    add(g,boxTris(0.9,0.22,0.06),M(lx+1.6,y+2.0,lz-2.18,0),lin(0xb02a20));add(g,boxTris(0.22,0.9,0.06),M(lx+1.6,y+2.0,lz-2.18,0),lin(0xb02a20));
    for(const s of[-1,1])for(const t of[-1,1])add(g,cylTris(0.04,0.04,2.6,5),M(lx+s*2.95,y,lz+t*2.1),aco);
    add(g,boxTris(2.4,0.06,0.9),M(lx-0.8,y+0.92,lz+1.2),aco2);for(const s of[-1,1])for(const t of[-1,1])add(g,boxTris(0.05,0.9,0.05),M(lx-0.8+s*1.1,y+0.45,lz+1.2+t*0.4),aco);
    add(g,boxTris(0.3,0.25,0.25),M(lx-1.4,y+1.07,lz+1.2),lin(0xdcdcd6));add(g,cylTris(0.05,0.05,0.18,8),M(lx-0.6,y+0.95,lz+1.15),lin(0x8ab0c0),{e:0.15});}
  // mastro com bandeira rasgada, caixas e tambores
  add(g,cylTris(0.06,0.06,7.5,6),M(1,P(1,-3),-3),aco2);add(g,boxTris(0.02,0.9,1.4,{tz:0.8}),M(1,P(1,-3,6.9),-3.75),lin(0x4a5a3a),{j:0.1,rnd:R});
  MESH.baseMil=litMesh(g.data());BASEM_PRONTA=true;}
/* colisores, caixas militares e as peças que são obras de verdade (torres, gerador, postes) */
function baseMilitarMontar(){const X=BASEM.x,Zc=BASEM.z;
  /* v10.2.2: os colisores da cerca, dos alojamentos, do caminhão e do portão saíram com eles (os modelos novos trazem os seus,
     no 62u_lugares.js). Ficam os da tenda e os pontos de saque: as caixas militares e o alojamento, agora na porta das garagens */
  colBox(X+5,Zc+10.6,3,0.06,0,{solid:true});for(const s of[-1,1])colBox(X+5+s*3.0,Zc+8.5,0.06,2.15,0,{solid:true});
  const caixas=[[-12,-4],[-12,4.2],[11,11],[-11.4,-3.3]];caixas.forEach(([lx,lz],i)=>interAdd({id:'base-caixa'+i,kind:'bau',x:X+lx-0.9,z:Zc+lz,label:'Revistar a caixa militar',tabela:'militar',respawn:3}));
  interAdd({id:'base-aloj',kind:'bau',x:X-3.5,z:Zc-4.6,label:'Revistar as garagens',tabela:'militar',respawn:4});}
function baseMilitarObras(){const X=BASEM.x,Zc=BASEM.z,tem=t=>OB.some(o=>o.tipo===t&&Math.hypot(o.x-X,o.z-Zc)<25);
  if(!tem('torreVigia')){criarObra('torreVigia',X+11.5,Zc-11.5,Math.PI/4);criarObra('torreVigia',X-11.5,Zc+12.2,-Math.PI*0.75);}
  if(!tem('geradorBase')){const o=criarObra('geradorBase',X+5,Zc-8,0);o.ext.comb=0;o.ext.ligado=true;}
  if(!tem('poste')){for(const[lx,lz,y]of[[12,-6,Math.PI],[0,7.6,0],[-12.6,0.6,Math.PI/2],[6,13,0]])criarObra('poste',X+lx,Zc+lz,y);}}   // v10.2.2: dois postes mudaram de lugar (o helicóptero caído ocupa o meio)
/* ---------- interação da história (caderno, amostra, centrífuga, vacina) ---------- */
const HIST_PONTOS=[];
function histLab(){if(!CID||!CID.predios)return null;const p=CID.predios.find(q=>q.nome.indexOf('Hospital')>=0);if(!p)return null;
  for(let f=p.salas.length-1;f>=0;f--){const s=(p.salas[f]||[]).find(q=>q.tipo==='laboratorio');if(s){const w=pw(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);return{x:w[0],y:s.y,z:w[1]};}}return null;}
function histMontarPontos(){HIST_PONTOS.length=0;const L=histLab();
  if(L){HIST_PONTOS.push({id:'caderno',x:L.x+0.6,y:L.y,z:L.z,r:1.8,ativo:()=>G.hist.cap>=2&&!G.hist.caderno,t:'Pegar o caderno da Dra. Helena',s:'em cima da bancada do laboratório',usar:()=>{G.hist.caderno=true;ganhar('caderno',1);sfx('missao');histAvanca();}});
    HIST_PONTOS.push({id:'freezer',x:L.x-0.8,y:L.y,z:L.z+0.6,r:1.8,ativo:()=>G.hist.cap>=2&&!G.hist.amostra&&G.chefesR&&G.chefesR.pacienteZero&&G.chefesR.pacienteZero.st==='morto',t:'Pegar a amostra no freezer',s:'o Paciente Zero já caiu: tem sangue dele guardado',usar:()=>{G.hist.amostra=true;ganhar('amostra',1);sfx('missao');histAvanca();}});}
  const X=BASEM.x,Zc=BASEM.z,y=ground(X+4.2,Zc+9.7);
  HIST_PONTOS.push({id:'centrifuga',x:X+4.2,y,z:Zc+9.6,r:2.0,ativo:()=>G.hist.cap>=3&&!G.hist.vacinaPronta,t:'Centrífuga',s:'',texto:centrifugaTexto,usar:centrifugaUsar});
  HIST_PONTOS.push({id:'vacina',x:X+3.6,y,z:Zc+9.6,r:2.0,ativo:()=>G.hist.vacinaPronta&&!G.hist.vacinaPegou,t:'Pegar as vacinas',s:'3 doses',usar:()=>{G.hist.vacinaPegou=true;ganhar('vacina',3);sfx('missao');ganharXP(200);
      dica('vacina','corpo','Use uma vacina como qualquer remédio (mochila ou barra rápida). Quem toma não pega mais o vírus.');}});}
function histInter(tryIt){if(!G.hist)return;for(const q of HIST_PONTOS){if(Math.abs(q.x-P.x)>4||Math.abs(q.z-P.z)>4)continue;if(!q.ativo())continue;tryIt({k:'hist',o:q},q.x,q.z,q.r,2.4,-0.6,q.y);}}
function histTexto(q){return q.texto?q.texto():{t:q.t,s:q.s};}
function histUsar(q){q.usar();}
function geradorBaseObra(){return OB.find(o=>o.tipo==='geradorBase');}
function centrifugaTexto(){const g=geradorBaseObra(),h=G.hist,tem=invCount('caderno')&&invCount('amostra');
  if(h.sint)return{t:'Centrífuga carregada',s:G.noite?'rodando: defenda o gerador até o amanhecer':'roda à noite: fique na base quando escurecer'};
  if(!g||(g.ext.comb||0)<0.95)return{t:'Centrífuga sem energia',s:'o gerador precisa de 2 galões de gasolina'};
  return{t:tem?'Carregar a centrífuga':'Centrífuga',s:tem?'caderno e amostra':'faltam o caderno e a amostra'};}
function centrifugaUsar(){const g=geradorBaseObra(),h=G.hist;if(h.sint){feed('Já está carregada',true);return;}
  if(!g||(g.ext.comb||0)<0.95){feed('Sem energia: 2 galões no gerador',true);sfx('vazio');return;}
  if(!(invCount('caderno')&&invCount('amostra'))){feed('Faltam o caderno e a amostra',true);sfx('vazio');return;}
  invRemove('caderno',1);invRemove('amostra',1);h.sint=true;h.cap=4;sfx('motor');hudMissao(true);radioHist('c3b');salvarJogo();}
/* ---------- capítulos ---------- */
function radioHist(k,atraso){setTimeout(()=>{toast('radio',HIST_FALAS[k]);sfx('missao');},atraso||0);}
function histAvanca(){const h=G.hist;if(h.cap===2&&h.caderno&&h.amostra){h.cap=3;radioHist('c2c',2500);radioHist('c3a',9000);}hudMissao(true);}
function histInfo(){{const c=typeof cap5Info==='function'?cap5Info():null;if(c)return c;}const h=G.hist;if(!h||!h.cap)return null;
  if(h.fim2)return{n:'A cura',t:'Você está imune. Continue sobrevivendo e leve as vacinas a quem precisar.',alvo:null};
  if(h.cap===2){const L=histLab(),falta=[];if(!h.caderno)falta.push('o caderno no laboratório do hospital (último andar)');if(!h.amostra)falta.push('uma amostra do Paciente Zero');
    return{n:'Capítulo 2 · O laboratório',t:'Pegue '+falta.join(' e ')+'.',alvo:L?{x:L.x,y:L.y,z:L.z}:null};}
  const X=BASEM.x,Zc=BASEM.z;
  if(h.cap===3){const g=geradorBaseObra(),c=g?g.ext.comb||0:0;return{n:'Capítulo 3 · A base',t:c<0.95?'Leve 2 galões de gasolina ao gerador da Base Militar, a oeste da mata.':'Leve o caderno e a amostra para a centrífuga, na tenda branca da base.',alvo:{x:X+(c<0.95?5:4.2),z:Zc+(c<0.95?-8:9.6)}};}
  if(h.cap===4){if(h.vacinaPronta)return{n:'Capítulo 4 · A vacina',t:'A vacina está pronta na tenda. Pegue e tome uma dose.',alvo:{x:X+3.6,z:Zc+9.6}};
    return{n:'Capítulo 4 · A noite da centrífuga',t:G.noite?'Defenda o gerador da base até o amanhecer.':'Ao anoitecer, fique na base: a centrífuga roda a noite toda.',alvo:{x:X+5,z:Zc-8}};}
  return null;}
let histT=0,sintT=0,ondaBaseT=0;
function updateHistoria(dt){if(!G.hist||G.modo!=='jogo')return;const h=G.hist;
  // começa depois do resgate
  if(!h.cap&&G.m&&G.m.etapa>=4){h.espera=(h.espera||0)+dt;if(h.espera>25){h.cap=2;radioHist('c2a');radioHist('c2b',7000);hudMissao(true);}}
  // noite da centrífuga: barulho chama os mortos; ondas extras em volta da base; o gerador não pode cair
  const g=geradorBaseObra();
  if(h.sint&&G.noite){if(!g||g.hp<=0){h.sint=false;h.rodou=false;h.cap=3;radioHist('falhou');baseMilitarObras();const ng=geradorBaseObra();if(ng){ng.hp=ng.hpMax*0.25;ng.ext.comb=0;}h.caderno=true;h.amostra=true;if(!invCount('caderno'))ganhar('caderno',1);if(!invCount('amostra'))ganhar('amostra',1);hudMissao(true);hudGeradorBase(null);return;}
    h.rodou=true;sintT-=dt;if(sintT<=0){sintT=3;barulho(g.x,g.z,60,false,g.y);sfx('motor',g.x,g.z,0.6);}
    if(Math.hypot(P.x-BASEM.x,P.z-BASEM.z)<90){ondaBaseT-=dt;if(ondaBaseT<=0){ondaBaseT=40;ondaBase();}}
    hudGeradorBase(g);}
  else hudGeradorBase(null);
  // mantém o gerador abastecido durante a noite da centrífuga (a centrífuga puxa a força do tanque cheio)
  if(h.sint&&g&&G.noite)g.ext.comb=Math.max(g.ext.comb,0.2);}
function ondaBase(){const g=geradorBaseObra();if(!g)return;const n=4+Math.min(8,(G.noiteN||1));
  for(let i=0;i<n;i++){for(let t=0;t<12;t++){const a=Math.random()*6.283,r=34+Math.random()*12,x=BASEM.x+Math.cos(a)*r,z=BASEM.z+Math.sin(a)*r;if(!pontoLivre(x,z))continue;
      const R=Math.random(),tipo=R<0.12?'runner':R<0.2?'rastejante':R<0.26&&G.noiteN>=3?'inchado':i===0&&G.noiteN>=3?'brute':'walker';
      const q=criarZ(tipo,x,z,{st:'alerta'});if(q){q.ax=g.x;q.az=g.z;q.ay=g.y;q.alvoBase=true;}break;}}
  if(Math.random()<0.5)ondaCaes(5,BASEM.x,BASEM.z);}
/* zumbis da onda da base: chegando no gerador, batem nele */
function zAlvoBase(z){if(!z.alvoBase||z.st!=='vaga')return;const g=geradorBaseObra();if(!g)return;const d=Math.hypot(z.x-g.x,z.z-g.z);
  if(d<2.4){z.st='quebra';z.obra=g;z.t=0;}else{z.st='alerta';z.ax=g.x;z.az=g.z;z.ay=g.y;}}
function histAmanhece(){const h=G.hist;if(!h)return;
  if(h.sint&&h.rodou){const g=geradorBaseObra();if(g&&g.hp>0){h.sint=false;h.vacinaPronta=true;radioHist('c4a',2000);progresso('vacina');hudMissao(true);}}}
function histVacina(){const h=G.hist;if(!h)return null;const L=P.lesoes||(P.lesoes=lesNovo());L.virus=0;L.vacinado=true;
  conquista('vacina');if(!h.fim2){h.fim2=true;radioHist('fim2',1500);setTimeout(()=>mostrarFim2(),5000);}return'Vacinado: o vírus não pega mais em você';}
function mostrarFim2(){mostrarFim();const t=$('t-fim');if(t){const h2=t.querySelector('h2');if(h2)h2.textContent='A cura';const p=$('fim-t');if(p)p.textContent='A vacina funcionou. Você é a primeira pessoa imune ao vírus. A Dra. Helena vai espalhar a notícia pelo rádio.';}}
let geradorHudEl=null;
function hudGeradorBase(g){const el=geradorHudEl||(geradorHudEl=document.getElementById('gerador-base'));if(!el)return;if(!g){if(!el.hidden)el.hidden=true;return;}el.hidden=false;el.querySelector('i').style.width=Math.max(0,100*g.hp/g.hpMax).toFixed(1)+'%';}
V8.novo.historia=()=>{G.hist={cap:0,caderno:false,amostra:false,sint:false,rodou:false,vacinaPronta:false,vacinaPegou:false,fim2:false};baseMilitarObras();histMontarPontos();};
V8.salvar.historia=()=>G.hist;
V8.carregar.historia=s=>{V8.novo.historia();if(s&&typeof s==='object')Object.assign(G.hist,s);baseMilitarObras();histMontarPontos();};
