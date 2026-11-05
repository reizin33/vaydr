import json
T1='''(()=>{const n=__nnc,out={};for(const cat of['comum','suprimentos','escondida']){const N=60000,tab=n.CAIXA_LOOT[cat],lim=n.CAIXA_CFG.tipos[cat][1],cnt={},freq={},qOk=true;let vazias=0,maxT=0;
  for(const e of tab)freq[e[0]]=0;for(let i=0;i<N;i++){const r=n.sortearConteudo(cat);const k=r.length;cnt[k]=(cnt[k]||0)+1;if(!k)vazias++;maxT=Math.max(maxT,k);const ids=new Set();
    for(const it of r){if(ids.has(it[0]))qOk=false;ids.add(it[0]);freq[it[0]]++;const e=tab.find(t=>t[0]===it[0]);if(it[1]<e[2]||it[1]>e[3])qOk=false;}}
  const ef=n.chancesEfetivas(cat);let maxDif=0;const tabela=[];for(const[id,conf,efv]of ef.itens){const obs=freq[id]/N;maxDif=Math.max(maxDif,Math.abs(obs-efv));tabela.push(id+':'+(conf*100).toFixed(1)+'%>'+(efv*100).toFixed(1)+'%/obs '+(obs*100).toFixed(1)+'%');}
  out[cat]={limite:lim,maxTipos:maxT,dist:cnt,vazias:(vazias/N*100).toFixed(2)+'%',quantidadesOk:qOk,maxDiferenca:(maxDif*100).toFixed(2)+' pp',fator:ef.fator,tabela};}return out;})()'''
T2='''(()=>{const n=__nnc,C=n.CAIXAS,erros=[],porReg={};for(const c of C){if(c.estado==='espera'||c.x===undefined)continue;const k=c.reg+'/'+c.cat;porReg[k]=(porReg[k]||0)+(c.estado==='cheia'?1:0);
  const reg=n.CAIXA_CFG.regioes.find(r=>r.id===c.reg);if(!n.dentroRegiao(reg,c.x,c.z))erros.push(c.id+' fora da região');
  const bl=n.TREES.some(t=>t.alive&&Math.hypot(t.x-c.x,t.z-c.z)<0.5+0.23*t.s)||n.ROCKS.some(r=>r.alive&&Math.hypot(r.x-c.x,r.z-c.z)<0.5+0.85*r.s);if(bl)erros.push(c.id+' dentro de árvore/rocha');
  if(Math.abs(c.y-n.ground(c.x,c.z))>0.01)erros.push(c.id+' fora do chão');
  for(const o of C)if(o!==c&&o.x!==undefined&&o.estado!=='espera'&&Math.hypot(o.x-c.x,o.z-c.z)<n.CAIXA_CFG.distEntreCaixas-0.01)erros.push(c.id+' perto de '+o.id);
  const ni=c.itens.filter(Boolean).length;if(ni>n.CAIXA_CFG.tipos[c.cat][1])erros.push(c.id+' itens demais');}
  const lim=[];for(const reg of n.CAIXA_CFG.regioes)for(const cat in reg.max)if((porReg[reg.id+'/'+cat]||0)>reg.max[cat])lim.push(reg.id+'/'+cat);
  return{total:C.length,ativas:C.filter(c=>c.estado==='cheia').length,espera:C.filter(c=>c.estado==='espera').length,erros:erros.slice(0,10),limitesEstourados:lim,porReg};})()'''
SETUP_T3='''(()=>{const n=__nnc;let c=n.CAIXAS.find(c=>c.cat==='comum'&&c.estado==='cheia'&&c.itens.filter(Boolean).length>=1);if(!c)return null;
  c.itens=[{id:'graveto',n:2},{id:'pedra',n:3}];window.__c=c;n.P.x=c.x+1.2;n.P.z=c.z;window.__antes={graveto:n.invCount('graveto'),pedra:n.invCount('pedra')};n.abrirCaixaMata(c);
  return{id:c.id,modo:n.G.modo,aba:!document.getElementById('inv-bau').hidden,titulo:document.getElementById('bau-tit').textContent,slots:document.querySelectorAll('#grade-bau .slot').length};})()'''
T3='''(()=>{const n=__nnc,c=window.__c;return{graveto:n.invCount('graveto')-window.__antes.graveto,pedra:n.invCount('pedra')-window.__antes.pedra,estado:c.estado,restante:c.itens.filter(Boolean).length,
  espera:+(c.prox-n.G.tm).toFixed(1),faixa:n.CAIXA_CFG.tempos.comum};})()'''
T4='''(()=>{const n=__nnc,c=window.__c,a={g:n.invCount('graveto'),p:n.invCount('pedra')};n.fecharMochila?.();n.abrirCaixaMata(c);return{estado:c.estado,modo:n.G.modo,mudou:n.invCount('graveto')!==a.g||n.invCount('pedra')!==a.p};})()'''
SETUP_T5='''(()=>{const n=__nnc;let c=n.CAIXAS.find(c=>c.cat==='suprimentos'&&c.estado==='cheia');window.__c2=c;c.itens=[{id:'fita',n:1},{id:'pano',n:2}];n.P.x=c.x+1.2;n.P.z=c.z;n.abrirCaixaMata(c);return c.id;})()'''
T5='''(()=>{const n=__nnc,c=window.__c2,c1=window.__c;const antes={c2:JSON.stringify(c.itens),c1p:c1.prox,tm:n.G.tm};n.salvarJogo();
  for(const q of n.CAIXAS){q.itens=[];q.estado='espera';q.prox=0;}n.carregarJogo();const d2=n.CAIXAS.find(q=>q.id===c.id),d1=n.CAIXAS.find(q=>q.id===c1.id);window.__c=d1;window.__c2=d2;
  return{parcialIgual:JSON.stringify(d2.itens)===antes.c2,itens:d2.itens.filter(Boolean).map(s=>s.id+'x'+s.n),estadoParcial:d2.estado,timerIgual:Math.abs(d1.prox-antes.c1p)<0.11,estadoSaqueada:d1.estado,tmIgual:Math.abs(n.G.tm-antes.tm)<0.5};})()'''
T6='''(()=>{const n=__nnc,c=window.__c,ant=[c.x,c.z];n.G.tm=c.prox+1;n.P.x=c.x+8;n.P.z=c.z;n.updateCaixas(1.2);const perto={estado:c.estado,mesmoLugar:c.x===ant[0]};
  n.P.x=0;n.P.z=0;n.updateCaixas(1.2);const dAnt=Math.hypot(c.x-ant[0],c.z-ant[1]),dJog=Math.hypot(c.x-n.P.x,c.z-n.P.z);
  return{pertoDoJogador:perto,estado:c.estado,distAnterior:Math.round(dAnt),distJogador:Math.round(dJog),valido:n.lugarCaixaValido(Object.assign({},c,{ant:null}),c.x,c.z,false),itens:c.itens.filter(Boolean).length};})()'''
T7='''(()=>{const n=__nnc;const c=n.CAIXAS.find(q=>q.estado==='cheia'&&q.cat==='escondida');if(!c)return'sem escondida';const tm0=n.G.tm;c.itens.fill(null);n.caixasCarregar(n.caixasSalvar());const d=n.CAIXAS.find(q=>q.id===c.id);
  return{estado:d.estado,espera:+(d.prox-n.G.tm).toFixed(1),faixa:n.CAIXA_CFG.tempos.escondida};})()'''
T9='''(()=>{const n=__nnc;return{arvores:n.TREES.length,sinistros:n.SINISTROS.length,tipos:[...new Set(n.SINISTROS.map(s=>s.tipo))],inicio:Math.round(Math.hypot(n.P.x,n.P.z)),inv:n.P.inv.filter(Boolean).length,caixasClareira:!!n.INTER.find(i=>i.id==='caixas')};})()'''
plan=[["desk",{"viewport":{"width":960,"height":540}},[["wait",3],["click","#m-novo"],["wait",2],["gwait",0.4],
 ["eval","T9_mundo",T9],["eval","T1_sorteio",T1],["eval","T2_lugares",T2],
 ["eval","T3_abrir",SETUP_T3],["wait",0.4],["click","[data-bau=pegar]"],["wait",0.3],["eval","T3_pegou",T3],
 ["press","Escape"],["wait",0.3],["eval","T4_reabrir",T4],["press","Escape"],["wait",0.3],
 ["eval","T5_abrir",SETUP_T5],["wait",0.3],["js","document.querySelector('#grade-bau [data-b=\"0\"]').click()"],["wait",0.3],["press","Escape"],["wait",0.3],
 ["eval","T5_salvar_carregar",T5],["gwait",0.3],
 ["eval","T6_reaparecer",T6],["eval","T7_recarregar",T7],["eval","T2_depois",T2],
 ["js","(()=>{const n=__nnc;n.invAdd('pedra',2);})()"],["eval","T10_pedra","(()=>{const n=__nnc;return{slot0:n.P.inv[0]&&n.P.inv[0].id,label:document.getElementById('a-atacar-l').textContent};})()"],
 ["js","(()=>{const n=__nnc;window.__z=n.zLevantar('walker',n.P.x+7,n.P.z+5);})()"],["gwait",2.4],["eval","T11_zumbiSobe","(()=>{const q=window.__z;return q?{st:q.st,sink:+q.sink.toFixed(2)}:null;})()"],
 ["js","(()=>{const n=__nnc;const c=n.CAIXAS.find(q=>q.cat==='comum'&&q.estado==='cheia');n.P.x=c.x-Math.sin(0.5)*3;n.P.z=c.z-Math.cos(0.5)*3;n.G.hora=11;n.Z.length=0;n.G.camFix={pos:[c.x-2.2,c.y+1.5,c.z-2.2],tgt:[c.x,c.y+0.3,c.z],fov:0.8};})()"],
 ["gwait",0.5],["shot","155_caixa_comum.png"],
 ["js","(()=>{const n=__nnc;const c=n.CAIXAS.find(q=>q.cat==='suprimentos'&&q.estado==='cheia');n.P.x=c.x+3;n.P.z=c.z+3;n.G.camFix={pos:[c.x+2,c.y+1.4,c.z+2],tgt:[c.x,c.y+0.25,c.z],fov:0.8};})()"],
 ["gwait",0.5],["shot","156_caixa_sup.png"]]]]
json.dump(plan,open('p54.json','w'));print('ok')
