/* ================= ferimentos: sangramento, perna quebrada e o vírus =================
   sangramento: corte do cutelo, mordida de cachorro ou de rastejante. Perde vida aos poucos e deixa rastro.
     Leve para sozinho em uns 40 s; forte só para com bandagem ou kit.
   perna quebrada: queda alta ou pancada muito forte. Anda devagar, não corre nem pula.
     Tala (2 gravetos + 2 tecidos, faz em qualquer lugar) imobiliza: volta a andar normal, sem correr, até sarar (1 dia e meio).
   vírus: o ataque de um zumbi pode passar o vírus (roupa grossa protege). Ele sobe sozinho e, sem a seringa antiviral,
     mata em cerca de um dia de jogo: primeiro febre e cansaço, depois menos vida máxima e a vista escurecendo, por fim perde vida.
     Quem morre do vírus levanta como zumbi perto da mochila. Uma seringa cura na hora e protege por 2 horas.
     Seringa: farmácia, hospital, casas e carros; na oficina (2 remédios + 1 antisséptico + 1 garrafa d'água);
     e quem cuida dos feridos no acampamento prepara uma por dia se tiver remédios no baú. */
Object.assign(ITEMS,{
  tala:{nome:'Tala',icon:'i-tala',max:5,tipo:'cura',trata:'perna',vida:0,desc:'Gravetos e tecido bem amarrados. Imobiliza a perna quebrada: dá para andar de novo, sem correr, até sarar.'},
  seringa:{nome:'Seringa antiviral',icon:'i-seringa',max:6,tipo:'cura',trata:'virus',vida:10,desc:'Antiviral contra o vírus dos zumbis. Uma dose cura na hora e protege por 2 horas. Sem ela, quem pega o vírus morre em cerca de um dia.'},
  mascaraGas:{nome:'Máscara de gás',icon:'i-mascara',max:1,tipo:'roupa',slot:'cabeca',prot:0.03,gas:0.9,desc:'Filtra o gás verde dos inchados. Vai na cabeça.'}});
RECIPES.push({faz:'tala',n:1,custo:{graveto:2,pano:2},cat:'cura',etapa:1,est:0},
  {faz:'seringa',n:1,custo:{remedios:2,antisseptico:1,agua:1},cat:'cura',etapa:3,est:2,desb:{oficina:true}});
SK_CASCAS.mascaraGas=[{sub:'rosto',inf:0.03,cor:0x2b2f2a,pelo:0},{sub:'cabecaAba',inf:0.018,cor:0x1a1c1a,pelo:0}];
for(const[t,e]of[['farmacia',['seringa',1,2,0.4]],['casa',['seringa',1,1,0.06]],['carro',['seringa',1,1,0.05]],['suprimentos',['seringa',1,1,0.2]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['farmacia_loja',['seringa',.22,1,2]],['farmacia_balcao',['seringa',.3,1,2]],['farmacia_estoque',['seringa',.4,1,3]],['hosp_armario',['seringa',.3,1,2]],
  ['hosp_gaveta',['seringa',.18,1,1]],['hosp_carrinho',['seringa',.2,1,1]],['cofre_hosp',['seringa',.6,2,3]],['banheiro',['seringa',.04,1,1]],['ap_gaveta',['seringa',.03,1,1]],
  ['vestiario',['seringa',.06,1,1]],['laboratorio',['seringa',.4,1,2]],['hosp_deposito',['mascaraGas',.1,1,1]],['arsenal_caixa',['mascaraGas',.12,1,1]],
  ['laboratorio',['mascaraGas',.2,1,1]],['vestiario',['mascaraGas',.04,1,1]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
const LES={sangraLeve:0.55,sangraForte:1.35,leveDur:40,pernaVel:0.55,talaVel:0.85,curaPernaH:36,virusH:22,imuneH:2};
/* chance de um ataque passar o vírus (a roupa grossa diminui) */
const MORDIDA={walker:0.3,runner:0.32,rastejante:0.45,caoZ:0.38,screamer:0.28,emboscada:0.34,sentinela:0.28,policial:0.22,inchado:0.18,brute:0.18,elite:0.15,
  acougueiro:0.2,sargento:0.2,pacienteZero:0.5,maquinista:0.25,fazendeiro:0.2};
function lesNovo(){return{sangra:0,sangraT:0,perna:0,tala:false,pernaH:0,virus:0,imuneH:0,gotaT:0,tosseT:0,apagaoT:8};}
function lesao(tipo,src){if(!P.alive)return;const L=P.lesoes||(P.lesoes=lesNovo());
  if(tipo==='sangramento'){const forte=src&&(ZS[src.tipo]&&(ZS[src.tipo].chefeR||src.tipo==='caoZ'))||Math.random()<0.35;const antes=L.sangra;L.sangra=Math.max(L.sangra,forte?2:1);L.sangraT=0;
    if(L.sangra>antes){toast('alerta',L.sangra>=2?'Corte fundo, você está sangrando muito! Use uma bandagem ou um kit médico logo.':'Você está sangrando. Para sozinho em um tempo, ou use uma bandagem.');}}
  else if(tipo==='perna'){if(L.perna)return;L.perna=1;L.tala=false;L.pernaH=0;sfx('dor');P.shake=Math.max(P.shake,0.7);
    toast('alerta','Você quebrou a perna! Não dá para correr nem pular. Faça uma tala (2 gravetos e 2 tecidos, aba Fabricar) e use para imobilizar.');}
  hudLesoes();}
/* ataque de zumbi: pode passar o vírus */
function lesaoMordida(z){if(!P.alive)return;const L=P.lesoes||(P.lesoes=lesNovo());if(L.imuneH>0||L.vacinado)return;
  const df=DIF[cfg.dif].dano,p=(MORDIDA[z.tipo]??0.25)*(1-protecao()*1.4)*(df>1?1.3:df<1?0.6:1);if(Math.random()>=p)return;
  if(L.virus>0){L.virus=Math.min(99,L.virus+4);return;}
  L.virus=0.5;sangue(P.x,P.y+1.1,P.z,10);sfx('mordida',P.x,P.z,0.8);
  toast('alerta','Você foi mordido e pegou o vírus! Sem a seringa antiviral, ele te mata em cerca de um dia. Tem seringa na farmácia, no hospital e em carros, ou faça na oficina: 2 remédios + 1 antisséptico + 1 garrafa d’água.');
  hudLesoes();}
/* itens usados: bandagem/kit param sangramento; tala imobiliza; seringa cura o vírus */
function curaLesoes(id){const L=P.lesoes;if(!L)return null;let msg=null;
  if(L.sangra>0&&(id==='bandagem'||id==='kit')){L.sangra=0;msg='O sangramento parou';}
  if(id==='tala'){if(L.perna&&!L.tala){L.tala=true;msg='Perna imobilizada: dá para andar, sem correr';}}
  if(L.ferida&&(id==='sutura'||id==='kit')){L.ferida=null;msg=(msg?msg+'. ':'')+'A ferida grave foi fechada: a vida máxima voltou';}
  if(id==='vacina')msg=histVacina();
  if(id==='seringa'){const tinha=L.virus>0;L.virus=0;L.imuneH=LES.imuneH;msg=tinha?'Seringa aplicada: o vírus foi embora':'Seringa aplicada: protegido por 2 horas';if(tinha){sfx('missao');progresso('curouVirus');}}
  hudLesoes();return msg;}
function precisaTratar(t){const L=P.lesoes||{};return t==='perna'?!!(L.perna&&!L.tala):t==='ferida'?!!L.ferida:true;}
function pernaRuim(){const L=P.lesoes;return!!(L&&L.perna);}
function lesaoVel(){const L=P.lesoes;if(!L||!L.perna)return 1;return L.tala?LES.talaVel:LES.pernaVel;}
function pernaSemTala(){const L=P.lesoes;return!!(L&&L.perna&&!L.tala);}
function virusNivel(){const L=P.lesoes;return L?L.virus||0:0;}
let lesHudT=0;
function updateLesoes(dt){corpoLevantaPasso(dt);if(!P.lesoes)P.lesoes=lesNovo();const L=P.lesoes;if(!P.alive||G.modo!=='jogo')return;
  const h=dt/(G.noite?24:30),medico=SOBREV.some(s=>s.st==='base'&&s.tarefa==='curar')&&sobBase(P.x,P.z,14);
  // sangramento
  if(L.sangra>0){L.sangraT+=dt;P.vida-=(L.sangra>=2?LES.sangraForte:LES.sangraLeve)*dt;L.gotaT-=dt;
    if(L.gotaT<=0){L.gotaT=L.sangra>=2?0.8:1.6;gotaChao(P.x+(Math.random()-0.5)*0.3,chaoEm(P.x,P.z,P.y+0.3),P.z+(Math.random()-0.5)*0.3,0.05+Math.random()*0.03);}
    if(L.sangra<2&&L.sangraT>LES.leveDur){L.sangra=0;feed('O sangramento parou');}
    if(medico&&L.sangra>0){L.sangra=0;feed('Cuidaram do seu corte no acampamento');}
    if(P.vida<=0){P.vida=0;G.causa='sangramento';morrer();return;}}
  // perna: sara sozinha (mais rápido com tala e com quem cuida dos feridos)
  if(L.perna){L.pernaH+=h*(L.tala?1:0.5)*(medico?2:1);if(L.pernaH>=LES.curaPernaH){L.perna=0;L.tala=false;L.pernaH=0;toast('corpo','Sua perna sarou. Já dá para correr de novo.');}}
  // vírus
  if(L.imuneH>0)L.imuneH=Math.max(0,L.imuneH-h);
  if(L.virus>0){const antes=L.virus;L.virus=Math.min(100,L.virus+h*100/LES.virusH*(medico?0.5:1));
    for(const m of[25,50,75,90])if(antes<m&&L.virus>=m)avisoVirus(m);
    if(L.virus>35){P.energia=Math.max(0,P.energia-dt*(0.6+L.virus/100));L.tosseT-=dt;if(L.tosseT<=0){L.tosseT=10+Math.random()*10-L.virus*0.06;sfx('tosse');if(L.virus>60)P.shake=Math.max(P.shake,0.22);}}
    if(L.virus>80){L.apagaoT-=dt;if(L.apagaoT<=0){L.apagaoT=6+Math.random()*6;apagao();}}
    if(L.virus>75)P.vida-=dt*0.4*(L.virus-75)/25;
    if(P.vida>vidaMax())P.vida=vidaMax();
    if(L.virus>=100||P.vida<=0){P.vida=0;G.causa='virus';G.corpoVirus={x:P.x,y:P.y,z:P.z};morrer();return;}}
  lesHudT-=dt;if(lesHudT<=0){lesHudT=0.4;hudLesoes();}}
function avisoVirus(m){const t={25:'O vírus está avançando: febre e cansaço. Procure uma seringa antiviral.',50:'Metade do caminho: o vírus já tira parte da sua vida máxima. Seringa, rápido!',
  75:'O vírus está tomando conta. A vista escurece e a vida começa a cair. Sem seringa você não aguenta muito.',90:'Está quase no fim... use uma seringa agora!'}[m];if(t)toast('alerta',t);sfx('coracao');}
function hudLesoes(){const L=P.lesoes||{},s=$('vx-sangra'),p=$('vx-perna'),i=$('vx-infec');if(!s)return;
  s.hidden=!(L.sangra>0);s.classList.toggle('forte',L.sangra>=2);
  p.hidden=!L.perna;if(L.perna)p.querySelector('b').textContent=L.tala?'Com tala':'Quebrada';
  i.hidden=!(L.virus>0);if(L.virus>0){i.querySelector('b').textContent='Vírus '+Math.max(1,Math.floor(L.virus))+'%';i.classList.toggle('alta',L.virus>50);}}
function resetLesoes(){P.lesoes=lesNovo();hudLesoes();}
/* quem morreu do vírus levanta como zumbi perto de onde caiu */
function corpoLevanta(){const c=G.corpoVirus;G.corpoVirus=null;if(!c)return;G.corpoLev={x:c.x,y:c.y,z:c.z,t:1.5};}
/* o corpo levanta em tempo de jogo (pausar segura o susto) */
function corpoLevantaPasso(dt){const c=G.corpoLev;if(!c)return;c.t-=dt;if(c.t>0)return;G.corpoLev=null;
  const q=criarZ('walker',c.x+0.6,c.z+0.4,{y:c.y,cidade:dentroCidade(c.x,c.z,2)});if(q){q.tint=[0.82,0.9,0.78];q.st='vaga';q.hx=c.x;q.hz=c.z;}
  toast('alerta','Seu corpo levantou como um deles, perto de onde você caiu. Cuidado ao buscar a mochila.');}
V8.novo.lesoes=()=>{resetLesoes();G.corpoVirus=null;G.corpoLev=null;};
V8.salvar.lesoes=()=>P.lesoes;
V8.carregar.lesoes=s=>{P.lesoes=Object.assign(lesNovo(),s&&typeof s==='object'?s:{});if(P.lesoes.infec&&!P.lesoes.virus)P.lesoes.virus=P.lesoes.infec;hudLesoes();};
