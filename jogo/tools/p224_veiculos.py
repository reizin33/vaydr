"""p224: todos os veículos, do jeito que o jogador faz (pedido do Himalaia: "confira todos os meios de transporte: se estão
andando, se dá para pôr gasolina, consertar qualquer parte do motor e carregar"). Para cada veículo, no lugar onde ele nasce:
1. o painel do veículo (segurar E) com as peças na mochila: abastecer, consertar o motor, trocar pneu, pôr óleo, instalar
   bateria, montar o rotor, consertar a lataria; confere o estado antes e depois de cada ação e se o veículo fica pronto;
2. porta-malas: guarda um item e confere que ficou lá;
3. entra (pela função do jogo, sem pular as conferências) e anda com a tecla W de verdade (evento de teclado); no helicóptero:
   segura Espaço para subir, depois W para ir para a frente, depois C para descer; confere a distância e a altura.
O helicóptero e o barco são conferidos também com o motor ligado parado (o rotor gira, o barco fica na água)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;P.fome=100;P.sede=100;};G.hora=11;"
         "const V=X('VEICS');const tipos={};for(const v of V){if(!tipos[v.tipo])tipos[v.tipo]=v;}window.__tipos=Object.entries(tipos);window.__res={};")]
TECLA = ("const tecla=(t,c)=>{const e=new KeyboardEvent(t,{code:c,key:c==='Space'?' ':c.slice(3).toLowerCase(),bubbles:true,cancelable:true});window.dispatchEvent(e);};")
DAR = ("const dar=(id,n)=>{for(let i=0;i<n;i++){const k=P.inv.findIndex(q=>!q);if(k<0)return;P.inv[k]={id,n:1};if(X('ITEMS')[id].durMax)P.inv[k].dur=X('ITEMS')[id].durMax;}};"
       "P.inv.fill(null);dar('kitFerramentas',1);dar('gasolina',2);dar('pecaVeiculo',2);dar('pneu',1);dar('oleoMotor',1);dar('bateriaVeic',1);dar('pecasRotor',2);dar('sucata',3);dar('pregos',2);dar('pedra',1);")
ESTADO = ("const est=v=>({comb:Math.round(v.comb),hp:Math.round(v.hp),motor:Math.round(v.pecas.motor),oleo:Math.round(v.pecas.oleo),bateria:v.pecas.bateria,rotor:v.pecas.rotor,"
          "pneus:(v.pecas.pneus||[]).map(Math.round).join('/'),pode:X('veicPode')(v)});")
for i in range(6):
    T = "const T=window.__tipos[" + str(i) + "];if(!T){window.__pula=true;return;}window.__pula=false;const v=T[1];"
    # 1) painel e conserto com as peças na mochila
    s += [js(T + DAR + ESTADO + "if(X('CARRO')&&X('CARRO').ativo)X('sairCarro')();vai(v.x+3,v.z+3);G.modo='jogo';"
             "const r={tipo:v.tipo,antes:est(v),acoes:[]};X('abrirVeiculo')(v);r.painelAbriu=n.G.modo==='veiculo';"
             "const ac=()=>X('veicAcoes')(v).map(a=>a.id+(a.ok?'':'(não)'));r.disponiveis=ac();"
             "for(const id of['abastecer','motor','pneu','oleo','bateria','rotor','lataria','abastecer']){const a=X('veicAcoes')(v).find(q=>q.id===id);if(!a)continue;const e0=est(v);X('veicAcao')(id);const e1=est(v);"
             "r.acoes.push(id+(a.ok?'':'(bloqueada)')+': '+JSON.stringify(e0)+' -> '+JSON.stringify(e1)+' · '+(document.getElementById('vc-msg')||{}).textContent);}"
             "r.depois=est(v);r.pronto=!X('veicPode')(v);"
             "X('veicAcao')('carga');r.portaMalasAbriu=n.G.modo==='mochila'||n.G.modo==='bau'||!!X('bauAberto');const b=X('bauAberto');if(b&&b.itens){const k=P.inv.findIndex(q=>q&&q.id==='pedra');if(k>=0){const j=b.itens.findIndex(q=>!q);if(j>=0){b.itens[j]=P.inv[k];P.inv[k]=null;}}}"
             "r.noPortaMalas=v.itens.filter(Boolean).map(q=>q.id).join(',');try{X('fecharMochila')();}catch(_){}G.modo='jogo';n.ev('tela(null)');window.__r=r;"), ["gwait", 0.3],
          # 2) entra e anda
          js("if(window.__pula)return;" + T + TECLA + "const r=window.__r;X('entrarVeic')(v);r.entrou=!!(X('CARRO')===v&&v.ativo);r.p0=[v.x,v.z,v.y];v.v=0;"
             "if(X('VT')(v).voa){tecla('keydown','Space');}else tecla('keydown','KeyW');"), ["gwait", 5.0],
          js("if(window.__pula)return;" + T + TECLA + "const r=window.__r;r.alt1=Math.round((v.alt||0)*100)/100;r.d1=Math.round(Math.hypot(v.x-r.p0[0],v.z-r.p0[2])*100)/100;r.vel1=Math.round(v.v*100)/100;r.rotorGiro=Math.round((v.rotor||0)*100)/100;"
             "if(X('VT')(v).voa){tecla('keyup','Space');tecla('keydown','KeyW');r.p1=[v.x,v.z];}else{tecla('keyup','KeyW');}"), ["gwait", 3.0],
          js("if(window.__pula)return;" + T + TECLA + "const r=window.__r;if(X('VT')(v).voa){r.dFrente=Math.round(Math.hypot(v.x-r.p1[0],v.z-r.p1[1])*100)/100;r.alt2=Math.round((v.alt||0)*100)/100;tecla('keyup','KeyW');tecla('keydown','KeyC');}"), ["gwait", 6.0],
          js("if(window.__pula)return;" + T + TECLA + ESTADO + "const r=window.__r;if(X('VT')(v).voa){tecla('keyup','KeyC');r.altPousou=Math.round((v.alt||0)*100)/100;}r.combDepois=Math.round(v.comb*10)/10;r.hpDepois=Math.round(v.hp);"
             "v.v=0;X('sairCarro')();r.saiu=!v.ativo;window.__res[v.tipo]=r;")]
# jangada (feita na bancada; aqui posta na água ao lado do barco): sobe e rema com W
s += [js("const b=X('VEICS').find(q=>q.tipo==='barco');if(X('CARRO')&&X('CARRO').ativo)X('sairCarro')();const v=X('veicNovo')('jangada',b.x+4,b.z+2,0,{id:'jangadaTeste'});v.y=X('veicChao')(v,v.x,v.z);"
         "vai(v.x+2,v.z+2);X('entrarVeic')(v);window.__jr={entrou:!!(X('CARRO')===v&&v.ativo),p0:[v.x,v.z]};window.__jv=v;" + TECLA + "tecla('keydown','KeyW');"), ["gwait", 5.0],
      js(TECLA + "tecla('keyup','KeyW');const v=window.__jv,r=window.__jr;r.andou=Math.round(Math.hypot(v.x-r.p0[0],v.z-r.p0[1])*100)/100;r.naAgua=X('aguaNivel')(v.x,v.z)!==null;v.v=0;X('sairCarro')();r.saiu=!v.ativo;window.__res.jangada=r;")]
s += [ev("veiculos", "return window.__res;")]
salvar('tools/p224_veiculos.json', s, vp=(640, 360))
