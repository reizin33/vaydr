"""p130: fotos do visual depois do céu/neblina e das casas por fora (sombra de contato no térreo e hera nas paredes).
Mesmos enquadramentos do p127 (vila e mata) para comparar com 700/701, mais uma fachada da cidade e uma casa de sítio com hera."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += foto("720_vis_vila.png", "vivo();Z.length=0;G.hora=10;G.chuva=0;const p=X('PLACES').find(q=>q.id==='vila');vai(p.x+2,p.z+16);P.yaw=P.body=Math.PI;n.cfg.cam='3';G.camFix={pos:[p.x+3.5,P.y+2.2,p.z+22],tgt:[p.x,P.y+1.4,p.z],fov:0.95};", 0.5)
s += foto("721_vis_mata.png", "G.chuva=0;vai(-40,22);G.camFix={pos:[-31,P.y+2.0,31],tgt:[-40,P.y+2.5,22],fov:1.0};", 0.5)
# fachada da cidade: uma janela do térreo perto do centro, vista da rua
s += foto("722_vis_cidade.png", "G.chuva=0;G.hora=10;const C=X('CIDADE'),cx=(C.x0+C.x1)/2,cz=(C.z0+C.z1)/2;const J=X('CID').janelas.filter(j=>j.f===0&&!j.p.rural).sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz));"
          "const j=J[0],nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);vai(j.x+nx*5,j.z+nz*5);G.camFix={pos:[j.x+nx*11+nz*3,P.y+2.2,j.z+nz*11-nx*3],tgt:[j.x,P.y+1.6,j.z],fov:1.0};window.__jan={x:j.x,z:j.z};", 0.6, 4.0)
# casa de fora da cidade com hera: o primeiro trecho de hera de uma casa rural
s += foto("723_vis_casa_hera.png", "G.chuva=0;G.hora=10;const ps=X('CID').predios.filter(p=>p.rural&&p.heras&&p.heras.length);window.__heras={casas:ps.length,trechos:ps.reduce((a,p)=>a+p.heras.length,0)};"
          "const p=ps[0],h=p.heras[0],pw=X('pw'),a=h.eixo==='u'?pw(p,h.s,h.k):pw(p,h.k,h.s),b=h.eixo==='u'?pw(p,h.s,h.k+h.fora):pw(p,h.k+h.fora,h.s),nx=b[0]-a[0],nz=b[1]-a[1];"
          "vai(a[0]+nx*2.5,a[1]+nz*2.5);G.camFix={pos:[a[0]+nx*6+nz*2,h.y0+2.0,a[1]+nz*6-nx*2],tgt:[a[0],h.y0+1.0,a[1]],fov:1.0};", 0.6, 4.0)
s += [ev("info", "return{heras:window.__heras,janela:window.__jan,erros:(window.__erros||[]).length};")]
salvar('p130.json', s)
