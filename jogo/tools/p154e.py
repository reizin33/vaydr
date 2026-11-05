"""p154e: por que a bancada não cabe em cima da plataforma (qual colisor bloqueia)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
MONTA = ("const C=[2,-19],g=(x,z)=>X('ground')(x,z),cr=X('criarObra');"
         "for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
         "const pl=cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});window.__pl=pl;")
s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;" + MONTA + "n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));n.invAdd('madeira',6);n.invAdd('pedra',4);n.invAdd('corda',2);"),
      ev("bancada", "const pl=window.__pl,cam=X('cam');n.cfg.cam='1';vai(pl.x+0.2,pl.z+0.7,pl.y);P.yaw=Math.PI;P.body=P.yaw;P.pitch=0;cam.fwd=[0,0,-1];X('modoObra')(true);X('OBRA').tipo='bancadaTrab';X('obraAlvo')();"
         "const O=X('OBRA'),D=X('OBRAS').bancadaTrab,pts=[[O.x,O.z],...X('cantos')(O.x,O.z,O.yaw,D.hw*0.9,D.hd*0.9)];"
         "const bl=pts.map(p=>{const c=X('bloqueadoAlto')(p[0],p[1],0.08,O.y);return c?{x:r2(c.x),z:r2(c.z),hw:c.hw,hd:c.hd,r:c.r,y0:c.y0,y1:c.y1,obra:c.obra&&c.obra.tipo,tree:!!c.tree,est:!!c.estacao,inter:c.inter}:null;});"
         "return{ok:O.ok,motivo:O.motivo,x:r2(O.x),z:r2(O.z),y:r2(O.y),yaw:r2(O.yaw),bl,ctx:X('contextoObra')()};")]
salvar('p154e.json', s)
