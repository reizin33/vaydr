"""p61: recipientes, portas, gerador, rota de zumbi por escada, infestação noturna, salvar/carregar da cidade."""
import json, os
J=lambda s:s.strip()
A="const n=__nnc,C=n.CID,a=C.predios[0],H=C.predios.find(p=>p.tipo==='hospital');const W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];"
# os cercos dos sobreviventes (Seu Jorge na oficina, Marina na delegacia, Tião no metrô) põem 3 ou 4 zumbis caçando o jogador
# assim que ele chega perto; parado no meio do teste ele morre (igual na versão anterior). Este teste confere a cidade, então os cercos ficam desligados.
SEM_CERCO = ["js", "(()=>{try{__nnc.ev('for(const s of SOBREV)s.cercoFeito=true')}catch(e){}})()"]
steps=[["wait",3],["click","#m-novo"], SEM_CERCO,["wait",2],["js","window.__turbo=6;window.__semRender=true;"],["gwait",0.3],
 ["js",J("(()=>{"+A+"n.G.hora=10;n.Z.length=0;const w=W(a,a.uc,3);n.P.x=w[0];n.P.z=w[1];n.P.y=a.y0;n.P.vy=0;})()")],["gwait",0.3],
 # recipiente: vasculhar a primeira gaveta/armário do térreo do Aurora
 ["eval","cont",J("(()=>{"+A+"const c=C.conts.find(c=>c.p===a&&c.sala.f===0&&c.sala.tipo==='portaria');if(!c)return null;window.__c=c;n.P.x=c.x+Math.sin(c.yaw)*1.0;n.P.z=c.z+Math.cos(c.yaw)*1.0;n.P.y=c.y;n.P.vy=0;n.set&&0;n.alvo={k:'cont',o:c};n.interagir(true);const B=n.bau;return{estado:c.estado,itens:(c.itens||[]).filter(Boolean).map(i=>i.id+'x'+i.n),bauAberto:!!B,txt:n.textoInter({k:'cont',o:c})};})()")],
 ["eval","pegou",J("(()=>{const n=__nnc,c=window.__c,B=n.bau;if(!B)return null;const antes=c.itens.filter(Boolean).length;let pegos=[];for(let j=0;j<B.itens.length;j++){const s=B.itens[j];if(!s)continue;const id=s.id,q=s.n;if(n.invAdd(s.id,s.n,null)===0){B.itens[j]=null;pegos.push(id+'x'+q);}}B.aoMudar();return{antes,pegos,estado:c.estado,resto:c.itens.filter(Boolean).length};})()")],
 ["click","#inv-x"],["gwait",0.2],
 # porta: abrir, fechar, travar; trancada com pé de cabra
 ["eval","portas",J("(()=>{"+A+"const d=C.portas.find(d=>d.p===a&&d.f===0&&d.estado==='fechada'&&d.tipo==='madeira');if(!d)return null;const r={id:d.id,ini:d.estado,col:!!d.col};n.portaUsar(d,false);r.aposAbrir=d.estado;r.colAberta=!!d.col;n.portaUsar(d,false);r.aposFechar=d.estado;r.col=!!d.col;n.portaUsar(d,true);r.travada=d.estado;window.__d=d;\n   const t=C.portas.find(q=>q.estado==='trancada'&&!q.chave);if(t){n.invAdd('peDeCabra',1,{dur:200});r.trancTxt=n.textoInter({k:'porta',o:t}).t;n.portaUsar(t,true);r.forcada=t.estado;window.__t=t;}return r;})()")],
 # zumbi no 2º andar caça o jogador no térreo pela escada
 ["eval","zumbi",J("(()=>{"+A+"const s=a.salas[2].find(s=>s.tipo==='apartamento');const w=W(a,(s.u0+s.u1)/2,(s.v0+s.v1)/2);const z=n.criarZ('walker',w[0],w[1],{y:s.y,cidade:true});z.st='caca';z.viu=0;z.lx=n.P.x;z.lz=n.P.z;z.ly=n.P.y;window.__z=z;\n   for(const d of C.portas)if(d.p===a&&(d.estado==='trancada'||d.estado==='travada'||d.estado==='fechada'))n.portaEstado(d,'aberta');const w2=W(a,a.uc,3);n.P.x=w2[0];n.P.z=w2[1];n.P.y=a.y0;n.P.vy=0;n.P.vida=100;\n   const rota=n.navRota(z.x,z.y,z.z,n.P.x,n.P.y,n.P.z);return{zy:+z.y.toFixed(2),rota:rota?rota.length:null,andares:rota?[...new Set(rota.map(q=>Math.round((q.y-a.y0)/3.2)))].join(','):null};})()")],
 ["js","window.__turbo=4;window.__t0=__nnc.G.t+90;"],["until","(()=>{const z=window.__z,n=__nnc;return !z.vivo||(Math.hypot(z.x-n.P.x,z.z-n.P.z)<2.2&&Math.abs(z.y-n.P.y)<1)||n.G.t>window.__t0;})()",400],["js","window.__turbo=6;"],
 ["eval","zumbiChegou",J("(()=>{const n=__nnc,z=window.__z;return{segundos:+(n.G.t-window.__t0+90).toFixed(1),dist:+Math.hypot(z.x-n.P.x,z.z-n.P.z).toFixed(1),dy:+(z.y-n.P.y).toFixed(2),st:z.st,vida:Math.round(n.P.vida)};})()")],
 # gerador do hospital e porta eletrônica
 ["eval","gerador",J("(()=>{"+A+"n.Z.length=0;const g=H.gerador;n.P.x=g.x+1.2;n.P.z=g.z;n.P.y=g.y;n.P.vy=0;n.invAdd('gasolina',1);n.alvo={k:'gerador',o:g};const t0=n.textoInter(n.alvo).t;n.interagir(false);\n   const e=C.portas.find(d=>d.tipo==='eletronica');const r={t0,energia:n.G.cid.energia,eletronica:!!e};if(e){n.portaUsar(e,false);r.abriu=e.estado;}return r;})()")],
 # infestação: noite na cidade enche aos poucos, longe do jogador e fora da zona dele
 ["eval","inf0",J("(()=>{"+A+"n.Z.length=0;const w=W(a,a.uc,3);n.P.x=w[0];n.P.z=w[1];n.P.y=a.y0;n.P.vy=0;n.G.hora=21;return{nivel:n.nivelInfestacao(21),dia:n.nivelInfestacao(11),tarde:n.nivelInfestacao(19)};})()")],
 ["gwait",40],
 ["eval","inf40",J("(()=>{const n=__nnc;const zs=n.Z.filter(z=>z.vivo&&z.cidade);const Pz=n.salaEm(n.P.x,n.P.y+0.3,n.P.z);let perto=0,mesma=0;for(const z of zs){if(Math.hypot(z.x-n.P.x,z.z-n.P.z)<15)perto++;if(z.zona===Pz)mesma++;}\n   const tipos={};for(const z of zs)tipos[z.tipo]=(tipos[z.tipo]||0)+1;return{total:zs.length,alvo:Math.round(5+18*1),tipos,nasceramPerto:perto,naZonaDoJogador:mesma,hordas:(n.G.cid.hordas||[]).length,vida:Math.round(n.P.vida)};})()")],
 # salvar e carregar: estado dos recipientes e portas
 ["js","__nnc.Z.length=0;__nnc.salvarJogo()"],
 ["reload"],["wait",3],["click","#m-continuar"],["wait",2],["js","window.__turbo=6;window.__semRender=true;"],["gwait",0.3],
 ["eval","carregado",J("(()=>{"+A+"const c=C.conts.find(c=>c.p===a&&c.sala.f===0&&c.sala.tipo==='portaria');const r={contEstado:c.estado,contResto:(c.itens||[]).filter(Boolean).length,energia:n.G.cid.energia};\n   const ds=C.portas.filter(d=>d.estado==='travada'||d.estado==='quebrada'||(d.tipo==='eletronica'&&d.estado==='aberta'));r.portasMudadas=Object.keys(n.G.cid.portas).length;r.travadas=C.portas.filter(d=>d.estado==='travada').length;r.colTravada=C.portas.filter(d=>d.estado==='travada').every(d=>!!d.col);return r;})()")],
]
plan=[["desk",{"viewport":{"width":960,"height":540}},steps]]
json.dump(plan,open(os.path.join(os.path.dirname(__file__),'..','p61.json'),'w'),ensure_ascii=False)
print('ok',len(steps))
