/* ================= Etapa 16 (continuação): ponte de madeira e deque na água doce (aba Água) =================
   PONTE DE MADEIRA: na beira de um rio, lago ou vala, olhe para a outra margem. A ponte vai de margem a margem (até 14 m), com
   corrimão dos dois lados e estacas na água; o tabuleiro fica um pouco acima da água (dá para nadar por baixo). Custa por trecho de 2 m.
   DEQUE: na margem, olhando para a água: um piso de madeira de 3 × 4 m sobre estacas, com mureta e um poste de amarrar; bom para
   pescar longe da margem (e, mais tarde, para encostar barco). As construções do mar ficam para a Etapa 20. */
iconesNovos({
  'i-ponte-madeira':'<path d="M2 14c4-4 16-4 20 0"/><path d="M2 14v5M22 14v5M7 11.5V19M12 10.6V19M17 11.5V19"/><path d="M2 17h20"/>',
  'i-deque':'<path d="M3 11h18v3H3z"/><path d="M5 14v6M12 14v6M19 14v6"/><path d="M3 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/><path d="M19 11V7"/>'});
OBRAS.ponteMadeira={nome:'Ponte de madeira',icon:'i-ponte-madeira',custo:{tabuas:4,madeira:2,pregos:2},hp:420,hw:1,hd:1,solid:false,etapa:2,
  desc:'Atravessa rio, lago ou vala de margem a margem (até 14 m), com corrimão. Custa por trecho de 2 m.'};
OBRAS.deque={nome:'Deque',icon:'i-deque',custo:{tabuas:10,madeira:4,pregos:6},hp:500,hw:1.5,hd:2,solid:false,etapa:2,
  desc:'Piso de madeira sobre estacas na água doce, saindo da margem. Bom para pescar longe da margem.'};
OBRA_ORDEM.push('ponteMadeira','deque');for(const k of['ponteMadeira','deque'])if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);
{const c=OBRA_CATS.find(q=>q.id==='agua');if(c){for(const k of['ponteMadeira','deque'])if(!c.t.includes(k))c.t.push(k);}}
if(typeof LUGAR_EXT!=='undefined')for(const k of['nv','w','L','y0'])LUGAR_EXT.add(k);
Object.assign(BASE_DICAS,{ponteMadeira:'Ponte pronta: atravesse andando. O corrimão segura; por baixo dá para passar nadando.',
  deque:'Deque pronto: ande até a ponta para pescar longe da margem. Segure E no poste para amarrar o barco (quando tiver um).'});
/* ---------- ponte ---------- */
const PON={max:14,larg:1.8};
function ponteAltura(e,t){const L=Math.hypot(e.bx-e.ax,e.bz-e.az),arco=clamp(L*0.035,0.1,0.45);let h=lerp(e.ay,e.by,t)+Math.sin(Math.PI*t)*arco;
  if(e.nv!==null&&e.nv!==undefined&&t>0.08&&t<0.92)h=Math.max(h,e.nv+0.8);return h;}
function alvoPonteMadeira(x,z,yaw){const f=[Math.sin(P.yaw),Math.cos(P.yaw)],r={x,z,y:ground(x,z),yaw:P.yaw},no=m=>Object.assign(r,{ok:false,motivo:m});
  const A=[P.x+f[0]*1.1,P.z+f[1]*1.1];if(aguaProf(A[0],A[1])>0.15)return no('Comece a ponte na margem, em terra firme');
  const yA=ground(A[0],A[1]);let viu=false,B=null,nv=-1e9;
  for(let s=0.5;s<=PON.max;s+=0.25){const px=A[0]+f[0]*s,pz=A[1]+f[1]*s,gy=ground(px,pz),nA=aguaNivel(px,pz),agua=nA!==null&&nA-gy>0.12;
    if(agua||gy<yA-1.1){viu=true;if(nA!==null)nv=Math.max(nv,nA);continue;}if(viu){B=[px+f[0]*0.6,pz+f[1]*0.6];break;}}
  if(!viu)return no('A ponte vai por cima de rio, lago ou vala: olhe para a outra margem');
  if(!B)return no('Longe demais: a ponte vai até '+PON.max+' m');
  const yB=ground(B[0],B[1]);if(Math.abs(yB-yA)>2.5)return no('A outra margem é alta demais');
  if(!dentroMapa(A[0],A[1],3)||!dentroMapa(B[0],B[1],3)||!dentroMapa((A[0]+B[0])/2,(A[1]+B[1])/2,3))return no('Longe demais');
  const L=Math.hypot(B[0]-A[0],B[1]-A[1]);r.x=(A[0]+B[0])/2;r.z=(A[1]+B[1])/2;r.y=(yA+yB)/2;r.yaw=Math.atan2(f[0],f[1]);
  r.ext={ax:+A[0].toFixed(2),az:+A[1].toFixed(2),ay:+yA.toFixed(2),bx:+B[0].toFixed(2),bz:+B[1].toFixed(2),by:+yB.toFixed(2),n:Math.max(1,Math.ceil(L/2)),nv:nv>-1e8?+nv.toFixed(2):null};
  for(let i=1;i<12;i++){const t=i/12,px=lerp(A[0],B[0],t),pz=lerp(A[1],B[1],t);if(pointBlocked(px,pz,0.35))return no('Tem coisa no caminho da ponte');}
  if(OB.some(q=>q.tipo==='ponteMadeira'&&d2(q.x,q.z,r.x,r.z)<4))return no('Já tem ponte aqui');
  r.ok=true;return r;}
OBRAS.ponteMadeira.alvo=alvoPonteMadeira;
{const _co=custoObra;custoObra=function(k){const c=_co.apply(this,arguments);if(k!=='ponteMadeira'||!OBRA.ativo||OBRA.tipo!==k||!OBRA.ext||!OBRA.ext.n)return c;const o={};for(const q in c)o[q]=c[q]*OBRA.ext.n;return o;};}
function geoPonteMadeira(e,o){const g=new GB(8192,8),R=rng(Math.round((e.ax+e.bz)*100)),C=k=>lin(COR_CASA[k]),L=Math.hypot(e.bx-e.ax,e.bz-e.az),W=PON.larg,y0=(e.ay+e.by)/2,hz=L/2;
  const hAt=t=>ponteAltura(e,t)-y0,nT=Math.max(6,Math.round(L/0.28));
  for(let i=0;i<nT;i++){const t=(i+0.5)/nT,z=-hz+L*t;add(g,boxTris(W,0.06,L/nT*0.88),mat(0,hAt(t)-0.03,z),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  const nS=Math.max(2,Math.ceil(L/1.2));
  for(const x of[-W/2+0.1,W/2-0.1])for(let i=0;i<nS;i++){const ta=i/nS,tb=(i+1)/nS,za=-hz+L*ta,zb=-hz+L*tb,ya=hAt(ta)-0.13,yb=hAt(tb)-0.13,Ls=Math.hypot(zb-za,yb-ya);
    add(g,boxTris(0.12,0.14,Ls+0.02),mat(x,(ya+yb)/2,(za+zb)/2,-Math.atan2(yb-ya,zb-za),0,0),C('esc'),{j:0.06,rnd:R});}
  const nP=Math.max(2,Math.round(L/2));
  for(const x of[-W/2,W/2]){for(let i=0;i<=nP;i++){const t=i/nP;add(g,boxTris(0.09,1.0,0.09),mat(x,hAt(t)+0.45,-hz+L*t),C('esc2'));}
    for(let i=0;i<nP;i++){const ta=i/nP,tb=(i+1)/nP,za=-hz+L*ta,zb=-hz+L*tb,ya=hAt(ta)+0.92,yb=hAt(tb)+0.92,Ls=Math.hypot(zb-za,yb-ya);add(g,boxTris(0.07,0.07,Ls+0.04),mat(x,(ya+yb)/2,(za+zb)/2,-Math.atan2(yb-ya,zb-za),0,0),C('mad'),{j:0.06,rnd:R});}}
  if(o){for(let i=1;i<nP;i++){const t=i/nP,z=-hz+L*t,w=localW(o,0,z),gy=ground(w[0],w[1])-y0,top=hAt(t)-0.14;if(top-gy<0.3)continue;for(const x of[-W/2+0.15,W/2-0.15])add(g,boxTris(0.16,top-gy+0.4,0.16),mat(x,(top+gy-0.4)/2,z),C('esc'),{j:0.06,rnd:R});}}
  return g.data();}
function ponteMadMontar(o){const e=o.ext,L=Math.hypot(e.bx-e.ax,e.bz-e.az),N=Math.max(2,Math.ceil(L/1.5)),W=PON.larg;o.sups=[];o.cols=[];
  for(let j=0;j<N;j++){const ta=j/N,tb=(j+1)/N,tm=(ta+tb)/2,c=[lerp(e.ax,e.bx,tm),lerp(e.az,e.bz,tm)],hd=L/N/2+0.03;
    o.sups.push(supAdd({t:'ram',x:c[0],z:c[1],hw:W/2,hd,yaw:o.yaw,ya:ponteAltura(e,ta)-0.0,yb:ponteAltura(e,tb),dono:o}));
    const lo=Math.min(ponteAltura(e,ta),ponteAltura(e,tb)),hi=Math.max(ponteAltura(e,ta),ponteAltura(e,tb));
    for(const sd of[-1,1]){const w=localW(o,sd*(W/2+0.02),(tm-0.5)*L);o.cols.push(colBox(w[0],w[1],0.05,hd,o.yaw,{solid:true,obra:o,y0:lo-0.05,y1:hi+1.0}));}}
  o.mesh=litMesh(geoPonteMadeira(e,o));}
OBRAS.ponteMadeira.montar=ponteMadMontar;
/* ---------- deque ---------- */
const DQ={w:3,l:4};
function alvoDeque(x,z,yaw){const f=[Math.sin(P.yaw),Math.cos(P.yaw)],r={x,z,y:ground(x,z),yaw:Math.atan2(f[0],f[1])},no=m=>Object.assign(r,{ok:false,motivo:m});
  let A=null;for(let s=0.6;s<=4;s+=0.2){const px=P.x+f[0]*s,pz=P.z+f[1]*s;if(aguaProf(px,pz)>0.12){A=[P.x+f[0]*(s-0.5),P.z+f[1]*(s-0.5)];break;}}
  if(!A)return no('O deque vai na margem, saindo para a água: olhe para a água de perto');
  const gA=ground(A[0],A[1]),c=[A[0]+f[0]*DQ.l/2,A[1]+f[1]*DQ.l/2];let molhado=0,nv=-1e9;const p={x:c[0],z:c[1],yaw:r.yaw};
  for(let i=-1;i<=1;i++)for(let j=-2;j<=2;j++){const w=localW(p,i*1.2,j*0.95),n=aguaNivel(w[0],w[1]);if(n!==null&&n-ground(w[0],w[1])>0.1){molhado++;nv=Math.max(nv,n);}}
  if(molhado<6)return no('Pouca água embaixo: avance o deque para dentro do rio ou do lago');
  if(!dentroMapa(c[0],c[1],4))return no('Longe demais');
  if(nv-gA>0.6)return no('A margem aqui é baixa demais');
  const y=Math.max(nv+0.45,gA-0.15);if(y-gA>1.3)return no('A margem é alta demais: procure um lugar mais baixo');
  Object.assign(r,{x:c[0],z:c[1],y,ext:{nv:+nv.toFixed(2),y0:+gA.toFixed(2)}});
  for(const[lx,lz]of[[0,0],[1.2,1.6],[-1.2,1.6],[1.2,-1.4],[-1.2,-1.4]]){const w=localW(r,lx,lz);if(pointBlocked(w[0],w[1],0.3))return no('Tem coisa no caminho');}
  if(OB.some(q=>(q.tipo==='deque'||q.tipo==='ponteMadeira')&&d2(q.x,q.z,r.x,r.z)<5*5))return no('Encosta em outra ponte ou deque');
  r.ok=true;return r;}
OBRAS.deque.alvo=alvoDeque;
function geoDeque(e,o){const g=new GB(8192,8),R=rng(Math.round(((o&&o.x)||1)*100)),C=k=>lin(COR_CASA[k]),W=DQ.w,Lq=DQ.l;
  for(let i=0;i<14;i++){const z=-Lq/2+(i+0.5)*Lq/14;add(g,boxTris(W,0.06,Lq/14*0.88),mat(0,-0.03,z),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  for(const x of[-W/2+0.12,0,W/2-0.12])add(g,boxTris(0.12,0.14,Lq),mat(x,-0.13,0),C('esc'),{j:0.06,rnd:R});
  if(o){for(const x of[-W/2+0.15,W/2-0.15])for(const z of[-Lq/2+0.3,0,Lq/2-0.2]){const w=localW(o,x,z),gy=ground(w[0],w[1])-o.y;if(gy>-0.25)continue;add(g,boxTris(0.17,-gy+0.3,0.17),mat(x,(gy-0.2)/2,z),C('esc'),{j:0.06,rnd:R});}}
  for(const x of[-W/2,W/2]){for(const z of[-Lq/2+0.6,0,Lq/2-0.05])add(g,boxTris(0.08,0.6,0.08),mat(x,0.3,z),C('esc2'));add(g,boxTris(0.07,0.07,Lq-0.55),mat(x,0.58,0.27),C('mad'));}
  add(g,boxTris(W,0.07,0.07),mat(0,0.58,Lq/2-0.05),C('mad'));for(const x of[-W/2+0.4,W/2-0.4])add(g,boxTris(0.07,0.6,0.07),mat(x,0.3,Lq/2-0.05),C('esc2'));
  add(g,boxTris(0.16,0.75,0.16),mat(W/2-0.35,0.37,Lq/2-0.4),C('esc'));add(g,boxTris(0.3,0.05,0.07),mat(W/2-0.35,0.62,Lq/2-0.4),lin(0x3a3a38));
  if(e&&o&&o.y-e.y0>0.5){const h=o.y-e.y0;add(g,boxTris(1.2,0.06,Math.hypot(1.2,h)),mat(0,-h/2,-Lq/2-0.55,-Math.atan2(h,1.2),0,0),C('mad'),{j:0.08,rnd:R});}
  return g.data();}
function dequeMontar(o){const e=o.ext,W=DQ.w,Lq=DQ.l;o.sups=[supAdd({t:'ret',x:o.x,z:o.z,hw:W/2,hd:Lq/2,yaw:o.yaw,y:o.y,dono:o})];
  if(o.y-e.y0>0.5){const w=localW(o,0,-Lq/2-0.6);o.sups.push(supAdd({t:'ram',x:w[0],z:w[1],hw:0.6,hd:0.62,yaw:o.yaw,ya:e.y0,yb:o.y,dono:o}));}
  o.cols=[];const lado=(lx,lz,hw,hd)=>{const w=localW(o,lx,lz);o.cols.push(colBox(w[0],w[1],hw,hd,o.yaw,{solid:true,obra:o,y0:o.y-0.05,y1:o.y+0.65}));};
  lado(-W/2,0.3,0.05,Lq/2-0.3);lado(W/2,0.3,0.05,Lq/2-0.3);lado(0,Lq/2,W/2,0.05);
  o.mesh=litMesh(geoDeque(e,o));}
OBRAS.deque.montar=dequeMontar;
{const _fa=fantasmaAlto;fantasmaAlto=function(){const t=OBRA.tipo,e=OBRA.ext;if((t==='ponteMadeira'||t==='deque')&&e){const k=t+':'+[e.ax,e.az,e.bx,e.bz,e.nv,e.y0,OBRA.x,OBRA.z].map(v=>v===undefined||v===null?'':(+v).toFixed(1)).join();
  if(k!==fantasmaK){if(fantasmaM)liberarMesh(fantasmaM);fantasmaM=meshAlto(t==='deque'?geoDeque(Object.assign({},e),{x:OBRA.x,y:OBRA.y,z:OBRA.z,yaw:OBRA.yaw}):geoPonteMadeira(e,null));fantasmaK=k;}return fantasmaM;}return _fa.apply(this,arguments);};}
