"""p227b: dá para chegar a pé nas entradas do subsolo (mina, caverna, bunker, torre, abrigo)? Busca de caminho numa grade de 0,5 m
a partir da clareira, andando só onde o jogo deixa (dentro do mapa e sem colisão); mostra o que bloqueia perto de cada entrada."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
BFS = ("const dm=X('dentroMapa'),pb=X('pointBlocked'),S=0.5,X0=-160,Z0=-160,N=640;const ok=new Uint8Array(N*N),vis=new Uint8Array(N*N);"
       "for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=X0+i*S,z=Z0+j*S;ok[j*N+i]=dm(x,z,0.3)&&!pb(x,z,0.32)?1:0;}"
       "const q=new Int32Array(N*N);let h=0,t=0;const ini=Math.round((0-Z0)/S)*N+Math.round((4-X0)/S);vis[ini]=1;q[t++]=ini;"
       "while(h<t){const c=q[h++],i=c%N,j=(c/N)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const k=b*N+a;if(vis[k]||!ok[k])continue;vis[k]=1;q[t++]=k;}}"
       "const res={};for(const e of X('SUB').entradas){const ex=e.sup[0],ez=e.sup[1];let best=1e9;for(let dj=-8;dj<=8;dj++)for(let di=-8;di<=8;di++){const i=Math.round((ex-X0)/S)+di,j=Math.round((ez-Z0)/S)+dj;if(i<0||j<0||i>=N||j>=N)continue;if(vis[j*N+i])best=Math.min(best,Math.hypot(di*S,dj*S));}"
       "const c=pb(ex,ez,0.3);res[e.id]={nome:e.nome,x:ex,z:ez,raio:r2(Math.hypot(ex,ez)),chegaA:best>1e8?null:r2(best),bloqueio:c?Object.keys(c).filter(k=>!['x','z','r','t','c','s','hw','hd','solid','stamp','br','cells'].includes(k)).join('/'):null,trancada:!!e.trancada};}"
       "return{alcancaveis:t,entradas:res};")
s += [js("vivo();Z.length=0;"), ev("acesso", BFS)]
s += foto("e28_caverna.png", "const e=X('SUB').entradas.find(q=>q.id==='caverna');vai(e.sup[0]+Math.sin(e.sup[2])*6,e.sup[1]+Math.cos(e.sup[2])*6,X('ground')(e.sup[0]+Math.sin(e.sup[2])*6,e.sup[1]+Math.cos(e.sup[2])*6));P.yaw=Math.atan2(e.sup[0]-P.x,e.sup[1]-P.z);P.body=P.yaw;P.pitch=-0.05;n.cfg.cam='3';G.hora=12;")
s += foto("e28_mina.png", "const e=X('SUB').entradas.find(q=>q.id==='mina');vai(e.sup[0]+Math.sin(e.sup[2])*6,e.sup[1]+Math.cos(e.sup[2])*6,X('ground')(e.sup[0]+Math.sin(e.sup[2])*6,e.sup[1]+Math.cos(e.sup[2])*6));P.yaw=Math.atan2(e.sup[0]-P.x,e.sup[1]-P.z);P.body=P.yaw;P.pitch=-0.05;n.cfg.cam='3';G.hora=12;")
salvar('tools/p227b_acesso.json', s, vp=(960, 540))
