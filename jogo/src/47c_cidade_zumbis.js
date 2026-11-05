/* ================= zumbis na cidade: tipos urbanos, rotas por portas e escadas, infestação pelo relógio, hordas ================= */
Object.assign(ZS,{emboscada:{hp:90,vaga:0.5,caca:3.3,dano:15,alcance:1.5,r:0.32,malha:'walker'},elite:{hp:700,vaga:0.8,caca:2.7,dano:26,alcance:1.85,r:0.46,obra:2.5,malha:'brute'},
  sentinela:{hp:150,vaga:0.6,caca:2.9,dano:15,alcance:1.6,r:0.36,malha:'walker'}});
Object.assign(ZP,{emboscada:ZP.runner,elite:ZP.brute,sentinela:{lean:0.06,arm:0.25,arm2:0.3,spread:0.04,leg:0.4,sway:0.5,tilt:0.04}});
/* ---------- sentinelas: ficam paradas guardando lugares importantes (porta trancada ou com alarme, gerador, plataforma do metrô) ---------- */
function gerarPostos(){CID.postos=[];const vistos=new Set(),add=(x,y,z,yaw,nome)=>CID.postos.push({id:CID.postos.length,x,y,z,yaw,nome,zz:null});
  for(const d of CID.portas){if(!(d.chave||d.alarme||d.tipo==='eletronica'))continue;const k=(d.p?d.p.id:'m')+'_'+d.f;if(vistos.has(k))continue;vistos.add(k);
    const lado=d.sA==='fora'?d.nB:d.sB==='fora'?d.nA:(d.sA&&d.sA.tipo==='corredor'?d.nA:d.nB);const dx=lado.x-d.x,dz=lado.z-d.z,l=Math.hypot(dx,dz)||1;
    add(lado.x+dx/l*0.6,lado.y,lado.z+dz/l*0.6,Math.atan2(-dx,-dz),d.p?d.p.nome:'metrô');}
  for(const p of CID.predios)if(p.gerador){const w=pw(p,p.gerador.u,p.gerador.v-1.4);add(w[0],p.gerador.y,w[1],p.yaw+Math.PI,p.nome);}
  for(const s of CID.metro.partes)if(/Plataforma/.test(s.nome))add(s.x+1.5,s.y,s.z+1.0,Math.PI,'metrô');}   // fora da linha das colunas
/* uma sentinela por posto, que nasce quando o jogador se aproxima (fora da vista) e só volta um dia depois de morta */
function updatePostos(){if(!CID.postos||!G.cid)return;G.cid.postos=G.cid.postos||{};G.cid.celasZ=G.cid.celasZ||{};
  for(const p of CID.predios){if(p.tipo!=='policia'||G.cid.celasZ[p.id])continue;const d=Math.hypot((p.x0+p.x1)/2-P.x,(p.z0+p.z1)/2-P.z);if(d>40)continue;
    const s=(p.salas[0]||[]).find(q=>q.tipo==='celas');if(!s)continue;G.cid.celasZ[p.id]=1;
    for(let i=0;i<3;i++){const w=pw(p,s.u0+0.7+(s.u1-s.u0-1.4)*(i/2),s.v0+(s.v1-s.v0)*0.45);const z=criarZ(i===2?'brute':'walker',w[0],w[1],{y:s.y,cidade:true,hx:w[0],hz:w[1]});if(z){z.st='dorme';z.preso=true;}}}
  for(const q of CID.postos){if(q.zz&&q.zz.vivo&&Z.includes(q.zz))continue;q.zz=null;const morta=G.cid.postos[q.id];if(morta!==undefined&&(G.tm||0)-morta<1440)continue;
    const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<22||d>70||vistoPeloJogador(q.x,q.y,q.z))continue;
    const z=criarZ('sentinela',q.x,q.z,{y:q.y,cidade:true,hx:q.x,hz:q.z,hy:q.y});if(!z)continue;z.st='guarda';z.posto=q;z.yaw0=q.yaw;z.ch.yaw=q.yaw;z.tint=[0.78,0.84,0.95];q.zz=z;}}

/* ---------- rotas (Dijkstra nos nós de portas, salas, corredores e escadas; na rua anda reto) ---------- */
let NOS_FORA=null;
function zonaDe(x,y,z){return emPredios(x,z,4)?salaEm(x,y+0.3,z):null;}
function navRota(x0,y0,z0,x1,y1,z1){const s0=zonaDe(x0,y0,z0),s1=zonaDe(x1,y1,z1);if(s0===s1&&!(s0&&s0.tipo==='escada'))return null;
  if(!NOS_FORA)NOS_FORA=CID.nos.filter(n=>n.sala==='fora');
  const custo0=n=>Math.hypot(n.x-x0,n.z-z0)+Math.abs(n.y-y0)*6,custo1=n=>Math.hypot(n.x-x1,n.z-z1)+Math.abs(n.y-y1)*6;   // altura pesa muito
  // escada não é convexa (lances e divisória): lá só valem os nós por perto que se enxergam em linha reta
  const fontes=s0?(s0.tipo==='escada'?nosEscada(s0,x0,y0,z0,custo0):(s0.nos||[])):NOS_FORA,alvos=new Set(s1?(s1.tipo==='escada'?nosEscada(s1,x1,y1,z1,custo1):(s1.nos||[])):NOS_FORA);if(!fontes.length||!alvos.size)return null;
  // A*: prioridade = custo até aqui + distância em linha reta até o alvo (nunca superestima)
  const N=CID.nos.length,dist=new Float64Array(N).fill(1e18),ant=new Int32Array(N).fill(-1),feito=new Uint8Array(N),fila=[],hh=n=>Math.hypot(n.x-x1,n.z-z1);
  for(const n of fontes){const c=custo0(n);if(c<dist[n.id]){dist[n.id]=c;heapPush(fila,c+hh(n),n);}}
  let fim=null,melhor=1e18;
  // na rua anda reto: de qualquer ponto de fora, só interessa ir direto às entradas do prédio (ou boca do metrô) onde está o alvo
  const pA=s1&&s1.p,foraAlvo=!s1?[]:NOS_FORA.filter(m=>pA?(m.entrada===pA||(m.janela&&m.janela.p===pA)):(s1.metro?!!m.boca:false));
  const relaxa=(n,c,m,w)=>{if(feito[m.id])return;let cw=w;if(m.porta&&n.porta===m.porta&&portaFechada(m.porta))cw+=m.porta.estado==='travada'?14:6;
      if(m.janela&&n.janela===m.janela&&janelaTapada(m.janela))return;
      if(m.passarela&&n.passarela===m.passarela&&m.passarela.quebrada)return;
      if(m.sala&&m.sala.semPiso)return;                                     // poço do elevador sem chão: ninguém anda por ali
      if(m.entulho&&n.entulho===m.entulho&&m.entulho.ativo)return;           // lance tomado por entulho
      const nc=c+cw;if(nc<dist[m.id]){dist[m.id]=nc;ant[m.id]=n.id;heapPush(fila,nc+hh(m),m);}};
  while(fila.length){const[f,n]=heapPop(fila);
    if(feito[n.id])continue;feito[n.id]=1;if(f>=melhor)break;const c=dist[n.id];
    if(alvos.has(n)){const tot=c+hh(n)+Math.abs(n.y-y1)*6;if(tot<melhor){melhor=tot;fim=n;}}
    for(const[m,w]of n.viz)relaxa(n,c,m,w);
    if(n.sala==='fora')for(const m of foraAlvo)if(m!==n)relaxa(n,c,m,Math.hypot(m.x-n.x,m.z-n.z)*1.15);}
  if(!fim)return null;const out=[];for(let id=fim.id;id>=0;id=ant[id])out.push(CID.nos[id]);out.reverse();return out;}
/* nós da escada que dá para alcançar em linha reta de (x,y,z): de qualquer andar do mesmo prédio, porque o lance de cima de um andar
   já fica na zona do andar seguinte; se nenhum se enxerga, fica o mais perto */
function nosEscada(s,x,y,z,custo){const out=[];
  for(const n of CID.nos){if(Math.abs(n.y-y)>1.3||Math.abs(n.x-x)>3.5||Math.abs(n.z-z)>3.5||!n.sala||n.sala==='fora'||n.sala.p!==s.p)continue;
    if(n.sala.semPiso||Math.hypot(n.x-x,n.z-z)>3.5||!trechoLivre(x,y,z,n.x,n.y,n.z))continue;out.push(n);}
  if(out.length)return out;let b=null,bd=1e9;for(const n of s.nos||[]){const d=custo(n);if(d<bd){bd=d;b=n;}}return b?[b]:[];}
function heapPush(h,c,n){h.push([c,n]);let i=h.length-1;while(i>0){const q=(i-1)>>1;if(h[q][0]<=h[i][0])break;const t=h[q];h[q]=h[i];h[i]=t;i=q;}}
function heapPop(h){const top=h[0],last=h.pop();if(h.length){h[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m===i)break;const t=h[m];h[m]=h[i];h[i]=t;i=m;}}return top;}
/* próximo ponto de passagem do zumbi até (x,y,z); refaz a rota quando a zona dele ou do alvo muda */
function navProximo(z,x,y,zz){if(!emPredios(z.x,z.z,6)&&!emPredios(x,zz,6))return null;
  const sa=z.zona,sb=zonaDe(x,y,zz);if(sa===sb&&!(sa&&sa.tipo==='escada')){z.rota=null;return null;}
  const mudou=z.rotaA!==sa||z.rotaB!==sb;
  if(mudou||(G.t>(z.rotaT||0)&&(z.rota||G.t>(z.rotaFalha||0)))){z.rota=navRota(z.x,z.y,z.z,x,y,zz);z.rotaI=0;z.rotaA=sa;z.rotaB=sb;z.rotaT=G.t+3;if(!z.rota)z.rotaFalha=G.t+2;}
  const r=z.rota;if(!r)return null;
  while(z.rotaI<r.length){const n=r[z.rotaI],m=r[z.rotaI+1],dn=Math.hypot(n.x-z.x,n.z-z.z);
    // dentro de prédio, só corta caminho para o nó seguinte se a linha até ele estiver livre (ponta da divisória da escada, batente de porta);
    // senão vai até o nó de verdade (no máximo 1,5 s tentando, para nunca travar)
    const livre=()=>!z.zona||!m||trechoLivre(z.x,z.y,z.z,m.x,m.y,m.z);
    if(dn<0.7&&Math.abs(n.y-z.y)<1.3){if(dn>0.25&&!livre()){if(z.noI!==z.rotaI||z.noR!==r){z.noI=z.rotaI;z.noR=r;z.noT=G.t;}if(G.t-z.noT<1.5)break;}z.rotaI++;continue;}
    // já passou do nó (está mais perto do seguinte do que o nó está dele, no mesmo nível): pula
    if(m&&Math.abs(m.y-z.y)<1.6&&Math.hypot(m.x-z.x,m.z-z.z)+Math.abs(m.y-z.y)<Math.hypot(m.x-n.x,m.z-n.z)+Math.abs(m.y-n.y)-0.2&&livre()){z.rotaI++;continue;}break;}
  if(z.rotaI>=r.length)return null;
  // janela quebrada: pula para o outro lado (demora um pouco)
  {const n=r[z.rotaI],a=r[z.rotaI-1];if(n.janela&&a&&a.janela===n.janela&&Math.hypot(a.x-z.x,a.z-z.z)<1.1){z.pula=z.pula||{t:0.9,x:n.x,y:n.y,z:n.z,j:n.janela};}}
  // pula o nó se o próximo já está na mesma zona e perto em linha reta (rua aberta)
  return r[z.rotaI];}
/* linha entre dois pontos livre de paredes e móveis na altura dos pés (amostra a cada 0,3 m) */
function trechoLivre(x0,y0,z0,x1,y1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/0.3));
  for(let i=1;i<n;i++){const k=i/n;if(bloqueadoAlto(x0+(x1-x0)*k,z0+(z1-z0)*k,0.2,y0+(y1-y0)*k+0.1))return false;}return true;}

/* ponto dentro de uma área vedada de algum prédio (poço do elevador) */
function vedadoEm2(x,z){for(const p of CID.predios){if(!p.vedado||x<p.x0||x>p.x1||z<p.z0||z>p.z1)continue;const l=plc(p,x,z);if(vedadoEm(p,l[0],l[1],0.3))return true;}return false;}
/* ---------- infestação: quantos zumbis a cidade sustenta conforme a hora ---------- */
function nivelInfestacao(h){if(h>=6.5&&h<16)return 0.12;if(h>=16&&h<18)return lerp(0.12,0.3,(h-16)/2);if(h>=18&&h<20.5)return lerp(0.3,1,(h-18)/2.5);if(h>=20.5||h<4.5)return 1;return lerp(1,0.12,(h-4.5)/2);}
const DIF_CID={facil:0.7,normal:1,dificil:1.35};
let infT=0;
const SALAS_NINHO=new Set(['deposito','lixo','banheiro','estoque','garagem','pecas','deposito_med','gerador','apartamento','escritorio','enfermaria','laboratorio','corredor',
  'quarto','sala_casa','cozinha_casa','lavabo','quarto_hotel','quarto_luxo','suite','restaurante','cozinha','lavanderia','escritorio_pol','vestiario','galpao','farm_estoque','adega','cobertura','recepcao_pol']);
function pontosRua(){if(CID.pontosRua)return CID.pontosRua;const out=[];
  for(const e of RUAS_EW)for(let x=CIDADE.x0+8;x<CIDADE.x1-6;x+=12)out.push([x,e.z+(Math.random()-0.5)*e.a]);
  for(const n of RUAS_NS)for(let z=CIDADE.z0+8;z<CIDADE.z1-6;z+=12)out.push([n.x+(Math.random()-0.5)*n.a,z]);
  CID.pontosRua=out.filter(p=>!pointBlocked(p[0],p[1],0.6));return CID.pontosRua;}
function predioBase(p){return OB.some(o=>(o.tipo==='bau'||o.tipo==='cama'||o.tipo==='lamparina')&&o.x>p.x0-1&&o.x<p.x1+1&&o.z>p.z0-1&&o.z<p.z1+1);}
function vistoPeloJogador(x,y,z){const dx=x-cam.pos[0],dz=z-cam.pos[2],d=Math.hypot(dx,dz);if(d>45)return false;const f=(dx*cam.fwd[0]+dz*cam.fwd[2])/(d||1);return f>0.35;}
function tipoCidade(noite,dentro,R,risco,rb){let r=R();rb=rb||1;
  if(rb>1.1&&noite&&r<0.05)return'elite';if(rb>1.1&&r<0.12)return'brute';if(rb<0.9&&r<0.5)return dentro&&r<0.15?'emboscada':'walker';
  if(risco){if(noite)return r<0.07?'elite':r<0.3?'runner':r<0.42?'brute':r<0.6?'emboscada':'walker';return r<0.45?'emboscada':r<0.55?'brute':'walker';}
  if(noite)return r<0.02?'elite':r<0.24?'runner':r<0.3?'brute':r<0.35?'screamer':'walker';
  if(dentro&&r<0.32)return'emboscada';return r<0.05?'brute':r<0.1?'screamer':'walker';}
function nascerCidade(noite){const pts=[],Pz=salaEm(P.x,P.y+0.3,P.z),R=Math.random;
  // dentro dos prédios (salas escuras) e no metrô
  for(const s of CID.salas){if(!(s.metro||SALAS_NINHO.has(s.tipo))||s.poco||(s.p&&s.p.rural))continue;if(s===Pz)continue;const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<16||d>75)continue;
    if(s.p&&predioBase(s.p))continue;if(s.p&&Pz&&Pz.p===s.p&&Math.abs(s.y-P.y)<2&&d<22)continue;pts.push([s,d]);if(s.p&&s.p.risco)pts.push([s,d]);}
  // na rua: só à noite e fora da vista
  if(noite||R()<0.3)for(const p of pontosRua()){const d=Math.hypot(p[0]-P.x,p[1]-P.z);if(d<22||d>70||vistoPeloJogador(p[0],0,p[1]))continue;pts.push([{rua:true,x:p[0],z:p[1]},d]);}
  if(!pts.length)return null;const[a]=pts[Math.floor(R()*pts.length)];
  let x,y,z;if(a.rua){x=a.x;z=a.z;y=chaoEm(x,z,1);}else if(a.metro){x=a.x0+1+R()*(a.x1-a.x0-2);z=a.z0+0.6+R()*(a.z1-a.z0-1.2);y=a.y;}else{const u=a.u0+0.5+R()*(a.u1-a.u0-1),v=a.v0+0.5+R()*(a.v1-a.v0-1),w=pw(a.p,u,v);x=w[0];z=w[1];y=a.y;}
  if(bloqueadoAlto(x,z,0.4,y)||Math.abs(chaoEm(x,z,y+0.3)-y)>0.35||vedadoEm2(x,z))return null;
  const br=bairroEm(x,z),dentro=!a.rua,tipo=tipoCidade2(tipoCidade(noite,dentro,R,!!(a.p&&a.p.risco),br?br.risco:1),noite,dentro,a),zz=criarZ(tipo,x,z,{y,cidade:true,hx:x,hz:z});if(!zz)return null;
  if(tipo==='emboscada'){zz.st='dorme';}else if(noite&&dentro&&R()<0.6){zz.st='alerta';const q=pontosRua()[Math.floor(R()*pontosRua().length)];zz.ax=q[0];zz.az=q[1];zz.ay=0;zz.sai=true;}
  if(tipo==='elite')zz.tint=[0.72,0.55,0.55];return zz;}
function updateInfestacao(dt){infT-=dt;if(infT>0)return;infT=1.2;const naCidade=distCidade(P.x,P.z)<55;if(naCidade&&P.alive)updatePostos();
  let n=0;for(const z of Z)if(z.cidade&&z.vivo)n++;
  // longe demais: some quem ninguém vê
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(!z.cidade||!z.vivo)continue;const d=Math.hypot(z.x-P.x,z.z-P.z);
    if((d>110||(!naCidade&&d>60))&&!vistoPeloJogador(z.x,z.y,z.z)){Z.splice(i,1);n--;}
    else if(z.recolher&&z.st!=='caca'&&z.st!=='golpe'&&d>24&&z.zona&&!z.zona.metro&&z.zona.tipo!=='telhado'&&!vistoPeloJogador(z.x,z.y,z.z)){Z.splice(i,1);n--;}}
  if(!naCidade||!P.alive)return;
  const brP=bairroEm(P.x,P.z),inf=Math.min(1,nivelInfestacao(G.hora)+(G.cid&&G.cid.surto?0.5:0)),alvo=Math.round((5+18*inf)*(DIF_CID[cfg.dif]||1)*(brP?brP.risco:1));G.cid.inf=inf;
  if(n<alvo){const z=nascerCidade(inf>0.5);if(z&&n===0&&inf>0.5)dica('cidadeNoite','alerta','A cidade acordou. Feche portas, apague a luz e evite as ruas abertas.');}
  // amanhecendo: parte dos que estão na rua volta para dentro dos prédios
  if(inf<0.6&&G.hora>4&&G.hora<8)for(const z of Z)if(z.cidade&&z.vivo&&!z.recolher&&!z.zona&&z.st!=='caca'&&Math.random()<0.04){z.recolher=true;
    let best=null,bd=1e9;for(const p of CID.predios)for(const e of p.entradas||[]){const d=Math.hypot(e.x-z.x,e.z-z.z);if(d<bd){bd=d;best=e;}}
    if(best){z.st='alerta';z.ax=best.x;z.az=best.z;z.ay=best.y;}}}

/* ---------- hordas: grupos que atravessam a cidade pelas ruas à noite; longe, só a posição do grupo ---------- */
function rotaRuas(){if(CID.grafoRua)return CID.grafoRua;const pts=[];
  for(const e of RUAS_EW)for(const n of RUAS_NS)pts.push({x:n.x,z:e.z,viz:[]});
  for(const e of RUAS_EW){pts.push({x:CIDADE.x0+6,z:e.z,viz:[]});pts.push({x:CIDADE.x1-6,z:e.z,viz:[]});}
  for(const a of pts)for(const b of pts){if(a===b)continue;if((Math.abs(a.z-b.z)<0.1||Math.abs(a.x-b.x)<0.1)&&Math.hypot(a.x-b.x,a.z-b.z)<56)a.viz.push(b);}
  CID.grafoRua=pts;return pts;}
function hordaNova(){const pts=rotaRuas(),bordas=pts.filter(p=>p.x<CIDADE.x0+10||p.x>CIDADE.x1-10);let ini=bordas[Math.floor(Math.random()*bordas.length)];
  if(Math.hypot(ini.x-P.x,ini.z-P.z)<55)ini=bordas.sort((a,b)=>Math.hypot(b.x-P.x,b.z-P.z)-Math.hypot(a.x-P.x,a.z-P.z))[0];
  const h={x:ini.x,z:ini.z,de:ini,para:ini.viz[Math.floor(Math.random()*ini.viz.length)],n:8+Math.floor(Math.random()*6),membros:[],t:0,parado:0};G.cid.hordas.push(h);return h;}
const tamHorda=h=>h.membros.length?h.membros.filter(z=>z.vivo).length:h.n;
function noRua(x,z){let b=null,bd=1e9;for(const p of rotaRuas()){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p;}}return b;}
/* próximo cruzamento: com barulho para investigar, o vizinho que mais aproxima dele; sem, qualquer um (sem voltar) */
function rumoHorda(h,de){if(h.alvoRuido){if(de===h.alvoRuido){h.alvoRuido=null;h.investiga=G.t+20;}else{let b=null,bd=1e9;for(const q of de.viz){const d=Math.hypot(q.x-h.alvoRuido.x,q.z-h.alvoRuido.z);if(d<bd){bd=d;b=q;}}if(b)return b;}}
  const op=de.viz.filter(q=>q!==h.de);return op[Math.floor(Math.random()*op.length)]||de.viz[0];}
/* uma horda grande que ouve um barulho manda parte do grupo ver o que é; o resto segue o caminho */
function dividirHorda(h,alvo){const H=G.cid.hordas,t=tamHorda(h),k=Math.floor(t/2);if(k<4)return null;
  const h2={x:h.x,z:h.z,de:h.de,para:h.para,n:k,membros:[],t:0,parado:0,alvoRuido:alvo,semJuntar:G.t+45,filha:true};h.n=t-k;h.semJuntar=G.t+45;h.dividiu=G.t;
  if(h.membros.length){const vivos=h.membros.filter(z=>z.vivo);h2.membros=vivos.slice(vivos.length-k);h.membros=vivos.slice(0,vivos.length-k);for(const z of h2.membros)z.horda=h2;}
  // o grupo que sai vai direto para o cruzamento mais perto do barulho
  if(h.para&&h.para!==alvo&&!h.para.viz.includes(alvo)&&h.de&&Math.hypot(h.de.x-alvo.x,h.de.z-alvo.z)<Math.hypot(h.para.x-alvo.x,h.para.z-alvo.z)){h2.para=h.de;h2.de=h.para;}
  H.push(h2);if(Math.hypot(h.x-P.x,h.z-P.z)<60)feed('Parte da horda se separou atrás do barulho',true);return h2;}
/* duas hordas que se cruzam viram uma só */
function juntarHordas(){const H=G.cid.hordas;for(let i=0;i<H.length;i++)for(let j=H.length-1;j>i;j--){const a=H[i],b=H[j];if((a.semJuntar||0)>G.t||(b.semJuntar||0)>G.t)continue;
    if(Math.hypot(a.x-b.x,a.z-b.z)>7)continue;const ta=tamHorda(a),tb=tamHorda(b);if(ta+tb>26)continue;
    a.n=ta+tb;if(b.membros.length){if(!a.membros.length)a.extra=(a.extra||0)+ta;for(const z of b.membros)if(z.vivo){z.horda=a;a.membros.push(z);}}else if(a.membros.length){/* b ainda é só número: materializa junto na próxima vez */a.extra=(a.extra||0)+tb;}
    if(!a.alvoRuido&&b.alvoRuido)a.alvoRuido=b.alvoRuido;H.splice(j,1);if(Math.hypot(a.x-P.x,a.z-P.z)<60)feed('Duas hordas se juntaram',true);}}
function updateHordas(dt){if(!G.cid)return;G.cid.hordas=G.cid.hordas||[];const H=G.cid.hordas,noite=nivelInfestacao(G.hora)>0.6;
  if(noite&&H.length<(G.cid.inf>0.95?2:1)&&distCidade(P.x,P.z)<80&&Math.random()<dt*0.01)hordaNova();
  for(let i=H.length-1;i>=0;i--){const h=H[i];if(!h.para){H.splice(i,1);continue;}
    // barulho perto: grupo grande se divide (uma parte vai ver); grupo pequeno muda de rumo inteiro
    for(const nz of NOISE){if(nz.vistoH&&nz.vistoH.has(h))continue;if(Math.hypot(nz.x-h.x,nz.z-h.z)>=nz.r*1.5)continue;(nz.vistoH=nz.vistoH||new Set()).add(h);
      const b=noRua(nz.x,nz.z);if(!b||b===h.alvoRuido)continue;
      if(tamHorda(h)>=10&&!h.filha&&G.t-(h.dividiu||-1e9)>60&&H.length<5)dividirHorda(h,b);else h.alvoRuido=b;}
    const dx=h.para.x-h.x,dz=h.para.z-h.z,d=Math.hypot(dx,dz),v=0.9;
    // membros de verdade só perto do jogador
    const perto=Math.hypot(h.x-P.x,h.z-P.z)<70;
    if(perto&&(!h.membros.length||h.extra)){const q=h.membros.length?h.extra:h.n;h.extra=0;for(let k=0;k<q;k++){const a=k/q*6.283,r=1.5+Math.random()*3.5,z=criarZ(Math.random()<0.15?'runner':Math.random()<0.08?'brute':'walker',h.x+Math.cos(a)*r,h.z+Math.sin(a)*r,{cidade:true,horda:h,y:0});if(z){z.st='marcha';h.membros.push(z);}}}
    if(!perto&&h.membros.length){h.n=h.membros.filter(z=>z.vivo).length+(h.extra||0);h.extra=0;for(const z of h.membros){const j=Z.indexOf(z);if(j>=0&&!vistoPeloJogador(z.x,z.y,z.z))Z.splice(j,1);}h.membros=[];}
    h.membros=h.membros.filter(z=>z.vivo&&Z.includes(z));if(perto&&h.membros.length===0&&h.n>0&&h.t>5){H.splice(i,1);continue;}
    // anda até o próximo cruzamento; travado muito tempo, escolhe outro caminho
    let avanca=true;if(h.membros.length){let mv=0;for(const z of h.membros)mv+=Math.hypot(z.x-h.x,z.z-h.z);mv/=h.membros.length;if(mv>8)avanca=false;}
    if(avanca&&d>1){h.x+=dx/d*v*dt;h.z+=dz/d*v*dt;h.parado=0;}else h.parado+=dt;
    if(d<=1.5||h.parado>25){const de=h.para,nx=rumoHorda(h,de);h.de=de;h.parado=0;h.para=nx;if(!noite&&!h.alvoRuido&&Math.random()<0.4){h.para=null;}}
    h.t+=dt;for(const z of h.membros)if(z.st==='marcha'||z.st==='vaga'){z.st='marcha';z.mx=h.x+(z.id%5-2)*1.3;z.mz=h.z+((z.id>>2)%5-2)*1.3;}}
  juntarHordas();}
/* luz e barulho de base chamam atenção à noite */
let atracaoT=0;
function updateAtracao(dt){atracaoT-=dt;if(atracaoT>0||!G.cid)return;atracaoT=9;if(nivelInfestacao(G.hora)<0.6)return;
  for(const f of FIRES){if(!dentroCidade(f.x,f.z,10))continue;const s=salaEm(f.x,f.y+0.3,f.z);const r=s&&s.tipo!=='telhado'&&s.tipo!=='sacada'?16:30;barulho(f.x,f.z,r,false,f.y);}}
/* linha de visão na cidade: parede e piso entre andares escondem o jogador (refeita 4 vezes por segundo por zumbi) */
function enxerga(z){z.losT=(z.losT||0)-0.016;if(z.losT>0)return z.los;z.losT=0.25;
  const x0=z.x,y0=z.y+1.5,z0=z.z,x1=P.x,y1=P.y+1.4,z1=P.z,d=Math.hypot(x1-x0,z1-z0);let ok=true;
  if(Math.abs(y1-y0)>2.6&&zonaDe(P.x,P.y,P.z)!==z.zona&&(z.zona||zonaDe(P.x,P.y,P.z)))ok=false;
  else for(let t=0.5;t<d-0.3;t+=0.45){const k=t/d,x=x0+(x1-x0)*k,y=y0+(y1-y0)*k,zz=z0+(z1-z0)*k,c=bloqueadoAlto(x,zz,0.04,y-1.2);
    if(c&&!c.tree&&!c.cont&&!c.movel&&!c.carro2&&!c.entulho&&!(c.porta&&c.porta.tipo==='grade')){ok=false;break;}}
  z.los=ok;return ok;}
/* janela com tábuas: ninguém passa */
function janelaTapada(j){return OB.some(o=>o.tipo==='tabuasJanela'&&o.ext&&o.ext.janela===j.id)||(typeof janelaPouso==='function'&&(!janelaPouso(j,true)||!janelaPouso(j,false)));}
/* surto: em algumas noites um prédio longe do jogador fica tomado (vira ninho até o amanhecer) */
function cidSurto(forcar){if(!G.cid||(!forcar&&Math.random()>0.3)||distCidade(P.x,P.z)>120)return;const ps=CID.predios.filter(p=>p.andares>1&&!p.rural&&Math.hypot((p.x0+p.x1)/2-P.x,(p.z0+p.z1)/2-P.z)>30&&!predioBase(p));if(!ps.length)return;
  const p=ps[Math.floor(Math.random()*ps.length)];let n=0;for(const fl of p.salas)for(const s of fl||[]){if(n>=8||s.tipo==='telhado'||s.tipo==='escada'||Math.random()<0.5)continue;const z=criarZ(Math.random()<0.2?'runner':'walker',s.x,s.z,{y:s.y,cidade:true});if(z)n++;}
  if(n)toast('radio','...tem muita coisa se mexendo dentro do '+p.nome+'. Fique longe de lá esta noite.');}
