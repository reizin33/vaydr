/* ================= Etapa 4 · cascas de verdade: peças do kit nas fachadas e nos telhados (v10.2.3) =================
   Pedido do Himalaia (projeto da etapa 4 aprovado em 14/11/2026; amostra do Aurora aprovada e passo 2 liberado na mesma noite).
   As paredes dos prédios ficam as de hoje; por fora entram as peças 3D do kit "Post Apocalypse Kitbash" (versão gratuita, de
   Oleg Ushenok; tools/kit_banco.py → 21n_kit_dados.js, KITX):
   · fachada: calhas descendo do telhado até a calçada, caixas de ar-condicionado embaixo (ou do lado) de algumas janelas, quadro
     de luz e relógio perto da porta dos fundos, chapas rebitadas e tábuas pregadas em algumas janelas dos andares de cima;
   · lojas e oficina: porta de enrolar meio baixada sobre as vitrines e a caixa da porta de enrolar em cima do portão da oficina
     (feitas aqui com a textura da porta de enrolar do kit); tambores e lona encostados do lado da loja e da oficina;
   · telhado: caixa d'água no suporte, placas solares, armação de antenas, respiros e barraco de chapa e telha (montado com as
     peças do kit); nas lojas de um andar, as caixas de ar-condicionado em cima da laje;
   · beco: caçamba, tambores e tambores com lona encostados na parede (o beco continua passando);
   · fios: feixes atravessando os becos e cabos de um prédio ao outro por cima da rua;
   · sujeira: escorrido embaixo das janelas e das caixas de ar e mancha de umidade no pé das paredes (por cima da parede, que não
     muda).
   Tudo sai de regras sobre a planta de cada prédio (janelas, portas, vitrines, letreiros, sacadas, faixas de vidro da torre,
   escadas de fora, passarelas, caminhos do telhado, caixas de saque e o que já está na calçada), com sorteio fixo por prédio: o
   mundo é sempre o mesmo e os jogos salvos não mudam. Bairros com as peças: KIT.bairros (passo 2: o Centro e a Entrada; passo 3: Distrito Industrial e os dois bairros residenciais) e os prédios de KIT.extras fora deles (passo 4: o Galpão da Pousada, na serra).
   Desenho: as peças de cada quarteirão numa malha só, com a textura do kit (uma chamada para as grandes e outra para as pequenas,
   que somem antes), mais os cabos e a sujeira; cada quarteirão some de longe como os detalhes dos prédios. Colisão só no que fica
   no chão e no telhado. KIT.on=false desliga o desenho (para comparar antes e depois). */
const KIT={on:true,bairros:['Centro','Entrada da cidade','Distrito Industrial','Bairro Residencial Sul','Bairro Residencial Norte'],extras:['Galpão da Pousada'],
  itens:[],cabos:[],manchas:[],cols:[],grupos:[],pecas:{},info:null,dist:150,distPerto:70};
function kitOk(){return typeof KITX!=='undefined'&&!!KITX&&!!KITX.pecas;}
function kitT(id){const X=KITX.pecas[id];return X?X.tam:[0,0,0];}
/* os quatro lados do prédio: comprimento, ponto (ao longo, para fora da face) -> (u, v) e o giro de quem olha para fora */
function kitLados(p){const W=p.W,D=p.D;return{
  F:{L:W,uv:(a,o)=>[a,-o],yaw:p.yaw+Math.PI},B:{L:W,uv:(a,o)=>[a,D+o],yaw:p.yaw},
  L:{L:D,uv:(a,o)=>[-o,a],yaw:p.yaw-Math.PI/2},R:{L:D,uv:(a,o)=>[W+o,a],yaw:p.yaw+Math.PI/2}};}
function kitLadoPos(p,u,v){const c=[['F',Math.abs(v)],['B',Math.abs(v-p.D)],['L',Math.abs(u)],['R',Math.abs(u-p.W)]];c.sort((a,b)=>a[1]-b[1]);return c[0][0];}
const kitAo=(s,u,v)=>s==='F'||s==='B'?u:v;
function kitTopo(p){return p.casa?p.yTopo:p.yTopo+(p.andares>1?1.1:0.9);}   // alto da platibanda (na casa: a beira do telhado)
/* o que não pode ser coberto em cada lado: janelas, portas, sacadas (com a porta de vidro), escadas de fora, chegada das
   passarelas e o letreiro das lojas; as peças postas entram aqui também (uma não cobre a outra) */
function kitVaos(p){const V={F:[],B:[],L:[],R:[]};
  for(const j of CID.janelas){if(j.p!==p)continue;const l=plc(p,j.x,j.z),s=kitLadoPos(p,l[0],l[1]),a=kitAo(s,l[0],l[1]),y0=j.y+j.peit;
    V[s].push({s,a,a0:a-j.larg/2,a1:a+j.larg/2,y0,y1:j.vitrine?j.y+2.7:y0+1.2,k:'jan',j,f:j.f});}
  for(const d of CID.portas){if(d.p!==p||(d.sA!=='fora'&&d.sB!=='fora'))continue;const l=plc(p,d.x,d.z),s=kitLadoPos(p,l[0],l[1]),a=kitAo(s,l[0],l[1]);
    V[s].push({s,a,a0:a-d.larg/2-0.15,a1:a+d.larg/2+0.15,y0:d.y-0.3,y1:d.y+2.6,k:'porta',d});}
  for(const sc of p.sacadas||[]){const y=p.y0+sc.f*p.H;V.F.push({s:'F',a:(sc.u0+sc.u1)/2,a0:sc.u0-0.15,a1:sc.u1+0.15,y0:y-0.35,y1:y+2.45,k:'sacada'});}
  for(const e of CID.escadasExt){if(e.p!==p)continue;const l=e.u!==undefined?[e.u,e.v]:plc(p,e.x,e.z),s=kitLadoPos(p,l[0],l[1]),a=kitAo(s,l[0],l[1]);
    V[s].push({s,a,a0:a-1.4,a1:a+1.4,y0:-1,y1:kitTopo(p)+1.5,k:'escada'});}
  for(const pa of CID.passarelas||[]){if(pa.a!==p&&pa.b!==p)continue;const c1=plc(p,pa.x0,pa.z0),c2=plc(p,pa.x1,pa.z1),s=kitLadoPos(p,(c1[0]+c2[0])/2,(c1[1]+c2[1])/2);
    const a1=kitAo(s,c1[0],c1[1]),a2=kitAo(s,c2[0],c2[1]);V[s].push({s,a:(a1+a2)/2,a0:Math.min(a1,a2)-0.3,a1:Math.max(a1,a2)+0.3,y0:pa.y-0.8,y1:pa.y+1.8,k:'passarela'});}
  /* torre de escritórios com cobertura: faixas de vidro escuro na frente e nos fundos, um andar por vez */
  if(p.cobertura)for(let f=1;f<p.andares;f++){const y=p.y0+f*p.H;for(const s of ['F','B'])V[s].push({s,a:p.W/2,a0:0.3,a1:p.W-0.3,y0:y+0.7,y1:y+2.5,k:'vidro'});}
  /* lojas de um andar: o letreiro sobre a porta (e a cruz da farmácia) */
  if(p.andares===1&&!p.casa){const ya=p.y0,lw=Math.min(p.W/2-0.6,4.2);V.F.push({s:'F',a:p.W/2,a0:p.W/2-lw-0.2,a1:p.W/2+lw+0.2,y0:ya+2.75,y1:ya+3.85,k:'letreiro'});
    if(p.tipo==='farmacia')V.F.push({s:'F',a:p.W-1.2,a0:p.W-1.75,a1:p.W-0.65,y0:ya+2.5,y1:ya+3.5,k:'letreiro'});}
  return V;}
function kitLivre(L,a0,a1,y0,y1,m,ignora){for(const v of L){if(v===ignora)continue;if(a1+m>v.a0&&a0-m<v.a1&&y1+m>v.y0&&y0-m<v.y1)return false;}return true;}
/* objeto que já está na calçada (saco de lixo, caixa de luz, pneu...) encostado nesse trecho da parede */
function kitPropPerto(p,s,a,lado,r){const ld=kitLados(p)[s],uv=ld.uv(a,0.4),w=pw(p,uv[0],uv[1]);return CID.props.some(o=>Math.hypot(o.x-w[0],o.z-w[1])<(r||1.1));}

/* ---------- pôr uma peça ---------- */
function kitM(x,y,z,yaw,e,rx,rz){return trs(M4(),x,y,z,rx||0,yaw,rz||0,e[0],e[1],e[2]);}
/* na parede: a = ao longo do lado, y = altura da base da peça, o = afastamento da face (as costas da peça ficam em z=0) */
function kitParede(ctx,m,s,a,y,o,e,x){if(!KITX.pecas[m])return null;const p=ctx.p,L=ctx.ld[s],uv=L.uv(a,o),w=pw(p,uv[0],uv[1]);e=e||[1,1,1];
  const it={m,M:kitM(w[0],y,w[1],L.yaw,e,x&&x.rx,x&&x.rz),cor:x&&x.cor,p:p.nome,pp:p,s,a,y,e};ctx.itens.push(it);return it;}
/* no chão (ou no telhado): (u, v) é o meio da peça; giro gl relativo ao prédio (0, 90, 180, 270 graus); colisão opcional */
function kitChao(ctx,m,u,v,y,gl0,e,col,x){const X=KITX.pecas[m];if(!X)return null;const p=ctx.p;e=e||[1,1,1];
  const yaw=p.yaw+gl0,c=Math.cos(yaw),sn=Math.sin(yaw),cx=(X.lo[0]+X.hi[0])/2*e[0],cz=(X.lo[2]+X.hi[2])/2*e[2],w=pw(p,u,v);
  const ox=w[0]-(cx*c+cz*sn),oz=w[1]-(-cx*sn+cz*c);   // o meio da caixa da peça cai em (u, v)
  const it={m,M:kitM(ox,y,oz,yaw,e,x&&x.rx,x&&x.rz),cor:x&&x.cor,p:p.nome,pp:p,u,v,y,e};ctx.itens.push(it);
  if(col){const t=X.tam;KIT.cols.push(colBox(w[0],w[1],t[0]*e[0]/2+0.05,t[2]*e[2]/2+0.05,yaw,{solid:true,y0:y-0.2,y1:y+t[1]*e[1],kit:m}));}
  return it;}

/* ---------- 1) calhas: num canto de cada lado, do telhado até a calçada (base com a curva, trechos retos com luva) ---------- */
function kitCalhas(ctx){const{p,R,V,ld}=ctx,topo=kitTopo(p),C=KITX.pecas.cano,Rt=KITX.pecas.canoReto,Lv=KITX.pecas.canoLuva;if(!C||!Rt||!Lv)return;
  for(const s of ['F','B','L','R']){const L=ld[s].L;if(L<7||(s!=='F'&&R()>0.8)||(p.casa&&(s==='L'||s==='R')))continue;   // casa: só onde tem beiral
    const cs=[0.42,L-0.42];if(R()<0.5)cs.reverse();
    const o=p.andares===1&&s==='F'&&!p.casa?0.075:0.012;   // na frente das lojas a faixa da base sai 6 cm da parede
    for(const a of cs){if(!kitLivre(V[s],a-0.42,a+0.42,QUADRA_Y-1,topo,0.05)||kitPropPerto(p,s,a))continue;
      kitParede(ctx,'cano',s,a,QUADRA_Y,o);let y=QUADRA_Y+C.hi[1],k=0;
      while(y<topo-0.08){if(k%3===2&&y+Lv.passo<topo-0.3){kitParede(ctx,'canoLuva',s,a,y,o);y+=Lv.passo;k++;continue;}   // luva a cada dois trechos
        const sy=Math.min(1,(topo-0.05-y)/Rt.passo);kitParede(ctx,'canoReto',s,a,y,o,[1,sy,1]);y+=Rt.passo*sy;k++;}
      V[s].push({s,a,a0:a-0.35,a1:a+0.35,y0:-1,y1:topo,k:'peca'});ctx.calhas.push([s,a]);break;}}}

/* ---------- 2) ar-condicionado embaixo (ou do lado) de algumas janelas dos andares de cima ---------- */
function kitArCond(ctx){const{p,R,V,ld}=ctx,ch=p.tipo==='escritorio'?0.32:0.2,max=p.tipo==='escritorio'?4:p.casa?1:2;
  for(const s of ['F','B','L','R']){let n=0;
    for(const v of V[s].slice()){if(v.k!=='jan'||v.f<1||v.j.vitrine||n>=max||R()>ch)continue;
      const m=R()<0.55?'arCond':'arCaixa',t=kitT(m),k=m==='arCond'?0.7:0.78,w=t[0]*k,h=t[1]*k;let a=v.a,y=v.y0-0.12-h;
      if(!kitLivre(V[s],a-w/2,a+w/2,y,y+h,0.08,v)){let ok=false;const sg0=R()<0.5?-1:1;
        for(const sg of [sg0,-sg0]){const aa=v.a+sg*((v.a1-v.a0)/2+0.14+w/2),yy=v.y0+0.1;
          if(aa-w/2>0.35&&aa+w/2<ld[s].L-0.35&&kitLivre(V[s],aa-w/2,aa+w/2,yy,yy+h,0.08)){a=aa;y=yy;ok=true;break;}}
        if(!ok)continue;}
      kitParede(ctx,m,s,a,y,0.01,[k,k,k]);V[s].push({s,a,a0:a-w/2,a1:a+w/2,y0:y,y1:y+h,k:'peca'});ctx.ares.push([s,a,y,w]);n++;}}}

/* ---------- 3) chapas e tábuas pregadas por fora em algumas janelas de cima (nenhuma janela de passagem é tapada) ---------- */
function kitTapumes(ctx){const{p,R,V}=ctx,ch=(p.alagado||(p.entulho||0)>1)?0.4:p.tipo==='escritorio'?0.2:0.3;   // v10.2.6: o dobro de janelas tapadas (cidade destruída)
  for(const s of ['F','B','L','R'])for(const v of V[s]){if(v.k!=='jan'||v.f<1||v.j.vitrine||R()>ch)continue;const lg=v.a1-v.a0;
    if(R()<0.62){const m=R()<0.5?'chapa':'chapa2',t=kitT(m);kitParede(ctx,m,s,v.a,v.y0-0.11,0.045,[(lg+0.26)/t[0],1.42/t[1],1],{rz:(R()-0.5)*0.07});}
    else{const t=kitT('tabuas');kitParede(ctx,'tabuas',s,v.a,v.y0+0.08,0.045,[(lg+0.42)/t[0],1.05/t[1],0.8],{rz:(R()-0.5)*0.12});}
    v.tapada=true;}}

/* ---------- 4) quadro de luz e relógio perto da porta dos fundos (no mercado, o extintor) ---------- */
function kitLuz(ctx){const{p,R,V}=ctx;const ps=['B','L','R','F'].map(s=>V[s].find(v=>v.k==='porta')).filter(Boolean);const d=ps[0];if(!d)return;const s=d.s;
  const poe=(m,lado,dist,y,e)=>{const t=kitT(m),w=t[0]*e[0],a=lado>0?d.a1+dist+w/2:d.a0-dist-w/2;
    if(a-w/2<0.3||a+w/2>ctx.ld[s].L-0.3||!kitLivre(V[s],a-w/2,a+w/2,y,y+t[1]*e[1],0.06))return false;
    kitParede(ctx,m,s,a,y,0.01,e);V[s].push({s,a,a0:a-w/2,a1:a+w/2,y0:y,y1:y+t[1]*e[1],k:'peca'});return true;};
  const l0=R()<0.5?-1:1;
  if(p.tipo==='mercado'){poe('extintor',l0,0.35,0.85,[1,1,1])||poe('extintor',-l0,0.35,0.85,[1,1,1]);}
  else{poe('quadroLuz',l0,0.3,1.55,[0.9,0.9,0.9])||poe('quadroLuz',-l0,0.3,1.55,[0.9,0.9,0.9]);}
  poe('caixaLuz',-l0,0.3,1.3,[1.7,1.7,1.7])||poe('caixaLuz',l0,1.9,1.3,[1.7,1.7,1.7]);}

/* ---------- 4b) lojas e oficina: porta de enrolar meio baixada nas vitrines, caixa da porta de enrolar sobre o portão da oficina,
   chapas rebitadas remendando as paredes da oficina. Placas feitas aqui com a textura do kit (a porta de enrolar e a chapa cinza
   do atlas): um retângulo de textura por trecho de até 2,6 m, que é como as portas de enrolar de loja são, em seções. ---------- */
const KIT_UV={enrolar:[0.004,0.004,0.232,0.243],metal:[0.006,0.256,0.244,0.494]};   // (u0, v0, u1, v1) no atlas do kit
/* retângulo na parede: lado s, de a0 a a1 ao longo, de y0 a y1, afastado o da face, com o pedaço (u0,v0)-(u1,v1) da textura */
function kitQuad(ctx,s,a0,a1,y0,y1,o,uv,out){const p=ctx.p,L=ctx.ld[s],n=[Math.sin(L.yaw),Math.cos(L.yaw)],P=(a,y)=>{const q=L.uv(a,o),w=pw(p,q[0],q[1]);return[w[0],y,w[1]];};
  const A=P(a0,y0),B=P(a1,y0),C=P(a1,y1),D=P(a0,y1),[u0,v0,u1,v1]=uv;
  for(const[q,uu,vv]of[[A,u0,v1],[B,u1,v1],[C,u1,v0],[A,u0,v1],[C,u1,v0],[D,u0,v0]])out.push([q,[n[0],0,n[1]],uu,vv]);}
/* caixa horizontal presa na parede (a caixa da porta de enrolar): frente, fundo de baixo e tampa */
function kitCaixaParede(ctx,s,a0,a1,y0,y1,fundo,uv,out){const p=ctx.p,L=ctx.ld[s],n=[Math.sin(L.yaw),0,Math.cos(L.yaw)],P=(a,y,o)=>{const q=L.uv(a,o),w=pw(p,q[0],q[1]);return[w[0],y,w[1]];};
  const[u0,v0,u1,v1]=uv,vm=(v0+v1)/2;
  const face=(A,B,C,D,nn,ua,ub,va,vb)=>{for(const[q,uu,vv]of[[A,ua,vb],[B,ub,vb],[C,ub,va],[A,ua,vb],[C,ub,va],[D,ua,va]])out.push([q,nn,uu,vv]);};
  face(P(a0,y0,fundo),P(a1,y0,fundo),P(a1,y1,fundo),P(a0,y1,fundo),n,u0,u1,v0,vm);                       // frente
  face(P(a0,y0,0.01),P(a1,y0,0.01),P(a1,y0,fundo),P(a0,y0,fundo),[0,-1,0],u0,u1,vm,v1);                   // embaixo
  face(P(a0,y1,fundo),P(a1,y1,fundo),P(a1,y1,0.01),P(a0,y1,0.01),[0,1,0],u0,u1,vm,v1);                   // em cima
  const L0=[-Math.cos(L.yaw),0,Math.sin(L.yaw)];
  face(P(a0,y0,0.01),P(a0,y0,fundo),P(a0,y1,fundo),P(a0,y1,0.01),[-L0[0],0,-L0[2]],u0,u0+(u1-u0)*0.1,v0,vm); // pontas
  face(P(a1,y0,fundo),P(a1,y0,0.01),P(a1,y1,0.01),P(a1,y1,fundo),L0,u0,u0+(u1-u0)*0.1,v0,vm);}
/* junta os retângulos numa peça "feita aqui" (já no lugar, no mundo) */
function kitProc(ctx,out,grande){const n=out.length,f=new Float32Array(n*11),uv=new Float32Array(n*2);
  out.forEach(([q,nn,uu,vv],i)=>{const b=i*11;f[b]=q[0];f[b+1]=q[1];f[b+2]=q[2];f[b+3]=f[b+4]=f[b+5]=1;f[b+6]=0;f[b+7]=0;f[b+8]=nn[0];f[b+9]=nn[1];f[b+10]=nn[2];uv[i*2]=uu;uv[i*2+1]=vv;});
  ctx.itens.push({m:'feita',proc:{f,uv,n},p:ctx.p.nome,pp:ctx.p,grande:!!grande});}
/* porta de enrolar meio baixada: a cortina aparece h metros abaixo da caixa; em seções de até 2,6 m */
function kitEnrolarEm(ctx,s,a0,a1,yTopo,h,out){const L=a1-a0,n=Math.max(1,Math.ceil(L/2.6)),U=KIT_UV.enrolar,cv=Math.min(1,h/2.4)*(U[3]-U[1]);
  for(let i=0;i<n;i++){const b0=a0+L*i/n,b1=a0+L*(i+1)/n,cu=Math.min(1,(b1-b0)/2.4)*(U[2]-U[0]);
    kitQuad(ctx,s,b0,b1,yTopo-h,yTopo,0.035,[U[0],U[3]-cv,U[0]+cu,U[3]],out);}
  kitCaixaParede(ctx,s,a0-0.05,a1+0.05,yTopo,yTopo+0.27,0.24,KIT_UV.metal,out);}
function kitLojas(ctx){const{p,R,V}=ctx;if(p.andares!==1||p.casa)return;const out=[],loja=['mercado','farmacia','conveniencia','padaria'].includes(p.tipo);
  if(loja)for(const v of V.F){if(v.k!=='jan'||!v.j.vitrine||R()>0.8)continue;const h=0.5+R()*0.5;kitEnrolarEm(ctx,'F',v.a0+0.02,v.a1-0.02,v.y1,h,out);
      V.F.push({s:'F',a:v.a,a0:v.a0-0.1,a1:v.a1+0.1,y0:v.y1-h,y1:v.y1+0.3,k:'peca'});}
  if(p.tipo==='oficina'){const d=V.F.find(v=>v.k==='porta');if(d){const y=d.d.y+(d.d.larg>1.3?2.4:2.15);kitEnrolarEm(ctx,'F',d.a0+0.1,d.a1-0.1,y,0.12,out);
      V.F.push({s:'F',a:d.a,a0:d.a0,a1:d.a1,y0:y-0.15,y1:y+0.3,k:'peca'});}
    /* chapas rebitadas remendando as paredes do lado */
    for(const s of ['L','R'])for(let i=0;i<2;i++){const m=R()<0.5?'chapa':'chapa2',t=kitT(m),w=t[0]*0.95,a=1.2+w/2+R()*(ctx.ld[s].L-2.4-w),y=p.y0+0.05+R()*0.25;
      if(!kitLivre(V[s],a-w/2,a+w/2,y,y+t[1]*1.15,0.1))continue;kitParede(ctx,m,s,a,y,0.02,[0.95,1.15,1],{rz:(R()-0.5)*0.05});V[s].push({s,a,a0:a-w/2,a1:a+w/2,y0:y,y1:y+t[1]*1.15,k:'peca'});}}
  if(out.length)kitProc(ctx,out,true);
  /* do lado de fora, nas paredes do lado: tambores (na oficina, mais) e tambores com lona, sem tapar porta nem escada */
  const nos=CID.nos.filter(q=>q.y<1.5&&Math.abs(q.x-(p.x0+p.x1)/2)<p.W+8&&Math.abs(q.z-(p.z0+p.z1)/2)<p.D+8);
  const quer=p.tipo==='oficina'?3:(loja?1:0);let n=0;
  for(let tent=0;tent<14&&n<quer;tent++){const s=R()<0.5?'L':'R',m=n===0||R()<0.6?'tambores':'lona',t=kitT(m),L=ctx.ld[s].L,a=1.0+t[0]/2+R()*(L-2.0-t[0]);
    const Vs=V[s].filter(v=>v.k!=='jan');if(!kitLivre(Vs,a-t[0]/2-0.7,a+t[0]/2+0.7,-0.5,1.6,0)||kitPropPerto(p,s,a,0,t[0]/2+0.9))continue;
    const uv=ctx.ld[s].uv(a,0.12+t[2]/2),wc=pw(p,uv[0],uv[1]);if(nos.some(q=>Math.hypot(q.x-wc[0],q.z-wc[1])<t[0]/2+0.9)||pointBlocked(wc[0],wc[1],0.4))continue;
    const it=kitChao(ctx,m,uv[0],uv[1],QUADRA_Y,{F:Math.PI,B:0,L:-Math.PI/2,R:Math.PI/2}[s],[1,1,1],true);if(it){it.chao=true;it.wx=wc[0];it.wz=wc[1];}
    V[s].push({s,a,a0:a-t[0]/2,a1:a+t[0]/2,y0:-0.5,y1:t[1],k:'peca'});n++;}}

/* ---------- 5) telhado: caixa d'água, antenas, placas solares, barraco e respiros nos lugares livres ---------- */
function kitTelhado(ctx){const{p,R}=ctx,E=0.25,W=p.W,D=p.D,cel=0.25,nu=Math.ceil(W/cel),nv=Math.ceil(D/cel),G=new Uint8Array(nu*nv),yT=p.andares>1?p.y0+p.andares*p.H:p.yTopo;
  const marca=(u0,u1,v0,v1)=>{for(let i=Math.max(0,Math.floor(u0/cel));i<Math.min(nu,Math.ceil(u1/cel));i++)for(let j=Math.max(0,Math.floor(v0/cel));j<Math.min(nv,Math.ceil(v1/cel));j++)G[j*nu+i]=1;};
  const linha=(a,b,r)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.2)+1;for(let k=0;k<=n;k++){const t=k/n,u=a[0]+(b[0]-a[0])*t,v=a[1]+(b[1]-a[1])*t;marca(u-r,u+r,v-r,v+r);}};
  const livre=(u0,u1,v0,v1)=>{if(u0<E+0.15||v0<E+0.15||u1>W-E-0.15||v1>D-E-0.15)return false;
    for(let i=Math.floor(u0/cel);i<Math.ceil(u1/cel);i++)for(let j=Math.floor(v0/cel);j<Math.ceil(v1/cel);j++)if(G[j*nu+i])return false;return true;};
  if(p.andares>1){const uc=p.uc,vS=p.vS;
    marca(uc-1.65,uc+1.65,vS-0.35,D);marca(uc-1.0,uc+1.0,vS-2.2,vS);              // casinha da escada e a frente da porta
    marca(E+0.3,E+2.9,D-E-2.9,D-E-0.3);                                            // caixa d'água de antes
    const t0=[uc,vS-1.4],t1=[E+1.6,E+1.6],t2=[W-E-1.6,E+1.6];linha(t0,t1,0.95);linha(t0,t2,0.95);linha(t1,t2,0.95);linha(t0,[uc,vS],0.95);}
  else{const c=[W/2,D/2];for(const e of CID.escadasExt){if(e.p!==p)continue;const l=e.u!==undefined?[e.u,e.v]:plc(p,e.x,e.z),q=[clamp(l[0],1,W-1),clamp(l[1],1,D-1)];
      marca(q[0]-2,q[0]+2,q[1]-2,q[1]+2);linha(q,c,1.0);}marca(c[0]-1.2,c[0]+1.2,c[1]-1.2,c[1]+1.2);}
  for(const m of CID.mirantes){if(m.p!==p)continue;const l=plc(p,m.x,m.z);marca(l[0]-1.5,l[0]+1.5,l[1]-1.5,l[1]+1.5);}
  for(const c of CID.conts){if(c.p!==p||c.sala!==p.telhado)continue;marca(c.u-1.3,c.u+1.3,c.v-1.3,c.v+1.3);}
  for(const o of p.aberturasTelhado||[]){const a=o.a-0.9,b=o.b+0.9;if(o.lado==='R')marca(W-2.8,W,a,b);else if(o.lado==='L')marca(0,2.8,a,b);else if(o.lado==='B')marca(a,b,D-2.8,D);else marca(a,b,0,2.8);}
  /* acha um lugar para uma caixa w x d (+ folga): perto das beiradas primeiro, sorteado entre os melhores */
  const acha=(w,d,folga)=>{const c=[];for(let u=E+0.2+w/2+folga;u<=W-E-0.2-w/2-folga;u+=0.25)for(let v=E+0.2+d/2+folga;v<=D-E-0.2-d/2-folga;v+=0.25){
      if(!livre(u-w/2-folga,u+w/2+folga,v-d/2-folga,v+d/2+folga))continue;const b=Math.min(u-w/2,W-u-w/2,v-d/2,D-v-d/2);c.push([b+R()*1.2,u,v]);}
    if(!c.length)return null;c.sort((a,b)=>a[0]-b[0]);const q=c[Math.floor(R()*Math.min(4,c.length))];marca(q[1]-w/2-folga*0.6,q[1]+w/2+folga*0.6,q[2]-d/2-folga*0.6,q[2]+d/2+folga*0.6);return[q[1],q[2]];};
  const tel=ctx.telhado=[];
  const poe=(m,giro,e,col,x)=>{tel.push(m);const t=kitT(m),q=(Math.round(giro/(Math.PI/2))&1)?[t[2]*e[2],t[0]*e[0]]:[t[0]*e[0],t[2]*e[2]],l=acha(q[0],q[1],0.35);if(!l)return null;
    return kitChao(ctx,m,l[0],l[1],yT,giro,e,col,x);};
  const g4=()=>Math.floor(R()*4)*Math.PI/2;
  if(p.andares>1){
    poe(R()<0.6?'caixaDagua':'tanque',g4(),R()<0.6?[1,1,1]:[0.82,0.82,0.82],true);
    if(R()<0.6)tel.push('barraco:'+kitBarraco(ctx,acha,yT,g4()));
    if(R()<0.65)poe('antena',g4(),[1,1,1],true);
    if(R()<0.7){const m=R()<0.5?'solar':'solar2',n=1+Math.floor(R()*2),g=g4();for(let i=0;i<n;i++)poe(m,g,[1,1,1],true);}}
  else{const n=2+Math.floor(R()*2);for(let i=0;i<n;i++){const m=R()<0.5?'arCond':'arCaixa';poe(m,g4(),[0.85,0.85,0.85],true);}
    if(R()<0.6)poe('tanque',g4(),[0.62,0.62,0.62],true);}
  /* respiros: canos curvos saindo da laje, encostados na platibanda */
  for(let i=0;i<2;i++)poe('respiro',g4(),[1,1,1],false);}
/* barraco de chapa: quatro canos de esteio, três paredes de chapa, telha caída para trás; aberto para a frente */
function kitBarraco(ctx,acha,yT,giro){const{p,R}=ctx,w=2.2,d=2.6,hF=2.25,hB=1.95,q=(Math.round(giro/(Math.PI/2))&1)?[d,w]:[w,d],l=acha(q[0],q[1],0.3);if(!l)return false;
  const yaw=p.yaw+giro,c=Math.cos(yaw),s=Math.sin(yaw),cw=pw(p,l[0],l[1]);
  const em=(lx,lz)=>[cw[0]+lx*c+lz*s,cw[1]-lx*s+lz*c];   // do espaço do barraco (x para o lado, z para a frente) para o mundo
  const peca=(m,lx,y,lz,dy,e,rx,rz)=>{const X=KITX.pecas[m];if(!X)return;const ccx=(X.lo[0]+X.hi[0])/2*e[0],ccz=(X.lo[2]+X.hi[2])/2*e[2],
      g=dy||0,cg=Math.cos(yaw+g),sg=Math.sin(yaw+g),w2=em(lx,lz);
    ctx.itens.push({m,M:kitM(w2[0]-(ccx*cg+ccz*sg),y,w2[1]-(-ccx*sg+ccz*cg),yaw+g,e,rx,rz),p:p.nome,pp:p,e,grande:true});};
  const Rt=KITX.pecas.canoReto;
  for(const[lx,lz,h]of[[-w/2+0.08,d/2-0.08,hF],[w/2-0.08,d/2-0.08,hF],[-w/2+0.08,-d/2+0.08,hB],[w/2-0.08,-d/2+0.08,hB]])peca('canoReto',lx,yT,lz,0,[1,h/Rt.passo,1]);
  const ch=kitT('chapa'),ch2=kitT('chapa2');
  peca('chapa',0,yT+0.05,-d/2+0.02,0,[(w-0.1)/ch[0],(hB-0.1)/ch[1],1]);                       // fundo (a frente da chapa para fora)
  peca('chapa2',-w/2+0.02,yT+0.05,0,-Math.PI/2,[(d-0.1)/ch2[0],(hB-0.1)/ch2[1],1]);         // lados
  peca('chapa2',w/2-0.02,yT+0.05,0,Math.PI/2,[(d-0.1)/ch2[0],(hB-0.1)/ch2[1],1]);
  const tl=kitT('telha'),inc=Math.atan2(hF-hB,d);peca('telha',0,yT+(hF+hB)/2-0.02,0,0,[(w+0.35)/tl[0],1,(d+0.45)/tl[2]],-inc,0);
  KIT.cols.push(colBox(cw[0],cw[1],w/2+0.05,d/2+0.05,yaw,{solid:true,y0:yT-0.2,y1:yT+hF,kit:'barraco'}));return true;}

/* ---------- 6) beco: caçamba, tambores e lona encostados na parede, sem fechar a passagem ---------- */
function kitBeco(ctx){const{p,R,V,ld}=ctx;
  const nos=CID.nos.filter(q=>q.y<1.5&&Math.abs(q.x-(p.x0+p.x1)/2)<p.W+8&&Math.abs(q.z-(p.z0+p.z1)/2)<p.D+8);
  for(const s of ['F','B','L','R']){const vz=ctx.vizinho[s];if(!vz||vz.gap<2.6||vz.gap>6)continue;let n=0;
    for(let tent=0;tent<10&&n<1;tent++){const m=['cacamba','tambores','lona','tambores'][Math.floor(R()*4)],t=kitT(m),a=1.2+t[0]/2+R()*(ld[s].L-2.4-t[0]);
      if(!kitLivre(V[s],a-t[0]/2-0.6,a+t[0]/2+0.6,-0.5,1.6,0)||kitPropPerto(p,s,a,0,t[0]/2+1.0)||ctx.chao.some(q=>q[0]===s&&Math.abs(q[1]-a)<t[0]+0.8))continue;
      const uv=ld[s].uv(a,0.12+t[2]/2),gi={F:Math.PI,B:0,L:-Math.PI/2,R:Math.PI/2}[s],wc=pw(p,uv[0],uv[1]);
      if(nos.some(q=>Math.hypot(q.x-wc[0],q.z-wc[1])<t[0]/2+0.9))continue;   // fora dos pontos de passagem dos caminhos
      if(KIT.itens.some(it=>it.chao&&Math.hypot(it.wx-wc[0],it.wz-wc[1])<3.2))continue;   // nada de frente um para o outro no beco
      const it=kitChao(ctx,m,uv[0],uv[1],QUADRA_Y,gi,[1,1,1],true);if(it){it.chao=true;it.wx=wc[0];it.wz=wc[1];}V[s].push({s,a,a0:a-t[0]/2,a1:a+t[0]/2,y0:-0.5,y1:t[1],k:'peca'});ctx.chao.push([s,a]);n++;}}}

/* ---------- 7) fios: feixes atravessando o beco; cabos por cima da rua até o prédio da frente ---------- */
function kitVizinhos(p,predios){const ld=kitLados(p),out={};
  for(const s of ['F','B','L','R']){const L=ld[s];let best=null;
    for(const q of predios){if(q===p||q.rural)continue;
      for(const t of ['F','B','L','R']){const lq=kitLados(q)[t];if(Math.abs(Math.cos(L.yaw-lq.yaw)+1)>0.02)continue;   // faces opostas
        const a=pw(p,...L.uv(0,0)),b=pw(p,...L.uv(L.L,0)),n=[Math.sin(L.yaw),Math.cos(L.yaw)],qa=pw(q,...lq.uv(0,0)),gap=(qa[0]-a[0])*n[0]+(qa[1]-a[1])*n[1];
        if(gap<1||gap>32)continue;const ta=[b[0]-a[0],b[1]-a[1]],tl=Math.hypot(...ta),tu=[ta[0]/tl,ta[1]/tl],qb=pw(q,...lq.uv(lq.L,0));
        const s1=(qa[0]-a[0])*tu[0]+(qa[1]-a[1])*tu[1],s2=(qb[0]-a[0])*tu[0]+(qb[1]-a[1])*tu[1],o0=Math.max(0,Math.min(s1,s2)),o1=Math.min(tl,Math.max(s1,s2));
        if(o1-o0<2.5)continue;if(!best||gap<best.gap)best={q,t,gap,o0,o1};}}
    out[s]=best;}
  return out;}
/* altura livre nas duas paredes (entre as janelas de um andar e do outro) num ponto do beco */
function kitFioLivre(VA,aA,VB,aB,y,m){return kitLivre(VA,aA-0.5,aA+0.5,y-m,y+m,0)&&kitLivre(VB,aB-0.5,aB+0.5,y-m,y+m,0);}
function kitFios(ctx,todos){const{p,R}=ctx;
  for(const s of ['F','B','L','R']){const vz=ctx.vizinho[s];if(!vz)continue;const q=vz.q,cq=todos.get(q),Vq=cq?cq.V:kitVaos(q),ldq=kitLados(q)[vz.t],L=ctx.ld[s];
    if(cq&&cq.feito&&cq.feito.has(p))continue;(ctx.feito||(ctx.feito=new Set())).add(q);
    const beco=vz.gap<6,nMax=beco?2:(p.andares>=3&&q.andares>=3?3:0);let n=0;
    const wq0=pw(q,...ldq.uv(0,0)),wq1=pw(q,...ldq.uv(1,0)),tq=[wq1[0]-wq0[0],wq1[1]-wq0[1]];   // sentido de "ao longo" do lado do outro prédio
    for(let tent=0;tent<30&&n<nMax;tent++){const a=vz.o0+1.2+R()*(vz.o1-vz.o0-2.4),w=pw(p,...L.uv(a,0));
      let aq=(w[0]-wq0[0])*tq[0]+(w[1]-wq0[1])*tq[1];
      if(beco){const fl=Math.min(p.andares,q.andares);if(fl<2)break;const f=1+Math.floor(R()*(fl-1)),y=p.y0+f*p.H-0.55+R()*0.4;
        if(!kitFioLivre(ctx.V[s],a,Vq[vz.t],aq,y,0.7))continue;const nc=2+Math.floor(R()*2);
        for(let i=0;i<nc;i++){const da=(R()-0.5)*0.5,dy=(R()-0.5)*0.35,wa=pw(p,...L.uv(a+da,0.04)),wq=pw(q,...ldq.uv(aq+da+(R()-0.5)*0.6,0.04));
          KIT.cabos.push({pp:p,a:[wa[0],y+dy,wa[1]],b:[wq[0],y+dy+(R()-0.5)*0.3,wq[1]],sag:0.12+R()*0.35,r:0.008+R()*0.007});}
        ctx.V[s].push({s,a,a0:a-0.5,a1:a+0.5,y0:y-0.5,y1:y+0.5,k:'peca'});n++;}
      else{aq+=(R()-0.5)*4;if(aq<1||aq>ldq.L-1)continue;const yA=kitTopo(p)-1.55-R()*0.4,yB=kitTopo(q)-1.55-R()*0.4;
        if(!kitLivre(ctx.V[s],a-0.4,a+0.4,yA-0.4,yA+0.4,0)||!kitLivre(Vq[vz.t],aq-0.4,aq+0.4,yB-0.4,yB+0.4,0))continue;
        const wq=pw(q,...ldq.uv(aq,0.05)),wa=pw(p,...L.uv(a,0.05));KIT.cabos.push({pp:p,a:[wa[0],yA,wa[1]],b:[wq[0],yB,wq[1]],sag:0.9+R()*1.1+vz.gap*0.02,r:0.012+R()*0.008});
        ctx.V[s].push({s,a,a0:a-0.3,a1:a+0.3,y0:yA-0.3,y1:yA+0.3,k:'peca'});n++;}}}}

/* ---------- 8) sujeira: escorrido embaixo das janelas e das caixas de ar, umidade no pé das paredes ---------- */
function kitSujeiraMontar(ctx){const{p,R,V,ld}=ctx,M=KIT.manchas;
  const faixa=(s,a,w,y0,y1,al0,al1,cor,o)=>{const L=ld[s];M.push({p,s,L,a,w,y0,y1,al0,al1,cor,o});};
  for(const s of ['F','B','L','R']){
    for(const v of V[s]){if(v.k==='jan'&&!v.j.vitrine&&v.y1&&R()<0.16){const lg=v.a1-v.a0;   // v10.2.6: fuligem subindo da janela (o fogo passou por ali)
        faixa(s,v.a,lg+0.35+R()*0.3,v.y1+0.02,v.y1+0.9+R()*1.1,0.62+R()*0.2,0,3);}
      if(v.k==='jan'&&!v.j.vitrine){const n=2+Math.floor(R()*3),lg=v.a1-v.a0;
        for(let i=0;i<n;i++){const a=v.a0+0.08+R()*(lg-0.16),w=0.05+R()*0.16,len=0.35+R()*(v.f>0?1.3:0.7);faixa(s,a,w,v.y0-0.04,v.y0-0.04-len,0.24+R()*0.2,0,0);}}}
    for(const q of ctx.ares)if(q[0]===s){const n=1+Math.floor(R()*2);for(let i=0;i<n;i++){const a=q[1]+(R()-0.5)*q[3]*0.6,len=0.6+R()*1.2;faixa(s,a,0.06+R()*0.1,q[2]+0.02,q[2]-len,0.32+R()*0.14,0,1);}}
    /* pé da parede: trechos sobrepostos de umidade, mais altos e mais escuros perto dos cantos */
    const L=ld[s].L;for(let a=0.1;a<L-0.1;){const w=0.8+R()*2.2,c=a+w/2;
      if(kitLivre(V[s].filter(v=>v.k==='porta'||v.k==='escada'),c-w/2,c+w/2,QUADRA_Y,QUADRA_Y+1,0)){const h=0.3+R()*0.6+(c<1.5||c>L-1.5?0.3:0);faixa(s,c,w,QUADRA_Y,QUADRA_Y+h,0.26+R()*0.16,0,2,p.andares===1&&s==='F'?0.075:0.012);}
      a+=w*(0.55+R()*0.4);}}}
/* faixa vertical: escorrido (alfa forte em cima, some embaixo) ou umidade (forte embaixo, some em cima) com a borda irregular */
function kitSujeiraGeo(manchas){const out=[];
  const C=[[0.13,0.115,0.095],[0.16,0.1,0.06],[0.11,0.105,0.09],[0.028,0.026,0.024]];   // 3: fuligem de incêndio (v10.2.6)
  for(const f of manchas){const{p,L,a,w,y0,y1,al0,al1}=f,c=C[f.cor],o=(f.o||0.012)+((a*7.31)%1)*0.004;
    const pt=(aa,y)=>{const uv=L.uv(aa,o),q=pw(p,uv[0],uv[1]);return[q[0],y,q[1]];};
    const n=f.cor===2?6:3;   // umidade: borda de cima recortada em vários pedaços
    for(let i=0;i<n;i++){const a0=a-w/2+w*i/n,a1=a-w/2+w*(i+1)/n,j=f.cor===2?(Math.sin(a0*13.1+y0*7.7)*0.5+0.5)*0.45+0.55:1,ya=y0+(y1-y0)*j;
      const A=pt(a0,y0),B=pt(a1,y0),Cc=pt(a1,ya),D=pt(a0,ya);
      for(const[q,al]of[[A,al0],[B,al0],[Cc,al1],[A,al0],[Cc,al1],[D,al1]])out.push(q[0],q[1],q[2],c[0],c[1],c[2],al);}}
  return new Float32Array(out);}

/* ---------- montagem (depois que a cidade nasce) ---------- */
/* ---------- passo 3: casas (telhado de duas águas) e armazéns do Distrito Industrial (v10.2.5) ----------
   Casa: calha só nos lados com beiral (frente e fundo), no máximo um ar-condicionado e, em metade delas, a armação de antena
   em pé na cumeeira, perto de um oitão (sem caixa d'água nem barraco: o telhado é inclinado). Armazém: além do telhado plano,
   tambores, caçamba, lona e tanque encostados nas paredes do pátio (fora das portas e dos caminhos), com colisão. */
function kitTelhadoCasa(ctx){const{p,R}=ctx;if(R()<0.5)return;const t=kitT('antena'),k=0.62,u=R()<0.5?1.2+t[0]*k/2:p.W-1.2-t[0]*k/2;
  const it=kitChao(ctx,'antena',u,p.D/2,p.yTopo+1.5+0.08,R()<0.5?0:Math.PI,[k,k,k],false);if(it)(ctx.telhado||(ctx.telhado=[])).push('antena');}
function kitPatio(ctx){const{p,R,V,ld}=ctx;const nos=CID.nos.filter(q=>q.y<1.5&&Math.abs(q.x-(p.x0+p.x1)/2)<p.W+8&&Math.abs(q.z-(p.z0+p.z1)/2)<p.D+8);
  const lista=['tambores','cacamba','tambores','lona','tanque','tambores'];let n=0;
  for(let tent=0;tent<40&&n<5;tent++){const s=['B','L','R','F'][tent%4],m=lista[n%lista.length],t=kitT(m),L=ld[s].L;if(L<t[0]+3)continue;
    const a=1.4+t[0]/2+R()*(L-2.8-t[0]);
    if(!kitLivre(V[s],a-t[0]/2-0.7,a+t[0]/2+0.7,-0.5,Math.max(1.6,t[1]),0)||kitPropPerto(p,s,a,0,t[0]/2+1.0)||ctx.chao.some(q=>q[0]===s&&Math.abs(q[1]-a)<t[0]+1.2))continue;
    const uv=ld[s].uv(a,0.15+t[2]/2),gi={F:Math.PI,B:0,L:-Math.PI/2,R:Math.PI/2}[s],wc=pw(p,uv[0],uv[1]);
    if(nos.some(q=>Math.hypot(q.x-wc[0],q.z-wc[1])<t[0]/2+1.0))continue;
    const it=kitChao(ctx,m,uv[0],uv[1],QUADRA_Y,gi,[1,1,1],true);if(!it)continue;it.chao=true;it.wx=wc[0];it.wz=wc[1];
    V[s].push({s,a,a0:a-t[0]/2,a1:a+t[0]/2,y0:-0.5,y1:t[1],k:'peca'});ctx.chao.push([s,a]);n++;}}
function kitPredios(){return CID.predios.filter(p=>p.W&&(KIT.extras.includes(p.nome)||!p.rural)&&(KIT.extras.includes(p.nome)||(()=>{const b=bairroEm((p.x0+p.x1)/2,(p.z0+p.z1)/2);return!!b&&KIT.bairros.includes(b.nome);})()));}
/* um grupo por quarteirão: as peças, os cabos e a sujeira dos prédios dele (os cabos ficam com o prédio de onde saem) */
function kitAgrupar(){const G=new Map(),grupo=p=>{const q=quadraEm((p.x0+p.x1)/2,(p.z0+p.z1)/2)||p;let g=G.get(q);
    if(!g){g={q,ps:new Set(),itens:[],cabos:[],manchas:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,m:null,mp:null,mc:null,mm:null};G.set(q,g);}g.ps.add(p);return g;};
  for(const it of KIT.itens)grupo(it.pp).itens.push(it);for(const c of KIT.cabos)grupo(c.pp).cabos.push(c);for(const f of KIT.manchas)grupo(f.p).manchas.push(f);
  for(const g of G.values()){for(const p of g.ps){g.x0=Math.min(g.x0,p.x0);g.x1=Math.max(g.x1,p.x1);g.z0=Math.min(g.z0,p.z0);g.z1=Math.max(g.z1,p.z1);}
    for(const c of g.cabos)for(const q of [c.a,c.b]){g.x0=Math.min(g.x0,q[0]);g.x1=Math.max(g.x1,q[0]);g.z0=Math.min(g.z0,q[2]);g.z1=Math.max(g.z1,q[2]);}
    g.x0-=3;g.x1+=3;g.z0-=3;g.z1+=3;}
  return[...G.values()];}
function kitGerar(){for(const c of KIT.cols)colRemove(c);KIT.cols.length=0;KIT.itens.length=0;KIT.cabos.length=0;KIT.manchas.length=0;KIT.grupos=[];
  if(!kitOk()||!CID.predios.length)return;const ps=kitPredios();if(!ps.length)return;
  const todos=new Map();
  for(const p of ps){const ctx={p,R:rng(91000+p.id*131),ld:kitLados(p),V:kitVaos(p),itens:KIT.itens,calhas:[],ares:[],chao:[]};ctx.vizinho=kitVizinhos(p,CID.predios);todos.set(p,ctx);}
  for(const ctx of todos.values()){kitCalhas(ctx);kitLuz(ctx);kitLojas(ctx);kitArCond(ctx);kitTapumes(ctx);
    if(ctx.p.casa)kitTelhadoCasa(ctx);else{kitTelhado(ctx);kitBeco(ctx);}if(ctx.p.tipo==='armazem')kitPatio(ctx);}
  for(const ctx of todos.values())kitFios(ctx,todos);
  for(const ctx of todos.values())kitSujeiraMontar(ctx);
  KIT.grupos=kitAgrupar();
  const cont={};for(const it of KIT.itens)cont[it.m]=(cont[it.m]||0)+1;
  KIT.info={predios:ps.map(p=>p.nome),quarteiroes:KIT.grupos.length,pecas:KIT.itens.length,porTipo:cont,cabos:KIT.cabos.length,manchas:KIT.manchas.length,colisoes:KIT.cols.length,
    telhados:Object.fromEntries([...todos.values()].map(c=>[c.p.nome,(c.telhado||[]).join(',')]))};}
{const _gc=gerarCidade;gerarCidade=function(){const r=_gc.apply(this,arguments);try{kitGerar();}catch(e){console.error('kit (peças das fachadas)',e);}return r;};}

/* ---------- malhas: as peças juntas numa malha com a textura do kit; os cabos e a sujeira à parte ---------- */
function kitPeca(id){let d=KIT.pecas[id];if(d!==undefined)return d;const X=KITX.pecas[id];if(!X)return KIT.pecas[id]=null;const g=mod3dDecodificar(X);return KIT.pecas[id]={f:g.f,uv:g.uv,n:g.nt*3};}
function kitJuntar(itens){let nv=0;for(const it of itens){const d=it.proc||kitPeca(it.m);if(d)nv+=d.n;}
  const f=new Float32Array(nv*11),uv=new Float32Array(nv*2);let o=0;
  for(const it of itens){if(it.proc){f.set(it.proc.f,o*11);uv.set(it.proc.uv,o*2);o+=it.proc.n;continue;}const d=kitPeca(it.m);if(!d)continue;const M=it.M,c=it.cor||[1,1,1],e=it.e||[1,1,1],i0=1/(e[0]*e[0]),i1=1/(e[1]*e[1]),i2=1/(e[2]*e[2]);
    for(let i=0;i<d.n;i++,o++){const a=i*11,b=o*11,x=d.f[a],y=d.f[a+1],z=d.f[a+2];
      f[b]=M[0]*x+M[4]*y+M[8]*z+M[12];f[b+1]=M[1]*x+M[5]*y+M[9]*z+M[13];f[b+2]=M[2]*x+M[6]*y+M[10]*z+M[14];
      f[b+3]=c[0];f[b+4]=c[1];f[b+5]=c[2];f[b+6]=0;f[b+7]=0;
      const nx=d.f[a+8]*i0,ny=d.f[a+9]*i1,nz=d.f[a+10]*i2,X=M[0]*nx+M[4]*ny+M[8]*nz,Y=M[1]*nx+M[5]*ny+M[9]*nz,Z=M[2]*nx+M[6]*ny+M[10]*nz,l=Math.hypot(X,Y,Z)||1;
      f[b+8]=X/l;f[b+9]=Y/l;f[b+10]=Z/l;uv[o*2]=d.uv[i*2];uv[o*2+1]=d.uv[i*2+1];}}
  return{f,uv,n:nv};}
/* cabo: tubo de 6 lados pendurado (catenária aproximada por parábola), cor de borracha velha */
function kitCabosGeo(cabos){const out=[],cor=[0.055,0.052,0.05];
  for(const c of cabos){const N=26,S=6,pts=[];for(let i=0;i<=N;i++){const t=i/N;pts.push([c.a[0]+(c.b[0]-c.a[0])*t,c.a[1]+(c.b[1]-c.a[1])*t-4*c.sag*t*(1-t),c.a[2]+(c.b[2]-c.a[2])*t]);}
    for(let i=0;i<N;i++){const A=pts[i],B=pts[i+1],d=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(...d),t=[d[0]/l,d[1]/l,d[2]/l];
      let u=[-t[2],0,t[0]];const lu=Math.hypot(...u)||1;u=[u[0]/lu,u[1]/lu,u[2]/lu];const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
      for(let k=0;k<S;k++){const a0=k/S*6.2832,a1=(k+1)/S*6.2832,n0=[u[0]*Math.cos(a0)+v[0]*Math.sin(a0),u[1]*Math.cos(a0)+v[1]*Math.sin(a0),u[2]*Math.cos(a0)+v[2]*Math.sin(a0)],
          n1=[u[0]*Math.cos(a1)+v[0]*Math.sin(a1),u[1]*Math.cos(a1)+v[1]*Math.sin(a1),u[2]*Math.cos(a1)+v[2]*Math.sin(a1)];
        const P=(Q,n)=>[Q[0]+n[0]*c.r,Q[1]+n[1]*c.r,Q[2]+n[2]*c.r];
        for(const[Q,n]of[[A,n0],[B,n0],[B,n1],[A,n0],[B,n1],[A,n1]]){const q=P(Q,n);out.push(q[0],q[1],q[2],cor[0],cor[1],cor[2],0,0,n[0],n[1],n[2]);}}}}
  return new Float32Array(out);}
/* as peças pequenas (ar-condicionado, quadros, calhas, respiros, o que está no chão do beco) somem antes, a 70 m, onde já são
   poucos pixels; as grandes (caixa d'água, barraco, antenas, placas, chapas nas janelas) e os cabos vão até onde vão os
   detalhes dos prédios */
const KIT_PEQ=new Set(['arCond','arCaixa','quadroLuz','caixaLuz','extintor','respiro','cano','canoReto','canoLuva','cacamba','tambores','lona','caixas','barreira','tabuas']);
function kitMalhas(g){if(g.m!==null)return;g.m=false;
  try{const tex=texModelo('kit_atlas',KITX.tex,false),gr=g.itens.filter(it=>it.grande||!KIT_PEQ.has(it.m)),pq=g.itens.filter(it=>!it.grande&&KIT_PEQ.has(it.m));
    const A=kitJuntar(gr),B=kitJuntar(pq);if(A.n)g.m=texMesh(A.f,A.uv,tex);if(B.n)g.mp=texMesh(B.f,B.uv,tex);if(!g.m&&g.mp){g.m=g.mp;g.mp=null;}
    g.tri=(A.n+B.n)/3;g.triPerto=B.n/3;
    const c=kitCabosGeo(g.cabos);if(c.length)g.mc=litMesh(c);
    const s=kitSujeiraGeo(g.manchas);if(s.length)g.mm=unMesh(s);}
  catch(e){console.error('kit (malhas)',e);}}
function kitPerto(g,ox,oz){return Math.hypot(Math.max(g.x0-ox,0,ox-g.x1),Math.max(g.z0-oz,0,oz-g.z1));}
function kitDesenhar(Pg,sombra,perto){if(!KIT.on||!KIT.grupos.length)return;const ox=sombra?P.x:cam.pos[0],oz=sombra?P.z:cam.pos[2],oy=sombra?P.y:cam.pos[1];
  if(oy<SUB_FUNDO)return;
  for(const g of KIT.grupos){const d=kitPerto(g,ox,oz);if(d>(sombra?(perto?60:110):KIT.dist))continue;
    if(g.m===null)kitMalhas(g);if(!g.m||(g.m.tex&&!g.m.tex.pronta))continue;const pq=g.mp&&d<(sombra?60:KIT.distPerto)?g.mp:null;
    if(sombra){gl.uniformMatrix4fv(Pg.u.uModel,false,ID);for(const m of [g.m,pq,g.mc])if(m){gl.bindVertexArray(m.vao);gl.drawArrays(gl.TRIANGLES,0,m.count);}continue;}
    drawStat(Pg,g.m,ID);if(pq)drawStat(Pg,pq,ID);if(g.mc)drawStat(Pg,g.mc,ID);}}
DESENHO.opaco.push(Pg=>kitDesenhar(Pg,false));
DESENHO.sombra.push((Pg,perto)=>kitDesenhar(Pg,true,perto));
/* a sujeira vai junto com as manchas de sangue (mesmo programa, mesma mistura, sem escrever profundidade) */
function kitSujeira(){if(!KIT.on||!KIT.grupos.length||cam.pos[1]<SUB_FUNDO)return;let usou=false;
  for(const g of KIT.grupos){if(!g.mm||kitPerto(g,cam.pos[0],cam.pos[2])>80)continue;
    if(!usou){const n=E.n||0,luz=lerp(1,0.3,n);gl.uniform4f(PU.u.uTint,luz,luz,luz,1);gl.uniformMatrix4fv(PU.u.uModel,false,ID);usou=true;}
    gl.bindVertexArray(g.mm.vao);gl.drawArrays(gl.TRIANGLES,0,g.mm.count);}
  if(usou)gl.bindVertexArray(DISC.vao);}
{const _dm=desenharManchas;desenharManchas=function(){_dm.apply(this,arguments);try{kitSujeira();}catch(e){}};}
