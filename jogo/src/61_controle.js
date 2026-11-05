/* ================= controle (gamepad) no PC =================
   Esquerdo anda, direito olha. A pula/sobe, B agacha (correndo: rola), X usa (segurar = vasculhar), Y troca de arma,
   RT ataca, LT mira, LB empurra, RB recarrega, L3 corre, R3 troca a câmera, setas: ↑ lanterna, ↓ construir, ← → item anterior/próximo,
   Select mochila, Start pausa. Os menus, a construção e o Select segurado (mapa) estão em 61b_controles.js (Etapa 11). */
const GP={ativo:false,ant:[],mov:false,olhaT:0,avisou:false};
window.addEventListener('gamepadconnected',e=>{GP.ativo=true;if(!GP.avisou){GP.avisou=true;toast('corpo','Controle conectado: esquerdo anda, direito olha, RT ataca, LT mira, A pula, B agacha/rola, X usa. Start pausa.');}});
window.addEventListener('gamepaddisconnected',()=>{GP.ativo=false;IN.mx=IN.mz=0;moverTeclas();});
function zonaMorta(v,dz){const a=Math.abs(v);if(a<dz)return 0;const t=(a-dz)/(1-dz);return Math.sign(v)*t*t*(1.6-0.6*t);}   // curva: fino perto do centro, rápido na borda
function lerControle(dt){if(!GP.ativo||!navigator.getGamepads)return;let gp=null;for(const g of navigator.getGamepads())if(g&&g.connected){gp=g;break;}if(!gp)return;
  const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5)),A=GP.ant,apertou=i=>b(i)&&!A[i],soltou=i=>!b(i)&&A[i];
  if(G.modo==='jogo'){
    const lx=zonaMorta(gp.axes[0]||0,0.16),ly=zonaMorta(gp.axes[1]||0,0.16);
    if(lx||ly){IN.mx=lx;IN.mz=-ly;GP.mov=true;}else if(GP.mov){GP.mov=false;IN.mx=IN.mz=0;moverTeclas();}
    const rx=zonaMorta(gp.axes[2]||0,0.12),ry=zonaMorta(gp.axes[3]||0,0.12);
    if(rx||ry){const k=dt*(P.aim>0.5?1.6:2.9)*(cfg.sens||1);P.yaw-=rx*k;P.pitch=clamp(P.pitch-ry*k*0.75,-1.25,1.05);}
    if(apertou(10)){IN.runFix=!IN.runFix;IN.run=IN.runFix;if(IN.run&&P.agachado)agachar(false);}
    if(IN.runFix&&!(lx||ly)&&!KEYS.ShiftLeft){IN.runFix=false;IN.run=false;}
    if(apertou(0)){if(CARRO.ativo)IN.freio=true;else pular();}if(soltou(0))IN.freio=false;
    if(apertou(1)&&!CARRO.ativo){if(IN.run&&(lx||ly)&&rolar()){}else agachar();}
    if(apertou(2))usarPress();if(soltou(2))usarSolta();
    if(apertou(3)){const n=BAR_N;for(let k=1;k<=n;k++){const j=(P.sel+k)%n;if(P.inv[j]&&ITEMS[P.inv[j].id]&&(ITEMS[P.inv[j].id].tipo==='arma'||ITEMS[P.inv[j].id].mao)){selecionar(j);break;}}}
    if(b(7)||(gp.buttons[7]&&gp.buttons[7].value>0.35)){if(!A[7]){if(OBRA.ativo)colocarObra();else{IN.attack=true;IN.atkQ=true;}}}else if(A[7])IN.attack=false;
    IN.aim=b(6)||(gp.buttons[6]&&gp.buttons[6].value>0.35);
    if(apertou(4)&&!CARRO.ativo)empurrar();if(apertou(5)){if(OBRA.ativo)OBRA.rot+=Math.PI/4;else recarregar();}
    if(apertou(11))trocarCamera();if(apertou(12))lanterna();if(apertou(13)&&!CARRO.ativo)modoObra();
    if(apertou(14))selecionar((P.sel+BAR_N-1)%BAR_N);if(apertou(15))selecionar((P.sel+1)%BAR_N);
    if(apertou(8))abrirMochila();if(apertou(9))pausar();}
  else if(G.modo==='mochila'){if(apertou(8)||apertou(1)){fecharMochila();}}
  else if(G.modo==='pausa'){if(apertou(9)||apertou(1)){G.modo='jogo';tela(null);}}
  for(let i=0;i<gp.buttons.length;i++)A[i]=b(i);}
