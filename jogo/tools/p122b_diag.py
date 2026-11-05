import json
dump = "(()=>{const n=__nnc,P=n.P;return{P:[Math.round(P.x),Math.round(P.z)],vivo:P.alive,vida:Math.round(P.vida),nZ:n.Z.length,perto:n.Z.filter(z=>Math.hypot(z.x-P.x,z.z-P.z)<35).map(z=>z.tipo+'@'+Math.round(z.x)+','+Math.round(z.z)+(z.cerco?' cerco='+z.cerco:'')+' st='+z.st)};})()"
steps = [["wait",2],["click","#m-novo"],["wait",1.5],["js","(()=>{const n=__nnc;n.G.hora=10;n.Z.length=0;})()"],["gwait",0.3],
         ["js","(()=>{const n=__nnc;n.P.x=200;n.P.z=20;n.P.y=n.chaoEm(200,20,1);n.P.vy=0;})()"],["gwait",3],["eval","Z3",dump],["gwait",10],["eval","Z13",dump],["gwait",27],["eval","Z40",dump]]
json.dump([["desk",{"viewport":{"width":960,"height":540}},steps]],open('../p122b.json','w'))
