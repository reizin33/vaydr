"""p135b: os colisores da cidade sem dono (só a marca 'br'): onde estão, tamanho, altura, quem criou (pilha de chamada guardada
no momento da criação não existe, então vai a vizinhança: prédio mais perto e distância até a caixa dele)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("semDono", "const C=X('CIDADE'),PR=X('CID').predios,L=X('COLL').filter(c=>c.solid&&c.x>C.x0-6&&c.x<C.x1+6&&c.z>C.z0-6&&c.z<C.z1+6),"
         "IGN=['t','x','z','hw','hd','c','s','yaw','solid','r','y0','y1','id','cel','st','stamp','cells','k','br'];"
         "const sem=L.filter(c=>!Object.keys(c).filter(k=>!IGN.includes(k)).length);"
         "const viz=c=>{let b=null,bd=1e9;for(const p of PR){const dx=Math.max(p.x0-c.x,0,c.x-p.x1),dz=Math.max(p.z0-c.z,0,c.z-p.z1),d=Math.hypot(dx,dz);if(d<bd){bd=d;b=p;}}return{p:b&&b.id,nome:b&&(b.nome||b.tipo),d:r2(bd)};};"
         "return{n:sem.length,br:L.filter(c=>c.br!==undefined).length,exBr:L.slice(0,3).map(c=>c.br),lista:sem.map(c=>Object.assign({t:c.t,x:r2(c.x),z:r2(c.z),a:r2(c.hw!==undefined?c.hw:c.r),b:r2(c.hd||0),yaw:r2(c.yaw||0),y0:c.y0===undefined?null:r2(c.y0),y1:c.y1===undefined?null:r2(c.y1),chao:r2(X('ground')(c.x,c.z))},viz(c)))};")]
salvar('p135b.json', s)
