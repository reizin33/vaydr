"""p94: veículos — peças, consertos, combustível, porta-malas, ponte, carro, moto, triciclo, barco, jangada, helicóptero e salvamento."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
V = "const VS=X('VEICS'),vv=id=>VS.find(q=>q.id===id||q.tipo===id),IN=X('IN');"
s = inicio()
s += [ev("lista", V+"return VS.map(v=>({id:v.id,tipo:v.tipo,x:r2(v.x),z:r2(v.z),y:r2(v.y),pode:X('veicPode')(v)}));")]
# caminhonete: oficina, abastecer, dirigir, óleo gasta
s += [js(V+"vivo();const t=vv('caminhonete');vai(t.x+2.2,t.z+1);n.invAdd('gasolina',2);X('abrirVeiculo')(t);"),
      ev("oficina", V+"return{modo:G.modo,acoes:X('veicAcoes')(vv('caminhonete')).map(a=>a.id+(a.ok?'+':'-')).join(','),tela:!document.getElementById('t-veiculo').hidden};"),
      js("X('veicAcao')('abastecer');"), ev("abasteceu", V+"return{comb:vv('caminhonete').comb,gas:conta('gasolina')};"),
      js("X('veicAcao')('dirigir');"), ev("dentro", V+"return{ativo:X('CARRO').ativo,tipo:X('CARRO').tipo,modo:G.modo};"),
      js(V+"IN.mz=1;"), ["gwait", 3.0], js(V+"IN.mz=0;IN.freio=true;"), ["gwait", 2.0], js(V+"IN.freio=false;"),
      ev("andou", V+"const t=vv('caminhonete');return{x:r2(t.x),z:r2(t.z),v:r2(t.v),comb:r2(t.comb),oleo:r2(t.pecas.oleo)};"),
      js("X('sairCarro')();"), ev("saiu", V+"return{ativo:X('CARRO').ativo,px:r2(P.x),modo:G.modo};")]
# ponte: a caminhonete atravessa o rio por cima
s += [js(V+"vivo();const t=vv('caminhonete'),Pn=X('PONTE');t.x=Pn.x-16;t.z=Pn.z;t.yaw=Math.PI/2;t.comb=60;X('veicColisor')(t);vai(t.x-2,t.z+2);X('entrarVeic')(t);IN.mz=1;"),
      ["gwait", 1.8], ev("na_ponte", V+"const t=vv('caminhonete'),Pn=X('PONTE');return{x:r2(t.x),y:r2(t.y),deck:r2(Pn.y),sobre:Math.abs(t.x-Pn.x)<Pn.hw};"),
      ["gwait", 2.5], js(V+"IN.mz=0;IN.freio=true;"), ["gwait", 1.5], js(V+"IN.freio=false;"),
      ev("atravessou", V+"const t=vv('caminhonete'),Pn=X('PONTE');return{x:r2(t.x),passou:t.x>Pn.x+Pn.hw,y:r2(t.y),hp:t.hp};"), js("X('sairCarro')();")]
# porta-malas
s += [js(V+"vivo();const t=vv('caminhonete');vai(t.x+2.5,t.z);n.invAdd('tabuas',5);n.invAdd('pregos',4);X('abrirBau')({itens:t.itens,nome:'Porta-malas'});const i=P.inv.findIndex(q=>q&&q.id==='tabuas');X('bauGuardar')(i);const j=P.inv.findIndex(q=>q&&q.id==='pregos');X('bauGuardar')(j);X('fecharMochila')();"),
      ev("porta_malas", V+"const t=vv('caminhonete');return{carga:t.itens.filter(Boolean).map(q=>q.id+'x'+q.n).join(','),tabuas:conta('tabuas')};")]
# carro abandonado da vila: bateria, pneu, gasolina
s += [js(V+"vivo();G.modo='jogo';const c=vv('sedanVila');vai(c.x+2,c.z+1);n.invAdd('kitFerramentas',1);n.invAdd('bateriaVeic',1);n.invAdd('pneu',1);n.invAdd('gasolina',1);n.invAdd('oleoMotor',1);"),
      ev("sedan_antes", V+"return{pode:X('veicPode')(vv('sedanVila')),pneus:vv('sedanVila').pecas.pneus.join(',')};"),
      js(V+"X('abrirVeiculo')(vv('sedanVila'));for(const a of['bateria','pneu','abastecer','oleo'])X('veicAcao')(a);"),
      ev("sedan_depois", V+"const c=vv('sedanVila');return{pode:X('veicPode')(c),pneus:c.pecas.pneus.join(','),bat:c.pecas.bateria,comb:c.comb,oleo:c.pecas.oleo,kit:(P.inv.find(q=>q&&q.id==='kitFerramentas')||{}).dur,bat2:conta('bateriaVeic'),pneu2:conta('pneu')};"),
      js("X('fecharVeiculo')();")]
# moto na cidade: motor quebrado -> peça de motor
s += [js(V+"vivo();const m=vv('motoCidade');vai(m.x+1.5,m.z+1);n.invAdd('pecaVeiculo',1);n.invAdd('gasolina',1);X('abrirVeiculo')(m);X('veicAcao')('motor');X('veicAcao')('abastecer');X('veicAcao')('dirigir');IN.mz=1;"),
      ["gwait", 2.0], js(V+"IN.mz=0;IN.freio=true;"), ["gwait", 1.5], js(V+"IN.freio=false;"),
      ev("moto", V+"const m=vv('motoCidade');return{ativo:m.ativo,motor:m.pecas.motor,comb:r2(m.comb),dx:r2(m.x-186),roll:r2(m.roll)};"), js("X('sairCarro')();")]
s += foto("340_moto.png", V+"const m=vv('motoCidade');vai(m.x+2.4,m.z+2.4);G.camFix={pos:[m.x+3.2,m.y+1.6,m.z+2.8],tgt:[m.x,m.y+0.7,m.z]};", 0.3)
s += [js("G.camFix=null;")]
# barco no cais: conserto, gasolina, sair na água
s += [js(V+"vivo();const b=vv('barcoCais');vai(72.2,90.5,X('LAGO').nivel+0.6);n.invAdd('pecaVeiculo',1);n.invAdd('gasolina',1);X('abrirVeiculo')(b);X('veicAcao')('motor');X('veicAcao')('abastecer');X('veicAcao')('dirigir');IN.mz=1;"),
      ["gwait", 3.0], js(V+"IN.mz=0;"), ["gwait", 2.0],
      ev("barco", V+"const b=vv('barcoCais');return{ativo:b.ativo,x:r2(b.x),z:r2(b.z),y:r2(b.y),nivel:r2(X('LAGO').nivel),comb:r2(b.comb),naAgua:X('aguaNivel')(b.x,b.z)!==null};"),
      js("X('sairCarro')();"), ["gwait", 0.5], ev("saiu_barco", "return{nada:!!P.nada,y:r2(P.y)};")]
s += foto("341_barco.png", V+"const b=vv('barcoCais');G.camFix={pos:[b.x-5,b.y+3,b.z-6],tgt:[b.x,b.y+0.5,b.z]};", 0.3)
s += [js("G.camFix=null;")]
# jangada: montar na beira do rio e remar
s += [js(V+"vivo();P.nada=null;const R=X('RIO'),s0=0.62,q=X('rioPonto')(s0),w=R.larg(s0)+1.6;vai(q[0]+q[3]*w,q[1]-q[2]*w);P.body=Math.atan2(-q[3],q[2]);P.yaw=P.body;n.invAdd('jangada',1);const i=P.inv.findIndex(x=>x&&x.id==='jangada');X('usarUtil')(i);"),
      ev("jangada", V+"const j=VS.find(v=>v.tipo==='jangada');return{existe:!!j,naAgua:j?X('aguaNivel')(j.x,j.z)!==null:false,item:conta('jangada')};"),
      js(V+"const j=VS.find(v=>v.tipo==='jangada');if(j){X('entrarVeic')(j);IN.mz=1;}"), ["gwait", 3.0], js(V+"IN.mz=0;"),
      ev("remou", V+"const j=VS.find(v=>v.tipo==='jangada');return j?{ativo:j.ativo,v:r2(j.v),y:r2(j.y)}:null;"), js("X('sairCarro')();")]
# helicóptero da base: rotor, motor, bateria, gasolina; sobe, anda e pousa
s += [js(V+"vivo();P.nada=null;const h=vv('heliBase');vai(h.x+3.5,h.z+2);for(const[k,q]of[['pecasRotor',2],['pecaVeiculo',1],['bateriaVeic',1],['kitFerramentas',1],['gasolina',3]])n.invAdd(k,q);X('abrirVeiculo')(h);for(const a of['rotor','motor','bateria','abastecer','abastecer','abastecer'])X('veicAcao')(a);"),
      ev("heli_pronto", V+"const h=vv('heliBase');return{pode:X('veicPode')(h),rotor:h.pecas.rotor,motor:h.pecas.motor,comb:h.comb,kit:(P.inv.find(q=>q&&q.id==='kitFerramentas')||{}).dur};"),
      js(V+"X('veicAcao')('dirigir');"), ["gwait", 4.0], js(V+"IN.freio=true;"), ["gwait", 3.0], js(V+"IN.freio=false;IN.mz=1;"), ["gwait", 3.0], js(V+"IN.mz=0;"),
      ev("heli_voando", V+"const h=vv('heliBase');return{ativo:h.ativo,alt:r2(h.alt),rotor:r2(h.rotor),dx:r2(h.x+112),v:r2(h.v),hp:h.hp};")]
s += foto("342_heli.png", V+"const h=vv('heliBase');G.camFix={pos:[h.x-10,h.y+4,h.z-10],tgt:[h.x,h.y+1.5,h.z]};", 0.3)
s += [js("G.camFix=null;"), js(V+"IN.desce=true;"), ["gwait", 6.0], js(V+"IN.desce=false;"),
      ev("heli_pousou", V+"const h=vv('heliBase');return{alt:r2(h.alt),hp:h.hp};"), js("X('sairCarro')();"),
      ev("heli_saiu", V+"return{ativo:X('CARRO').ativo};")]
# salvar e carregar
s += [js("X('salvarJogo')();X('carregarJogo')();G.modo='jogo';"), ["gwait", 0.3],
      ev("carregado", V+"return VS.map(v=>v.id+':'+Math.round(v.comb)+'/'+v.pecas.motor+'/'+(v.pecas.bateria?'b':'-')+'/'+v.itens.filter(Boolean).length).join(' ');")]
salvar('p94.json', s)
