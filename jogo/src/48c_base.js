/* ================= base viva: o acampamento produz e se defende =================
   horta: planta com sementes; em um dia e meio dá milho, batata e às vezes abóbora (a chuva acelera). Quem cozinha colhe sozinho.
   coletor de chuva: enche com a chuva; enche suas garrafas ou mata a sede ali mesmo
   gerador: queima gasolina à noite e acende os postes de luz perto dele; também eletrifica o arame farpado
   arame farpado: segura e machuca os zumbis que passam (eletrificado, dá choque e derruba)
   alarme de latas: tilinta quando um zumbi passa e avisa de que lado ele vem
   torre de vigia: plataforma alta com escada; zumbi não sobe. Quem vigia fica lá em cima e atira de mais longe */
Object.assign(ITEMS,{
  sementes:{nome:'Sementes',icon:'i-sementes',max:30,tipo:'material',desc:'Milho, batata, abóbora, tomate, cenoura e feijão. Plante numa horta no acampamento ou nos canteiros da plantação da fazenda e das hortas dos sítios (toque E no canteiro para escolher o que plantar).'},
  milho:{nome:'Milho',icon:'i-milho',max:20,tipo:'comida',fome:10,desc:'Da horta. Cru mata pouco a fome; na sopa rende muito mais.'},
  batata:{nome:'Batata',icon:'i-batata',max:20,tipo:'comida',fome:9,desc:'Da horta. Melhor cozida, na sopa.'},
  abobora:{nome:'Abóbora',icon:'i-abobora',max:10,tipo:'comida',fome:14,desc:'Da horta. Dá uma boa sopa.'},
  sopa:{nome:'Sopa de legumes',icon:'i-sopa',max:10,tipo:'comida',fome:45,sede:15,vida:5,desc:'Feita com o que a horta dá. Enche a barriga, mata a sede e esquenta.'}});
RECIPES.push({faz:'sopa',n:1,custo:{milho:1,batata:1},alt:{batata:['abobora',1]},cat:'cura',etapa:2,est:1,desb:{item:'milho'}});
for(const[t,e]of[['celeiro',['sementes',2,4,0.6]],['casa',['sementes',1,2,0.2]],['mercado',['sementes',1,3,0.3]],['suprimentos',['sementes',3,5,0.4]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['ap_cozinha',['sementes',.1,1,2]],['estoque',['sementes',.2,1,3]],['deposito',['sementes',.1,1,2]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
Object.assign(OBRAS,{
  horta:{nome:'Horta',icon:'i-horta',custo:{tabuas:3,sementes:2},hp:90,hw:1.0,hd:1.5,solid:false,etapa:1,horta:true},
  coletor:{nome:'Coletor de chuva',icon:'i-coletor',custo:{tabuas:2,pano:3,sucata:2},hp:80,hw:0.5,hd:0.5,solid:true,etapa:2,coletor:true},
  torreVigia:{nome:'Torre de vigia',icon:'i-torre',custo:{tabuas:12,pregos:6,corda:2},hp:420,hw:1.35,hd:1.35,solid:false,etapa:2,torre:true},
  arame:{nome:'Arame farpado',icon:'i-arame',custo:{sucata:3,pregos:3},hp:170,hw:1.4,hd:0.3,solid:false,armadilha:true,etapa:2,arame:true},
  latas:{nome:'Alarme de latas',icon:'i-latas',custo:{sucata:2,corda:1},hp:40,hw:1.5,hd:0.1,solid:false,etapa:1,latas:true},
  gerador:{nome:'Gerador',icon:'i-gerador',custo:{sucata:8,pregos:6,tabuas:2},hp:220,hw:0.62,hd:0.42,solid:true,etapa:3,desb:'oficina',gerador:true},
  poste:{nome:'Poste de luz',icon:'i-poste',custo:{sucata:3,tabuas:1},hp:90,hw:0.14,hd:0.14,solid:true,etapa:3,desb:'oficina',poste:true}});
OBRA_ORDEM.push('horta','coletor','torreVigia','arame','latas','gerador','poste');
OBRAS_CHAO.push('horta','coletor','torreVigia','arame','latas','gerador','poste');
OBRAS_TELHADO.push('horta','coletor');
const TORRE_H=3.4;
/* ---------- geometria ---------- */
function baseGeometry(O,R,mk){const mad=lin(0x6b4e30),mad2=lin(0x5a412a),terra=lin(0x3a2a1c),aco=lin(0x7a8288),esc=lin(0x2b2b2b);
  O.horta=mk(g=>{for(const sx of[-1,1])add(g,bvTris(0.1,0.28,3.0),mat(sx*0.95,0.14,0),mad,{j:0.06,rnd:R});for(const sz of[-1,1])add(g,bvTris(2.0,0.28,0.1),mat(0,0.14,sz*1.45),mad,{j:0.06,rnd:R});
    add(g,bvTris(1.8,0.22,2.8),mat(0,0.11,0),terra,{j:0.12,rnd:R});for(let i=0;i<3;i++)add(g,bvTris(1.6,0.05,0.18),mat(0,0.235,-0.9+i*0.9),lin(0x2c2016),{j:0.15,rnd:R});});
  O.hortaBroto=mk(g=>{for(let k=0;k<5;k++){const a=k*1.26;add(g,bvTris(0.03,0.32,0.11,{tx:0.2}),mm(mat(0,0,0,0,a,0),mat(0,0.16,0.04,-0.35,0,0)),lin(0x4f8a2e),{j:0.15,rnd:R});}});
  O.hortaMadura=mk(g=>{for(let k=0;k<6;k++){const a=k*1.05;add(g,bvTris(0.035,0.62,0.13,{tx:0.25}),mm(mat(0,0,0,0,a,0),mat(0,0.3,0.05,-0.3,0,0)),lin(0x5f9a34),{j:0.15,rnd:R});}
    add(g,cylTris(0.035,0.045,0.2,6),mat(0.05,0.42,0.02,0.3,0,0.2),lin(0xe0b030));add(g,icoTris(0.14,0.25,R),mat(-0.12,0.1,0.1,0,0,0,1.1,0.8,1.1),lin(0xd9771e),{j:0.1,rnd:R});});
  O.coletor=mk(g=>{add(g,cylTris(0.36,0.32,0.95,12),mat(0,0,0),lin(0x2f5f86),{j:0.04,rnd:R});add(g,cylTris(0.37,0.37,0.05,12),mat(0,0.94,0),lin(0x24486a));
    for(const sx of[-1,1])for(const sz of[-1,1])add(g,cylTris(0.025,0.025,1.35,5),mat(sx*0.42,0,sz*0.42),mad2);
    add(g,cylTris(0.06,0.62,0.32,8,{top:false}),mat(0,1.02,0),lin(0x3f5a2c),{j:0.08,rnd:R});add(g,cylTris(0.03,0.03,0.25,6),mat(0.3,0.2,0.26,0,0,Math.PI/2),aco);});
  O.gerador=mk(g=>{add(g,bvTris(1.0,0.55,0.62),mat(0,0.42,0),lin(0xb8352a),{j:0.04,rnd:R});add(g,bvTris(1.04,0.06,0.66),mat(0,0.72,0),lin(0x2b2b2b));
    add(g,bvTris(0.5,0.3,0.4),mat(-0.15,0.88,0),lin(0x3a3d42));add(g,cylTris(0.05,0.05,0.5,8),mat(0.36,0.7,-0.18),aco);add(g,cylTris(0.07,0.07,0.08,8),mat(0.36,1.2,-0.18),esc);
    for(const sx of[-1,1])for(const sz of[-1,1])add(g,cylTris(0.12,0.12,0.06,10),mat(sx*0.38,0.12,sz*0.33,Math.PI/2,0,0),esc);add(g,bvTris(0.18,0.12,0.03),mat(0.3,0.5,0.32),lin(0xe0c060));
    add(g,bvTris(1.1,0.04,0.04),mat(0,0.16,0.33),aco);add(g,bvTris(1.1,0.04,0.04),mat(0,0.16,-0.33),aco);});
  O.geradorBase=mk(g=>{const ver=lin(0x4b5a3a),ver2=lin(0x3c4930);add(g,bvTris(1.6,0.08,1.05),mat(0,0.04,0),esc);
    add(g,bvTris(1.5,0.82,0.92),mat(0,0.5,0),ver,{j:0.04,rnd:R});add(g,bvTris(1.56,0.07,0.98),mat(0,0.94,0),ver2);
    for(let i=0;i<6;i++)add(g,bvTris(0.03,0.5,0.02),mat(-0.55+i*0.11,0.52,0.47),esc);add(g,bvTris(0.42,0.3,0.03),mat(0.42,0.6,0.47),lin(0x23282c));
    add(g,bvTris(0.12,0.06,0.02),mat(0.32,0.66,0.49),lin(0xd04030));add(g,bvTris(0.12,0.06,0.02),mat(0.5,0.66,0.49),lin(0x40b050));
    add(g,cylTris(0.07,0.07,0.55,8),mat(-0.5,0.95,-0.25),aco);add(g,cylTris(0.09,0.09,0.08,8),mat(-0.5,1.5,-0.25),esc);
    add(g,cylTris(0.3,0.3,0.7,10),mat(0.25,1.25,-0.05,0,0,Math.PI/2),lin(0x56653f),{j:0.04,rnd:R});add(g,cylTris(0.06,0.06,0.12,8),mat(0.62,1.25,-0.05,0,0,Math.PI/2),esc);
    add(g,bvTris(0.5,0.12,0.1),mat(-0.4,0.86,0.5),lin(0xe0c060));for(const sx of[-1,1])add(g,bvTris(0.08,0.08,1.0),mat(sx*0.7,0.1,0),aco);});
  O.poste=mk(g=>{add(g,cylTris(0.07,0.09,3.3,7),mat(0,0,0),mad2,{j:0.05,rnd:R});add(g,bvTris(0.06,0.06,0.7),mat(0,3.15,0.3),mad2);add(g,cylTris(0.12,0.05,0.14,8),mat(0,2.98,0.62),esc);
    add(g,cylTris(0.012,0.012,1.2,4),mat(0.05,2.0,0.0,0.3,0,0),esc);});
  O.posteLuz=mk(g=>add(g,icoTris(0.075,0.05,R),mat(0,2.95,0.62),lin(0xfff0c0),{e:3.2}));
  O.arame=mk(g=>{for(const x of[-1.3,0,1.3])add(g,cylTris(0.05,0.06,1.1,6),mat(x,0,0),mad2,{j:0.08,rnd:R});
    for(const y of[0.3,0.62,0.94]){add(g,cylTris(0.008,0.008,2.6,4),mat(1.3,y,0,0,0,Math.PI/2),aco);for(let i=0;i<9;i++){const x=-1.2+i*0.3;add(g,bvTris(0.06,0.012,0.012),mat(x,y,0,0,0.8,0.6),aco);add(g,bvTris(0.012,0.06,0.012),mat(x+0.02,y,0,0.6,0,0.8),aco);}}});
  O.latas=mk(g=>{for(const x of[-1.4,1.4])add(g,cylTris(0.04,0.05,0.9,6),mat(x,0,0),mad2);add(g,cylTris(0.008,0.008,2.8,4),mat(1.4,0.82,0,0,0,Math.PI/2),lin(0x8a7350));
    for(let i=0;i<7;i++){const x=-1.05+i*0.35;add(g,cylTris(0.004,0.004,0.12,3),mat(x,0.7,0),lin(0x8a7350));add(g,cylTris(0.035,0.035,0.11,8),mat(x,0.59,0),lin(i%2?0x9aa0a6:0xb8642a));}});
  O.torreVigia=mk(g=>{const H=TORRE_H,L=1.2;for(const sx of[-1,1])for(const sz of[-1,1])add(g,bvTris(0.16,H+1.25,0.16),mat(sx*L,(H+1.25)/2,sz*L),mad2,{j:0.05,rnd:R});
    for(const y of[0.9,2.2])for(const s of[-1,1]){add(g,bvTris(2.5,0.1,0.08),mat(0,y,s*L),mad,{j:0.06,rnd:R});add(g,bvTris(0.08,0.1,2.5),mat(s*L,y,0),mad,{j:0.06,rnd:R});}
    for(const s of[-1,1]){add(g,bvTris(0.07,0.07,3.3),mm(mat(s*L,H*0.5,0),mat(0,0,0,0.9,0,0)),mad,{j:0.06,rnd:R});}
    for(let i=0;i<7;i++)add(g,bvTris(2.7,0.08,0.38),mat(0,H,-1.15+i*0.383),mixc(mad,mad2,R()),{j:0.08,rnd:R});
    for(const y of[H+0.55,H+1.05]){for(const s of[-1,1])add(g,bvTris(2.5,0.08,0.08),mat(0,y,s*L),mad,{j:0.05,rnd:R});add(g,bvTris(0.08,0.08,2.5),mat(-L,y,0),mad,{j:0.05,rnd:R});}
    for(const s of[-1,1])add(g,bvTris(0.06,1.1,0.06),mat(L,H+0.55,s*0.62),mad2);
    add(g,bvTris(2.9,0.06,2.9,{tx:0.6,tz:0.6}),mat(0,H+2.35,0),lin(0x4a5a3a),{j:0.06,rnd:R});for(const sx of[-1,1])for(const sz of[-1,1])add(g,bvTris(0.06,1.0,0.06),mat(sx*1.05,H+1.85,sz*1.05),mad2);
    // escada no lado +x
    for(const s of[-1,1])add(g,bvTris(0.07,H+0.9,0.07),mat(L+0.32,(H+0.9)/2,s*0.3),mad2);for(let i=1;i<=9;i++)add(g,bvTris(0.07,0.05,0.62),mat(L+0.32,i*H/9.5,0),mad);});}
/* ---------- montar: torre (superfície, colisores e escada), postes e o resto ---------- */
function montarBase(o){const D=OBRAS[o.tipo];
  if(D.torre){const H=TORRE_H,L=1.2,c=Math.cos(o.yaw),s=Math.sin(o.yaw),W=(lx,lz)=>[o.x+lx*c+lz*s,o.z-lx*s+lz*c];o.alturaPlat=H;
    o.sup=supAdd({t:'ret',x:o.x,z:o.z,hw:1.35,hd:1.35,yaw:o.yaw,y:o.y+H,dono:o});o.cols=[];
    for(const sx of[-1,1])for(const sz of[-1,1]){const w=W(sx*L,sz*L);o.cols.push(colBox(w[0],w[1],0.14,0.14,o.yaw,{solid:true,obra:o}));}
    for(const[lx,lz,hw,hd]of[[0,-L-0.05,1.3,0.06],[-L-0.05,0,0.06,1.3],[0,L+0.05,1.3,0.06]]){const w=W(lx,lz);o.cols.push(colBox(w[0],w[1],hw,hd,o.yaw,{solid:true,obra:o,y0:o.y+H,y1:o.y+H+1.15}));}
    const hb=W(L+0.32,0),g=ground(hb[0],hb[1]),b=W(L+1.25,0),t=W(L-0.55,0);
    const v=viaReta(hb[0],hb[1],g,o.y+H,o.yaw-Math.PI/2,{x:b[0],y:ground(b[0],b[1]),z:b[1]},{x:t[0],y:o.y+H,z:t[1],rumo:o.yaw-Math.PI/2},o);v.tipo='escada';o.via=v;VIAS.push(v);}
  if(D.horta&&o.ext.cresce===undefined)o.ext.cresce=0.15;
  if(D.coletor&&o.ext.agua===undefined)o.ext.agua=0;
  if(D.gerador&&o.ext.comb===undefined){o.ext.comb=0;o.ext.ligado=true;}}
function desmontarBase(o){if(o.cols){for(const c of o.cols)colRemove(c);o.cols=null;}const i=FIRES.findIndex(f=>f.poste===o);if(i>=0)FIRES.splice(i,1);}
/* ---------- interação ---------- */
function baseInter(tryIt){for(const o of OB){const D=OBRAS[o.tipo];if(!(D.horta||D.coletor||D.gerador)||Math.abs(o.x-P.x)>5||Math.abs(o.z-P.z)>5)continue;
  // mira o ponto da peça mais perto de você (a horta é comprida)
  const c=Math.cos(o.yaw),s=Math.sin(o.yaw),dx=P.x-o.x,dz=P.z-o.z,lx=clamp(dx*c-dz*s,-D.hw,D.hw),lz=clamp(dx*s+dz*c,-D.hd,D.hd);
  tryIt({k:'baseObra',o},o.x+lx*c+lz*s,o.z-lx*s+lz*c,1.7,1.4,-0.6,o.y);}}
function baseTexto(o){const D=OBRAS[o.tipo];
  if(D.horta){const c=o.ext.cresce||0;return c>=1?{t:'Colher a horta',s:'milho, batata e sementes'}:{t:'Horta crescendo · '+Math.floor(c*100)+'%',s:G.chuva>0.3?'a chuva ajuda':'fica pronta em '+Math.ceil((1-c)*36/(G.chuva>0.3?2:1))+' h'};}
  if(D.coletor){const a=Math.floor(o.ext.agua||0),g=invCount('garrafa');return a<=0?{t:'Coletor de chuva vazio',s:'enche quando chove'}:{t:g?'Encher garrafas ('+Math.min(a,g)+')':'Beber água do coletor',s:a+' de 6 litros'};}
  if(D.gerador){const c=o.ext.comb||0,gas=invCount('gasolina');if(gas&&c<=0.6)return{t:'Abastecer o gerador',s:'1 galão · '+Math.round(c*100)+'% no tanque'};
    return{t:o.ext.ligado?'Desligar o gerador':'Ligar o gerador',s:c>0?Math.round(c*100)+'% no tanque · liga a luz à noite':'sem gasolina'};}
  return null;}
function baseInteragir(o){const D=OBRAS[o.tipo];
  if(D.horta){if((o.ext.cresce||0)<1){feed('Ainda não está pronta',true);return;}const L=colheita();for(const[id,n]of L)ganhar(id,n);o.ext.cresce=0;ganharXP(8);progresso('colheita');
    dica('horta','corpo','Colheu! A horta replanta sozinha. Milho e batata viram sopa na bancada, ou guarde nos baús para quem cozinha.');return;}
  if(D.coletor){const a=Math.floor(o.ext.agua||0);if(a<=0){feed('Vazio: enche com a chuva',true);return;}const g=invCount('garrafa');
    if(g){const k=Math.min(a,g);invRemove('garrafa',k);invAdd('agua',k);o.ext.agua-=k;feed('Encheu '+k+(k>1?' garrafas':' garrafa'));}else{P.sede=Math.min(100,P.sede+30);o.ext.agua-=1;feed('Bebeu água da chuva');}sfx('pegar');hudBarra();invRender();return;}
  if(D.gerador){const c=o.ext.comb||0;if(invCount('gasolina')&&c<=0.6){invRemove('gasolina',1);o.ext.comb=Math.min(1,c+0.5);o.ext.ligado=true;progresso('geradorLigou');feed('Gerador abastecido');sfx('motor',o.x,o.z,0.8);hudBarra();invRender();
      dica('gerador','corpo','Gerador ligado: à noite ele acende os postes de luz perto e dá choque no arame farpado. Um galão dura mais ou menos uma noite.');return;}
    o.ext.ligado=!o.ext.ligado;feed(o.ext.ligado?'Gerador ligado':'Gerador desligado');sfx('clique');}}
function colheita(){const L=[['milho',2+(Math.random()<0.5?1:0)],['batata',2+(Math.random()<0.5?1:0)]];if(Math.random()<0.35)L.push(['abobora',1]);if(Math.random()<0.6)L.push(['sementes',1]);return L;}
/* quem cozinha colhe as hortas maduras e guarda nos baús */
function colherHortas(s,dt){s.colheT=(s.colheT||0)-dt;if(s.colheT>0)return;s.colheT=4;
  for(const o of OB){if(o.tipo!=='horta'||(o.ext.cresce||0)<1||!sobBase(o.x,o.z,34))continue;const L=colheita();depositarBase(L);o.ext.cresce=0;
    if(!s.colheuDia||s.colheuDia!==G.dia){s.colheuDia=G.dia;toast('grupo',s.nome+' colheu a horta: '+nomesItens(L)+'.');}}}
/* ---------- arame farpado: segura e machuca (com choque se o gerador estiver ligado) ---------- */
function arameZumbi(z,ob,dt){const dx=z.x-ob.x,dz=z.z-ob.z,c=Math.cos(ob.yaw),s=Math.sin(ob.yaw),lx=dx*c-dz*s,lz=dx*s+dz*c;
  if(Math.abs(lx)>ob.col.hw+0.2||Math.abs(lz)>0.65)return 1;const el=ob.eletrico;
  z.hp-=(el?30:9)*dt;z.flash=Math.max(z.flash,0.05);ob.hp-=(el?1.5:3)*dt;if(ob.hp<=0)destruirObra(ob);
  if(el&&Math.random()<dt*6){faiscas(z.x,z.y+0.8,z.z);if(Math.random()<0.35)sfx('choque',z.x,z.z,0.6);if(z.st!=='atordoado'&&z.tipo!=='colosso'&&Math.random()<dt*3){const sg=lz>=0?1:-1;z.st='atordoado';z.t=0.7;z.kx=s*sg*2.5;z.kz=c*sg*2.5;}}
  if(z.hp<=0){z.hp=0.5;ferirZ(z,1,0,0,0);}return el?0.25:0.4;}
/* ---------- atualização ---------- */
let baseT=0,motorT=0;
function updateBase(dt){const chuva=G.chuva>0.3,noite=(E.n||0)>0.3;
  // gerador: gasta à noite, liga postes e arame
  let ger=null;for(const o of OB)if(OBRAS[o.tipo].gerador){const ativo=o.ext.ligado&&(o.ext.comb||0)>0,fi=energiaFiado(o);o.ativo=fi?ativo&&!!o.rodando:ativo&&noite;if(o.ativo&&o.tipo!=='geradorBase'&&!fi){o.ext.comb=Math.max(0,o.ext.comb-dt*0.5/240);if(o.ext.comb<=0){o.ativo=false;feed('O gerador ficou sem gasolina',true);}}if(o.ativo)ger=o;}
  if(ger){motorT-=dt;if(motorT<=0){motorT=0.95;sfx('motor',ger.x,ger.z,0.35);if(Math.random()<0.4)part(ger.x+0.36,ger.y+1.25,ger.z-0.18,0.1,0.8,0,1.6,0.12,[0.2,0.2,0.2,0.4],false,-0.3);}}
  for(const o of OB){if(energiaFiado(o)&&(o.tipo==='poste'||o.tipo==='arame')){}else if(o.tipo==='poste'){const lig=OB.some(g=>OBRAS[g.tipo].gerador&&g.ativo&&d2(g.x,g.z,o.x,o.z)<30*30);if(lig!==!!o.aceso){o.aceso=lig;const i=FIRES.findIndex(f=>f.poste===o);
        if(lig&&i<0)FIRES.push({x:o.x+Math.sin(o.yaw)*0.62,y:o.y+2.95,z:o.z+Math.cos(o.yaw)*0.62,poste:o,lamp:true,eletrica:true});else if(!lig&&i>=0)FIRES.splice(i,1);}}
    else if(o.tipo==='arame')o.eletrico=OB.some(g=>OBRAS[g.tipo].gerador&&g.ativo&&d2(g.x,g.z,o.x,o.z)<25*25);
    else if(o.tipo==='horta'){const r=(chuva?2:1)/(36*30)*1.0;o.ext.cresce=Math.min(1,(o.ext.cresce||0)+dt*r*(G.hora>=6&&G.hora<20?1:0.8)*climaHorta());}
    else if(o.tipo==='coletor'&&chuva)o.ext.agua=Math.min(6,(o.ext.agua||0)+dt*0.05*Math.min(1,G.chuva*1.3));}
  // alarme de latas
  baseT-=dt;if(baseT<=0){baseT=0.25;for(const o of OB){if(o.tipo!=='latas')continue;o.cd=(o.cd||0)-0.25;if(o.cd>0)continue;
      for(const z of Z){if(!z.vivo||Math.abs(z.x-o.x)>2.2||Math.abs(z.z-o.z)>2.2)continue;const dx=z.x-o.x,dz=z.z-o.z,c=Math.cos(o.yaw),s=Math.sin(o.yaw),lx=dx*c-dz*s,lz=dx*s+dz*c;
        if(Math.abs(lx)<1.6&&Math.abs(lz)<0.7){o.cd=8;sfx('latas',o.x,o.z,1);o.balanca=1.2;const d=Math.round(Math.hypot(o.x-P.x,o.z-P.z));
          if(d<120)toast('alerta','Latas tilintando a '+direcao(o.x-P.x,o.z-P.z)+' ('+d+' m): tem zumbi chegando por lá.');
          for(const sv of SOBREV)if(sv.st==='base'&&sv.tarefa==='vigiar')sv.atkT=Math.min(sv.atkT,0.2);break;}}}}
  for(const o of OB)if(o.balanca>0)o.balanca=Math.max(0,o.balanca-dt);}
/* ---------- desenho das partes que mudam ---------- */
const _MBA=new Float32Array(16),_MBB=new Float32Array(16);
function desenharBase(Pg){for(const o of OB){if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>90*90)continue;
  if(o.tipo==='horta'){const c=o.ext.cresce||0,m=c>=1?MESH.obra.hortaMadura:MESH.obra.hortaBroto,k=c>=1?1:0.5+0.5*c,cs=Math.cos(o.yaw),sn=Math.sin(o.yaw);
    for(let i=0;i<6;i++){const lx=(i%2?0.45:-0.45),lz=-0.95+Math.floor(i/2)*0.95,x=o.x+lx*cs+lz*sn,z=o.z-lx*sn+lz*cs;trs(_MBA,x,o.y+0.22,z,0,o.yaw+i*1.7,0,k,k,k);drawStat(Pg,m,_MBA);}}
  else if(o.tipo==='poste'&&o.aceso){trs(_MBA,o.x,o.y,o.z,0,o.yaw,0,1,1,1);drawStat(Pg,MESH.obra.posteLuz,_MBA);}}}
function bbBase(){const n=E.n||0;for(const o of OB){if(o.tipo==='poste'&&o.aceso){const x=o.x+Math.sin(o.yaw)*0.62,z=o.z+Math.cos(o.yaw)*0.62;bb(x,o.y+2.93,z,0.5,1,0.92,0.7,0.5*n);bb(x,o.y+2.5,z,3.2,1,0.85,0.6,0.07*n);}
  if(o.tipo==='arame'&&o.eletrico&&Math.random()<0.04){const t=Math.random()*2.6-1.3,c=Math.cos(o.yaw),s=Math.sin(o.yaw);bb(o.x+t*c,o.y+0.3+Math.random()*0.64,o.z-t*s,0.08,0.6,0.8,1,0.8);}}}
/* ---------- dicas na primeira vez que constrói cada peça ---------- */
const BASE_DICAS={horta:'Horta plantada. Ela cresce sozinha (a chuva ajuda) e fica pronta em mais ou menos um dia e meio. Aperte E perto dela para ver ou colher.',
  coletor:'Coletor de chuva pronto. Quando chover ele enche: aperte E para encher suas garrafas vazias ou beber ali mesmo.',
  torreVigia:'Torre de vigia pronta. Suba pela escada: lá de cima se enxerga longe e zumbi não alcança. Quem tem a tarefa vigiar fica lá em cima e atira de mais longe.',
  arame:'Arame farpado: segura e machuca os zumbis que passam. Com um gerador ligado a até 25 m, dá choque e derruba.',
  latas:'Alarme de latas: quando um zumbi passa por ele, as latas tilintam e você fica sabendo de que lado ele vem.',
  gerador:'Gerador pronto. Abasteça com um galão de gasolina (E). À noite ele acende os postes de luz e eletrifica o arame farpado por perto.',
  poste:'Poste de luz: acende sozinho à noite se tiver um gerador ligado a até 30 m.'};
function baseColocada(o){if(o.tipo==='torreVigia')progresso('obraTorre');const t=BASE_DICAS[o.tipo];if(t)dica('obra_'+o.tipo,'corpo',t);}
