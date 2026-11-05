"""p161: veículos e peças (Etapa 4). As peças de rotor e a bateria agora estão nas caixas (a tabela militar existe quando as peças
entram); sorteio de 400 caixas do helicóptero tombado dá peças de rotor; o helicóptero fica pronto com gasolina, peça de motor,
bateria e 2 peças de rotor; tirar bateria e pneu da caminhonete e pôr no carro da vila; pneu e bateria de carro não servem na moto
(e a bateria de moto serve); peça de motor tirada da caminhonete conserta a moto; desmontar o rotor; cada veículo com o seu jeito de
ficar pronto; salvar e carregar mantém tudo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const V=id=>X('VEICS').find(v=>v.id===id),abre=v=>{G.modo='jogo';X('abrirVeiculo')(v);},acao=id=>{X('veicAcao')(id);return X('veicMsg');},"
     "acoes=v=>X('veicAcoes')(v).map(a=>a.id+(a.ok?'':'(x)')+': '+a.s),fecha=()=>X('fecharVeiculo')(),pode=v=>X('veicPode')(v),"
     "kit=()=>{if(!conta('kitFerramentas'))n.invAdd('kitFerramentas',1);const s=P.inv.find(q=>q&&q.id==='kitFerramentas');s.dur=30;},"
     "usados=()=>P.inv.filter(q=>q&&['pneuCarro','pneuMoto','pneuTriciclo','bateriaCarro','bateriaMoto'].includes(q.id)).map(q=>q.id+(q.dur!==undefined?':'+q.dur:''));")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;};"),
      # tabelas de saque: a origem do problema
      e("saques", "const L=X('LOOT'),C=X('CID_LOOT'),tem=(T,k,id)=>!!(T[k]&&T[k].some(q=>q[0]===id));"
                  "return{militarRotor:tem(L,'militar','pecasRotor'),militarBateria:tem(L,'militar','bateriaVeic'),heliCx:tem(L,'heliCx','pecasRotor'),cargaCx:tem(L,'cargaCx','pecasRotor'),"
                  "arsenalSub:tem(L,'arsenalSub','pecasRotor'),labSeg:tem(L,'labSeg','pecasRotor'),labHospital:tem(C,'laboratorio','pecasRotor'),pendentes:X('LOOT_DEPOIS').length};"),
      e("sorteio", "let rotor=0,cxs=0;for(let i=0;i<400;i++){const r=X('rollLoot')('heliCx');cxs++;for(const q of r)if(q[0]==='pecasRotor')rotor+=q[1];}let mil=0;for(let i=0;i<400;i++){for(const q of X('rollLoot')('militar'))if(q[0]==='pecasRotor')mil+=q[1];}return{caixasHeli:cxs,rotorHeli:rotor,rotorMilitar400:mil};"),
      # helicóptero: do jeito que está no mapa até pronto
      e("heliAntes", "const v=V('heliBase');return{pode:pode(v),pecas:v.pecas,comb:v.comb};"),
      e("heliPronto", "const v=V('heliBase');kit();n.invAdd('gasolina',1);n.invAdd('pecaVeiculo',1);n.invAdd('bateriaVeic',1);n.invAdd('pecasRotor',2);abre(v);"
                      "const m=[acao('abastecer'),acao('motor'),acao('bateria'),acao('rotor')];fecha();return{msgs:m,pode:pode(v),pecas:v.pecas,comb:Math.round(v.comb)};"),
      e("heliDesmonta", "const v=V('heliBase');abre(v);const m=acao('tirarRotor');fecha();return{msg:m,rotor:v.pecas.rotor,pecasRotor:conta('pecasRotor'),pode:pode(v)};"),
      # caminhonete -> carro da vila: bateria e pneu
      e("tiraCaminhonete", "const v=V('caminhonete');kit();abre(v);const lista=acoes(v);const m1=acao('tirarBateria'),m2=acao('tirarPneu');fecha();"
                           "return{acoes:lista.filter(a=>a.startsWith('tirar')),m1,m2,bateria:v.pecas.bateria,pneus:v.pecas.pneus,usados:usados(),pode:pode(v)};"),
      e("sedanAntes", "const v=V('sedanVila');abre(v);const l=acoes(v).filter(a=>a.startsWith('pneu')||a.startsWith('bateria'));fecha();return{acoes:l,pneus:v.pecas.pneus,bateria:v.pecas.bateria,pode:pode(v)};"),
      e("sedanMonta", "const v=V('sedanVila');kit();n.invAdd('gasolina',1);abre(v);const m=[acao('pneu'),acao('bateria'),acao('abastecer')];fecha();return{msgs:m,pneus:v.pecas.pneus,bateria:v.pecas.bateria,usados:usados(),pode:pode(v)};"),
      # moto: pneu e bateria de carro não servem; bateria de moto serve; peça de motor da caminhonete conserta
      e("motoErrado", "const v=V('motoCidade');v.pecas.pneus[0]=0;v.pecas.bateria=false;const c=V('caminhonete');kit();abre(c);acao('tirarPneu');fecha();"
                      "n.invAdd('bateriaCarro',1);abre(v);const l=acoes(v).filter(a=>a.startsWith('pneu')||a.startsWith('bateria'));fecha();return{acoes:l,usados:usados()};"),
      e("motoCerto", "const v=V('motoCidade');const c=V('caminhonete');c.pecas.motor=100;kit();abre(c);const m0=acao('tirarMotor');fecha();n.invAdd('bateriaMoto',1);n.invAdd('gasolina',1);n.invAdd('pneu',1);"
                     "abre(v);const m=[acao('bateria'),acao('motor'),acao('pneu'),acao('abastecer')];fecha();return{tirarMotor:m0,motorCaminhonete:c.pecas.motor,msgs:m,moto:{bateria:v.pecas.bateria,motor:v.pecas.motor,pneus:v.pecas.pneus},pode:pode(v)};"),
      # cada veículo com o seu jeito de ficar pronto
      e("caminhonetePronta", "const v=V('caminhonete');kit();n.invAdd('gasolina',1);n.invAdd('bateriaCarro',1);abre(v);acao('abastecer');acao('bateria');fecha();return{pode:pode(v),comb:Math.round(v.comb)};"),
      e("triciclo", "const v=V('triFazenda');return{pode:pode(v),comb:v.comb,pneus:v.pecas.pneus};"),
      e("barco", "const v=V('barcoCais');const antes=pode(v);kit();n.invAdd('gasolina',1);n.invAdd('pecaVeiculo',1);abre(v);acao('abastecer');acao('motor');fecha();return{antes,pode:pode(v),motor:v.pecas.motor};"),
      # salvar e carregar
      e("antesSalvar", "X('salvarJogo')();return{caminhonete:V('caminhonete').pecas.bateria,sedan:{bateria:V('sedanVila').pecas.bateria,pneus:V('sedanVila').pecas.pneus},heliRotor:V('heliBase').pecas.rotor,usados:usados(),rotorMochila:conta('pecasRotor')};"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.2],
      e("carregou", "return{caminhonete:V('caminhonete').pecas.bateria,sedan:{bateria:V('sedanVila').pecas.bateria,pneus:V('sedanVila').pecas.pneus},heliRotor:V('heliBase').pecas.rotor,usados:usados(),rotorMochila:conta('pecasRotor')};")]
salvar('p161.json', s)
