"""p262 (v10.8.10): gancho de escalada.
1 o item, a receita na bancada (corda, sucata e fita) e o "Serve para"
2 no beco atrás da casa da largada das lajes, mirando a beirada da laje (5,8 m acima): o alvo vale; clicar puxa você até a laje
3 mirando o céu não vale; na corrida não vale; com o gancho gasto, ele quebra no último uso"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
CAM = ("const olha=(tx,ty,tz)=>{const n=__nnc,c=n.ev('cam'),e=[P.x,P.y+1.6,P.z],d=[tx-e[0],ty-e[1],tz-e[2]],l=Math.hypot(...d);c.pos=e;c.fwd=d.map(v=>v/l);"
       "P.yaw=Math.atan2(d[0],d[2]);P.body=P.yaw;};")
POS = ("const h=X('LAJ').R.path[0],e=h.escada,u=e.u>0?e.u-1.6:e.u+1.6,pw=X('morroPw'),st=pw(h,u,h.D/2+2.2),alvo=pw(h,u,h.D/2);")
s = inicio("X('FAUNA_POP').ativosMax=0;n.cfg.cam='1';")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;window.__cadaPasso=()=>{const n=__nnc;n.Z.length=0;n.P.vida=100;n.P.fome=100;n.P.sede=100;};")]
s += [ev("item", "const I=X('ITEMS').ganchoEscalada,R=X('RECIPES').find(r=>r.faz==='ganchoEscalada'),L=X('LIGA_EXTRA');"
         "return{nome:I&&I.nome,usos:I&&I.durMax,receita:R&&R.custo,est:R&&R.est,serve:['corda','sucata','fita'].map(k=>(L[k]||[]).includes('gancho de escalada'))};")]
s += [js(POS + "vai(st[0],st[1],X('ground')(st[0],st[1])+0.02);X('ganhar')('ganchoEscalada',1);sel('ganchoEscalada');window.__y0=h.yTop;"), ["gwait", 0.4],
      ev("alvo", CAM + POS + "olha(alvo[0],h.yTop-0.5,alvo[1]);const a=X('ganchoAlvo')();return a?{ok:true,y:r2(a.y),laje:r2(h.yTop),d:r2(a.d),pendura:r2(a.by)}:{ok:false,P:[r2(P.x),r2(P.y),r2(P.z)]};"),
      ev("ceu", CAM + POS + "olha(alvo[0],h.yTop+25,alvo[1]);return{alvo:!!X('ganchoAlvo')()};"),
      js(CAM + POS + "olha(alvo[0],h.yTop-0.5,alvo[1]);window.__dur=P.inv.find(q=>q&&q.id==='ganchoEscalada').dur;P.cd=0;X('atacar')();window.__puxou=!!P.gancho;"), ["gwait", 3.0],
      ev("subiu", POS + "const s=P.inv.find(q=>q&&q.id==='ganchoEscalada'),q=X('morroLocal')(h,P.x,P.z);return{puxou:window.__puxou,y:r2(P.y),laje:r2(h.yTop),naLaje:Math.abs(P.y-h.yTop)<0.6&&Math.abs(q[0])<h.W/2+0.2&&Math.abs(q[1])<h.D/2+0.2,"
         "gancho:!!P.gancho,muro:!!P.muro,noChao:P.noChao,usos:s?s.dur:null,antes:window.__dur};")]
s += [js(POS + "vai(st[0],st[1],X('ground')(st[0],st[1])+0.02);X('corridaComecar')(X('LAJ').C);"), ["gwait", 0.3],
      ev("naCorrida", CAM + POS + "olha(alvo[0],h.yTop-0.5,alvo[1]);P.cd=0;X('atacar')();const r={puxou:!!P.gancho,corrida:!!X('CORR').ativa};X('corridaFim')(X('LAJ').C,false);return r;"),
      js(CAM + POS + "vai(st[0],st[1],X('ground')(st[0],st[1])+0.02);const s=P.inv.find(q=>q&&q.id==='ganchoEscalada');s.dur=1;olha(alvo[0],h.yTop-0.5,alvo[1]);P.cd=0;X('atacar')();"), ["gwait", 3.0],
      ev("quebrou", "return{tem:conta('ganchoEscalada'),y:r2(P.y)};")]
salvar('tools/p262_gancho.json', s)
