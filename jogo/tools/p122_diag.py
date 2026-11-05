import json
patch = r"""{const _c=criarZ;criarZ=function(t,x,z,o){const r=_c.apply(this,arguments);if(r){const st=(new Error().stack||'').split('\n').slice(2,6).map(s=>s.trim().replace(/^at /,'').replace(/\(.*?:(\d+):\d+\)/,'@$1')).join(' < ');window.__orig.push({t,x:Math.round(x),z:Math.round(z),G:+G.t.toFixed(2),st,pd:Math.round(Math.hypot(x-P.x,z-P.z))});r.__st=st;}return r;};}"""
setup = "(()=>{const n=__nnc;window.__orig=[];window.__patch=%s;n.ev(window.__patch);n.G.hora=10;n.Z.length=0;})()" % json.dumps(patch)
dump = lambda a,b: "(()=>{const n=__nnc;return{P:[Math.round(n.P.x),Math.round(n.P.z)],nZ:n.Z.length,orig:window.__orig.slice(%d,%d).map(o=>o.t+'@'+o.x+','+o.z+' d='+o.pd+' t='+o.G+' '+o.st),hordas:(n.G.cid.hordas||[]).map(h=>({x:Math.round(h.x),z:Math.round(h.z),n:h.n,m:h.membros.length}))};})()" % (a,b)
steps = [["wait",2],["click","#m-novo"],["wait",1.5],["js",setup],["gwait",0.3],["eval","Z03",dump(0,40)],["gwait",5],["eval","Z5",dump(40,80)],
         ["js","(()=>{const n=__nnc;n.P.x=200;n.P.z=20;n.P.y=n.chaoEm(200,20,1);n.P.vy=0;})()"],["gwait",8],["eval","Z200",dump(0,60)],["gwait",20],["eval","Z200b",dump(0,80)]]
json.dump([["desk",{"viewport":{"width":960,"height":540}},steps]],open('../p122.json','w'))
