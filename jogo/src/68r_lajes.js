/* ================= Corrida das Lajes (v10.8.9) =================
   Himalaia (19/11/2026): "desafios, coisas para fazer" (o jogo não pode ser só matar zumbi). Uma corrida de parkour no
   Morro do Sabiá: a largada é na laje de uma casa com escada de marinheiro nos fundos e a chegada na bandeira quadriculada,
   doze lajes adiante. No meio: lajes coladas (a mais alta você sobe pulando de frente, a mais baixa você desce), as tábuas
   que atravessam os becos entre as fileiras e pulos por cima dos becos estreitos. Pisou no chão (beco, escada, rua, o
   Largo), perdeu. Cronômetro e medalhas como as outras corridas; o ouro dá o Tênis de corrida (só sai daqui): corre um
   pouco mais rápido, cansa menos correndo e amortece a queda.
   O caminho sai das próprias casas do morro (o mesmo em todo jogo): laje colada sobe até 2,5 m (o pulo vira escalada) e
   desce até 3,3 m (sem machucar); a tábua liga as fileiras; o pulo atravessa beco de 0,5 a 1,4 m entre lajes da mesma
   altura, sem mureta alta. Setas de spray amarelo nas lajes mostram o caminho. */
const LAJ={ok:false,R:null,C:null,ini:null,pts:null,malha:null,ctr:null,bandeira:null,pich:null,obras:[]};
const LAJ_CFG={max:12,min:8,orc:160000,obrasMax:4};
/* a casa cuja laje tem o ponto (x,z) na altura y */
function lajCasaPonto(x,z,y){let best=null,bd=0.8;for(const h of MOR.casas){const q=morroLocal(h,x,z);if(Math.abs(q[0])>h.W/2+0.12||Math.abs(q[1])>h.D/2+0.12)continue;const d=Math.abs(h.yTop-y);if(d<bd){bd=d;best=h;}}return best;}
/* puxadinho em cima da laje (2,85 m de parede) fecha a passagem: essas casas ficam fora do caminho */
function lajUsavel(h){return!!h&&!h.puxa;}
const lajBaixa=h=>h.mureta<=0.6;   // mureta baixa (degrau) ou nenhuma: dá para sair correndo e pular dali
/* um ponto na beira da laje: lado 'x+','x-' (as paredes do lado) ou 'z+','z-' (fundos e frente), na coordenada c do mundo (z nos lados x, x nos lados z) */
function lajBeira(h,lado,c){const sg=lado[1]==='+'?1:-1;let u,v;if(lado[0]==='x'){u=sg*h.W/2;v=(c-h.cz+u*h.s)/h.c;}else{v=sg*h.D/2;u=(c-h.cx-v*h.s)/h.c;}const w=morroPw(h,u,v);return{u,v,x:w[0],z:w[1],lado};}
/* a ponta de uma tábua cabe ali (fora da caixa-d'água, da escada, da tralha e de outra tábua)? */
function lajPontaLivre(h,b){const m=0.42;if(b.lado[0]==='x'){if(Math.abs(b.v)>h.D/2-0.6)return false;return b.u>0?h.livre(h.W/2-0.9,h.W/2-0.26,b.v-m,b.v+m):h.livre(-h.W/2+0.26,-h.W/2+0.9,b.v-m,b.v+m);}
  if(Math.abs(b.u)>h.W/2-0.6)return false;return b.v>0?h.livre(b.u-m,b.u+m,h.D/2-0.9,h.D/2-0.26):h.livre(b.u-m,b.u+m,-h.D/2+0.26,-h.D/2+0.9);}
/* o piso por baixo (chão ou degrau da escadinha) */
function lajPiso(x,z){let y=ground(x,z);for(const E of MOR.escadas)if(Math.abs(x-E.x)<=E.w/2+0.3&&z>=E.z0-0.3&&z<=E.z1+0.3)y=Math.max(y,E.yEm(z));return y;}
const lajNaEscada=(x,z)=>MOR.escadas.some(E=>Math.abs(x-E.x)<E.w/2+0.6&&z>E.z0-0.6&&z<E.z1+0.6);
/* uma tábua nova de p até q por cima do beco: procura, do meio para as pontas da faixa [c0,c1], um lugar com as duas pontas livres e o vão desimpedido */
function lajTabuaNova(p,lp,q,lq,c0,c1){const cm=(c0+c1)/2,perto=(x,z)=>MOR.tabuas.some(t=>Math.hypot((t.x0+t.x1)/2-x,(t.z0+t.z1)/2-z)<1.6)||LAJ.obras.some(o=>Math.hypot((o.p0.x+o.p1.x)/2-x,(o.p0.z+o.p1.z)/2-z)<1.6);
  for(let k=0;k<=Math.floor((c1-c0)/0.3);k++){const c=cm+(k%2?1:-1)*Math.ceil(k/2)*0.3;if(c<c0-1e-6||c>c1+1e-6)continue;
    const bp=lajBeira(p,lp,c),bq=lajBeira(q,lq,c);if(!lajPontaLivre(p,bp)||!lajPontaLivre(q,bq))continue;
    const dx=bq.x-bp.x,dz=bq.z-bp.z,G=Math.hypot(dx,dz);if(G<0.3)continue;const ux=dx/G,uz=dz/G;
    const p0={x:bp.x-ux*0.35,z:bp.z-uz*0.35,y:p.yTop+0.04},p1={x:bq.x+ux*0.35,z:bq.z+uz*0.35,y:q.yTop+0.04};if(perto((p0.x+p1.x)/2,(p0.z+p1.z)/2))continue;
    let ok=true;for(let d=0.2;d<=G-0.2+1e-6&&ok;d+=0.35){const y=p0.y+(p1.y-p0.y)*((d+0.35)/(G+0.7));const x=bp.x+ux*d,z=bp.z+uz*d;if(bloqueadoAlto(x,z,0.22,y+0.05)||y-lajPiso(x,z)<1.95)ok=false;}
    if(ok)return{p0,p1,G};}
  return null;}
/* as ligações de uma laje para outra:
   colada (o lado sem mureta: a mais alta até 2,5 m sobe pulando de frente, a mais baixa até 3,3 m desce);
   tábua que já existe; salto por cima do beco da mesma fileira (até 2 m; subindo, mais curto); descida por cima do beco
   entre as fileiras (pula da frente de uma laje para os fundos da de baixo, 0,8 a 2,8 m mais baixa);
   e, onde não dá para pular, uma tábua nova (pinguela sobre a escadinha ou rampa de tábua sobre o beco) */
function lajGrafo(){const E=new Map(),C=MOR.casas,add=(a,b,e)=>{if(!lajUsavel(a)||!lajUsavel(b)||a===b)return;const dy=b.yTop-a.yTop;if(!E.has(a))E.set(a,[]);E.get(a).push(Object.assign({a,b,dy,obra:0},e));};
  for(const a of C)if(a.vizD){const b=a.vizD,dy=b.yTop-a.yTop;if(dy<=2.5&&dy>=-3.3)add(a,b,{t:'colada'});if(dy>=-2.5&&dy<=3.3)add(b,a,{t:'colada'});}
  const ligadas=new Set();
  for(const t of MOR.tabuas){const a=lajCasaPonto(t.x0,t.z0,t.ya-0.04),b=lajCasaPonto(t.x1,t.z1,t.yb-0.04);if(!a||!b||a===b)continue;ligadas.add(a.id+'_'+b.id);ligadas.add(b.id+'_'+a.id);
    const p0={x:t.x0,z:t.z0,y:t.ya},p1={x:t.x1,z:t.z1,y:t.yb};add(a,b,{t:'tabua',p0,p1});add(b,a,{t:'tabua',p0:p1,p1:p0});}
  const fil=new Map();for(const h of C){if(!fil.has(h.fil))fil.set(h.fil,[]);fil.get(h.fil).push(h);}
  /* mesma fileira */
  for(const L of fil.values()){L.sort((p,q)=>p.cx-q.cx);for(let i=0;i+1<L.length;i++){const a=L[i],b=L[i+1];if(a.vizD===b||ligadas.has(a.id+'_'+b.id))continue;
    const ab=morroAabb(a.cx,a.cz,a.W,a.D,a.yaw),bb=morroAabb(b.cx,b.cz,b.W,b.D,b.yaw),G=bb[0]-ab[1];if(G<0.3||G>6.2)continue;
    const z0=Math.max(ab[2],bb[2])+0.6,z1=Math.min(ab[3],bb[3])-0.6;if(z1-z0<0.9)continue;
    let tb;for(const[p,q,sg]of[[a,b,1],[b,a,-1]]){const dy=q.yTop-p.yTop;let t=null;
      if(lajBaixa(p)&&(lajBaixa(q)||dy<=-1.2)){if(G<=2.0&&dy<=0.3&&dy>=-2.8)t='salto';else if(G<=1.5&&dy>0.3&&dy<=0.8)t='salto';else if(G<=0.95&&dy>0.8&&dy<=2.5)t='escala';}
      if(t){const x=(ab[1]+bb[0])/2,y=Math.max(p.yTop,q.yTop)+0.5;let ok=true;for(let z=z0;z<=z1+1e-6;z+=0.4)if(bloqueadoAlto(x,z,0.2,y)){ok=false;break;}
        if(ok){add(p,q,{t,x,z0,z1,G,sg});continue;}}
      if(G>=1.0&&lajBaixa(p)&&lajBaixa(q)&&Math.abs(dy)<=0.6*(G+0.7)){if(tb===undefined)tb=lajTabuaNova(a,'x+',b,'x-',z0,z1);
        if(tb)add(p,q,{t:'pinguela',obra:1,p0:sg>0?tb.p0:tb.p1,p1:sg>0?tb.p1:tb.p0});}}}}
  /* entre fileiras: a de baixo (a, fileira f) e a de cima (b, fileira f+1) */
  for(const a of C)for(const b of C){if(b.fil!==a.fil+1||ligadas.has(a.id+'_'+b.id))continue;const ab=morroAabb(a.cx,a.cz,a.W,a.D,a.yaw),bb=morroAabb(b.cx,b.cz,b.W,b.D,b.yaw);
    const x0=Math.max(ab[0],bb[0])+0.7,x1=Math.min(ab[1],bb[1])-0.7,G=bb[2]-ab[3];if(x1-x0<0.4||G<0.6||G>3.6)continue;
    const dy=b.yTop-a.yTop;
    /* descida: da frente de b pulando para os fundos de a */
    if(dy>=0.8&&dy<=2.8&&G<=3.0&&lajBaixa(b)&&(lajBaixa(a)||dy>=1.2)){const z=(ab[3]+bb[2])/2,y=b.yTop+0.5;let ok=true;for(let x=x0;x<=x1+1e-6;x+=0.4)if(bloqueadoAlto(x,z,0.2,y)){ok=false;break;}
      if(ok)add(b,a,{t:'descida',x0,x1,z,G});}
    /* rampa de tábua (sobe e desce) */
    if(lajBaixa(a)&&lajBaixa(b)&&Math.abs(dy)<=2.6&&Math.abs(dy)<=1.0*(G+0.7)){const tb=lajTabuaNova(a,'z+',b,'z-',x0,x1);
      if(tb){add(a,b,{t:'rampa',obra:1,p0:tb.p0,p1:tb.p1});add(b,a,{t:'rampa',obra:1,p0:tb.p1,p1:tb.p0});}}}
  return E;}
const LAJ_PULA=new Set(['salto','escala','descida']),LAJ_TABUA=new Set(['tabua','pinguela','rampa']);
/* nota de um caminho: mais lajes, de tudo um pouco (pulo, tábua, subida, descida), mais chão andado e o mínimo de tábua nova */
function lajNota(path,edges){let len=0,obra=0,pul=0,tab=0,sob=0,des=0;for(const e of edges){len+=Math.hypot(e.b.cx-e.a.cx,e.b.cz-e.a.cz);if(e.obra)obra++;if(LAJ_PULA.has(e.t))pul++;if(LAJ_TABUA.has(e.t))tab++;if(e.dy>=0.75)sob++;if(e.dy<=-1.5)des++;}
  return path.length*5+Math.min(pul,4)*4+Math.min(tab,3)*4+Math.min(sob,3)*2+Math.min(des,3)*1.5+len*0.05-obra*3;}
/* o melhor caminho simples que começa numa casa com escada de marinheiro (é por ela que se sobe para a largada) */
function lajRota(){const E=lajGrafo(),K=LAJ_CFG;let best=null;const ini=MOR.casas.filter(h=>lajUsavel(h)&&h.escada&&E.has(h)),cota=Math.floor(K.orc/Math.max(1,ini.length));
  for(const h0 of ini){let orc=cota;const go=(h,path,edges,seen,obra)=>{if(--orc<0)return;if(path.length>=K.min){const s=lajNota(path,edges);if(!best||s>best.s+1e-9)best={s,path:path.slice(),edges:edges.slice()};}
      if(path.length>=K.max)return;for(const e of E.get(h)||[]){if(seen.has(e.b)||obra+e.obra>K.obrasMax)continue;seen.add(e.b);path.push(e.b);edges.push(e);go(e.b,path,edges,seen,obra+e.obra);path.pop();edges.pop();seen.delete(e.b);}};
    go(h0,[h0],[],new Set([h0]),0);}
  return best;}
/* um lugar livre na laje (sem caixa-d'água, antena, varal, tralha, chegada da escada ou ponta de tábua), o mais perto de (pu,pv) */
function lajLivre(h,pu,pv,m){m=m||0.45;let best=null,bd=1e9;
  for(let u=-h.W/2+0.7;u<=h.W/2-0.7+1e-6;u+=0.25)for(let v=-h.D/2+0.7;v<=h.D/2-0.7+1e-6;v+=0.25){if(!h.livre(u-m,u+m,v-m,v+m))continue;const d=(u-pu)**2+(v-pv)**2;if(d<bd){bd=d;best=[u,v];}}
  if(!best)return null;const w=morroPw(h,best[0],best[1]);return{x:w[0],z:w[1],y:h.yTop,u:best[0],v:best[1]};}
function lajMontar(){if(LAJ.ok||typeof MOR==='undefined'||!MOR.ok||!MOR.casas.length)return;
  const R=lajRota();if(!R)return;const H=R.path,h0=H[0],esc=h0.escada;
  const ini=lajLivre(h0,esc.u,h0.D/2-1.9);if(!ini)return;
  /* as tábuas novas do caminho: apoio de rampa (anda por cima) e a ponta ocupada nas duas lajes */
  for(const e of R.edges){if(!e.obra)continue;const{p0,p1}=e,L=Math.hypot(p1.x-p0.x,p1.z-p0.z);
    supAdd({t:'ram',x:(p0.x+p1.x)/2,z:(p0.z+p1.z)/2,hw:0.32,hd:L/2,yaw:Math.atan2(p1.x-p0.x,p1.z-p0.z),ya:p0.y,yb:p1.y,dono:'lajeTabua'});
    for(const[h,q]of[[e.a,p0],[e.b,p1]]){const l=morroLocal(h,q.x,q.z);h.ocup.push([l[0]-0.45,l[0]+0.45,l[1]-0.45,l[1]+0.45]);}
    const o={t:e.t,p0,p1,L};if(L>3.6){const xm=(p0.x+p1.x)/2,zm=(p0.z+p1.z)/2,g0=ground(xm,zm),y1=(p0.y+p1.y)/2-0.05;if(y1-g0>1.2&&!pointBlocked(xm,zm,0.12)&&!lajNaEscada(xm,zm)){o.poste={x:xm,z:zm,y0:g0-0.2,y1};colCircle(xm,zm,0.06,{solid:true,y0:g0-0.5,y1:y1-0.1,morro:true});}}
    LAJ.obras.push(o);}
  /* o ponto de cada laje: perto de onde sai a ligação seguinte (a ponta da tábua, a beira do pulo), senão no meio da laje */
  const pref=(h,e)=>{if(!e)return[0,0];
    if(LAJ_TABUA.has(e.t)){const q=e.p0,o=e.p1,L=Math.hypot(q.x-o.x,q.z-o.z)||1;return morroLocal(h,q.x+(q.x-o.x)/L*0.9,q.z+(q.z-o.z)/L*0.9);}
    if(e.t==='salto'||e.t==='escala'){const zm=(e.z0+e.z1)/2;return morroLocal(h,e.x-e.sg*(e.G/2+1.4),zm);}
    if(e.t==='descida'){const xm=(e.x0+e.x1)/2;return morroLocal(h,xm,e.z+e.G/2+1.4);}
    return[0,0];};
  const pts=[];for(let i=1;i<H.length;i++){const e=R.edges[i-1],h=H[i];
    if(LAJ_TABUA.has(e.t))pts.push({x:(e.p0.x+e.p1.x)/2,z:(e.p0.z+e.p1.z)/2,y:(e.p0.y+e.p1.y)/2-0.04,r:1.15,h:2.6,tabua:true,de:[e.p0.x,e.p0.z],para:[e.p1.x,e.p1.z]});
    const pu=pref(h,R.edges[i]),q=lajLivre(h,pu[0],pu[1]);if(!q)return;pts.push({x:q.x,z:q.z,y:h.yTop,r:clamp(Math.min(h.W,h.D)/2-0.3,1.5,2.4),h:3.0,casa:h.id,pula:LAJ_PULA.has(e.t)});}
  /* tempo: correndo direto (6 m/s), mais o pulo que vira escalada, a tábua e o pulo do beco; o robô do teste corre em uns 11 s quando a base dá 14,7 */
  let len=0,px=ini.x,pz=ini.z;for(const p of pts){len+=Math.hypot(p.x-px,p.z-pz);px=p.x;pz=p.z;}
  let extra=0;for(const e of R.edges){if(e.dy>=0.75&&!LAJ_TABUA.has(e.t))extra+=1.7;else if(e.dy>=0.5)extra+=0.5;if(LAJ_TABUA.has(e.t))extra+=0.8;if(LAJ_PULA.has(e.t))extra+=0.4;if(e.dy<=-2)extra+=0.3;}
  const base=len/6.0+extra;LAJ.base=base;LAJ.len=len;
  LAJ.R=R;LAJ.ini=ini;LAJ.pts=pts;
  LAJ.C=corridaNova({id:'lajes',nome:'Corrida das Lajes',onde:'Morro do Sabiá',ok:()=>MOR.ok&&LAJ.ok,ini:{x:ini.x,y:ini.y,z:ini.z},
    dica:'De laje em laje até a bandeira: pule os becos estreitos, passe pelas tábuas e, na laje mais alta, pule de frente para subir. Pisou no chão, perdeu.',
    comeco:'suba na laje da largada pela escada de marinheiro, nos fundos da casa',
    pts,tempos:{ouro:Math.ceil(base*0.95),prata:Math.ceil(base*1.4),bronze:Math.ceil(base*2.0)},xp:{bronze:40,prata:70,ouro:130},
    premios:{bronze:[['bandagem',2]],prata:[['fio',2],['fusivel',1]],ouro:[['tenisCorrida',1]]}});
  /* a bandeira de chegada no último ponto e a pichação na parede da escada da largada */
  const fim=pts[pts.length-1],ant=pts.length>1?pts[pts.length-2]:ini;LAJ.bandeira={x:fim.x,y:fim.y,z:fim.z,dx:fim.x-ant.x,dz:fim.z-ant.z};
  colCircle(fim.x,fim.z,0.06,{solid:true,y0:fim.y,y1:fim.y+2.7,morro:true});
  LAJ.pich={h:h0,s:Math.min(0.055,(h0.W-0.5)/67)};   // a faixa da parede dos fundos entre o alto das janelas do térreo e a laje do 1º andar
  let cx=0,cz=0;for(const p of pts){cx+=p.x;cz+=p.z;}LAJ.ctr={x:cx/pts.length,z:cz/pts.length};
  LAJ.ok=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{lajMontar();}catch(e){console.error('Corrida das Lajes',e);}return r;};}

/* ---------- desenho: setas de spray, LARGADA e CHEGADA pintadas, a bandeira e a pichação da escada ---------- */
function lajGeo(){const g=new GB(1<<13,8),R=rng(68181),AM=0xe0b622;
  const pinta=(x,y,z,w,len,a,cor)=>add(g,boxTris(w,0.02,len),mat(x,y+0.008,z,0,a,0),lin(cor),{j:0.05,rnd:R});
  /* a tinta só vai em laje livre: todos os cantos dentro da laje e fora da tralha */
  const livreW=(h,L)=>{if(!h)return false;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[x,z]of L){const q=morroLocal(h,x,z);u0=Math.min(u0,q[0]);u1=Math.max(u1,q[0]);v0=Math.min(v0,q[1]);v1=Math.max(v1,q[1]);}return h.livre(u0-0.06,u1+0.06,v0-0.06,v1+0.06);};
  const seta=(p,q)=>{const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<1.4)return;const ux=dx/d,uz=dz/d,a=Math.atan2(ux,uz),h=lajCasaPonto(p.x,p.z,p.y);
    for(const k of[Math.min(1.2,d*0.35),0.7,0.35,0]){const cx=p.x+ux*k,cz=p.z+uz*k,tx=cx+ux*0.5,tz=cz+uz*0.5,L=[[cx-ux*0.5,cz-uz*0.5],[tx,tz]];
      for(const s of[-1,1]){const b=a+Math.PI+s*0.62;L.push([tx+Math.sin(b)*0.5,tz+Math.cos(b)*0.5]);}
      if(!livreW(h,L))continue;pinta(cx,p.y,cz,0.13,1.0,a,AM);for(const s of[-1,1]){const b=a+Math.PI+s*0.62;pinta(tx+Math.sin(b)*0.23,p.y,tz+Math.cos(b)*0.23,0.13,0.5,b,AM);}return;}};
  /* texto pintado no chão da laje, de pé para quem anda no sentido (fx,fz) */
  const chao=(txt,p,fx,fz,s,cor,recua)=>{const L0=Math.hypot(fx,fz)||1;fx/=L0;fz/=L0;const h=lajCasaPonto(p.x,p.z,p.y),W=(4*txt.length-1)*s/2+0.04,rx=-fz,rz=fx,F=4.6*s;
    for(const[a,b]of[[-recua,0],[-recua-0.5,0],[-recua,0.6],[-recua,-0.6],[-recua-0.5,0.6],[-recua-0.5,-0.6]]){const x=p.x+fx*a+rx*b,z=p.z+fz*a+rz*b;
      const L=[[x+rx*W,z+rz*W],[x-rx*W,z-rz*W],[x+fx*F+rx*W,z+fz*F+rz*W],[x+fx*F-rx*W,z+fz*F-rz*W]];if(!livreW(h,L))continue;
      textoBlocos(g,mm(mat(x,p.y+0.012,z,0,Math.atan2(-fx,-fz),0),mat(0,0,0,-Math.PI/2,0,0)),txt,s,cor);return true;}return false;};
  const ini=LAJ.ini,pts=LAJ.pts;
  /* seta em cada laje do caminho (na largada e em cada ponto de laje), apontando para o ponto seguinte */
  {const L=[ini].concat(pts);for(let i=0;i+1<L.length;i++){if(L[i].tabua)continue;seta(L[i],L[i+1]);}}
  {const q=pts[0];chao('LARGADA',ini,q.x-ini.x,q.z-ini.z,0.07,AM,0.15)||chao('LARGADA',ini,q.x-ini.x,q.z-ini.z,0.055,AM,0.15);}
  {const B=LAJ.bandeira;chao('CHEGADA',B,B.dx,B.dz,0.07,AM,1.1)||chao('CHEGADA',B,B.dx,B.dz,0.05,AM,1.0);
    /* mastro num balde de concreto e a bandeira quadriculada virada para quem chega */
    add(g,cylTris(0.17,0.14,0.3,8),mat(B.x,B.y,B.z),lin(0x8a8780),{j:0.04,rnd:R});add(g,cylTris(0.03,0.035,2.7,6),mat(B.x,B.y,B.z),lin(0x9a7a4a));
    const L=Math.hypot(B.dx,B.dz)||1,a=Math.atan2(-B.dx/L,-B.dz/L),M=mat(B.x,B.y,B.z,0,a,0);
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)add(g,boxTris(0.2,0.18,0.012),mm(M,mat(0.05+(i+0.5)*0.2,2.16+(j+0.5)*0.18,0)),lin((i+j)%2?0x1a1a1a:0xf0ece4));}
  /* as tábuas novas: duas tábuas lado a lado, sarrafos pregados quando a rampa é inclinada e um pontalete no meio do vão comprido */
  for(const o of LAJ.obras){const{p0,p1}=o,dx=p1.x-p0.x,dz=p1.z-p0.z,dy=p1.y-p0.y,L=Math.hypot(dx,dz),th=Math.atan2(dy,L),Lb=Math.hypot(L,dy)+0.12,
      M=mm(mat((p0.x+p1.x)/2,(p0.y+p1.y)/2-0.025,(p0.z+p1.z)/2,0,Math.atan2(dx,dz),0),mat(0,0,0,-th,0,0));
    for(const sx of[-0.105,0.105])add(g,boxTris(0.2,0.045,Lb+(R()-0.5)*0.1),mm(M,mat(sx,0,(R()-0.5)*0.06,0,(R()-0.5)*0.02,0)),lin(sx<0?0x7a5a3a:0x6e5034),{j:0.08,rnd:R});
    if(Math.abs(dy)/L>0.2)for(let z=-Lb/2+0.35;z<=Lb/2-0.3;z+=0.42)add(g,boxTris(0.46,0.03,0.05),mm(M,mat(0,0.035,z)),lin(0x8a6a44),{j:0.06,rnd:R});
    if(o.poste){const q=o.poste;add(g,boxTris(0.08,q.y1-q.y0,0.08),mat(q.x,(q.y0+q.y1)/2,q.z),lin(0x6b5034),{j:0.05,rnd:R});add(g,boxTris(0.5,0.06,0.08),mm(mat(q.x,q.y1-0.05,q.z,0,Math.atan2(dx,dz)+Math.PI/2,0),ID),lin(0x6b5034));}}
  /* pichação na parede dos fundos (onde fica a escada de marinheiro), acima das janelas do térreo: CORRIDA DAS LAJES */
  if(LAJ.pich){const q=LAJ.pich,h=q.h,w=morroPw(h,0,h.D/2+0.04);textoBlocos(g,mat(w[0],h.base+2.2,w[1],0,h.yaw,0),'CORRIDA DAS LAJES',q.s,AM);}
  return g.data();}
etapaMalha('fim','lajes',1,()=>{if(!LAJ.ok)return;try{LAJ.malha=litMesh(lajGeo());}catch(e){console.error('Corrida das Lajes (desenho)',e);LAJ.malha=null;}});
DESENHO.opaco.push(function lajDesenho(Pg){if(LAJ.malha&&LAJ.ctr&&d2(LAJ.ctr.x,LAJ.ctr.z,cam.pos[0],cam.pos[2])<190*190)drawStat(Pg,LAJ.malha,ID);});

/* ---------- a regra: na corrida das lajes, pisou no chão, perdeu ---------- */
function lajNoChao(){if(!P.noChao||P.escala||P.muro||CARRO.ativo)return false;return P.y-ground(P.x,P.z)<0.7;}
PASSOS.push(function lajRegra(dt){const C=CORR.ativa;if(!C||C!==LAJ.C||CORR.t<=0||G.modo!=='jogo'||!P.alive)return;
  if(lajNoChao()){toast('corpo','Corrida das Lajes: você pisou no chão. Para tentar de novo, volte à laje da largada.');sfx('vazio');corridaFim(C,false);}});
/* o ouro conta na conquista */
{const _cf=corridaFim;corridaFim=function(C,ok){const S=C&&C===LAJ.C?corridaD('lajes'):null,antes=S&&S.medalha;const r=_cf.apply(this,arguments);
  try{if(S&&ok&&S.medalha==='ouro'&&antes!=='ouro'&&typeof progresso==='function')progresso('lajesOuro');}catch(e){}return r;};}
if(typeof CONQ!=='undefined'&&!CONQ.some(d=>d.id==='lajesOuro'))CONQ.push({id:'lajesOuro',nome:'Dono da laje',desc:'Ganhe o ouro na Corrida das Lajes, no Morro do Sabiá.',ev:'lajesOuro',meta:1});

/* ---------- o prêmio de ouro: Tênis de corrida ---------- */
ITEMS.tenisCorrida={nome:'Tênis de corrida',icon:'i-botas',max:1,tipo:'roupa',slot:'pes',mat:'tecido',prot:0.01,peso:0.5,durMax:160,silencio:0.15,
  desc:'O prêmio de ouro da Corrida das Lajes. A sola de borracha agarra na laje: na disparada você corre 6% mais rápido e cansa menos, e ela amortece a queda (cai de um pouco mais alto sem se machucar). Gasta com a caminhada.'};
if(typeof SK_CASCAS!=='undefined')SK_CASCAS.tenisCorrida=[{sub:'pes',inf:0.011,cor:0xe6e2d8,pelo:0}];
function tenisEf(){const b=roupaItem('pes');return b&&b===ITEMS.tenisCorrida?roupaEf('pes'):0;}
{const _mf=movFatorVel;movFatorVel=function(running){const f=_mf.apply(this,arguments);return running?f*(1+0.06*tenisEf()):f;};}
PASSOS.push(function tenisFolego(dt){if(!P.alive||!P.correndo)return;const k=tenisEf();if(k>0)P.energia=Math.min(100,P.energia+4.6*dt*0.22*k);});
{const _po=pousar;pousar=function(chao){const k=tenisEf();if(k>0&&P.vy<0)P.vy=Math.min(0,P.vy+1.4*MOV.kq*k);return _po.apply(this,arguments);};}
