/* ================= ganchos das casas da vila e dos sítios (registrados depois que 39_v8.js criou as listas) ================= */
/* minimapa: o contorno das casas da vila e dos sítios */
MAPA_DESENHOS.push((g,X,Y,k,n)=>{for(const p of RURAIS){const cs=[[0,0],[p.W,0],[p.W,p.D],[0,p.D]].map(q=>pw(p,q[0],q[1]));
  g.fillStyle=n>0.5?'#2e2a26':p.igreja?'#d8d0c0':p.casa?'#a8806a':'#8a8e92';g.beginPath();cs.forEach((c,i)=>i?g.lineTo(X(c[0]),Y(c[1])):g.moveTo(X(c[0]),Y(c[1])));g.closePath();g.fill();}});
/* ---------- moradores: às vezes tem um deles dormindo dentro da casa (e vários na igreja) ---------- */
let ruralZT=0;
PASSOS.push(dt=>{ruralZT-=dt;if(ruralZT>0)return;ruralZT=1.5;if(!P.alive||P.y<SUB_FUNDO)return;G.ruralZ=G.ruralZ||{};const ps=salaEm(P.x,P.y+0.3,P.z);
  for(const p of RURAIS){const d=Math.hypot((p.x0+p.x1)/2-P.x,(p.z0+p.z1)/2-P.z);if(d>48||d<13||G.ruralZ[p.id]===G.dia)continue;G.ruralZ[p.id]=G.dia;
    const n=p.igreja?3+Math.floor(Math.random()*3):Math.random()<(p.casa?0.42:0.5)?1+(Math.random()<0.25?1:0):0;
    const salas=p.salas.flat().filter(s=>s&&s!==ps&&!/escada|telhado|corredor/.test(s.tipo));if(!n||!salas.length)continue;
    for(let i=0;i<n;i++){const s=salas[Math.floor(Math.random()*salas.length)];for(let k=0;k<8;k++){const u=s.u0+0.6+Math.random()*(s.u1-s.u0-1.2),v=s.v0+0.6+Math.random()*(s.v1-s.v0-1.2),w=pw(p,u,v);
      if(bloqueadoAlto(w[0],w[1],0.35,s.y+0.1))continue;const q=criarZ(Math.random()<0.3?'emboscada':'walker',w[0],w[1],{y:s.y,cidade:true,hx:w[0],hz:w[1],hy:s.y});if(q){q.st='dorme';q.morador=p.id;}break;}}}});
V8.salvar.rurais=()=>({z:G.ruralZ||{}});
V8.carregar.rurais=s=>{G.ruralZ=s&&s.z?s.z:{};};
V8.novo.rurais=()=>{G.ruralZ={};};
