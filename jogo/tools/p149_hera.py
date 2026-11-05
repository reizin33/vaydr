"""p137: fotos depois dos pinheiros em massas de agulha, do rodapé e das cantoneiras nas casas e do aviso da primeira noite."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;G.hora=16.6;G.dia=1;"), ["gwait", 0.6],
      ev("noite1", "return{dica:!!G.dicas.noite1aviso,toast:[...document.querySelectorAll('.toast p')].map(e=>e.textContent).filter(t=>t.includes('primeira noite')).length};")]
#s += foto("750_pinheiros.png", "G.hora=10;G.chuva=0;vai(-40,22);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.6, 4.0)
#s += foto("751_pinheiro_perto.png", "G.hora=10;const T=X('TREES').filter(t=>t.kind===0&&t.alive&&!t.agua).sort((a,b)=>Math.hypot(a.x+40,a.z-22)-Math.hypot(b.x+40,b.z-22))[0];vai(T.x+5,T.z+5);G.camFix={pos:[T.x+7,T.y+2.2,T.z+7],tgt:[T.x,T.y+3.2,T.z],fov:1.0};", 0.6, 4.0)
s += foto("790_vila_hera.png", "G.hora=10;const p=X('PLACES').find(q=>q.id==='vila');vai(p.x+2,p.z+16);P.yaw=P.body=Math.PI;G.camFix={pos:[p.x+3.5,P.y+2.2,p.z+22],tgt:[p.x,P.y+1.4,p.z],fov:0.95};", 0.6, 4.0)
s += foto("791_casa_hera.png", "G.hora=10;const p=X('CID').predios.find(q=>q.rural&&q.casa&&q.local&&q.local!=='vila')||X('CID').predios.find(q=>q.rural&&q.casa);const a=X('pw')(p,-3,-4),b=X('pw')(p,p.W/2,0);vai(a[0],a[1]);G.camFix={pos:[a[0],p.y0+1.7,a[1]],tgt:[b[0],p.y0+1.2,b[1]],fov:1.0};", 0.6, 4.0)
salvar('p149.json', s)
