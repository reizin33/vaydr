"""p60: cidade carrega, física de calçada/escada/parede, imagens da avenida, do interior e do metrô."""
import json, os
J=lambda s:s.strip()
A="const n=__nnc,C=n.CID,a=C.predios[0];"
# os cercos dos sobreviventes (Seu Jorge na oficina, Marina na delegacia, Tião no metrô) põem 3 ou 4 zumbis caçando o jogador
# assim que ele chega perto; parado no meio do teste ele morre (igual na versão anterior). Este teste confere a cidade, então os cercos ficam desligados.
SEM_CERCO = ["js", "(()=>{try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}})()"]
steps=[["wait",3],["click","#m-novo"], SEM_CERCO,["wait",2],["js","window.__turbo=6;window.__semRender=true;"],["gwait",0.3],
 ["eval","info",J("(()=>{"+A+"return{predios:C.predios.map(p=>p.nome+':'+p.andares+'a '+p.salas.flat().length+'s'),salas:C.salas.length,portas:C.portas.length,janelas:C.janelas.length,conts:C.conts.length,nos:C.nos.length,quadras:C.quadras.length,sups:n.SUPS.length,buracos:n.BURACOS?n.BURACOS.length:null};})()")],
 # calçada: da rua (0) sobe no meio-fio (0.15)
 ["js","(()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;n.P.x=200;n.P.z=8;n.P.y=0;n.P.vy=0;n.P.yaw=Math.PI;n.P.body=Math.PI;})()"],["gwait",0.3],
 ["eval","rua","(()=>{const n=__nnc;return{y:+n.P.y.toFixed(3),dentroMapa:true};})()"],
 ["down","w"],["gwait",2.0],["up","w"],["gwait",0.3],
 ["eval","calcada","(()=>{const n=__nnc;return{x:+n.P.x.toFixed(1),z:+n.P.z.toFixed(1),y:+n.P.y.toFixed(3)};})()"],
 # escada do Aurora: lance A até o patamar, lance B até o 1º andar
 ["js",J("(()=>{"+A+"const w=n.pw?null:null;const uc=a.uc,vS=a.vS,c=a.c,s=a.s;const W=(u,v)=>[a.ox+u*c+v*s,a.oz-u*s+v*c];const p0=W(uc-0.65,vS+1.0);n.P.x=p0[0];n.P.z=p0[1];n.P.y=a.y0;n.P.vy=0;const yaw=a.yaw;n.P.yaw=yaw;n.P.body=yaw;window.__W=W;})()")],
 ["gwait",0.3],["down","w"],["gwait",1.4],["up","w"],["gwait",0.3],
 ["eval","patamar",J("(()=>{"+A+"const l=[(n.P.x-a.ox)*a.c-(n.P.z-a.oz)*a.s,(n.P.x-a.ox)*a.s+(n.P.z-a.oz)*a.c];return{u:+l[0].toFixed(2),v:+l[1].toFixed(2),vS:+a.vS.toFixed(2),y:+n.P.y.toFixed(2),esperado:+(a.y0+1.6).toFixed(2)};})()")],
 ["js",J("(()=>{"+A+"const p0=window.__W(a.uc+0.65,a.vS+4.9);n.P.x=p0[0];n.P.z=p0[1];n.P.vy=0;const yaw=a.yaw+Math.PI;n.P.yaw=yaw;n.P.body=yaw;})()")],
 ["gwait",0.3],["down","w"],["gwait",1.6],["up","w"],["gwait",0.3],
 ["eval","andar1",J("(()=>{"+A+"const l=[(n.P.x-a.ox)*a.c-(n.P.z-a.oz)*a.s,(n.P.x-a.ox)*a.s+(n.P.z-a.oz)*a.c];const s=n.salaEm?n.salaEm(n.P.x,n.P.y+0.3,n.P.z):null;return{u:+l[0].toFixed(2),v:+l[1].toFixed(2),y:+n.P.y.toFixed(2),esperado:+(a.y0+3.2).toFixed(2),sala:s?s.tipo+' f'+s.f:null};})()")],
 # parede: andar para oeste dentro do corredor do térreo
 ["js",J("(()=>{"+A+"const p0=window.__W(a.uc,4);n.P.x=p0[0];n.P.z=p0[1];n.P.y=a.y0;n.P.vy=0;const yaw=a.yaw-Math.PI/2;n.P.yaw=yaw;n.P.body=yaw;})()")],
 ["gwait",0.3],["down","w"],["gwait",1.5],["up","w"],["gwait",0.2],
 ["eval","parede",J("(()=>{"+A+"const l=[(n.P.x-a.ox)*a.c-(n.P.z-a.oz)*a.s,(n.P.x-a.ox)*a.s+(n.P.z-a.oz)*a.c];return{u:+l[0].toFixed(2),corredorDe:+(a.uc-1).toFixed(2),y:+n.P.y.toFixed(2)};})()")],
 # metrô: desce a escada da boca
 ["js","(()=>{const n=__nnc,b=n.CID.metro.bocas[0];n.P.x=(b.x0+b.x1)/2;n.P.z=b.z1+1.2;n.P.y=0.15;n.P.vy=0;n.P.yaw=Math.PI;n.P.body=Math.PI;})()"],
 ["gwait",0.3],["down","w"],["gwait",4.0],["up","w"],["gwait",0.3],
 ["eval","metro",J("(()=>{const n=__nnc;const s=n.salaEm?n.salaEm(n.P.x,n.P.y+0.3,n.P.z):null;return{x:+n.P.x.toFixed(1),z:+n.P.z.toFixed(1),y:+n.P.y.toFixed(2),sala:s?s.nome:null,vida:Math.round(n.P.vida)};})()")],
 # imagens
 ["js","(()=>{const n=__nnc;window.__turbo=0;window.__semRender=false;n.P.x=186;n.P.z=9;n.P.y=0;n.P.vy=0;n.P.yaw=-Math.PI/2+0.15;n.P.body=n.P.yaw;n.P.pitch=0.05;n.G.hora=9.5;})()"],
 ["gwait",0.5],["shot","180_avenida.png"],
 ["js",J("(()=>{"+A+"const p0=window.__W(a.uc,3);n.P.x=p0[0];n.P.z=p0[1];n.P.y=a.y0;n.P.vy=0;n.P.yaw=a.yaw;n.P.body=a.yaw;n.P.pitch=0;})()")],
 ["gwait",0.5],["shot","181_corredor.png"],
]
plan=[["desk",{"viewport":{"width":960,"height":540}},steps]]
json.dump(plan,open(os.path.join(os.path.dirname(__file__),'..','p60.json'),'w'),ensure_ascii=False)
print('ok',len(steps))
