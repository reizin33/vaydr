"""p233e (Parte 2): dá para levar a caminhonete do círculo antigo até a beira nova, desviando das árvores como o jogador faz?
O p233b anda só em linha reta e para na primeira árvore (na mata de dentro também seria assim). Aqui:
1 mapa de passagem: grade de 1 m; célula livre quando a caminhonete (círculos de 1 m de raio) cabe sem encostar em árvore,
  pedra, mato fechado ou água funda. Busca em largura a partir da beira (os 9 m de mato fechado contam como chegada).
  De 2 em 2 graus, saindo do círculo antigo (r=140): existe caminho? quanto ele é mais comprido que a reta?
  Onde r=140 cai dentro do terreiro cercado de um sítio (sítio 1 e sítio 2), a largada recua para fora da cerca.
2 a mesma conta na mata de dentro (saindo de r=64 até r=136), para comparar com a mata que já existia.
3 dirigir de verdade: em 7 direções a caminhonete segue o caminho achado com volante e acelerador (IN.mx e IN.mz, como o
  jogador no teclado), com ré quando encalha, e mede até onde chegou."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;__nnc.Z.length=0;"
         "const c=window.__seg;if(c)window.__guiar(c);};")]
# 1 e 2: mapa de passagem
s += [ev("passagem", """const dm=X('dentroMapa'),R=X('raioMapaEm'),pb=X('pointBlocked'),agua=X('aguaProfVeic'),MR=X('MAP_R'),CL=1.15,
 rmax=Math.ceil(X('raioMapaMax')()+2),N=rmax*2+1,off=rmax,id=(i,j)=>i*N+j,deg=(x,z)=>(Math.atan2(z,x)*180/Math.PI+360)%360;
 const t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');
 function busca(rIni,rFim,meta,folga){const L=new Int8Array(N*N),D=new Int32Array(N*N).fill(-1),q=[];
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x=i-off+0.5,z=j-off+0.5,r=Math.hypot(x,z);if(r<rIni-folga||r>rFim)continue;const a=deg(x,z);if(a<44||a>268)continue;
   if(!dm(x,z,1.2))continue;const c=pb(x,z,CL);if(c&&!(t&&c.veic===t))continue;if(agua&&agua(x,z)>1.1)continue;L[id(i,j)]=1;if(meta(x,z,r)){D[id(i,j)]=0;q.push(id(i,j));}}
  for(let h=0;h<q.length;h++){const k=q[h],i=(k/N)|0,j=k-i*N;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const k2=id(i+a,j+b);if(L[k2]&&D[k2]<0){D[k2]=D[k]+1;q.push(k2);}}}
  return{L,D};}
 function caminho(B,x0,z0){let best=-1,bd=1e9;for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const i=Math.floor(x0)+off+a,j=Math.floor(z0)+off+b,k=id(i,j);if(B.D[k]>=0&&a*a+b*b<bd){bd=a*a+b*b;best=k;}}
  if(best<0)return null;const P=[];let k=best;for(let g=0;g<2000;g++){const i=(k/N)|0,j=k-i*N;P.push([i-off+0.5,j-off+0.5]);if(B.D[k]===0)break;let nk=-1;
   for(let a=-1;a<=1&&nk<0;a++)for(let b=-1;b<=1;b++){const k2=id(i+a,j+b);if(B.D[k2]===B.D[k]-1){nk=k2;if(!a||!b)break;}}if(nk<0)break;k=nk;}return P;}
 const comp=P=>{let l=0;for(let i=1;i<P.length;i++)l+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return l;};
 const fora=busca(140,rmax,(x,z,r)=>r>=R(x,z)-9,44),dentro=busca(64,138,(x,z,r)=>r>=135,20);
 const res={fora:[],dentro:[]},movidas=[],rural=X('ruralEm');window.__caminhos={};
 for(let a=50;a<=262;a+=2){const ra=a*Math.PI/180;
  let P=null,r0=140;for(;r0>=100&&!P;r0-=2){const x=Math.cos(ra)*r0,z=Math.sin(ra)*r0;if(rural(x,z,1))continue;P=caminho(fora,x,z);}r0+=2;
  if(r0<140)movidas.push(a+':'+r0);const reta=raioMapaAng(a)-9-r0;if(P){res.fora.push([a,1,r2(comp(P)/Math.max(1,reta))]);window.__caminhos[a]=P;}else res.fora.push([a,0,null]);
  const Q=caminho(dentro,Math.cos(ra)*64,Math.sin(ra)*64);res.dentro.push(Q?[a,1,r2(comp(Q)/71)]:[a,0,null]);}
 function raioMapaAng(a){const ra=a*Math.PI/180;return R(Math.cos(ra)*100,Math.sin(ra)*100);}
 const resumo=L=>{const ok=L.filter(q=>q[1]),rs=ok.map(q=>q[2]).sort((p,q)=>p-q);return{angulos:L.length,comCaminho:ok.length,pct:Math.round(100*ok.length/L.length),
  desvioMediano:rs.length?rs[rs.length>>1]:null,desvio90:rs.length?rs[Math.floor(rs.length*0.9)]:null,semCaminho:L.filter(q=>!q[1]).map(q=>q[0])};};
 return{fora:resumo(res.fora),dentro:resumo(res.dentro),largadaMovida:movidas.join(' '),porAngulo:res.fora.map(q=>q[0]+':'+(q[1]?q[2]:'X')).join(' ')};""")]
# 3 dirigir de verdade seguindo o caminho
s += [js("""window.__guiar=(c)=>{const t=c.t,IN=__nnc.ev('IN');const P=c.P;let k=c.k,bd=1e9;for(let i=c.k;i<Math.min(P.length,c.k+20);i++){const d=Math.hypot(P[i][0]-t.x,P[i][1]-t.z);if(d<bd){bd=d;k=i;}}c.k=k;
 const alvo=P[Math.min(P.length-1,k+4)],dy=Math.atan2(alvo[0]-t.x,alvo[1]-t.z);let df=dy-t.yaw;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
 const r=Math.hypot(t.x,t.z);c.rMax=Math.max(c.rMax||0,r);
 if(c.re>0){c.re-=0.05;IN.mz=-0.7;IN.mx=c.reMx;return;}
 if(Math.abs(t.v)<0.6){c.parado=(c.parado||0)+0.05;if(c.parado>1.5){c.parado=0;c.re=1.3;c.reMx=df>0?1:-1;c.manobras=(c.manobras||0)+1;return;}}else c.parado=0;
 IN.mx=Math.max(-1,Math.min(1,-df*2.5));const vt=Math.abs(df)>0.6?2.5:5.5;IN.mz=t.v<vt?0.8:(t.v>vt+1.5?-0.3:0);};""")]
for a in (90, 118, 136, 160, 180, 206, 232):   # ângulos pares: o mapa de passagem é de 2 em 2 graus
    s += [js("window.__seg=null;X('sairCarro')&&X('sairCarro')();const CM=(window.__caminhos||{})[" + str(a) + "];window.__ang=" + str(a) + ";if(!CM){window.__semCaminho=true;return;}window.__semCaminho=false;"
             "const t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');const p3=CM[Math.min(CM.length-1,3)];"
             "t.x=CM[0][0];t.z=CM[0][1];t.yaw=Math.atan2(p3[0]-t.x,p3[1]-t.z);t.v=0;t.comb=80;t.hp=Math.max(t.hp||0,80);X('veicColisor')(t);vai(t.x+2,t.z+2);X('entrarVeic')(t);"
             "window.__seg={t,P:CM,k:0,rMax:0,manobras:0,r0:r2(Math.hypot(t.x,t.z))};"),
          ["gwait", 45], js("X('IN').mz=0;X('IN').mx=0;")]
    s += [ev("dir" + str(a), """if(window.__semCaminho)return{semCaminho:true};const c=window.__seg,t=c.t,r=Math.hypot(t.x,t.z),R=X('raioMapaEm')(t.x,t.z),fim=c.P[c.P.length-1];
 return{r0:c.r0,r:r2(r),rMax:r2(c.rMax),raioAqui:r2(R),faltouAteBeira:r2(R-r),chegou:c.rMax>=R-10||Math.hypot(fim[0]-t.x,fim[1]-t.z)<3,pontoDoCaminho:c.k+'/'+c.P.length,
  faltouNoCaminho:r2(Math.hypot(fim[0]-t.x,fim[1]-t.z)),manobras:c.manobras,hp:Math.round(t.hp),ativo:t.ativo};""")]
s += [js("window.__seg=null;X('IN').mz=0;X('IN').mx=0;X('sairCarro')&&X('sairCarro')();")]
salvar('tools/p233e_caminho.json', s, vp=(640, 360))
