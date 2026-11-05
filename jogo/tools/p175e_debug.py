import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),owl=(o,u,v)=>X('owl')(o,u,v);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};const c={x:-62,z:52},a=0.3;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);"
        "const K=cria('curral',c.x,c.z,a);W.__K=K;const o1=owl(K,-2.2,1.6),o2=owl(K,1.2,1.6);const co=cria('cocho',o1[0],o1[1],a);co.itens[0]=X('newItem')('feno',4);const be=cria('bebedouro',o2[0],o2[1],a);be.ext.agua=16;W.__be=be;"
        "const p=owl(K,-0.5,-0.2);const v=X('criarBicho')('vaca',p[0],p[1],{});X('domarCria')(v);v.modo='curral';v.curral={x:K.x,z:K.z};v.fome=10;v.sede=60;W.__v=v;W.__log=[];"
        "const q=owl(K,0,-6);vai(q[0],q[1]);"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;const v=W.__v,b=W.__be;if(W.__log.length<400&&(W.__k=(W.__k||0)+1)%20===0)W.__log.push([r2(v.sede),v.st,r2(Math.hypot(b.x-v.x,b.z-v.z)),r2(v.comeT||0),r2(b.ext.agua),r2(v.v||0),v.modo]);};"), ["gwait", 12],
      e("log", "return{log:W.__log.slice(0,60),sede:W.__v.sede};")]
salvar('p175e.json', s)
