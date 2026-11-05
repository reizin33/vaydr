"""p107: vila e sítios com casas de verdade — quantas, onde, chão plano, portas, móveis, saques especiais, entrar, vasculhar,
morador dormindo, fotos da vila, da igreja, de dentro das casas e dos sítios."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const RU=X('RURAIS'),CI=X('CID'),gr=(x,z)=>X('ground')(x,z),V=id=>RU.find(p=>p.lote===id),SI=id=>RU.find(p=>p.local===id),IK=X('INTER_K'),"
     "porta=p=>CI.portas.find(d=>d.p===p&&(d.sA==='fora'||d.sB==='fora')),sala=(p,t)=>p.salas.flat().find(s=>s&&s.tipo===t);")
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("contagem", F+"return{rurais:RU.length,vila:RU.filter(p=>p.local==='vila').length,sitios:RU.filter(p=>p.local&&p.local.startsWith('sitio')).length,"
                       "lista:RU.map(p=>(p.lote||p.local)+':'+(p.igreja?'igreja':p.casa?'casa'+p.andares:p.tipo)+'/s'+p.salas.flat().length+'/c'+CI.conts.filter(c=>c.p===p).length+'/m'+CI.moveis.filter(m=>m.p===p).length+'/p'+CI.portas.filter(d=>d.p===p).length).join(' ')};"),
      ev("chaoPlano", F+"return RU.map(p=>{const hs=[[p.bx0,p.bz0],[p.bx1,p.bz0],[p.bx0,p.bz1],[p.bx1,p.bz1],[(p.x0+p.x1)/2,(p.z0+p.z1)/2]].map(q=>gr(q[0],q[1]));return (p.lote||p.local)+':'+r2(Math.max(...hs)-Math.min(...hs));}).join(' ');"),
      ev("especiais", F+"const I=X('INTER');return['vila-antena','vila-casa3','vila-mercado','vila-farmacia','vila-carro1','vila-carro2','vila-carro3','galpao-sitio1','galpao-sitio6','poco-sitio3','carro-sitio2'].map(id=>{const it=I.find(i=>i.id===id);if(!it)return id+':FALTA';const r=X('ruralEm')(it.x,it.z,0);return id+':'+(r?(r.lote||r.local):'fora')+(X('pointBlocked')(it.x,it.z,0.25)?':BLOQ':'');}).join(' ');"),
      ev("missao", F+"G.m.etapa=1;const mi=X('missaoInfo')();return{t:mi.t,alvo:mi.alvo&&mi.alvo.id};"),
      ev("estradas", F+"return X('ROADS').slice(5).map(r=>(r.sitio||'vila')+':'+r.pts.length).join(' ');")]
# entrar na casa 1 da vila
s += [js(F+"vivo();Z.length=0;G.hora=10;const p=V('v1'),d=porta(p);window.__d0=d.estado;X('portaEstado')(d,'aberta');const w=X('pw')(p,p.uF,-1.8);vai(w[0],w[1]);"), ["gwait", 0.5],
      ev("naPorta", F+"const p=V('v1');return{estadoAntes:window.__d0,salaFora:!!X('salaEm')(P.x,P.y+0.3,P.z),y:r2(P.y),yq:r2(p.yq)};"),
      js(F+"const p=V('v1'),s=sala(p,'sala_casa'),w=X('pw')(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);vai(w[0],w[1],s.y);"), ["gwait", 0.6],
      ev("dentro", F+"const s=X('salaEm')(P.x,P.y+0.3,P.z);return{sala:s&&s.tipo,y:r2(P.y),interior:r2(X('interiorEm')(P.x,P.y+0.3,P.z)),teto:r2(X('tetoEm')(P.x,P.y+0.3,P.z)||0),abrigado:X('abrigado')()};")]
s += foto("470_casa_sala.png", F+"const p=V('v1'),s=sala(p,'sala_casa'),a=X('pw')(p,s.u0+0.6,s.v0+0.6),b=X('pw')(p,(s.u0+s.u1)/2+1,(s.v0+s.v1)/2+0.5);G.camFix={pos:[a[0],s.y+1.75,a[1]],tgt:[b[0],s.y+0.6,b[1]]};", 0.4)
s += foto("471_casa_cozinha.png", F+"const p=V('v1'),s=sala(p,'cozinha_casa'),a=X('pw')(p,s.u1-0.4,s.v0+0.4),b=X('pw')(p,(s.u0+s.u1)/2-0.5,(s.v0+s.v1)/2+0.6);G.camFix={pos:[a[0],s.y+1.75,a[1]],tgt:[b[0],s.y+0.5,b[1]]};", 0.4)
s += foto("472_casa_quarto.png", F+"const p=V('v1'),s=sala(p,'quarto'),a=X('pw')(p,s.u0+0.4,s.v0+0.4),b=X('pw')(p,(s.u0+s.u1)/2+0.5,(s.v0+s.v1)/2+0.6);G.camFix={pos:[a[0],s.y+1.75,a[1]],tgt:[b[0],s.y+0.5,b[1]]};", 0.4)
s += [js("G.camFix=null;"),
      js(F+"const p=V('v1'),c=CI.conts.find(c=>c.p===p&&c.tipo==='geladeira')||CI.conts.find(c=>c.p===p);window.__ct=c.tipo;vai(c.x+Math.sin(c.yaw)*0.9,c.z+Math.cos(c.yaw)*0.9,c.y);X('abrirCont')(c);"), ["wait", 0.3],
      ev("vasculhou", F+"return{tipo:window.__ct,modo:G.modo};"), js(F+"if(G.modo==='mochila')X('fecharMochila')();")]
# morador dormindo: chegar perto de uma casa ainda não visitada hoje
s += [js(F+"Z.length=0;G.ruralZ={};const p=V('v11');vai((p.x0+p.x1)/2+20,(p.z0+p.z1)/2+8);"), ["gwait", 2.0],
      ev("moradores", F+"const L=Z.filter(q=>q.morador!==undefined&&q.vivo);return{visitadas:Object.keys(G.ruralZ).length,zumbis:L.length,dormindo:L.filter(q=>q.st==='dorme').length,dentro:L.filter(q=>!!X('salaEm')(q.x,q.y+0.3,q.z)).length};"),
      js("__nnc.Z.length=0;")]
# fotos de fora
s += foto("473_vila_alto.png", F+"vai(61.5,-60);G.hora=10;G.camFix={pos:[92,26,-52],tgt:[58,0,-84]};", 0.6)
s += foto("474_vila_rua.png", F+"vai(61.5,-58);G.camFix={pos:[62.5,1.7,-57],tgt:[61.5,1.6,-80]};", 0.5)
s += foto("475_vila_transversal.png", F+"vai(80,-79);G.camFix={pos:[96,2.2,-78],tgt:[60,1.2,-80]};", 0.5)
s += foto("476_igreja.png", F+"const p=V('igreja');vai(61.5,-98);G.camFix={pos:[66,3.0,-95],tgt:[61.5,4.5,-110]};", 0.5)
s += foto("477_igreja_dentro.png", F+"const p=V('igreja'),s=sala(p,'igreja'),a=X('pw')(p,p.W/2-1.6,0.8),b=X('pw')(p,p.W/2,p.D-1.0);X('portaEstado')(porta(p),'aberta');vai(a[0],a[1],s.y);G.camFix={pos:[a[0],s.y+1.8,a[1]],tgt:[b[0],s.y+1.4,b[1]]};", 0.5)
s += foto("478_mercadinho.png", F+"const p=V('v6');vai(63,-71);G.camFix={pos:[62.5,2.0,-64],tgt:[70,2.0,-73]};", 0.5)
s += foto("479_sitio_alto.png", F+"const p=SI('sitio1'),c=[(p.x0+p.x1)/2,(p.z0+p.z1)/2];vai(c[0]+12,c[1]+2);G.camFix={pos:[c[0]+28,gr(c[0],c[1])+16,c[1]+20],tgt:[c[0]+1,gr(c[0],c[1])+1,c[1]-2]};", 0.6)
s += foto("480_sitio_varanda.png", F+"const p=SI('sitio1'),a=X('pw')(p,p.W+2,-5.5),b=X('pw')(p,p.W*0.55,-0.5);vai(a[0],a[1]);G.camFix={pos:[a[0],p.yq+1.7,a[1]],tgt:[b[0],p.yq+1.6,b[1]]};", 0.5)
s += foto("481_sitio_porteira.png", F+"const pl=X('placeById')('sitio3'),p=SI('sitio3');vai(pl.x,pl.z-22);G.camFix={pos:[pl.x+1.5,gr(pl.x,pl.z-24)+1.8,pl.z-24],tgt:[pl.x,gr(pl.x,pl.z)+1.8,pl.z-6]};", 0.5)
s += foto("482_sitio_quintal.png", F+"const p=SI('sitio2'),a=X('pw')(p,-6,p.D+9),b=X('pw')(p,p.W*0.6,p.D+2);vai(a[0],a[1]);G.camFix={pos:[a[0],p.yq+2.2,a[1]],tgt:[b[0],p.yq+1.0,b[1]]};", 0.5)
s += [js("G.camFix=null;")]
# salvar e carregar dentro de casa (porta aberta continua aberta, gaveta vasculhada continua)
s += [js(F+"const p=V('v1'),d=porta(p),s=sala(p,'sala_casa'),w=X('pw')(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);vai(w[0],w[1],s.y);X('salvarJogo')();X('carregarJogo')();X('jogar')();"), ["gwait", 0.5],
      ev("carregar", F+"const p=V('v1'),d=porta(p),c=CI.conts.find(c=>c.p===p&&c.tipo===window.__ct);return{porta:d.estado,gaveta:c&&c.estado,sala:(X('salaEm')(P.x,P.y+0.3,P.z)||{}).tipo,y:r2(P.y)};")]
salvar('p107.json', s)
