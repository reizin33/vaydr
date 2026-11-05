"""p109: fotos para mostrar as casas novas (vila, igreja, dentro das casas, sítios)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = ("const RU=X('RURAIS'),CI=X('CID'),gr=(x,z)=>X('ground')(x,z),V=id=>RU.find(p=>p.lote===id),SI=id=>RU.find(p=>p.local===id),pw=X('pw'),"
     "porta=p=>CI.portas.find(d=>d.p===p&&(d.sA==='fora'||d.sB==='fora')),sala=(p,t)=>p.salas.flat().find(s=>s&&s.tipo===t),"
     "cam=(p,u,v,y,u2,v2,y2)=>{const a=pw(p,u,v),b=pw(p,u2,v2);G.camFix={pos:[a[0],y,a[1]],tgt:[b[0],y2,b[1]]};};")
s = inicio("X('FAUNA_POP').ativosMax=0;Z.length=0;")
s += foto("490_vila_alto.png", F+"vivo();G.hora=9.5;vai(61.5,-58);G.camFix={pos:[34,24,-50],tgt:[64,0,-86]};", 0.6)
s += foto("491_vila_rua.png", F+"vai(63.2,-56.5);P.yaw=3.14;P.body=3.14;G.camFix={pos:[60.5,2.4,-55],tgt:[61.8,2.6,-100]};", 0.5)
s += foto("492_igreja.png", F+"vai(64,-94);G.camFix={pos:[66.5,1.9,-93.5],tgt:[61.5,4.6,-108]};", 0.5)
s += foto("493_igreja_dentro.png", F+"const p=V('igreja'),sl=sala(p,'igreja');X('portaEstado')(porta(p),'aberta');const a=pw(p,p.W/2+0.3,0.9);vai(a[0],a[1],sl.y);cam(p,p.W/2-1.8,0.7,sl.y+1.9,p.W/2,p.D-1.2,sl.y+1.2);", 0.5)
s += foto("494_casa_sala.png", F+"const p=V('v4'),sl=sala(p,'sala_casa'),k=sala(p,'cozinha_casa'),a=pw(p,(k.u0+k.u1)/2,(k.v0+k.v1)/2);vai(a[0],a[1],k.y);cam(p,sl.u0+0.45,sl.v1-0.35,sl.y+1.75,sl.u1-1.4,sl.v0+0.9,sl.y+0.65);", 0.5)
s += foto("495_casa_cozinha.png", F+"const p=V('v4'),k=sala(p,'cozinha_casa'),sl=sala(p,'sala_casa'),a=pw(p,(sl.u0+sl.u1)/2,(sl.v0+sl.v1)/2);vai(a[0],a[1],sl.y);cam(p,k.u1-0.4,k.v0+0.4,k.y+1.75,k.u0+1.2,k.v1-0.8,k.y+0.6);", 0.5)
s += foto("496_casa_quarto.png", F+"const p=V('v10'),q=sala(p,'quarto'),sl=sala(p,'sala_casa'),a=pw(p,(sl.u0+sl.u1)/2,(sl.v0+sl.v1)/2);vai(a[0],a[1],sl.y);cam(p,q.u1-0.4,q.v0+0.45,q.y+1.75,q.u0+1.0,q.v1-1.0,q.y+0.5);", 0.5)
s += foto("497_sitio_alto.png", F+"const p=SI('sitio3'),c=pw(p,p.W/2,p.D/2),f=pw(p,p.W/2+8,-14),o=pw(p,p.W/2,-4);vai(o[0],o[1]);G.camFix={pos:[f[0],p.yq+15,f[1]],tgt:[c[0],p.yq,c[1]]};", 0.6)
s += foto("498_sitio_varanda.png", F+"const p=SI('sitio2'),a=pw(p,p.W*0.75,-6.5),b=pw(p,p.W*0.6,-0.5),o=pw(p,p.W/2,-9);vai(o[0],o[1]);G.camFix={pos:[a[0],p.yq+1.8,a[1]],tgt:[b[0],p.yq+1.3,b[1]]};", 0.5)
s += foto("499_sitio_galpao.png", F+"const p=SI('sitio5'),a=pw(p,p.W+1.5,-3.5),b=pw(p,p.W+6.5,2.5),o=pw(p,p.W/2,-9);vai(o[0],o[1]);G.camFix={pos:[a[0],p.yq+2.0,a[1]],tgt:[b[0],p.yq+1.0,b[1]]};", 0.5)
s += [js("G.camFix=null;")]
salvar('p109.json', s)
