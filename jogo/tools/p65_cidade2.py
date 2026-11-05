"""p65: passarela quebrada (consertar e atravessar), caixa no telhado, horda andando pelas ruas sem entrar em prédio, água do metrô, surto."""
import json, os
J=lambda s:s.strip()
A="const n=__nnc,C=n.CID;const W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];"
steps=[["wait",2],["click","#m-novo"],["wait",1],
 ["eval","passarela",J("(()=>{"+A+"n.G.hora=10;n.Z.length=0;const pa=C.passarelas.find(q=>q.quebrada);const e=pa.pontas[0];n.P.x=e[0];n.P.z=e[1]-0.6;n.P.y=pa.y;n.P.vy=0;n.invAdd('tabuas',5);n.invAdd('pregos',5);\n   n.alvo={k:'passarela',o:pa};const t=n.textoInter(n.alvo).t;n.interagir(true);window.__pa=pa;return{t,quebrada:pa.quebrada,sup:!!pa.sup,de:pa.a.nome,para:pa.b.nome};})()")],
 ["js","(()=>{const n=__nnc,pa=window.__pa;n.P.yaw=0;n.P.body=0;})()"],["down","w"],["gwait",2.0],["up","w"],["gwait",0.3],
 ["eval","atravessou",J("(()=>{const n=__nnc,pa=window.__pa;const s=n.salaEm(n.P.x,n.P.y+0.3,n.P.z);return{z:+n.P.z.toFixed(2),y:+n.P.y.toFixed(2),pay:+pa.y.toFixed(2),em:s?s.p.nome+' '+s.tipo:null,vida:Math.round(n.P.vida)};})()")],
 ["eval","caixaTeto",J("(()=>{"+A+"const c=C.conts.find(c=>c.tabela==='teto');n.alvo={k:'cont',o:c};n.interagir(true);const B=n.bau;return{estado:c.estado,itens:(c.itens||[]).filter(Boolean).map(i=>i.id+'x'+i.n)};})()")],
 ["js","document.getElementById('inv-x').click()"],["gwait",0.2],
 # horda: noite, jogador numa esquina; a horda anda pelas ruas
 ["eval","horda0",J("(()=>{"+A+"n.Z.length=0;n.G.hora=22;n.P.x=205;n.P.z=8;n.P.y=0;n.P.vy=0;n.G.cid.hordas=[];const h=n.hordaNova();h.x=255;h.z=8;const pts=C.grafoRua;h.de=pts.find(p=>p.x===255&&p.z===8)||h.de;h.para=h.de.viz.find(p=>p.x===205)||h.de.viz[0];window.__h=h;return{n:h.n,x:h.x,z:h.z,para:[h.para.x,h.para.z]};})()")],
 ["gwait",20],
 ["eval","horda20",J("(()=>{const n=__nnc,h=window.__h;const dentro=h.membros.filter(z=>n.CID.predios.some(p=>z.x>p.x0+0.3&&z.x<p.x1-0.3&&z.z>p.z0+0.3&&z.z<p.z1-0.3&&z.y<1));return{x:+h.x.toFixed(1),z:+h.z.toFixed(1),membros:h.membros.length,vivos:h.membros.filter(z=>z.vivo).length,dentroDePredio:dentro.length,distJogador:+Math.hypot(h.x-n.P.x,h.z-n.P.z).toFixed(1)};})()")],
 ["eval","barulho",J("(()=>{const n=__nnc,h=window.__h;n.barulho(205,40,70,false,0);return{antes:[h.para&&h.para.x,h.para&&h.para.z]};})()")],["gwait",3],
 ["eval","barulhoDepois",J("(()=>{const n=__nnc,H=n.G.cid.hordas;return{hordas:H.length,tam:H.map(h=>n.tamHorda(h)),alvoRuido:H.map(h=>h.alvoRuido?[h.alvoRuido.x,h.alvoRuido.z]:null),ouvindo:n.Z.filter(z=>z.ouvir||z.st==='alerta').length};})()")],
 # água do metrô
 ["eval","agua",J("(()=>{const n=__nnc;n.Z.length=0;n.G.cid.hordas=[];n.P.x=250;n.P.z=-29.5;n.P.y=-7;n.P.vy=0;n.P.yaw=Math.PI/2;n.P.body=n.P.yaw;return{naAgua:n.naAgua(n.P.x,n.P.y,n.P.z)};})()")],
 ["down","w"],["gwait",1],["eval","aguaVel","(()=>{const n=__nnc;return{vel:+Math.hypot(n.P.vx,n.P.vz).toFixed(2)};})()"],["up","w"],
 ["js","(()=>{const n=__nnc;n.P.x=222;n.P.z=-31.5;n.P.y=-7;n.P.vy=0;n.P.yaw=-Math.PI/2;n.P.body=n.P.yaw;})()"],["down","w"],["gwait",1],["eval","secoVel","(()=>{const n=__nnc;return{vel:+Math.hypot(n.P.vx,n.P.vz).toFixed(2)};})()"],["up","w"],
 # surto
 ["eval","surto",J("(()=>{const n=__nnc;n.Z.length=0;n.P.x=205;n.P.z=-60;n.P.y=0.15;n.cidSurto(true);const zs=n.Z.filter(z=>z.vivo);const pred={};for(const z of zs){const s=n.salaEm(z.x,z.y+0.3,z.z);if(s&&s.p)pred[s.p.nome]=(pred[s.p.nome]||0)+1;}return{zumbis:zs.length,predios:pred};})()")],
]
plan=[["desk",{"viewport":{"width":960,"height":540}},steps]]
json.dump(plan,open(os.path.join(os.path.dirname(__file__),'..','p65.json'),'w'),ensure_ascii=False)
print('ok',len(steps))
