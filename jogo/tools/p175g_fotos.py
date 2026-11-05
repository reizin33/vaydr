"""p175g: confere de perto, depois dos ajustes: água no bebedouro e feno no cocho; a porteira nova do curral; o galinheiro novo
(suspenso, telhado de duas águas, rampa e ninhos); as abelhas pequenas em volta da colmeia; composteira e biodigestor com a
chama azul do fogareiro (sem a fogueira em cima)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),owl=(o,u,v)=>X('owl')(o,u,v),"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm');")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};G.hora=10;G.chuva=0;P.inv.fill(null);"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[118,-70],[-62,52],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,14)||_re(x,z,22)||arv(x,z,15)>0||_pb(x,z,3))continue;c={x,z};}if(!c)c={x:-62,z:52};W.__c=c;vai(c.x,c.z);"
        "const be=cria('bebedouro',c.x+3,c.z+3,0);be.ext.agua=36;const co=cria('cocho',c.x+3,c.z+5,0);co.itens[0]=X('newItem')('feno',6);W.__be=be;W.__co=co;"
        "const K=cria('curral',c.x-8,c.z+10,0);W.__K=K;"
        "const g=cria('galinheiro',c.x+8,c.z-4,0.6);W.__g=g;X('galPasso')(g);Object.assign(g.ext,{g:4,comida:15,agua:10});g.ext.pin=[G.tm];"
        "const h=cria('horta',c.x-6,c.z-6,0);h.ext.cresce=0.6;const cm=cria('colmeia',c.x-3.6,c.z-6,0);W.__cm=cm;X('colPasso')(cm);cm.ext.enxame=true;cm.ext.prodTm=G.tm;"
        "const cp=cria('composteira',c.x+1.5,c.z-9,0);const bd=cria('biodigestor',c.x-1.5,c.z-9,0);W.__bd=bd;X('bioPasso')(bd);bd.ext.gas=60;bd.ext.carga=3;X('bioPasso')(bd);"
        "vai(c.x+12,c.z+12);window.__dbg={agua:be.ext.agua,feno:co.itens.filter(Boolean).length,fogo:X('FIRES').filter(f=>f.bio===bd).map(f=>!!f.semChama)};"), ["gwait", 3],
      ev("dbg", "return window.__dbg;")]
s += foto('p175_cochos.png', H + "const be=W.__be,y=X('ground')(be.x,be.z);G.camFix={pos:[be.x-1.4,y+2.5,be.z+1.0],tgt:[be.x,y+0.6,be.z+1.0],fov:1.0};", 0.2, 4.0)
s += foto('p175_porteira.png', H + "const K=W.__K,p=owl(K,3.5,-8),y=X('ground')(K.x,K.z);G.camFix={pos:[p[0],y+2.4,p[1]],tgt:[K.x,y+0.7,K.z-2],fov:1.0};", 0.2, 4.0)
s += foto('p175_galinheiro.png', H + "const g=W.__g,y=X('ground')(g.x,g.z),fx=Math.sin(g.yaw),fz=Math.cos(g.yaw),rx=Math.cos(g.yaw),rz=-Math.sin(g.yaw);G.camFix={pos:[g.x-fx*3.4-rx*1.6,y+1.8,g.z-fz*3.4-rz*1.6],tgt:[g.x,y+0.7,g.z],fov:1.0};", 2.5, 4.0)
s += foto('p175_colmeia.png', H + "const o=W.__cm,y=X('ground')(o.x,o.z);G.camFix={pos:[o.x+1.3,y+1.35,o.z+1.1],tgt:[o.x,y+0.95,o.z],fov:0.95};", 0.5, 4.0)
s += foto('p175_composteira_biodigestor.png', H + "const b=W.__bd,y=X('ground')(b.x,b.z);G.camFix={pos:[b.x+1.5,y+2.6,b.z+4.4],tgt:[b.x+1.5,y+0.7,b.z],fov:1.0};", 0.3, 4.0)
salvar('p175g.json', s)
