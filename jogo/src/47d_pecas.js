/* ================= peças de veículo que passam de um para outro (Etapa 4) =================
   Com o kit de ferramentas, dá para tirar peças boas de um veículo e pôr em outro compatível:
   · pneu: sai como "pneu usado" do tipo da roda (carro, moto ou triciclo), com o estado que tinha (barra de estado na mochila);
     só entra em veículo do mesmo tipo. O pneu novo de sempre continua servindo em qualquer um.
   · bateria: sai como "bateria de carro" (caminhonete, carro e helicóptero) ou "bateria de moto"; só entra no tipo certo.
     A bateria automotiva achada por aí continua servindo em qualquer um.
   · motor: um motor com 50% ou mais rende uma peça de motor (o motor perde 50%).
   · rotor: as peças de rotor saem do helicóptero e voltam para ele.
   As peças de rotor também passaram a aparecer onde o texto do item promete: avião caído, depósitos militares e laboratórios. */
iconesNovos({'i-pneu-usado':'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5"/><path d="M6.5 6.5l1.6 1.6" stroke-dasharray="1 2"/>',
  'i-bateria-p':'<rect x="5" y="8" width="14" height="10" rx="1.5"/><path d="M8 8V6.5h2.5V8M13.5 8V6.5H16V8M8.5 13h2.5M14.5 11.8v2.5M13.3 13h2.5"/>'});
Object.assign(ITEMS,{
  pneuCarro:{nome:'Pneu usado de carro',icon:'i-pneu-usado',max:1,tipo:'material',durMax:100,peca:'pneu',aro:'carro',desc:'Tirado de uma caminhonete ou de um carro. Serve só em caminhonete e carro; entra com o estado que tem (a barra).'},
  pneuMoto:{nome:'Pneu usado de moto',icon:'i-pneu-usado',max:1,tipo:'material',durMax:100,peca:'pneu',aro:'moto',desc:'Tirado de uma moto. Serve só em moto; entra com o estado que tem (a barra).'},
  pneuTriciclo:{nome:'Pneu usado de triciclo',icon:'i-pneu-usado',max:1,tipo:'material',durMax:100,peca:'pneu',aro:'triciclo',desc:'Tirado de um triciclo. Serve só em triciclo; entra com o estado que tem (a barra).'},
  bateriaCarro:{nome:'Bateria de carro',icon:'i-bateria-v',max:1,tipo:'material',peca:'bateria',tam:'grande',desc:'Tirada de um veículo. Serve em caminhonete, carro e helicóptero.'},
  bateriaMoto:{nome:'Bateria de moto',icon:'i-bateria-p',max:1,tipo:'material',peca:'bateria',tam:'pequena',desc:'Tirada de uma moto. Pequena: serve só em moto.'}});
ITEMS.pneu.desc='Pneu novo. Serve em qualquer veículo com rodas; troca um furado (precisa do kit de ferramentas).';
ITEMS.bateriaVeic.desc='Bateria carregada, nova. Serve em qualquer veículo que usa bateria (carro, moto e helicóptero).';
ITEMS.pecasRotor.desc='Pás e eixo de rotor de helicóptero. Raras: avião caído, helicóptero tombado, depósitos militares e laboratórios.';
/* de que tipo é a roda e o tamanho da bateria de cada veículo */
const PECA_ARO={caminhonete:'carro',sedan:'carro',moto:'moto',triciclo:'triciclo'},PECA_TAM={caminhonete:'grande',sedan:'grande',heli:'grande',moto:'pequena'};
const PNEU_DE={carro:'pneuCarro',moto:'pneuMoto',triciclo:'pneuTriciclo'};
/* onde as peças de rotor aparecem (as tabelas são criadas por módulos posteriores: entram depois de tudo carregar) */
for(const[t,e]of[['heliCx',['pecasRotor',1,1,0.5]],['cargaCx',['pecasRotor',1,1,0.15]],['arsenalSub',['pecasRotor',1,1,0.15]],['labSeg',['pecasRotor',1,1,0.12]]])lootMais('LOOT',t,e);
lootMais('CID','laboratorio',['pecasRotor',.1,1,1]);

/* o melhor item compatível que o jogador tem para uma peça do veículo (o novo, universal, vem primeiro) */
function pecaCompat(v,peca){const P_=P.inv.filter(Boolean);
  if(peca==='pneu'){const aro=PECA_ARO[v.tipo];if(invCount('pneu'))return{id:'pneu',est:100};
    let best=null;for(const s of P_){const d=ITEMS[s.id];if(d.peca==='pneu'&&d.aro===aro&&(!best||(s.dur??100)>(best.dur??100)))best=s;}return best?{id:best.id,est:best.dur??100,slot:best}:null;}
  if(peca==='bateria'){if(invCount('bateriaVeic'))return{id:'bateriaVeic'};const tam=PECA_TAM[v.tipo];for(const s of P_){const d=ITEMS[s.id];if(d.peca==='bateria'&&d.tam===tam)return{id:s.id,slot:s};}return null;}
  return null;}
/* peça que o jogador tem, mas não serve neste veículo (para explicar) */
function pecaErrada(v,peca){for(const s of P.inv){if(!s)continue;const d=ITEMS[s.id];if(d.peca!==peca)continue;
  if(peca==='pneu'&&d.aro!==PECA_ARO[v.tipo])return d;if(peca==='bateria'&&d.tam!==PECA_TAM[v.tipo])return d;}return null;}
function pecaTirar(s){const i=P.inv.indexOf(s);if(i>=0){s.n--;if(s.n<=0)P.inv[i]=null;}}
function pecaDar(id,extra){const left=invAdd(id,1,extra);if(left)soltarItens([[id,1,extra]],P.x,P.z,P.y);}

{const _acoes=veicAcoes;veicAcoes=function(v){const A=_acoes.apply(this,arguments),T=VT(v),p=v.pecas,kit=invCount('kitFerramentas')>0,temKit=kit?'':' (precisa do kit de ferramentas)';
  // instalar: aceita as peças usadas compatíveis
  for(const a of A){if(a.id==='pneu'){const c=pecaCompat(v,'pneu'),e=pecaErrada(v,'pneu');a.ok=kit&&!!c;a.s=c?(c.id==='pneu'?'1 pneu novo':'1 '+ITEMS[c.id].nome.toLowerCase()+' ('+Math.round(c.est)+'%)')+temKit:e?'o pneu que você tem é '+e.nome.toLowerCase().replace('pneu usado ','')+': não serve':'1 pneu'+temKit;}
    if(a.id==='bateria'){const c=pecaCompat(v,'bateria'),e=pecaErrada(v,'bateria');a.ok=kit&&!!c;a.s=c?'1 '+ITEMS[c.id].nome.toLowerCase()+temKit:e?'a '+e.nome.toLowerCase()+' não serve aqui':'1 bateria'+temKit;}}
  // tirar peças boas (fica antes do porta-malas e do dirigir)
  const R=[];
  if(T.rodas&&p.pneus.some(q=>q>=25)){const best=Math.max(...p.pneus);R.push({id:'tirarPneu',t:'Tirar um pneu',s:'o melhor ('+Math.round(best)+'%) vai para a mochila'+temKit,ok:kit});}
  if(T.bateria&&p.bateria)R.push({id:'tirarBateria',t:'Tirar a bateria',s:(PECA_TAM[v.tipo]==='pequena'?'bateria de moto':'bateria de carro')+temKit,ok:kit});
  if(!T.semMotor&&p.motor>=50)R.push({id:'tirarMotor',t:'Tirar peça do motor',s:'rende 1 peça de motor; o motor perde 50%'+temKit,ok:kit});
  if(T.rotor&&p.rotor>0)R.push({id:'tirarRotor',t:'Desmontar o rotor',s:p.rotor+' peça'+(p.rotor>1?'s':'')+' de rotor'+temKit,ok:kit});
  const k=A.findIndex(a=>a.id==='carga');A.splice(k<0?A.length:k,0,...R);return A;};}
{const _acao=veicAcao;veicAcao=function(id){const v=veicAberto;if(!v)return _acao.apply(this,arguments);const T=VT(v),p=v.pecas,kit=P.inv.find(s=>s&&s.id==='kitFerramentas');let msg=null;
  if(id==='pneu'){const c=pecaCompat(v,'pneu');if(!kit||!c)return _acao.apply(this,arguments);if(c.id==='pneu')return _acao.apply(this,arguments);
    const i=p.pneus.indexOf(Math.min(...p.pneus));p.pneus[i]=Math.max(p.pneus[i],c.est);pecaTirar(c.slot);gastar(kit,2);sfx('construir');msg='Pneu usado no lugar ('+Math.round(c.est)+'%)';}
  else if(id==='bateria'){const c=pecaCompat(v,'bateria');if(!kit||!c||c.id==='bateriaVeic')return _acao.apply(this,arguments);pecaTirar(c.slot);p.bateria=true;gastar(kit,1);sfx('construir');msg='Bateria instalada';}
  else if(id==='tirarPneu'&&kit&&T.rodas){const best=Math.max(...p.pneus);if(best<25)msg='Nenhum pneu bom';else{const i=p.pneus.indexOf(best);p.pneus[i]=0;pecaDar(PNEU_DE[PECA_ARO[v.tipo]],{dur:Math.round(best)});gastar(kit,1);sfx('construir');msg='Pneu na mochila ('+Math.round(best)+'%); a roda ficou vazia';}}
  else if(id==='tirarBateria'&&kit&&T.bateria&&p.bateria){p.bateria=false;pecaDar(PECA_TAM[v.tipo]==='pequena'?'bateriaMoto':'bateriaCarro');gastar(kit,1);sfx('construir');msg='Bateria na mochila';}
  else if(id==='tirarMotor'&&kit&&!T.semMotor&&p.motor>=50){p.motor-=50;pecaDar('pecaVeiculo');gastar(kit,2);sfx('construir');msg='Peça de motor na mochila; motor em '+pct(p.motor);}
  else if(id==='tirarRotor'&&kit&&T.rotor&&p.rotor>0){const k=p.rotor;p.rotor=0;for(let j=0;j<k;j++)pecaDar('pecasRotor');gastar(kit,2);sfx('construir');msg=k+' peça'+(k>1?'s':'')+' de rotor na mochila';}
  else return _acao.apply(this,arguments);
  veicMsg=msg||'';veicRender();invRender();hudBarra();};}
