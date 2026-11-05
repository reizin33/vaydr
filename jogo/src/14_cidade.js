/* ================= cidade abandonada: quarteirões, prédios exploráveis e metrô =================
   Prédio em coordenadas locais: u ao longo da fachada, v da frente para os fundos, y absoluto.
   Cada prédio vira colisores com faixa de altura, pisos ('ret'), lances de escada ('ram'), salas (zonas internas),
   portas, janelas, recipientes e nós de navegação dos zumbis. As peças de desenho ficam em p.pecas (15_cidade_geo.js). */
const CID={predios:[],quadras:[],salas:[],portas:[],janelas:[],conts:[],nos:[],moveis:[],props:[],metro:[],ninhos:[],fugas:[],escadasExt:[],aguas:[],fumacas:[],entulhos:[],alcapoes:[],mirantes:[],poroes:[],bombas:[]};
const QUADRA_Y=0.15,PISO0=0.27,ANDAR_H=3.2;
const RUAS_EW=[{z:-44,a:4,c:2.5},{z:8,a:6,c:3},{z:58,a:4,c:2.5}],RUAS_NS=[{x:205,a:4,c:2.5},{x:255,a:4,c:2.5},{x:305,a:4,c:2.5}];
/* cores por tipo de prédio: fachada, interior, piso, detalhe */
const CID_COR={residencial:[0xb9a68e,0xcfc5b4,0x8a6e52,0x6b5a4c],escritorio:[0x8f9aa3,0xc9ccc8,0x6d6f6c,0x3f4a52],mercado:[0xd7cfbf,0xd9d4c8,0x9a9a92,0x9a3a2e],
  hospital:[0xe4e2dc,0xdfe3e0,0x9fb3ad,0x2e8a4a],oficina:[0x9a8f7c,0xa9a294,0x55534d,0x3d5a73],
  hotel:[0xb88a6a,0xd8cbb6,0x7a4e3a,0x8a2a22],policia:[0xcfd3d6,0xc9ccc8,0x6d6f6c,0x1f3a6a],farmacia:[0xe8ecea,0xe3e8e4,0xa9b3ae,0x2e8a4a],
  conveniencia:[0xd9d0c0,0xddd6c8,0x8f8a80,0xd94a1a],padaria:[0xd8c49a,0xe0d4b8,0x8a6e52,0x8a5a2a],armazem:[0x8d8f86,0x9a9a92,0x5d5d58,0x55595c],
  casa:[0xd8c8a8,0xe0d6c4,0x8a6e52,0xa8261d]};
const COR_ESCADA=0x8d8a82;
let RC=rng(424242);const RHERA=rng(77031);   // hera nas paredes: sorteio à parte, para não mudar o resto da cidade
/* --- transformação local ↔ mundo --- */
const pw=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c];
const plc=(p,x,z)=>{const dx=x-p.ox,dz=z-p.oz;return[dx*p.c-dz*p.s,dx*p.s+dz*p.c];};
function boxL(p,u0,u1,v0,v1,y0,y1,o){const c=pw(p,(u0+u1)/2,(v0+v1)/2);return colBox(c[0],c[1],(u1-u0)/2,(v1-v0)/2,p.yaw,Object.assign({solid:true,y0,y1,predio:p.id},o||{}));}
function retL(p,u0,u1,v0,v1,y,o){const c=pw(p,(u0+u1)/2,(v0+v1)/2);return supAdd(Object.assign({t:'ret',x:c[0],z:c[1],hw:(u1-u0)/2,hd:(v1-v0)/2,yaw:p.yaw,y,dono:p},o||{}));}
function ramL(p,u0,u1,v0,v1,ya,yb){const c=pw(p,(u0+u1)/2,(v0+v1)/2);return supAdd({t:'ram',x:c[0],z:c[1],hw:(u1-u0)/2,hd:(v1-v0)/2,yaw:p.yaw,ya,yb,dono:p});}
const peca=(p,u0,u1,y0,y1,v0,v1,cor,b,k,e,rx)=>p.pecas.push([u0,u1,y0,y1,v0,v1,cor,b||0,k||0,e||0,rx||0]);   // k: 0 normal, 1 só perto, 2 só longe; e: brilho; rx: inclinação (telhado)
/* parede reta: eixo 'u' corre ao longo de u na linha v=k; eixo 'v' corre ao longo de v na linha u=k.
   ab: aberturas {a,b,y0,y1,passa}; as que 'passa' cortam o colisor. fora: lado de fora (-1/+1) para pintar a casca externa; 0 = parede interna */
function paredeL(p,eixo,k,a,b,t,ya,yb,ab,corIn,bIn,fora,corFora){ab=(ab||[]).slice().sort((x,y)=>x.a-y.a);
  const R=(s0,s1,y0,y1,lado)=>{let t0=k-t/2,t1=k+t/2;if(lado<0)t1=k;else if(lado>0)t0=k;return eixo==='u'?[s0,s1,y0,y1,t0,t1]:[t0,t1,y0,y1,s0,s1];};
  const col=(s0,s1)=>{if(s1-s0<0.02)return;const r=R(s0,s1,ya,yb,0);boxL(p,r[0],r[1],r[4],r[5],ya,yb);};
  let s=a;for(const o of ab)if(o.passa){col(s,o.a);s=o.b;}col(s,b);
  const pc=(s0,s1,y0,y1)=>{if(s1-s0<0.01||y1-y0<0.01)return;
    if(fora){const r1=R(s0,s1,y0,y1,fora),r2=R(s0,s1,y0,y1,-fora);peca(p,...r1,corFora,0);peca(p,...r2,corIn,bIn);}
    else{const r=R(s0,s1,y0,y1,0);peca(p,...r,corIn,bIn);}};
  s=a;for(const o of ab){pc(s,o.a,ya,yb);pc(o.a,o.b,ya,o.y0);pc(o.a,o.b,o.y1,yb);s=o.b;}pc(s,b,ya,yb);
  // molduras das janelas na face de fora e vidro escuro só para a malha de longe
  if(fora)for(const o of ab)if(!o.passa){const fk=k+fora*t/2;const m=(s0,s1,y0,y1,d)=>{const r=eixo==='u'?[s0,s1,y0,y1,Math.min(fk,fk+fora*d),Math.max(fk,fk+fora*d)]:[Math.min(fk,fk+fora*d),Math.max(fk,fk+fora*d),y0,y1,s0,s1];return r;};
    peca(p,...m(o.a-0.06,o.b+0.06,o.y0-0.08,o.y0,0.06),0x6f6b62,0);peca(p,...m(o.a-0.06,o.b+0.06,o.y1,o.y1+0.06,0.04),0x6f6b62,0);
    const g=eixo==='u'?[o.a,o.b,o.y0,o.y1,k-t/2+0.02,k+t/2-0.02]:[k-t/2+0.02,k+t/2-0.02,o.y0,o.y1,o.a,o.b];peca(p,...g,0x1a2228,0,2);}
  // acabamento por fora (só na malha de perto): rodapé de cimento no térreo, interrompido só nas portas, e cantoneiras claras nas pontas da parede
  if(fora){const fk=k+fora*t/2,ext=(s0,s1,y0,y1,d)=>eixo==='u'?[s0,s1,y0,y1,Math.min(fk,fk+fora*d),Math.max(fk,fk+fora*d)]:[Math.min(fk,fk+fora*d),Math.max(fk,fk+fora*d),y0,y1,s0,s1];
    if(ya<=p.y0+0.05){let s0=a;for(const o of ab)if(o.passa){if(o.a-s0>0.05)peca(p,...ext(s0,o.a,ya,ya+0.32,0.022),0x5d5a52,0,1);s0=o.b;}if(b-s0>0.05)peca(p,...ext(s0,b,ya,ya+0.32,0.022),0x5d5a52,0,1);}
    for(const sx of[a,b])peca(p,...ext(sx-0.06,sx+0.06,ya,yb,0.03),0xd6d0c2,0,1);}
  // hera subindo em alguns trechos lisos da parede de fora do térreo (mais nas casas de fora da cidade); as folhas são montadas no geoPredio
  if(fora&&ya<=p.y0+0.05){const ch=p.rural?0.32:0.12,segs=[];let s0=a;for(const o of ab){segs.push([s0,o.a]);s0=o.b;}segs.push([s0,b]);
    for(const[s1,s2]of segs){if(s2-s1<0.9||RHERA()>ch)continue;const w=Math.min(s2-s1-0.15,0.6+RHERA()*1.0),c=(s1+s2)/2+(RHERA()-0.5)*(s2-s1-w)*0.8,h=Math.min(yb-ya-0.1,0.7+RHERA()*1.9);
      (p.heras||(p.heras=[])).push({eixo,k:k+fora*t/2,fora,s:c,w,y0:ya,h});}}}
/* registra as janelas de uma parede (posição no mundo, normal para fora) */
function regJanelas(p,f,eixo,k,fora,ab){const y=p.y0+f*p.H;for(const o of ab){if(o.passa)continue;const m=(o.a+o.b)/2,w=eixo==='u'?pw(p,m,k):pw(p,k,m),yawN=p.yaw+(eixo==='u'?(fora<0?Math.PI:0):(fora<0?-Math.PI/2:Math.PI/2));
  CID.janelas.push({id:CID.janelas.length,p,f,x:w[0],z:w[1],y,yaw:yawN,larg:o.b-o.a,peit:o.y0-y,quebrada:f===0&&RC()<0.3,vitrine:!!o.vit});}}
/* janelas espaçadas num trecho de parede */
function janelasEm(a,b,y,larg){const n=Math.max(1,Math.floor((b-a)/3.1)),out=[];const passo=(b-a)/n;for(let i=0;i<n;i++){const c=a+passo*(i+0.5),w=Math.min(larg||1.2,passo-0.5);if(w>0.5)out.push({a:c-w/2,b:c+w/2,y0:y+1.0,y1:y+2.2});}return out;}

/* --- salas, portas, nós --- */
function salaNova(p,f,u0,u1,v0,v1,tipo,nome){const y=p.y0+f*p.H;const c=pw(p,(u0+u1)/2,tipo==='escada'?v0+0.6:(v0+v1)/2);
  const s={id:CID.salas.length,p,f,u0,u1,v0,v1,y,tipo,nome:nome||tipo,x:c[0],z:c[1],conts:[],escura:tipo!=='corredor'&&tipo!=='escada'?0.62:0.8};
  CID.salas.push(s);(p.salas[f]=p.salas[f]||[]).push(s);s.no=noNovo(c[0],y,c[1],s);return s;}
function noNovo(x,y,z,sala,extra){const n=Object.assign({id:CID.nos.length,x,y,z,sala,viz:[]},extra||{});CID.nos.push(n);if(sala&&sala!=='fora')(sala.nos=sala.nos||[]).push(n);return n;}
function ligar(a,b,custo){const d=custo??Math.hypot(a.x-b.x,a.z-b.z)+Math.abs(a.y-b.y);a.viz.push([b,d]);b.viz.push([a,d]);}
/* porta: abertura na parede + objeto + dois nós (um de cada lado) */
function portaNova(p,f,eixo,k,a,b,sA,sB,tipo,estado,extra){const y=p.y0+f*p.H,cm=(a+b)/2,larg=b-a;
  const cl=eixo==='u'?pw(p,cm,k):pw(p,k,cm),yawP=p.yaw+(eixo==='u'?0:Math.PI/2);
  const nrm=eixo==='u'?[0,1]:[1,0],ladoA=eixo==='u'?pw(p,cm,k-0.75):pw(p,k-0.75,cm),ladoB=eixo==='u'?pw(p,cm,k+0.75):pw(p,k+0.75,cm);
  const d=Object.assign({id:CID.portas.length,p,f,x:cl[0],z:cl[1],y,yaw:yawP,larg,tipo,estado,hpMax:tipo==='metal'?320:tipo==='grade'?420:tipo==='elevador'?400:tipo==='vidro'?60:tipo==='corta'?260:150,sA,sB},extra||{});d.hp=d.hpMax;
  d.nA=noNovo(ladoA[0],y,ladoA[1],sA,{porta:d});d.nB=noNovo(ladoB[0],y,ladoB[1],sB,{porta:d});ligar(d.nA,d.nB,larg>1.3?0.3:0.6);
  if(sA&&sA!=='fora'&&sA.no)ligar(sA.no,d.nA);if(sB&&sB!=='fora'&&sB.no)ligar(sB.no,d.nB);
  CID.portas.push(d);return{a,b,y0:y,y1:y+(larg>1.3?2.4:2.15),passa:true,porta:d};}

/* --- tipos de sala por prédio e andar (decidem móveis e saque) --- */
/* porta de cada sala conforme o tipo: chave, alarme, grade, fechadura eletrônica ou sorteio */
function portaDaSala(p,s){const t=s.tipo;
  if(t==='farmacia')return{est:'trancada',tipo:'madeira',extra:{chave:'chaveFarmacia',alarme:true}};
  if(t==='laboratorio')return{est:'eletronica',tipo:'eletronica'};
  if(t==='arsenal')return{est:'trancada',tipo:'metal',extra:{chave:'chaveArsenal',alarme:true}};
  if(t==='celas')return{est:'trancada',tipo:'grade',extra:{celas:true}};
  if(t==='cobertura'||t==='cobertura_sala')return{est:RC()<0.6?'trancada':'fechada',tipo:'madeira'};
  if(t==='suite')return{est:RC()<0.5?'trancada':'fechada',tipo:'madeira'};
  return{est:RC()<0.5?'aberta':RC()<0.8?'fechada':'trancada',tipo:'madeira'};}
function tipoSala(p,f,lado,i,k){const T=p.tipo,n=p.andares;
  if(T==='hotel'){if(f===0)return i===0?(lado<0?'recepcao_hotel':'restaurante'):(lado<0?'deposito':'cozinha');return f===n-1?(i===0?'suite':'quarto_luxo'):'quarto_hotel';}
  if(T==='policia'){if(f===0)return i===0?(lado<0?'recepcao_pol':'arsenal'):(lado<0?'celas':'vestiario');return i===0&&lado<0?'delegado':'escritorio_pol';}
  if(T==='escritorio'&&p.cobertura&&f===n-1)return i===0&&lado<0?'cobertura_sala':'cobertura';
  if(T==='residencial')return f===0?(i===0?(lado<0?'portaria':'deposito'):'apartamento'):'apartamento';
  if(T==='escritorio')return f===0&&i===0?(lado<0?'recepcao':'copa'):(i===k-1&&lado>0?'arquivo':'escritorio');
  if(T==='hospital'){const L=f===0?[['recepcao','emergencia'],['farmacia','consultorio'],['consultorio','emergencia']]:f===1?[['enfermaria','enfermaria']]:[['administracao','deposito_med'],['laboratorio','laboratorio'],['laboratorio','deposito_med']];return L[Math.min(i,L.length-1)][lado<0?0:1];}
  return'sala';}
function tipoFundos(p,f,lado){const T=p.tipo;if(T==='hotel')return f===0?(lado<0?'lavanderia':'deposito'):(lado<0?'deposito':'banheiro');
  if(T==='policia')return f===0?(lado<0?'deposito':'banheiro'):(lado<0?'arquivo':'banheiro');if(T==='escritorio'&&p.cobertura&&f===p.andares-1)return lado<0?'banheiro':'adega';if(T==='hospital')return f===0?(lado<0?'gerador':'deposito_med'):f===2&&lado<0?'laboratorio':'banheiro';
  if(T==='residencial')return f===0?'lixo':'banheiro';return lado<0?'banheiro':'deposito';}

/* --- prédio com corredor central e escada nos fundos (vários andares) --- */
function predioCorredor(p){const W=p.W,D=p.D,E=0.25,I=0.12,uc=W/2,vS=D-E-5.55,n=p.andares,C=p.cores||CID_COR[p.tipo]||CID_COR.residencial;p.uc=uc;p.vS=vS;
  const k=clamp(Math.round((vS-E)/5.2),1,4),passo=(vS-E)/k;p.k=k;
  const cF=C[0],cI=C[1],cP=C[2];
  /* elevador quebrado: poço ao lado da escada (lado direito), porta de aço no patamar de cada andar; a cabine ficou presa entre o 1º e o 2º andar */
  const EL=n>=3?{uA:uc+1.375,uB:uc+3.25,vA:vS+0.06,vB:vS+1.95,vD:vS+0.7,fCab:1,fundo:1.3,portas:[],salas:[]}:null;
  if(EL){EL.yc=p.y0+p.H-0.35;EL.yR=EL.yc+2.45;EL.yP=p.y0-EL.fundo;p.poco=EL;p.vedado=[[EL.uA-0.15,EL.uB+0.3,vS,EL.vB+0.3]];}
  // pisos e telhado (o poço fura todas as lajes, menos a do telhado)
  for(let f=0;f<=n;f++){const y=p.y0+f*p.H,b=f===n?0:0.62,yb=f===0?QUADRA_Y:y-0.22,cor=f===n?0x6b6862:cP;
    const lajes=[[0,W,0,vS],[0,uc-1.3,vS,D],[uc-1.3,uc+1.3,vS,vS+1.2]];if(EL&&f<n)lajes.push([uc+1.3,EL.uB+0.12,EL.vB+0.12,D],[EL.uB+0.12,W,vS,D]);else lajes.push([uc+1.3,W,vS,D]);
    for(const r of lajes){retL(p,r[0],r[1],r[2],r[3],y);peca(p,r[0],r[1],yb,y,r[2],r[3],cor,b);
      if(f>0&&f<n)peca(p,r[0],r[1],y-0.24,y-0.22,r[2],r[3],cI,0.62);}}
  for(let f=0;f<n;f++){const ya=p.y0+f*p.H,yb=ya+p.H,S={};
    // salas
    const lados={};for(const lado of[-1,1]){const u0=lado<0?E:uc+1+I/2,u1=lado<0?uc-1-I/2:W-E,ls=[];
      for(let i=0;i<k;i++)ls.push(salaNova(p,f,u0,u1,E+i*passo,E+(i+1)*passo,tipoSala(p,f,lado,i,k)));
      const ub0=lado<0?E:uc+1.3+0.075,ub1=lado<0?uc-1.3-0.075:W-E;ls.push(salaNova(p,f,ub0,ub1,vS,D-E,tipoFundos(p,f,lado)));lados[lado]=ls;}
    const cor=salaNova(p,f,uc-1+I/2,uc+1-I/2,E,vS,'corredor'),esc=salaNova(p,f,uc-1.3,uc+1.3,vS,D-E,'escada');p.escadaSala=p.escadaSala||[];p.escadaSala[f]=esc;
    // nós do corredor
    const cn=[];for(let v=E+1.2;v<vS-0.5;v+=3.4){const w=pw(p,uc,v);cn.push(noNovo(w[0],ya,w[1],cor));}for(let i=1;i<cn.length;i++)ligar(cn[i-1],cn[i]);
    for(const q of cn)ligar(cor.no,q);
    const pertoCor=(v)=>{let b=cn[0],bd=1e9;for(const q of cn){const l=plc(p,q.x,q.z);const d=Math.abs(l[1]-v);if(d<bd){bd=d;b=q;}}return b;};
    // portas das salas para o corredor e das salas de fundos
    const abCorr={'-1':[],'1':[]},abFundos={'-1':[],'1':[]};
    for(const lado of[-1,1])lados[lado].forEach((s,i)=>{if(i<k){const vc=(s.v0+s.v1)/2+(i===0&&f===0?0.6:0),pd=portaDaSala(p,s),est=pd.est,tipo=pd.tipo;
        const o=lado<0?portaNova(p,f,'v',uc-1,vc-0.5,vc+0.5,s,cor,tipo,est,pd.extra):portaNova(p,f,'v',uc+1,vc-0.5,vc+0.5,cor,s,tipo,est,pd.extra);
        abCorr[lado].push(o);ligar(lado<0?o.porta.nB:o.porta.nA,pertoCor(vc));}
      else{const uc2=(s.u0+s.u1)/2,prev=lados[lado][k-1];const o=portaNova(p,f,'u',vS,uc2-0.45,uc2+0.45,prev,s,'madeira',RC()<0.6?'aberta':'fechada');abFundos[lado].push(o);}});
    // escada: porta corta-fogo entre o corredor e o patamar do andar
    const oe=portaNova(p,f,'u',vS,uc-0.6,uc+0.6,cor,esc,'corta','aberta');ligar(oe.porta.nA,pertoCor(vS-0.8));
    // paredes externas com janelas, porta principal e porta dos fundos
    const abF=[],abB=[],abL=[],abR=[];
    if(f===0){const o=portaNova(p,f,'u',E/2,uc-0.8,uc+0.8,'fora',cor,p.tipo==='hospital'||p.tipo==='escritorio'?'vidro':'madeira',p.tipo==='hospital'?'quebrada':'fechada');abF.push(o);
      const fora=noNovo(...pw(p,uc,-1.6).flatMap((v,i)=>i?[QUADRA_Y,v]:[v]),'fora',{entrada:p});ligar(fora,o.porta.nA,0.5);
      p.entradas=[fora];o.porta.nA.sala='fora';
      const bl=lados[-1][k],ub=(bl.u0+bl.u1)/2;const ob=portaNova(p,f,'u',D-E/2,ub-0.5,ub+0.5,bl,'fora','metal',RC()<0.5?'trancada':'fechada',p.tipo==='escritorio'?{alarme:true}:null);abB.push(ob);
      const fb=noNovo(...pw(p,ub,D+1.6).flatMap((v,i)=>i?[QUADRA_Y,v]:[v]),'fora',{entrada:p});ligar(fb,ob.porta.nB,0.5);ob.porta.nB.sala='fora';p.entradas.push(fb);
      for(const s of lados[-1].concat(lados[1]))if(s.v0<E+0.1){const a=s.u0+0.4,b=s.u1-0.4;abF.push(...janelasEm(a,b,ya));}}
    else{abF.push(...janelasEm(uc-0.9,uc+0.9,ya,1.0));
      for(const lado of[-1,1]){const s=lados[lado][0];if((p.tipo==='residencial'||p.tipo==='hotel')&&f>=1){const cb=(s.u0+s.u1)/2,sac=salaNova(p,f,cb-1.4,cb+1.4,-1.25,0,'sacada');sac.escura=0;const o=portaNova(p,f,'u',E/2,cb-0.5,cb+0.5,sac,s,'vidro','fechada');abF.push(o);
          p.sacadas=p.sacadas||[];p.sacadas.push({f,u0:cb-1.4,u1:cb+1.4,sala:sac});
          abF.push(...janelasEm(s.u0+0.3,cb-0.9,ya,1.0).filter(w=>w.b<cb-0.6),...janelasEm(cb+0.9,s.u1-0.3,ya,1.0).filter(w=>w.a>cb+0.6));}
        else abF.push(...janelasEm(s.u0+0.4,s.u1-0.4,ya));}}
    for(const lado of[-1,1])for(const s of lados[lado]){const lst=lado<0?abL:abR;lst.push(...janelasEm(s.v0+0.4,s.v1-0.4,ya));}
    for(const lado of[-1,1]){const s=lados[lado][k];if(!(f===0&&lado<0))abB.push(...janelasEm(s.u0+0.4,s.u1-0.4,ya,1.0));}
    regJanelas(p,f,'u',E/2,-1,abF);regJanelas(p,f,'u',D-E/2,1,abB);regJanelas(p,f,'v',E/2,-1,abL);regJanelas(p,f,'v',W-E/2,1,abR);
    paredeL(p,'u',E/2,0,W,E,ya,yb,abF,cI,0.62,-1,cF);paredeL(p,'u',D-E/2,0,W,E,ya,yb,abB,cI,0.62,1,cF);
    paredeL(p,'v',E/2,E,D-E,E,ya,yb,abL,cI,0.62,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,ya,yb,abR,cI,0.62,1,cF);
    // paredes internas
    paredeL(p,'v',uc-1,E,vS,I,ya,yb,abCorr[-1],cI,0.62);paredeL(p,'v',uc+1,E,vS,I,ya,yb,abCorr[1],cI,0.62);
    for(const lado of[-1,1])for(let i=1;i<k;i++){const v=E+i*passo;paredeL(p,'u',v,lado<0?E:uc+1,lado<0?uc-1:W-E,I,ya,yb,[],cI,0.62);}
    paredeL(p,'u',vS,E,uc-1,I,ya,yb,abFundos[-1],cI,0.62);paredeL(p,'u',vS,uc+1,W-E,I,ya,yb,abFundos[1],cI,0.62);
    paredeL(p,'u',vS,uc-1,uc+1,I,ya,yb,[oe],cI,0.62);
    // poço do elevador: zona própria (achada antes do quarto dos fundos), porta de aço emperrada no patamar, paredes para o quarto
    const abEl=[];
    if(EL){const ps=salaNova(p,f,EL.uA,EL.uB,EL.vA,EL.vB,'poco');ps.escura=0.92;ps.poco=EL;ps.semPiso=f!==0&&f!==EL.fCab;
      const L=p.salas[f];L.splice(L.indexOf(ps),1);L.unshift(ps);EL.salas[f]=ps;
      if(f===0)ps.no.y=EL.yP;else if(f===EL.fCab)ps.no.y=EL.yc;
      const est=f===0||f===EL.fCab?'emperrada':RC()<0.3?'aberta':'emperrada';
      const o=portaNova(p,f,'v',uc+1.3,EL.vD-0.5,EL.vD+0.5,esc,ps,'elevador',est);abEl.push(o);EL.portas[f]=o.porta;o.porta.poco=EL;
      if(f===0)o.porta.nB.y=EL.yP;else if(f===EL.fCab)o.porta.nB.y=EL.yc;
      paredeL(p,'v',EL.uB+0.06,vS,EL.vB+0.12,I,ya,yb,[],cI,0.62);paredeL(p,'u',EL.vB+0.06,uc+1.375,EL.uB+0.12,I,ya,yb,[],cI,0.62);
      for(const q of[[EL.uB-0.012,EL.uB,EL.vA,EL.vB],[EL.uA,EL.uB,EL.vB-0.012,EL.vB],[EL.uA,EL.uB,EL.vA,EL.vA+0.012]])peca(p,q[0],q[1],ya,yb,q[2],q[3],0x4a4d50,0.92);
      // moldura de aço da porta, do lado do patamar
      for(const q of[[EL.vD-0.62,EL.vD-0.5,ya,ya+2.3],[EL.vD+0.5,EL.vD+0.62,ya,ya+2.3],[EL.vD-0.62,EL.vD+0.62,ya+2.15,ya+2.3]])peca(p,uc+1.19,uc+1.225,q[2],q[3],q[0],q[1],0x6f777e,0.8);
      peca(p,uc+1.19,uc+1.225,ya+2.38,ya+2.52,EL.vD-0.2,EL.vD+0.2,0x1a2228,0.8);}
    paredeL(p,'v',uc-1.3,vS,D-E,0.15,ya,yb,[],COR_ESCADA,0.8);paredeL(p,'v',uc+1.3,vS,D-E,0.15,ya,yb,abEl,COR_ESCADA,0.8);
    // lances de escada até o próximo andar (ou o telhado)
    const y2=ya+p.H/2;ramL(p,uc-1.3+0.08,uc-0.05,vS+1.2,vS+4.35,ya,y2);ramL(p,uc+0.05,uc+1.3-0.08,vS+1.2,vS+4.35,yb,y2);retL(p,uc-1.3+0.08,uc+1.3-0.08,vS+4.35,D-E,y2);
    for(let i=0;i<10;i++){const v0=vS+1.2+i*0.315,h0=ya+i*0.16;peca(p,uc-1.22,uc-0.05,h0-0.04,h0+0.16,v0,v0+0.315,COR_ESCADA,0.8);
      const h1=y2+(9-i)*0.16;peca(p,uc+0.05,uc+1.22,h1-0.04,h1+0.16,v0,v0+0.315,COR_ESCADA,0.8);}
    peca(p,uc-1.22,uc+1.22,y2-0.2,y2,vS+4.35,D-E,COR_ESCADA,0.8);
    // nós da escada: patamar do andar → lance A → patamar do meio → lance B → próximo andar
    {const q=(u,v,y)=>{const w=pw(p,u,v);return noNovo(w[0],y,w[1],esc);};   // pé e topo de cada lance: a linha entre nós nunca corta a divisória
      const a0=q(uc-0.65,vS+1.5,ya+0.15),a1=q(uc-0.65,vS+4.0,ya+1.45),L=q(uc,vS+4.95,y2),b0=q(uc+0.65,vS+4.0,y2+0.15),bT=q(uc+0.65,vS+1.5,yb-0.15);
      ligar(esc.no,a0);ligar(a0,a1);ligar(a1,L);ligar(L,b0);ligar(b0,bT);p.escNos=p.escNos||[];p.escNos[f]={a0,a1,L,b0,bT};}
    if(f===0){boxL(p,uc,uc+1.3,vS+1.2,D-E,ya,ya+1.5,{sobEscada:true});peca(p,uc,uc+1.25,ya,ya+1.2,vS+1.25,D-E-0.05,COR_ESCADA,0.8);}}
  // divisória entre os lances, de baixo até o telhado
  boxL(p,uc-0.05,uc+0.05,vS+1.2,vS+4.35,p.y0,p.y0+n*p.H+0.6);peca(p,uc-0.05,uc+0.05,p.y0,p.y0+n*p.H,vS+1.2,vS+4.35,COR_ESCADA,0.8);
  if(EL)elevadorMontar(p,EL);
  // ligações entre andares pela escada (o lance B de um andar chega no patamar do próximo)
  // telhado: parapeito, casinha da escada com porta, caixa d'água
  {const yT=p.y0+n*p.H,yP=yT+1.1,abT=p.aberturasTelhado||[];
    const cobre=salaNova(p,n,uc-1.3,uc+1.3,vS,D-E,'escada');p.escadaSala[n]=cobre;
    const tel=salaNova(p,n,E,W-E,E,D-E,'telhado');tel.escura=0;cobre.escura=0.7;p.telhado=tel;
    boxL(p,uc-1.3,uc,vS+1.15,vS+1.25,yT,yT+1.0);peca(p,uc-1.3,uc,yT+0.9,yT+1.0,vS+1.15,vS+1.25,0x3b3e42,0.7);
    const ab=(lado)=>abT.filter(o=>o.lado===lado).map(o=>({a:o.a,b:o.b,y0:yT,y1:yP+0.1,passa:true}));
    paredeL(p,'u',E/2,0,W,E,yT,yP,ab('F'),0x77736b,0,-1,cF);paredeL(p,'u',D-E/2,0,W,E,yT,yP,ab('B'),0x77736b,0,1,cF);
    paredeL(p,'v',E/2,E,D-E,E,yT,yP,ab('L'),0x77736b,0,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,yT,yP,ab('R'),0x77736b,0,1,cF);
    const od=portaNova(p,n,'u',vS,uc-0.5,uc+0.5,tel,cobre,'metal','fechada');
    paredeL(p,'u',vS,uc-1.3,uc+1.3,0.15,yT,yT+2.7,[od],0x8a867c,0.7,-1,0x8a867c);
    paredeL(p,'v',uc-1.3,vS,D-E,0.15,yT,yT+2.7,[],0x8a867c,0.7,-1,0x8a867c);paredeL(p,'v',uc+1.3,vS,D-E,0.15,yT,yT+2.7,[],0x8a867c,0.7,1,0x8a867c);
    peca(p,uc-1.45,uc+1.45,yT+2.7,yT+2.9,vS-0.15,D-E+0.05,0x6b6862,0);boxL(p,uc-1.45,uc+1.45,vS-0.1,D-E,yT+2.7,yT+2.95);
    const wt=pw(p,E+1.6,D-E-1.6);peca(p,E+0.6,E+2.6,yT,yT+1.8,D-E-2.6,D-E-0.6,0x5d6a73,0);boxL(p,E+0.6,E+2.6,D-E-2.6,D-E-0.6,yT,yT+1.8);
    const tn=[];for(const[u,v]of[[uc,vS-1.4],[E+1.6,E+1.6],[W-E-1.6,E+1.6]]){const w=pw(p,u,v);tn.push(noNovo(w[0],yT,w[1],tel));}
    ligar(tn[0],tn[1]);ligar(tn[0],tn[2]);ligar(tn[1],tn[2]);ligar(tn[0],od.porta.nA);ligar(tel.no,tn[0]);
    // última escada chega no patamar de cima
    ligar(p.escNos[n-1].bT,cobre.no);
    for(let f=0;f<n-1;f++)ligar(p.escNos[f].bT,p.escadaSala[f+1].no);}
  fachada(p);
  // sacadas: laje, parapeito e piso andável do lado de fora da porta de vidro
  for(const s of p.sacadas||[]){const y=p.y0+s.f*p.H;retL(p,s.u0,s.u1,-1.25,0,y);peca(p,s.u0,s.u1,y-0.18,y,-1.25,0,0x8f8a80,0);
    for(const[u0,u1,v0,v1]of[[s.u0,s.u1,-1.3,-1.2],[s.u0-0.05,s.u0+0.05,-1.3,0],[s.u1-0.05,s.u1+0.05,-1.3,0]]){boxL(p,u0,u1,v0,v1,y,y+1.05);peca(p,u0,u1,y+0.95,y+1.05,v0,v1,0x3b3e42,0);}
    for(let u=s.u0+0.15;u<s.u1;u+=0.3)peca(p,u-0.015,u+0.015,y,y+0.95,-1.27,-1.23,0x3b3e42,0);}}

/* poço, cabine presa, alçapão, cabos, casa de máquinas, escadas de serviço e saque do elevador */
function elevadorMontar(p,EL){const{uA,uB,vA,vB,vD,yc,yR,yP}=EL,uc=p.uc,vS=p.vS,n=p.andares,yT=p.y0+n*p.H,inox=0x8d969f,aco=0x55595c;
  // fosso: chão, paredes até o térreo e água parada; buraco no quarteirão para o chão da rua não tampar o fosso
  retL(p,uA,uB,vA,vB,yP);peca(p,uA,uB,yP-0.12,yP,vA,vB,0x3a3d40,0.95);
  for(const q of[[uA-0.1,uA,vA-0.1,vB+0.1],[uB,uB+0.1,vA-0.1,vB+0.1],[uA,uB,vA-0.1,vA],[uA,uB,vB,vB+0.1]])peca(p,q[0],q[1],yP-0.12,p.y0,q[2],q[3],0x4a4d50,0.95);
  {const a=pw(p,uA,vA),b=pw(p,uB,vB),r={x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])};BURACOS.push(r);EL.ret=r;
    CID.aguas.push(Object.assign({y:yP+0.32,yMin:yP-0.5,poco:true},r));peca(p,uA,uB,yP+0.3,yP+0.32,vA,vB,0x1c2a2a,0.95);}
  // cabine: piso, paredes de inox, porta da cabine travada entreaberta (vão de 0,8 m), corrimão e espelho
  retL(p,uA,uB,vA,vB,yc);peca(p,uA+0.02,uB-0.02,yc-0.25,yc,vA+0.02,vB-0.02,aco,0.9);
  peca(p,uB-0.08,uB-0.02,yc,yR-0.2,vA+0.02,vB-0.02,inox,0.92);
  peca(p,uA+0.02,uB-0.02,yc,yR-0.2,vA+0.02,vA+0.08,inox,0.92);peca(p,uA+0.02,uB-0.02,yc,yR-0.2,vB-0.08,vB-0.02,inox,0.92);
  const g0=vD-0.4,g1=vD+0.4;
  for(const[a,b]of[[vA+0.02,g0],[g1,vB-0.02]]){peca(p,uA+0.02,uA+0.08,yc,yR-0.2,a,b,inox,0.92);boxL(p,uA,uA+0.1,a,b,yc,yR-0.2,{elevador:true});}
  peca(p,uA+0.02,uA+0.08,yc+2.1,yR-0.2,g0,g1,inox,0.92);
  peca(p,uB-0.14,uB-0.08,yc+0.9,yc+0.95,vA+0.3,vB-0.3,0x9aa1a6,0.92);peca(p,uB-0.09,uB-0.08,yc+1.05,yc+2.0,vA+0.45,vB-0.45,0x1a2228,0.92);
  // painel de botões apagado ao lado da porta da cabine
  peca(p,uA+0.08,uA+0.1,yc+0.95,yc+1.45,g1+0.08,g1+0.26,0x2b2b2b,0.92);
  // teto da cabine: quatro pedaços em volta do alçapão (o alçapão é uma superfície à parte, some quando abre)
  const h0=uB-0.85,h1=uB-0.12,k0=vB-0.85,k1=vB-0.15;
  for(const q of[[uA,h0,vA,vB],[h1,uB,vA,vB],[h0,h1,vA,k0],[h0,h1,k1,vB]]){retL(p,q[0],q[1],q[2],q[3],yR);peca(p,q[0]+0.02,q[1]-0.02,yR-0.2,yR,q[2]+0.02,q[3]-0.02,aco,0.9);}
  {const hc=pw(p,(h0+h1)/2,(k0+k1)/2),al={id:CID.alcapoes.length,p,x:hc[0],z:hc[1],y:yR,u:(h0+h1)/2,v:(k0+k1)/2,lu:h1-h0,lv:k1-k0,aberto:false,el:EL,r:[h0,h1,k0,k1]};
    al.sup=retL(p,h0,h1,k0,k1,yR);CID.alcapoes.push(al);EL.alcapao=al;}
  // cabos e trilhos do poço até a casa de máquinas
  for(const u of[uA+0.55,uB-0.55])peca(p,u-0.02,u+0.02,yR,yT-0.3,vA+0.93,vA+0.97,0x2b2b2b,0.9);
  for(const v of[vA+0.08,vB-0.08])peca(p,uB-0.06,uB,yP,yT-0.3,v-0.04,v+0.04,0x6f777e,0.92);
  // casa de máquinas no telhado, encostada na casinha da escada
  boxL(p,uc+1.375,uB+0.12,vS,EL.vB+0.12,yT,yT+1.5);peca(p,uc+1.375,uB+0.12,yT,yT+1.5,vS,EL.vB+0.12,0x8a867c,0);peca(p,uc+1.33,uB+0.17,yT+1.5,yT+1.62,vS-0.05,EL.vB+0.17,0x6b6862,0);
  // escadas de serviço: fosso → térreo; cabine → teto da cabine (pelo alçapão); teto da cabine → 2º andar
  const vi=(u,v,y0,y1,yawL,bu,bv,by,tu,tv,ty,tr)=>{const w=pw(p,u,v),b=pw(p,bu,bv),t=pw(p,tu,tv);const via=viaReta(w[0],w[1],y0,y1,p.yaw+yawL,{x:b[0],y:by,z:b[1]},{x:t[0],y:ty,z:t[1],rumo:p.yaw+tr},p);via.tipo='escada';via.recolhida=true;VIAS.push(via);return via;};
  const L0=uc+0.6;
  EL.viaFosso=vi(uA+0.4,vA+0.36,yP,p.y0,Math.PI,uA+0.85,vD+0.35,yP,L0,vD,p.y0,-Math.PI/2);
  for(const uu of[uA+0.18,uA+0.62])peca(p,uu-0.025,uu+0.025,yP,p.y0+0.6,vA+0.02,vA+0.07,0x3a3d40,0.92);for(let y=yP+0.3;y<p.y0;y+=0.32)peca(p,uA+0.18,uA+0.62,y-0.02,y+0.02,vA+0.02,vA+0.07,0x55595c,0.92);
  EL.viaAlcapao=vi(uB-0.45,(k0+k1)/2,yc,yR,Math.PI/2,uB-0.95,(k0+k1)/2,yc,h0-0.45,(k0+k1)/2,yR,-Math.PI/2);
  for(const vv of[k0+0.15,k1-0.15])peca(p,uB-0.13,uB-0.08,yc,yR-0.2,vv-0.025,vv+0.025,0x3a3d40,0.92);for(let y=yc+0.3;y<yR-0.25;y+=0.32)peca(p,uB-0.13,uB-0.08,y-0.02,y+0.02,k0+0.15,k1-0.15,0x55595c,0.92);
  if(n>=3){const y2=p.y0+2*p.H;EL.viaTeto=vi(uA+0.32,vD,yR,y2,-Math.PI/2,uA+0.8,vD,yR,L0,vD,y2,-Math.PI/2);
    for(const vv of[vD-0.22,vD+0.22])peca(p,uA+0.01,uA+0.06,yR,y2+0.6,vv-0.025,vv+0.025,0x3a3d40,0.92);for(let y=yR+0.3;y<y2;y+=0.32)peca(p,uA+0.01,uA+0.06,y-0.02,y+0.02,vD-0.22,vD+0.22,0x55595c,0.92);}
  // saque: bolsa largada dentro da cabine e caixa de ferramentas caída no fosso
  contExtra(p,EL.salas[EL.fCab],'bolsa','elevador',uB-0.42,vA+0.45,yc,-Math.PI/2,'el');
  contExtra(p,EL.salas[0],'caixaFerr','fosso',uB-0.5,vB-0.38,yP,-Math.PI/2,'fo');}
/* recipiente avulso numa sala do prédio (posição local u,v; yawL é o giro dentro do prédio) */
function contExtra(p,sala,tipo,tab,u,v,y,yawL,pref,extra){const D=CONT_DEF[tipo],w=pw(p,u,v),c=Object.assign({id:pref+p.id+(extra&&extra.sufixo||''),p,sala,tipo,tabela:tab,x:w[0],z:w[1],y,yaw:p.yaw+yawL,hw:D.hw,hd:D.hd,h:D.h,estado:'fechado',itens:null,t:0,u,v,yawL},extra||{});
  const reto=Math.abs(Math.sin(yawL))<0.5;c.col=colBox(c.x,c.z,reto?D.hw:D.hd,reto?D.hd:D.hw,p.yaw,{solid:true,y0:y,y1:y+D.h,cont:c});CID.conts.push(c);if(sala)sala.conts.push(c);return c;}
/* detalhes de fachada (só desenho): faixa escura na base, frisos entre andares, placas e equipamentos no telhado */
function fachada(p){const W=p.W,D=p.D,C=p.cores||CID_COR[p.tipo]||CID_COR.residencial,base=0x5d5a52,friso=0x8a857a,y0=p.y0,n=p.andares,yT=p.y0+n*p.H;
  const contorno=(y0,y1,o,cor)=>{peca(p,-o,W+o,y0,y1,-o,0.02,cor,0,0);peca(p,-o,W+o,y0,y1,D-0.02,D+o,cor,0,0);peca(p,-o,0.02,y0,y1,-o,D+o,cor,0,0);peca(p,W-0.02,W+o,y0,y1,-o,D+o,cor,0,0);};
  contorno(QUADRA_Y,y0+0.85,0.06,base);for(let f=1;f<=n;f++)contorno(y0+f*p.H-0.12,y0+f*p.H+0.06,0.1,friso);
  if(p.tipo==='hospital'){const uc=W/2;peca(p,uc-0.25,uc+0.25,yT-1.6,yT-0.2,-0.18,-0.1,0xd92a22,0);peca(p,uc-0.7,uc+0.7,yT-1.15,yT-0.65,-0.18,-0.1,0xd92a22,0);
    peca(p,uc-2.2,uc+2.2,y0+2.6,y0+2.75,-2.2,0,0xd9d6cc,0);for(const s of[-2,2]){peca(p,uc+s-0.08,uc+s+0.08,QUADRA_Y,y0+2.6,-2.1,-1.94,0x8d969f,0);boxL(p,uc+s-0.08,uc+s+0.08,-2.1,-1.94,QUADRA_Y-0.2,y0+2.6);}}
  if(p.tipo==='escritorio')peca(p,1,W-1,y0+3.0,y0+3.4,-0.16,-0.06,0x2f4f6a,0);
  // torre: faixas de vidro escuro em cada andar e mastro com luz vermelha no topo (dá para ver de longe)
  if(p.cobertura){for(let f=1;f<n;f++){const y=y0+f*p.H;for(const[v0,v1]of[[-0.05,-0.01],[D+0.01,D+0.05]])peca(p,0.4,W-0.4,y+0.85,y+2.35,v0,v1,0x26323c,0,0);}
    peca(p,W*0.5-0.08,W*0.5+0.08,yT,yT+7,D*0.5-0.08,D*0.5+0.08,0x55595c,0);peca(p,W*0.5-0.16,W*0.5+0.16,yT+6.9,yT+7.2,D*0.5-0.16,D*0.5+0.16,0xff3020,0,0,2.5);
    letreiro(p,'TORRE',W*0.5,y0+3.05,-0.17,0.08,0xd9d6cc,false);}
  // hotel: letreiro vertical vermelho com HOTEL, marquise na entrada com IMPERIAL
  if(p.tipo==='hotel'){const u=1.3;peca(p,u-0.7,u+0.7,y0+3.6,y0+3.6+8.4,-0.62,-0.42,0x8a2a22,0);peca(p,u-0.06,u+0.06,y0+3.6,y0+12,-0.42,-0.05,0x3a3d40,0);
    letreiro(p,'HOTEL',u,y0+4.1,-0.63,0.22,0xf2e6c8,true);
    const uc=W/2;peca(p,uc-2.6,uc+2.6,y0+2.7,y0+2.95,-2.4,0,0x3a2a22,0);letreiro(p,'IMPERIAL',uc,y0+2.98,-2.0,0.07,0xc9a227,false);
    for(const s2 of[-2.4,2.4]){peca(p,uc+s2-0.07,uc+s2+0.07,QUADRA_Y,y0+2.7,-2.3,-2.16,0x3a3d40,0);boxL(p,uc+s2-0.07,uc+s2+0.07,-2.3,-2.16,QUADRA_Y-0.2,y0+2.7);}}
  // delegacia: faixa azul, placa POLICIA e luz giroflex apagada na fachada
  if(p.tipo==='policia'){peca(p,-0.02,W+0.02,y0+2.85,y0+3.15,-0.05,-0.01,0x1f3a6a,0);const uc=W/2;peca(p,uc-2.2,uc+2.2,y0+3.25,y0+3.85,-0.18,-0.06,0x1f3a6a,0);letreiro(p,'POLICIA',uc,y0+3.35,-0.19,0.08,0xf2f2ee,false);}
  if(p.tipo==='residencial')for(let i=0;i<3;i++)peca(p,2+i*3.3,2.6+i*3.3,yT,yT+0.9,D-2.6,D-1.8,0x9aa1a6,0);
  for(let i=0;i<2;i++)peca(p,W*0.3+i*3,W*0.3+i*3+0.06,yT,yT+2.6+i,D*0.5,D*0.5+0.06,0x6f777e,0);
  trepadeiras(p);}
/* trepadeiras subindo pelas paredes de fora (a cidade está largada há tempo) */
function trepadeiras(p){const R=rng(300+p.id*17),W=p.W,D=p.D,hMax=Math.min(p.andares*p.H,8),verdes=[0x3a5a2a,0x4a6a32,0x2f4a24];
  const n=2+Math.floor(R()*4);for(let i=0;i<n;i++){const lado=Math.floor(R()*3),t=0.6+R()*((lado===0?W:D)-1.2),h=1.5+R()*hMax,w=0.5+R()*0.9,cor=verdes[i%3];
    // de longe ficam as placas verdes (silhueta); de perto a mesma mancha vira folhinhas soltas (hera do geoPredio), sem a cara de tábua verde
    for(let k=0;k<4;k++){const y0=(p.yq??QUADRA_Y)+k*h/4,y1=(p.yq??QUADRA_Y)+(k+1)*h/4,ww=w*(1-k*0.18),o=(R()-0.5)*0.4;
      if(lado===0)peca(p,t+o-ww/2,t+o+ww/2,y0,y1,-0.04,-0.005,cor,0,2);else if(lado===1)peca(p,-0.04,-0.005,y0,y1,t+o-ww/2,t+o+ww/2,cor,0,2);else peca(p,W+0.005,W+0.04,y0,y1,t+o-ww/2,t+o+ww/2,cor,0,2);
      (p.heras||(p.heras=[])).push(lado===0?{eixo:'u',k:0,fora:-1,s:t+o,w:ww,y0,h:y1-y0+0.12}:{eixo:'v',k:lado===1?0:W,fora:lado===1?-1:1,s:t+o,w:ww,y0,h:y1-y0+0.12});}}}
/* --- salão de um andar: área aberta, depósito e escritório nos fundos, escada de mão até a laje ---
   Cada tipo diz a porta da frente, se tem vitrine, os nomes das salas, a porta dos fundos, a altura e as cores do letreiro. */
const SALAO_CFG={
  mercado:{frente:{w:2.0,tipo:'vidro',est:'quebrada'},vit:true,salas:['loja','estoque','escritorio_loja'],fundos:{tipo:'metal',est:'trancada',alarme:true},dep:'fechada',alt:1.15,letreiro:[0xc9a227,0x9a2a22]},
  oficina:{frente:{w:3.8,tipo:'metal',est:'aberta'},vit:false,salas:['garagem','estoque','pecas'],fundos:{tipo:'metal',est:'trancada'},dep:'fechada',alt:1.15,letreiro:[0x3d5a73,0xd9d6cc]},
  farmacia:{frente:{w:1.6,tipo:'vidro',est:'quebrada'},vit:true,salas:['farm_loja','farm_estoque','escritorio_loja'],fundos:{tipo:'metal',est:'trancada',alarme:true},dep:'trancada',alt:1.1,letreiro:[0x2e8a4a,0xe8f0ea],cruz:true},
  conveniencia:{frente:{w:1.6,tipo:'vidro',est:'fechada'},vit:true,salas:['conv_loja','estoque','escritorio_loja'],fundos:{tipo:'metal',est:'fechada'},dep:'fechada',alt:1.05,letreiro:[0xd94a1a,0xf2e6c8]},
  padaria:{frente:{w:1.6,tipo:'vidro',est:'quebrada'},vit:true,salas:['padaria','estoque','escritorio_loja'],fundos:{tipo:'madeira',est:'fechada'},dep:'fechada',alt:1.05,letreiro:[0x8a5a2a,0xf2e6c8]},
  armazem:{frente:{w:4.4,tipo:'metal',est:'fechada'},vit:false,salas:['galpao','estoque','escritorio_loja'],fundos:{tipo:'metal',est:'trancada',alarme:true},dep:'fechada',alt:1.75,letreiro:[0x55595c,0xc9a227],fundoV:5.2}};
const salaoCfg=p=>SALAO_CFG[p.tipo]||SALAO_CFG.mercado;
function predioSalao(p){const YQ=p.yq??QUADRA_Y,K=salaoCfg(p),W=p.W,D=p.D,E=0.25,I=0.12,ya=p.y0,yb=ya+p.H*K.alt,C=CID_COR[p.tipo]||CID_COR.mercado,cF=C[0],cI=C[1],cP=C[2],vB=D-E-(K.fundoV||4.2);p.uc=W/2;p.alt=K.alt;
  retL(p,0,W,0,D,ya);peca(p,0,W,YQ,ya,0,D,cP,0.55);retL(p,0,W,0,D,yb,{telhado:true});peca(p,0,W,yb-0.25,yb,0,D,0x6b6862,0);
  const sal=salaNova(p,0,E,W-E,E,vB,K.salas[0]),dep=salaNova(p,0,E,W*0.6,vB,D-E,K.salas[1]),esc=salaNova(p,0,W*0.6,W-E,vB,D-E,K.salas[2]);
  const tel=salaNova(p,1,E,W-E,E,D-E,'telhado');tel.y=yb;tel.escura=0;p.telhado=tel;p.salas[1]=[tel];
  if(p.tipo==='oficina'){const u=W*0.7,v=vB+2.1,c=pw(p,u,v);CID.fumacas.push({id:CID.fumacas.length,p,sala:esc,x:c[0],z:c[1],y:ya,u,v,ativo:true,resto:0});
    for(let i=0;i<7;i++){const a=i*0.9,r=0.25+(i%3)*0.18;peca(p,u+Math.cos(a)*r-0.2,u+Math.cos(a)*r+0.2,ya,ya+0.12+(i%2)*0.1,v+Math.sin(a)*r-0.12,v+Math.sin(a)*r+0.12,0x2a2420,0.55);}
    peca(p,esc.u0+0.05,esc.u1-0.05,yb-0.32,yb-0.27,esc.v0+0.05,esc.v1-0.05,0x1a1714,0.55);}
  const portaF={a:W/2-K.frente.w/2,b:W/2+K.frente.w/2};
  const of=portaNova(p,0,'u',E/2,portaF.a,portaF.b,'fora',sal,K.frente.tipo,K.frente.est);
  const fora=noNovo(...pw(p,W/2,-1.6).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});ligar(fora,of.porta.nA,0.5);of.porta.nA.sala='fora';p.entradas=[fora];
  const o1=portaNova(p,0,'u',vB,W*0.3-0.5,W*0.3+0.5,sal,dep,'madeira',K.dep),o2=portaNova(p,0,'u',vB,W*0.8-0.5,W*0.8+0.5,sal,esc,'madeira',RC()<0.5?'trancada':'fechada');
  const ob=portaNova(p,0,'u',D-E/2,W*0.3-0.5,W*0.3+0.5,dep,'fora',K.fundos.tipo,K.fundos.est,K.fundos.alarme?{alarme:true}:null);const fb=noNovo(...pw(p,W*0.3,D+1.6).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});ligar(fb,ob.porta.nB,0.5);ob.porta.nB.sala='fora';p.entradas.push(fb);
  const vit=K.vit?[{a:E+0.6,b:portaF.a-0.6,y0:ya+0.5,y1:ya+2.6},{a:portaF.b+0.6,b:W-E-0.6,y0:ya+0.5,y1:ya+2.6}].filter(o=>o.b-o.a>0.8):janelasEm(E+0.5,portaF.a-0.4,ya).concat(janelasEm(portaF.b+0.4,W-E-0.5,ya));
  for(const o of vit)o.vit=K.vit;const jl=janelasEm(E+1,vB-1,ya),jr=janelasEm(E+1,vB-1,ya);regJanelas(p,0,'u',E/2,-1,vit);regJanelas(p,0,'v',E/2,-1,jl);regJanelas(p,0,'v',W-E/2,1,jr);
  paredeL(p,'u',E/2,0,W,E,ya,yb,[of,...vit],cI,0.55,-1,cF);paredeL(p,'u',D-E/2,0,W,E,ya,yb,[ob],cI,0.55,1,cF);
  paredeL(p,'v',E/2,E,D-E,E,ya,yb,jl,cI,0.55,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,ya,yb,jr,cI,0.55,1,cF);
  paredeL(p,'u',vB,E,W-E,I,ya,yb,[o1,o2],cI,0.55);paredeL(p,'v',W*0.6,vB,D-E,I,ya,yb,[],cI,0.55);
  // platibanda da laje
  const yP=yb+0.9;paredeL(p,'u',E/2,0,W,E,yb,yP,[],0x77736b,0,-1,cF);paredeL(p,'u',D-E/2,0,W,E,yb,yP,[],0x77736b,0,1,cF);
  paredeL(p,'v',E/2,E,D-E,E,yb,yP,[],0x77736b,0,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,yb,yP,[{a:D-3.2,b:D-2.2,y0:yb,y1:yP+0.1,passa:true}],0x77736b,0,1,cF);
  // escada de mão nos fundos, do lado de fora, até a laje
  {const u=W+0.25,v=D-2.7,b=pw(p,W+0.95,v),t=pw(p,W-0.8,v),h=pw(p,u,v);const via=viaReta(h[0],h[1],YQ,yb,p.yaw-Math.PI/2,{x:b[0],y:YQ,z:b[1]},{x:t[0],y:yb,z:t[1],rumo:p.yaw-Math.PI/2},p);via.tipo='escada';VIAS.push(via);CID.escadasExt.push({p,via,u,v,y0:YQ,y1:yb});
    const nb=noNovo(b[0],YQ,b[1],'fora',{escadaMao:true,entrada:p}),nt=noNovo(t[0],yb,t[1],tel);ligar(nb,nt,yb*2.5);ligar(nt,tel.no);}
  // letreiro sobre a porta (com o nome escrito em letras de bloco) e cruz verde na farmácia
  const[c1,c2]=p.letreiro||K.letreiro,lw=Math.min(W/2-0.6,4.2);peca(p,W/2-lw,W/2+lw,ya+2.9,ya+3.7,-0.2,-0.08,c1,0);
  if(p.placa)letreiro(p,p.placa,W/2,ya+3.04,-0.21,0.09,c2,false);else peca(p,W/2-lw+0.2,W/2+lw-0.2,ya+3.05,ya+3.45,-0.24,-0.19,c2,0);
  if(K.cruz){const u=W-1.2;peca(p,u-0.12,u+0.12,ya+2.6,ya+3.4,-0.3,-0.2,0x2ec84a,0,0);peca(p,u-0.4,u+0.4,ya+2.88,ya+3.12,-0.3,-0.2,0x2ec84a,0,0);}
  peca(p,-0.06,W+0.06,YQ-(p.rural?0.6:0),ya+0.7,-0.06,0.02,0x5d5a52,0);if(p.rural)for(const q of[[-0.06,W+0.06,D-0.02,D+0.06],[-0.06,0.02,0,D],[W-0.02,W+0.06,0,D]])peca(p,q[0],q[1],YQ-0.6,ya,q[2],q[3],0x5d5a52,0);trepadeiras(p);
  ligar(sal.no,of.porta.nB);}
/* letras de bloco (fonte 3x5) desenhadas como peças na fachada: u0 é o centro, v a profundidade da face, s o tamanho do "pixel" */
const FONTE={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',
  L:'100100100100111',M:'101111111101101',N:'101111111111101',O:'010101101101010',P:'110101110100100',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',Z:'111001010100111',' ':'000000000000000',
  J:'001001001101010',K:'101101110101101',Q:'010101101110011',W:'101101111111101',X:'101101010101101',Y:'101101010010010'};
function letreiro(p,txt,u0,y0,v,s,cor,vertical){txt=txt.toUpperCase();const n=txt.length;
  for(let k=0;k<n;k++){const g=FONTE[txt[k]]||FONTE[' '];
    for(let r=0;r<5;r++)for(let c=0;c<3;c++){if(g[r*3+c]!=='1')continue;
      const uu=vertical?u0-(c-1)*s:u0-((k-(n-1)/2)*4*s+(c-1)*s),yy=vertical?y0+((n-1-k)*6+(4-r))*s:y0+(4-r)*s;   // quem olha a fachada de frente tem a direita no sentido -u
      peca(p,uu-s/2,uu+s/2,yy,yy+s*0.95,v-0.04,v,cor,0,0);}}}

/* --- recipientes e móveis por tipo de sala (posições locais dentro da sala) --- */
const CONT_DEF={geladeira:{hw:0.36,hd:0.33,h:1.8,cor:0xd9d6cc,nome:'a geladeira'},armario:{hw:0.5,hd:0.28,h:1.9,cor:0x7a5a3c,nome:'o armário'},gaveta:{hw:0.45,hd:0.25,h:0.85,cor:0x8a6a45,nome:'as gavetas'},
  prateleira:{hw:0.9,hd:0.3,h:1.7,cor:0x8d969f,nome:'a prateleira'},mesa:{hw:0.7,hd:0.4,h:0.76,cor:0x6b4e30,nome:'a mesa'},arquivo:{hw:0.3,hd:0.33,h:1.3,cor:0x6f777e,nome:'o arquivo'},
  armarioMed:{hw:0.5,hd:0.25,h:1.9,cor:0xc9ccc8,nome:'o armário de remédios'},carrinho:{hw:0.35,hd:0.25,h:1.0,cor:0x9fb3ad,nome:'o carrinho'},caixaFerr:{hw:0.45,hd:0.25,h:0.9,cor:0xa8261d,nome:'a caixa de ferramentas'},
  caixas:{hw:0.6,hd:0.5,h:1.1,cor:0x8a6a45,nome:'as caixas'},cofre:{hw:0.3,hd:0.3,h:0.8,cor:0x3b3e42,nome:'o cofre'},guardaRoupa:{hw:0.6,hd:0.3,h:2.0,cor:0x6b4e30,nome:'o guarda-roupa'},balcao:{hw:1.1,hd:0.35,h:1.0,cor:0x8d7a62,nome:'o balcão'},
  bolsa:{hw:0.32,hd:0.22,h:0.4,cor:0x3d4a3a,nome:'a bolsa largada'},painel:{hw:0.32,hd:0.06,h:0.5,cor:0x2a2622,nome:'o esconderijo'},
  mala:{hw:0.4,hd:0.25,h:0.55,cor:0x5a3a2a,nome:'a mala'},armarioArmas:{hw:0.6,hd:0.3,h:2.0,cor:0x3a4a3a,nome:'o armário de armas'},armarioMetal:{hw:0.35,hd:0.3,h:1.9,cor:0x6f777e,nome:'o armário de metal'},
  freezer:{hw:0.6,hd:0.35,h:0.95,cor:0xd9d6cc,nome:'o freezer'}};
/* tabela de saque de cada recipiente depende do tipo de sala e do prédio */
const SALA_MOVEIS={
  apartamento:[['geladeira','ap_cozinha',0.15,0.1],['armario','ap_cozinha',0.45,0.08],['guardaRoupa','ap_quarto',0.85,0.1],['gaveta','ap_gaveta',0.6,0.92],['m:cama',0,0.8,0.75],['m:sofa',0,0.2,0.75],['m:mesa',0,0.45,0.5]],
  portaria:[['gaveta','escritorio',0.3,0.12],['armario','deposito',0.8,0.1],['m:mesa',0,0.3,0.45]],deposito:[['caixas','deposito',0.25,0.15],['prateleira','deposito',0.7,0.12],['caixas','deposito',0.5,0.85]],
  lixo:[['caixas','lixo',0.3,0.3]],banheiro:[['armario','banheiro',0.5,0.12]],
  escritorio:[['gaveta','escritorio',0.25,0.3],['gaveta','escritorio',0.7,0.3],['arquivo','escritorio',0.15,0.9],['m:mesa',0,0.25,0.42],['m:mesa',0,0.7,0.42]],
  recepcao:[['balcao','recepcao',0.5,0.35],['gaveta','escritorio',0.2,0.9]],copa:[['geladeira','ap_cozinha',0.15,0.1],['armario','ap_cozinha',0.6,0.1],['m:mesa',0,0.5,0.6]],
  arquivo:[['arquivo','escritorio',0.2,0.15],['arquivo','escritorio',0.5,0.15],['arquivo','escritorio',0.8,0.15],['cofre','cofre',0.85,0.85]],
  emergencia:[['carrinho','hosp_carrinho',0.3,0.3],['armarioMed','hosp_armario',0.8,0.1],['m:maca',0,0.5,0.7]],consultorio:[['armarioMed','hosp_armario',0.2,0.1],['gaveta','hosp_gaveta',0.75,0.3],['m:maca',0,0.6,0.75]],
  farmacia:[['prateleira','farmacia_rara',0.25,0.12],['prateleira','farmacia_rara',0.75,0.12],['balcao','hosp_gaveta',0.5,0.75]],
  enfermaria:[['carrinho','hosp_carrinho',0.5,0.5],['gaveta','hosp_gaveta',0.15,0.15],['m:maca',0,0.25,0.75],['m:maca',0,0.75,0.75],['m:maca',0,0.75,0.25]],
  laboratorio:[['geladeira','laboratorio',0.15,0.1],['armarioMed','laboratorio',0.6,0.1],['m:bancada',0,0.5,0.7]],administracao:[['gaveta','escritorio',0.3,0.4],['arquivo','escritorio',0.8,0.12],['cofre','cofre_hosp',0.85,0.85]],
  deposito_med:[['prateleira','hosp_armario',0.3,0.15],['caixas','hosp_deposito',0.7,0.6]],gerador:[['caixaFerr','oficina',0.2,0.2],['m:gerador',0,0.6,0.55]],
  loja:[['prateleira','mercado',0.2,0.3],['prateleira','mercado',0.2,0.65],['prateleira','mercado',0.55,0.3],['prateleira','mercado',0.55,0.65],['balcao','caixa_loja',0.85,0.2],['geladeira','mercado_frio',0.85,0.85]],
  estoque:[['caixas','estoque',0.3,0.35],['caixas','estoque',0.7,0.35],['prateleira','estoque',0.5,0.85]],escritorio_loja:[['gaveta','escritorio',0.5,0.4]],
  garagem:[['caixaFerr','oficina',0.15,0.85],['prateleira','pecas',0.85,0.85],['m:carro',0,0.5,0.45],['m:bancada',0,0.15,0.4]],pecas:[['prateleira','pecas',0.5,0.25],['caixaFerr','oficina',0.5,0.75]],
  // hotel
  recepcao_hotel:[['balcao','recepcao',0.5,0.3],['gaveta','hotel_gaveta',0.15,0.9],['m:sofa',0,0.6,0.78],['m:sofa',0,0.25,0.78]],
  restaurante:[['balcao','caixa_loja',0.85,0.15],['geladeira','mercado_frio',0.9,0.9],['m:mesa',0,0.25,0.3],['m:mesa',0,0.25,0.7],['m:mesa',0,0.6,0.5]],
  cozinha:[['geladeira','ap_cozinha',0.1,0.15],['geladeira','mercado_frio',0.3,0.1],['armario','ap_cozinha',0.6,0.1],['prateleira','estoque',0.9,0.6],['m:bancada',0,0.5,0.55]],
  quarto_hotel:[['mala','hotel_mala',0.85,0.15],['guardaRoupa','hotel_mala',0.15,0.1],['gaveta','hotel_gaveta',0.6,0.92],['m:cama',0,0.6,0.6],['m:mesa',0,0.2,0.85]],
  quarto_luxo:[['mala','hotel_mala',0.85,0.15],['guardaRoupa','hotel_mala',0.15,0.1],['gaveta','hotel_gaveta',0.5,0.92],['m:cama',0,0.6,0.6],['m:sofa',0,0.2,0.7]],
  suite:[['mala','hotel_mala',0.85,0.15],['guardaRoupa','hotel_mala',0.15,0.1],['cofre','cofre_suite',0.9,0.9],['gaveta','hotel_gaveta',0.5,0.92],['m:cama',0,0.6,0.6],['m:sofa',0,0.2,0.7]],
  lavanderia:[['armario','lavanderia',0.3,0.12],['caixas','lavanderia',0.8,0.6]],
  // delegacia
  recepcao_pol:[['balcao','recepcao_pol',0.5,0.35],['arquivo','escritorio',0.15,0.9],['m:mesa',0,0.7,0.75]],
  arsenal:[['armarioArmas','arsenal',0.2,0.1],['armarioArmas','arsenal',0.8,0.1],['caixas','arsenal_caixa',0.5,0.85]],
  celas:[['m:cama',0,0.2,0.82],['m:cama',0,0.8,0.82]],
  vestiario:[['armarioMetal','vestiario',0.15,0.1],['armarioMetal','vestiario',0.4,0.1],['armarioMetal','vestiario',0.65,0.1],['m:mesa',0,0.5,0.6]],
  delegado:[['gaveta','delegado',0.3,0.3],['cofre','cofre_pol',0.85,0.85],['arquivo','escritorio',0.15,0.9],['m:mesa',0,0.4,0.4]],
  escritorio_pol:[['gaveta','escritorio_pol',0.25,0.3],['arquivo','escritorio',0.8,0.9],['m:mesa',0,0.3,0.42],['m:mesa',0,0.7,0.42]],
  // cobertura da torre
  cobertura:[['guardaRoupa','cobertura',0.15,0.1],['gaveta','cobertura',0.6,0.92],['m:cama',0,0.7,0.6],['m:sofa',0,0.25,0.7]],
  cobertura_sala:[['cofre','cofre_suite',0.9,0.9],['armario','cobertura',0.15,0.1],['m:sofa',0,0.4,0.6],['m:mesa',0,0.6,0.35]],
  adega:[['prateleira','adega',0.3,0.15],['prateleira','adega',0.7,0.15]],
  // lojas de rua
  farm_loja:[['prateleira','farmacia_loja',0.15,0.3],['prateleira','farmacia_loja',0.15,0.7],['prateleira','farmacia_loja',0.85,0.3],['prateleira','farmacia_loja',0.85,0.7],['balcao','farmacia_balcao',0.5,0.85]],
  farm_estoque:[['prateleira','farmacia_estoque',0.3,0.15],['caixas','farmacia_estoque',0.7,0.7]],
  conv_loja:[['prateleira','conveniencia',0.2,0.3],['prateleira','conveniencia',0.2,0.7],['geladeira','mercado_frio',0.9,0.85],['freezer','mercado_frio',0.6,0.9],['balcao','caixa_loja',0.8,0.15]],
  padaria:[['balcao','padaria',0.5,0.3],['prateleira','padaria',0.15,0.7],['freezer','mercado_frio',0.85,0.85]],
  galpao:[['prateleira','armazem',0.15,0.3,{livre:1}],['prateleira','armazem',0.38,0.3,{livre:1}],['prateleira','armazem',0.61,0.3,{livre:1}],['prateleira','armazem',0.15,0.62,{livre:1}],['prateleira','armazem',0.38,0.62,{livre:1}],
    ['prateleira','armazem',0.61,0.62,{livre:1}],['caixas','armazem_caixa',0.88,0.25],['caixas','armazem_caixa',0.88,0.6],['m:palete',0,0.85,0.88],['m:empilhadeira',0,0.38,0.9]],
  // casas
  sala_casa:[['armario','ap_quarto',0.1,0.15],['gaveta','ap_gaveta',0.85,0.15],['m:sofa',0,0.4,0.78],['m:mesa',0,0.5,0.4],['m:rack',0,0.5,0.02],['m:tapete',0,0.45,0.6],
    ['m:quadro',0,0.4,0.99],['m:quadroP',0,0.99,0.4],['m:planta',0,0.97,0.95],['m:poltrona',0,0.03,0.8,{p:0.7}],['m:luminaria',0,0.97,0.05,{p:0.6}],['m:entulho',0,0.65,0.3,{p:0.7}],['m:caixasP',0,0.03,0.4,{p:0.5}]],
  cozinha_casa:[['geladeira','ap_cozinha',0.15,0.12],['armario','ap_cozinha',0.55,0.1],['m:mesaC',0,0.5,0.62],['m:fogao',0,0.85,0.02],['m:bancadaCoz',0,0.98,0.45],
    ['m:armarioAlto',0,0.55,0],['m:lixeira',0,0.03,0.6],['m:quadroP',0,0.45,0.99],['m:entulho',0,0.3,0.4,{p:0.7}]],
  quarto:[['guardaRoupa','ap_quarto',0.2,0.1],['gaveta','ap_gaveta',0.8,0.12],['m:cama',0,0.6,0.65],['m:criado',0,0.98,0.95],['m:comoda',0,0.02,0.6],['m:tapete',0,0.35,0.4],
    ['m:quadro',0,0.6,0.99],['m:roupasChao',0,0.3,0.55,{p:0.7}],['m:cadeira',0,0.98,0.3,{p:0.6}],['m:caixasP',0,0.03,0.95,{p:0.4}]],
  lavabo:[['armario','banheiro',0.5,0.15],['m:vaso',0,0.15,0.98],['m:piaB',0,0.65,0.98],['m:chuveiro',0,0.98,0.05],['m:lixeira',0,0.4,0.98]],
  // casas da vila e dos sítios (mais completas: estante, rack com TV, fogão a lenha, pia, mesa com cadeiras, criado-mudo...)
  sala_casa_rural:[['armario','ap_quarto',0.06,0.1],['gaveta','ap_gaveta',0.92,0.1],['m:sofa',0,0.42,0.86],['m:rack',0,0.66,0.02],['m:poltrona',0,0.97,0.6],['m:tapete',0,0.45,0.5],['m:mesinha',0,0.44,0.56],['m:quadro',0,0.42,0.99],['m:quadroP',0,0.99,0.3],['m:planta',0,0.03,0.97],['m:luminaria',0,0.9,0.95,{p:0.7}],
    ['m:entulho',0,0.62,0.35,{p:0.7}],['m:caixasP',0,0.25,0.04,{p:0.5}],['m:estante',0,0.02,0.55]],
  cozinha_casa_rural:[['geladeira','ap_cozinha',0.06,0.08],['armario','ap_cozinha',0.92,0.1],['m:fogao',0,0.78,0.98],['m:piaL',0,0.02,0.62],['m:mesaC',0,0.86,0.5],
    ['m:bancadaCoz',0,0.45,0.02],['m:armarioAlto',0,0.45,0],['m:lixeira',0,0.25,0.98],['m:quadroP',0,0.5,0.99],['m:entulho',0,0.5,0.55,{p:0.7}]],
  quarto_rural:[['guardaRoupa','ap_quarto',0.98,0.45],['gaveta','ap_gaveta',0.02,0.3],['m:cama',0,0.3,0.7],['m:criado',0,0.02,0.92],['m:tapete',0,0.45,0.32],
    ['m:comoda',0,0.7,0.02],['m:quadro',0,0.3,0.99],['m:roupasChao',0,0.6,0.45,{p:0.7}],['m:cadeira',0,0.98,0.9,{p:0.6}]],
  lavabo_rural:[['armario','banheiro',0.97,0.5],['m:vaso',0,0.1,0.98],['m:piaB',0,0.6,0.98],['m:chuveiro',0,0.02,0.05],['m:lixeira',0,0.35,0.98]],
  corredor_rural:[['gaveta','ap_gaveta',0.5,0.98],['m:quadro',0,0.5,0.02],['m:planta',0,0.02,0.5,{p:0.6}]]};
/* móvel novo: encostado na parede mais perto (de costas para ela) ou solto no meio (face: 0 +v, 1 -v, 2 +u, 3 -u) */
function movelNovo(p,s,k,u,v,N,face){const[w0,d0,h,c1,c2,parede,semCol]=N,y=s.y;let f=face;
  if(f===undefined){if(parede){const b=[u-s.u0,s.u1-u,v-s.v0,s.v1-v],m=Math.min(...b);f=m===b[2]?0:m===b[3]?1:m===b[0]?2:3;}else f=0;}
  const gira=f>=2,w=gira?d0:w0,d=gira?w0:d0;let cu=u,cv=v;
  if(parede){if(f===0)cv=s.v0+d/2+0.03;else if(f===1)cv=s.v1-d/2-0.03;else if(f===2)cu=s.u0+w/2+0.03;else cu=s.u1-w/2-0.03;}
  const u0=clamp(cu-w/2,s.u0+0.03,s.u1-w-0.03),v0=clamp(cv-d/2,s.v0+0.03,s.v1-d-0.03);
  if(vedadoEm(p,u0+w/2,v0+d/2,Math.max(w,d)/2)||portaTampada(p,s,u0,u0+w,v0,v0+d))return;
  if(parede&&(h===0||h>1.2)){const c=pw(p,u0+w/2,v0+d/2);if(CID.janelas.some(j=>j.p===p&&j.f===s.f&&Math.hypot(j.x-c[0],j.z-c[1])<(j.larg||1)/2+Math.max(w,d)/2+0.1))return;}
  if(!semCol&&(CID.moveis.some(m=>m.p===p&&m.s===s&&!m.semCol&&u0<m.u1&&u0+w>m.u0&&v0<m.v1&&v0+d>m.v0)||s.conts.some(c=>{const r=c.yawL%Math.PI===0,hu=r?c.hw:c.hd,hv=r?c.hd:c.hw;return u0<c.u+hu&&u0+w>c.u-hu&&v0<c.v+hv&&v0+d>c.v-hv;})))return;
  CID.moveis.push({p,s,k,u0,u1:u0+w,v0,v1:v0+d,y,h,c1,c2,f,semCol:!!semCol});if(!semCol)boxL(p,u0,u0+w,v0,v0+d,y,y+h,{movel:k});}
const vedadoEm=(p,u,v,r)=>(p.vedado||[]).some(q=>u+r>q[0]&&u-r<q[1]&&v+r>q[2]&&v-r<q[3]);
function mobiliar(p){const R=rng(1000+p.id*31);
  for(const fl of p.salas)for(const s of fl||[]){const L=SALA_MOVEIS[p.rural&&SALA_MOVEIS[s.tipo+'_rural']?s.tipo+'_rural':s.tipo==='escritorio'&&p.tipo==='mercado'?'escritorio_loja':s.tipo];if(!L)continue;
    for(const[k,tab,fu,fv,op]of L){const u=s.u0+0.55+(s.u1-s.u0-1.1)*fu,v=s.v0+0.55+(s.v1-s.v0-1.1)*fv;
      if(k.startsWith('m:')){if(op&&op.p!==undefined&&R()>op.p)continue;moveis(p,s,k.slice(2),u,v,R,op&&op.face);continue;}
      const D=CONT_DEF[k];if(!D)continue;const borda=Math.min(u-s.u0,s.u1-u,v-s.v0,s.v1-v);
      // encosta na parede mais próxima, virado para dentro
      let yawL=0;if(op&&op.livre)yawL=op.yaw||0;else if(borda===u-s.u0)yawL=Math.PI/2;else if(borda===s.u1-u)yawL=-Math.PI/2;else if(borda===v-s.v0)yawL=0;else yawL=Math.PI;
      const livre=op&&op.livre,uu=livre?u:borda===u-s.u0?s.u0+D.hd+0.02:borda===s.u1-u?s.u1-D.hd-0.02:u,vv=livre?v:borda===v-s.v0?s.v0+D.hd+0.02:borda===s.v1-v?s.v1-D.hd-0.02:v;
      if(vedadoEm(p,uu,vv,D.hw+0.05))continue;
      {const reto=yawL%Math.PI===0,hu=reto?D.hw:D.hd,hv=reto?D.hd:D.hw;if(portaTampada(p,s,uu-hu,uu+hu,vv-hv,vv+hv))continue;
        if(p.rural&&CID.moveis.some(m=>m.p===p&&m.s===s&&!m.semCol&&uu-hu<m.u1&&uu+hu>m.u0&&vv-hv<m.v1&&vv+hv>m.v0))continue;}
      const w=pw(p,uu,vv),c={id:'p'+p.id+'c'+s.conts.length+'s'+s.id,p,sala:s,tipo:k,tabela:tab,x:w[0],z:w[1],y:s.y,yaw:p.yaw+yawL,hw:D.hw,hd:D.hd,h:D.h,estado:'fechado',itens:null,t:0,u:uu,v:vv,yawL};
      c.col=colBox(c.x,c.z,(yawL%Math.PI===0?D.hw:D.hd),(yawL%Math.PI===0?D.hd:D.hw),p.yaw,{solid:true,y0:c.y,y1:c.y+D.h,cont:c});
      s.conts.push(c);CID.conts.push(c);}}}
/* área de passagem das portas da sala: móvel nenhum fica na frente */
function portaTampada(p,s,u0,u1,v0,v1){for(const d of CID.portas){if(d.p!==p||(d.sA!==s&&d.sB!==s))continue;const l=plc(p,d.x,d.z),ao=Math.abs(Math.sin(d.yaw-p.yaw))<0.5,h=d.larg/2+0.22;
    const a=ao?[l[0]-h,l[0]+h,l[1]-1.15,l[1]+1.15]:[l[0]-1.15,l[0]+1.15,l[1]-h,l[1]+h];if(u1>a[0]&&u0<a[1]&&v1>a[2]&&v0<a[3])return true;}return false;}
/* móveis das casas de fora da cidade: [largura, fundo, altura, cor 1, cor 2, encosta na parede, sem colisão] */
const MOVEIS_NOVOS={rack:[1.4,0.45,0.5,0x5a4030,0x1e2022,1],poltrona:[0.85,0.8,0.85,0x7a4a3a,0x5e3a2c,1],estante:[1.0,0.35,1.8,0x6b4e30,0x4a3424,1],fogao:[1.0,0.65,0.85,0x9a5a3a,0x2b2b2b,1],
  piaL:[1.3,0.6,0.9,0xd8d4cc,0x9aa1a6,1],criado:[0.45,0.4,0.55,0x6b4e30,0x4a3424,1],vaso:[0.4,0.6,0.45,0xe8e4dc,0xd0ccc4,1],piaB:[0.5,0.4,0.85,0xe8e4dc,0x9aa1a6,1],
  mesinha:[0.9,0.5,0.42,0x6b4e30,0x5a3f27,0],mesaC:[1.1,0.8,0.76,0x7a5a3c,0x5a3f27,0],tapete:[1.8,1.2,0.015,0x8a3a2a,0xc9a227,0,1],escrivaninha:[1.2,0.6,0.76,0x6b4e30,0x5a3f27,1],banco:[2.4,0.5,0.9,0x6b4e30,0x5a3f27,0],altar:[1.6,0.7,1.0,0xe8e2d4,0xc9a227,0],
  // casas mais cheias: quadros, planta, caixas, cômoda, roupas e papéis no chão, bancada e armário alto de cozinha, luminária, cadeira, chuveiro e lixeira
  quadro:[0.7,0.06,0,0x5a3f27,0xd8d0c0,1,1],quadroP:[0.42,0.05,0,0x2b2b2b,0xe8e4dc,1,1],planta:[0.45,0.45,1.05,0x9a5a3a,0x3f6a34,0],caixasP:[0.7,0.6,0.8,0xa07a4a,0x8a6a3a,0],
  comoda:[1.0,0.45,0.85,0x6b4e30,0x4a3424,1],roupasChao:[0.8,0.6,0.03,0x2f4f6a,0x7a2a22,0,1],entulho:[1.0,0.8,0.03,0xd8d0c0,0x55595c,0,1],bancadaCoz:[1.5,0.6,0.9,0x8a6e52,0xd8d4cc,1],
  armarioAlto:[1.2,0.35,0,0x8a6e52,0x6b5440,1,1],luminaria:[0.35,0.35,1.6,0x2b2b2b,0xe8dcb8,0],cadeira:[0.45,0.45,0.9,0x6b4e30,0x5a3f27,0],chuveiro:[0.9,0.9,0,0xd8d4cc,0x9aa1a6,1,1],lixeira:[0.32,0.32,0.45,0x55595c,0x3a3d40,0,1]};
function moveis(p,s,k,u,v,R,face){const N=MOVEIS_NOVOS[k];if(N){movelNovo(p,s,k,u,v,N,face);return;}const y=s.y,M={cama:[1.0,2.0,0.5,0x6b5a4c,0xb8b0a0],sofa:[2.0,0.9,0.85,0x5a5f6b,0x4a4f5a],mesa:[1.2,0.8,0.76,0x6b4e30,0x6b4e30],maca:[0.8,2.0,0.85,0x9fa6a4,0xd9dcd8],
    bancada:[2.0,0.7,0.95,0x6f777e,0x8d969f],gerador:[1.4,0.9,1.1,0x5a6b3a,0x3b3e42],carro:[2.0,4.2,1.4,0x6b6f74,0x2a2c2e],palete:[1.2,1.0,1.2,0x8a6a45,0x7a5a3c],empilhadeira:[1.2,2.3,2.1,0xc9a227,0x2b2b2b]}[k];if(!M)return;
  const[w,d,h,c1,c2]=M;const u0=clamp(u-w/2,s.u0+0.1,s.u1-w-0.1),v0=clamp(v-d/2,s.v0+0.1,s.v1-d-0.1);if(vedadoEm(p,u0+w/2,v0+d/2,Math.max(w,d)/2))return;
  if(portaTampada(p,s,u0,u0+w,v0,v0+d))return;
  CID.moveis.push({p,s,k,u0,u1:u0+w,v0,v1:v0+d,y,h,c1,c2});boxL(p,u0,u0+w,v0,v0+d,y,y+h,{movel:k});
  if(k==='gerador'){const c=pw(p,u0+w/2,v0+d/2);p.gerador={x:c[0],z:c[1],y,sala:s,u:u0+w/2,v:v0+d/2};}}

/* --- quarteirões elevados (calçada + lote) --- */
function gerarQuadras(){const xs=[CIDADE.x0],zs=[CIDADE.z0];for(const r of RUAS_NS)xs.push(r.x-r.a,r.x+r.a);xs.push(CIDADE.x1);for(const r of RUAS_EW)zs.push(r.z-r.a,r.z+r.a);zs.push(CIDADE.z1);
  for(let i=0;i<xs.length;i+=2)for(let j=0;j<zs.length;j+=2){const q={x0:xs[i],x1:xs[i+1],z0:zs[j],z1:zs[j+1],i:i/2,j:j/2};
    q.cW=i>0?RUAS_NS[i/2-1].c:0;q.cE=i+2<xs.length-1?RUAS_NS[i/2].c:0;q.cS=j>0?RUAS_EW[j/2-1].c:0;q.cN=j+2<zs.length-1?RUAS_EW[j/2].c:0;
    q.lote={x0:q.x0+q.cW,x1:q.x1-q.cE,z0:q.z0+q.cS,z1:q.z1-q.cN};
    q.sup=supAdd({t:'ret',x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2,hw:(q.x1-q.x0)/2,hd:(q.z1-q.z0)/2,yaw:0,y:QUADRA_Y,dono:q,solo:true});CID.quadras.push(q);}}
const quadraEm=(x,z)=>CID.quadras.find(q=>x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1);

/* --- metrô: duas bocas com escada, saguão, plataformas, túnel com trilhos, vagão parado e trecho alagado --- */
const METRO_Y=-6,TRILHO_Y=-7;
function gerarMetro(){const M={partes:[],pecas:[],agua:[]},cor={par:0x8a8f88,az:0x3d5a73,piso:0x6d6f6c,teto:0x55595c,trilho:0x4a4a48};CID.metro=M;
  const box=(x0,x1,y0,y1,z0,z1,c,b,col)=>{M.pecas.push([x0,x1,y0,y1,z0,z1,c,b??0.95]);if(col)colBox((x0+x1)/2,(z0+z1)/2,(x1-x0)/2,(z1-z0)/2,0,{solid:true,y0,y1,metro:true});};
  const zona=(nome,x0,x1,z0,z1,y,teto)=>{const s={id:CID.salas.length,nome,tipo:'metro',x0,x1,z0,z1,y,teto,x:(x0+x1)/2,z:(z0+z1)/2,escura:0.95,conts:[],metro:true};CID.salas.push(s);M.partes.push(s);s.no=noNovo(s.x,y,s.z,s);return s;};
  const ret=(x0,x1,z0,z1,y)=>supAdd({t:'ret',x:(x0+x1)/2,z:(z0+z1)/2,hw:(x1-x0)/2,hd:(z1-z0)/2,yaw:0,y,dono:M});
  // bocas: escada de 2,6 m descendo para o sul até o saguão
  const bocas=[[192,-3.0],[280,-3.0]];M.bocas=[];
  for(const[bx,bz]of bocas){const x0=bx,x1=bx+2.6,z0=bz-11.2,z1=bz;BURACOS.push({x0,x1,z0,z1});
    supAdd({t:'ram',x:(x0+x1)/2,z:(z0+z1)/2,hw:1.3,hd:5.6,yaw:0,ya:METRO_Y,yb:QUADRA_Y,dono:M});
    for(let i=0;i<36;i++){const z=z1-(i+1)*(11.2/36),y=QUADRA_Y-(i+1)*((QUADRA_Y-METRO_Y)/36);box(x0+0.05,x1-0.05,y-0.2,y,z,z+11.2/36,cor.piso,0.5);}
    // paredes laterais (do subsolo até o corrimão na rua) e grade do fundo
    box(x0-0.15,x0,METRO_Y-0.5,QUADRA_Y+1.05,z0,z1,cor.par,0.5,true);box(x1,x1+0.15,METRO_Y-0.5,QUADRA_Y+1.05,z0,z1,cor.par,0.5,true);box(x0-0.15,x1+0.15,QUADRA_Y-0.1,QUADRA_Y+1.05,z0-0.15,z0,cor.par,0.4,true);
    // cobertura com placa
    box(x0-0.4,x1+0.4,QUADRA_Y+2.8,QUADRA_Y+2.95,z1-3.2,z1+0.3,0x3b3e42,0);for(const xx of[x0-0.3,x1+0.3])box(xx-0.06,xx+0.06,QUADRA_Y,QUADRA_Y+2.8,z1-0.1,z1+0.02,0x3b3e42,0);
    M.pecas.push([x0+0.4,x1-0.4,QUADRA_Y+3.0,QUADRA_Y+3.5,z1-0.05,z1+0.05,0x2a5aa8,0,1.2]);
    const topo=noNovo(bx+1.3,QUADRA_Y,bz+1.2,'fora',{boca:true}),fundo={x:bx+1.3,z:z0-1.2};M.bocas.push({x0,x1,z0,z1,topo,fundo});}
  // saguões e plataformas
  const s1=zona('Saguão da estação Central',184,210,-24,-14.2,METRO_Y,-2.4),s2=zona('Saguão da estação Leste',270,296,-24,-14.2,METRO_Y,-2.4);
  const p1=zona('Plataforma Central',184,210,-28.5,-24,METRO_Y,-2.4),p2=zona('Plataforma Leste',270,296,-28.5,-24,METRO_Y,-2.4);
  const tn=zona('Túnel',184,296,-34.5,-28.5,TRILHO_Y,-2.6);
  for(const s of[s1,s2,p1,p2])ret(s.x0,s.x1,s.z0,s.z1,METRO_Y);ret(184,296,-34.5,-28.5,TRILHO_Y);
  // pisos e tetos (desenho)
  for(const s of[s1,s2,p1,p2]){box(s.x0,s.x1,METRO_Y-0.3,METRO_Y,s.z0,s.z1,cor.piso,0.95);box(s.x0,s.x1,-2.4,-2.1,s.z0,s.z1,cor.teto,0.95);}
  box(184,296,TRILHO_Y-0.3,TRILHO_Y,-34.5,-28.5,0x3a3530,0.95);box(184,296,-2.6,-2.3,-34.5,-28.5,cor.teto,0.95);
  for(const z of[-33,-30])box(184,296,TRILHO_Y,TRILHO_Y+0.14,z-0.06,z+0.06,0x6f6b62,0.9);
  for(let x=185;x<296;x+=0.9)box(x,x+0.25,TRILHO_Y,TRILHO_Y+0.06,-34,-29,0x4a3a2a,0.95);
  box(184,296,TRILHO_Y,METRO_Y,-28.62,-28.5,0xc9a227,0.9);   // borda amarela da plataforma
  // paredes: contorno do subsolo (colisores do chão do túnel até o teto)
  const Y0=TRILHO_Y-0.5,Y1=-2.0;
  box(183.8,184,Y0,Y1,-34.6,-14.2,cor.par,0.95,true);box(296,296.2,Y0,Y1,-34.6,-14.2,cor.par,0.95,true);box(183.8,296.2,Y0,Y1,-34.7,-34.5,cor.par,0.95,true);
  box(210,270,Y0,Y1,-28.6,-28.5,cor.par,0.95,true);   // parede entre túnel e o vão sem plataforma
  for(const[x0,x1]of[[184,192],[194.6,210],[270,280],[282.6,296]])box(x0,x1,METRO_Y,Y1,-14.4,-14.2,cor.az,0.95,true);
  box(210,210.2,METRO_Y,Y1,-28.5,-21.5,cor.par,0.95,true);box(210,210.2,METRO_Y,Y1,-20.5,-14.2,cor.par,0.95,true);box(210,210.2,METRO_Y+2.2,Y1,-21.5,-20.5,cor.par,0.95,true);
  box(269.8,270,METRO_Y,Y1,-28.5,-14.2,cor.par,0.95,true);
  // sala técnica atrás de uma porta de serviço trancada (pé de cabra): ferramentas, armário e o quadro de força
  const st=zona('Sala técnica do metrô',210.2,216,-24,-17.5,METRO_Y,-2.6);ret(210.2,216,-24,-17.5,METRO_Y);box(210.2,216,METRO_Y-0.3,METRO_Y,-24,-17.5,cor.piso,0.95);box(210.2,216,-2.6,-2.3,-24,-17.5,cor.teto,0.95);
  box(216,216.2,METRO_Y,Y1,-24.2,-17.3,cor.par,0.95,true);box(210.2,216,METRO_Y,Y1,-24.2,-24,cor.par,0.95,true);box(210.2,216,METRO_Y,Y1,-17.5,-17.3,cor.par,0.95,true);
  box(215.85,215.98,METRO_Y+1.0,METRO_Y+2.0,-21.4,-20.2,0x55595c,0.95);box(215.8,215.86,METRO_Y+1.3,METRO_Y+1.5,-21.2,-20.4,0xc9a227,0.95);
  {const d={id:CID.portas.length,p:null,f:0,x:210.1,z:-21,y:METRO_Y,yaw:Math.PI/2,larg:1.0,tipo:'metal',estado:'trancada',hpMax:320,sA:s1,sB:st,metro:true};d.hp=d.hpMax;
    d.nA=noNovo(209.3,METRO_Y,-21,s1,{porta:d});d.nB=noNovo(210.9,METRO_Y,-21,st,{porta:d});ligar(d.nA,d.nB,0.6);ligar(s1.no,d.nA);ligar(st.no,d.nB);CID.portas.push(d);M.portaServico=d;}
  // azulejos e colunas
  for(const s of[s1,s2])for(let x=s.x0+3;x<s.x1-1;x+=5){box(x-0.25,x+0.25,METRO_Y,-2.4,-21.5,-21,cor.az,0.95,true);}
  for(const s of[p1,p2])for(let x=s.x0+2;x<s.x1;x+=6){box(x-0.2,x+0.2,METRO_Y,-2.4,-26.4,-26,cor.par,0.95,true);M.pecas.push([x-0.35,x+0.35,-2.55,-2.45,-26.3,-26.1,0xff3020,0.6,0.8]);}
  // vagão parado no túnel (bloqueia metade dos trilhos) e entulho mais adiante
  box(226,244,TRILHO_Y,TRILHO_Y+3.0,-33.9,-30.9,0x9aa1a6,0.92,true);box(226,244,TRILHO_Y+1.4,TRILHO_Y+2.3,-33.95,-33.9,0x1a2228,0.92);
  for(let i=0;i<5;i++){const x=252+i*0.9,h=0.6+Math.sin(i*1.7)*0.4+1.0;box(x,x+1.1,TRILHO_Y,TRILHO_Y+h,-33.5,-31.4,0x6f6b62,0.95,true);}
  // trecho alagado (anda devagar)
  M.agua.push({x0:246,x1:262,z0:-34.5,z1:-28.5,y:TRILHO_Y+0.35});CID.aguas.push({x0:246,x1:262,z0:-34.5,z1:-28.5,y:TRILHO_Y+0.35,yMin:TRILHO_Y-0.6});
  // recipientes: caixa de ferramentas na sala técnica improvisada, armário de manutenção, malas no vagão
  const cont=(id,x,z,y,tipo,tab,yaw)=>{const D=CONT_DEF[tipo],c={id,p:null,sala:null,tipo,tabela:tab,x,z,y,yaw:yaw||0,hw:D.hw,hd:D.hd,h:D.h,estado:'fechado',itens:null,t:0,metro:true};
    c.col=colBox(x,z,D.hw,D.hd,yaw||0,{solid:true,y0:y,y1:y+D.h,cont:c});CID.conts.push(c);return c;};
  cont('m1',186,-15,METRO_Y,'caixaFerr','metro_ferr',Math.PI);cont('m2',208.5,-18,METRO_Y,'armario','metro_manut',-Math.PI/2);cont('m3',235,-30.5,TRILHO_Y,'caixas','metro_vagao',0);
  cont('m4',294,-16,METRO_Y,'armario','metro_manut',-Math.PI/2);cont('m5',272,-27,METRO_Y,'caixas','metro_vagao',0);
  cont('m6',215.5,-23.3,METRO_Y,'caixaFerr','metro_ferr',-Math.PI/2);cont('m7',211.2,-17.85,METRO_Y,'armario','metro_tec',Math.PI);cont('m8',213.5,-23.6,METRO_Y,'prateleira','metro_tec',0);
  // nós: bocas ↔ saguões ↔ plataformas ↔ túnel
  const bs=M.bocas;const nb1=noNovo(bs[0].fundo.x,METRO_Y,bs[0].fundo.z,s1),nb2=noNovo(bs[1].fundo.x,METRO_Y,bs[1].fundo.z,s2);ligar(bs[0].topo,nb1,14);ligar(bs[1].topo,nb2,14);ligar(nb1,s1.no);ligar(nb2,s2.no);
  ligar(s1.no,p1.no);ligar(s2.no,p2.no);const t1=noNovo(205,TRILHO_Y,-31.5,tn),t2=noNovo(275,TRILHO_Y,-31.5,tn);ligar(p1.no,t1,4);ligar(p2.no,t2,4);
  let ant=t1;for(let x=215;x<275;x+=10){const nt=noNovo(x,TRILHO_Y,x>222&&x<264?-29.6:-31.5,tn);ligar(ant,nt);ant=nt;}ligar(ant,t2);
  // descida da plataforma para os trilhos (pulo de 1 m) só na ponta das plataformas
  for(const s of[s1,s2,p1,p2,tn])CID.ninhos.push(s);}

/* --- ruas: carros, ônibus, entulho, barricada da polícia, postes --- */
function gerarRua(){const R=rng(777),P=CID.props;
  const carro=(x,z,yaw,cor,aberto)=>{P.push({k:'carro',x,z,yaw,cor,aberto});colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.6,carro2:true});
    if(aberto){const t=fwd(yaw,-2.75);CID.conts.push(Object.assign({id:'rc'+P.length,p:null,sala:null,tipo:'portaMalas',tabela:'carro',x:x+t[0],z:z+t[1],y:0,yaw,hw:0.8,hd:0.3,h:0.9,estado:'fechado',itens:null,t:0,rua:true}));}};
  const onibus=(x,z,yaw)=>{P.push({k:'onibus',x,z,yaw});colBox(x,z,1.3,5.8,yaw,{solid:true,y0:-0.2,y1:3.2,carro2:true});};
  const entulho=(x,z,r)=>{P.push({k:'entulho',x,z,r,seed:R()});colCircle(x,z,r*0.8,{entulho:true,y0:-0.3,y1:1.4+r*0.3});};
  // avenida: carros abandonados, um ônibus atravessado no cruzamento
  carro(180,5,1.6,0x6b6f74,true);carro(186,11.5,-1.4,0x2f3e5c,false);carro(214,4.2,1.5,0x7a1f1a,true);carro(222,11,1.75,0x8d8a80,false);carro(238,5.5,1.4,0x3a4a3a,true);
  carro(247,12,-1.6,0xb0a690,false);carro(262,4,1.65,0x2a2c2e,true);carro(278,11.5,-1.5,0x6b6f74,false);carro(292,5,1.5,0x5a3a2c,true);
  onibus(204.5,8.5,1.2);
  // rua transversal bloqueada ao norte por barricada policial e carros batidos: força a volta pelo outro lado
  for(let i=0;i<5;i++){P.push({k:'barreira',x:201.5+i*1.75,z:46,yaw:0});colBox(201.5+i*1.75,46,0.85,0.3,0,{solid:true,y0:-0.2,y1:1.1});}
  carro(203,43,0.3,0x2a2c2e,false);carro(207,42,-0.4,0xe0ddd5,false);
  entulho(250,40,1.6);entulho(253,43,1.2);entulho(257,38,1.4);entulho(196,-30,1.3);entulho(258,-20,1.1);
  // postes
  for(let x=180;x<330;x+=24){for(const z of[-0.2,16.2]){P.push({k:'poste',x,z,yaw:z<8?0:Math.PI});colCircle(x,z,0.12,{y0:-0.2,y1:6});}}
  // grama nas rachaduras e no meio-fio
  for(let i=0;i<1600;i++){const x=CIDADE.x0+R()*(CIDADE.x1-CIDADE.x0),z=CIDADE.z0+R()*(CIDADE.z1-CIDADE.z0);const q=quadraEm(x,z),y=q?QUADRA_Y:0;
    if(CID.predios.some(p=>x>p.x0-0.3&&x<p.x1+0.3&&z>p.z0-0.3&&z<p.z1+0.3))continue;if(R()<0.6&&q){const l=q.lote;if(x>l.x0&&x<l.x1&&z>l.z0&&z<l.z1&&R()<0.7)continue;}
    if(BURACOS.some(b=>x>b.x0-0.5&&x<b.x1+0.5&&z>b.z0-0.5&&z<b.z1+0.5)||pointBlocked(x,z,0.3))continue;GRASS.push({x,z,y:y-0.02,r:R()*6.283,s:0.5+R()*0.5,t:0.75+R()*0.3});}}

/* --- cerco de quarentena na borda da cidade: tapume de chapa com arame em cima e barricada no fim de cada rua.
   Antes a borda era o limite do mapa sem nada desenhado (parede invisível ao lado dos prédios da beirada). A entrada da estrada (oeste) fica aberta. --- */
/* Etapa 20: a avenida do meio (z = 8) segue até o cais do porto; ali o tapume leste tem uma abertura (o mesmo trecho do PORTO, 61t) */
const CERCO_PORTO={z0:-4,z1:20};
/* pedido do Himalaia: a volta da cidade virou mata e morro andáveis (62g_anel_cidade); o tapume ganhou 4 buracos no fim de ruas,
   dois a oeste (ruas z = -44 e z = 58), um ao norte e um ao sul (rua x = 255), sem a barricada daquele fim de rua */
const CERCO_BRECHAS={W:[-44,58],N:[255],S:[255],meia:4.6};
function gerarCerco(){const R=rng(4413),P=CID.props,C=CIDADE,E=0.3,PAS=[-2.8,19.2];
  const livre=(x,z)=>!CID.predios.some(p=>x>p.x0-0.4&&x<p.x1+0.4&&z>p.z0-0.4&&z<p.z1+0.4);
  // trecho reto: centro, meia-largura ao longo da borda e normal para dentro (yaw: x local = ao longo, z local = para dentro)
  const trecho=(cx,cz,hl,nx,nz,pula)=>{const yaw=Math.atan2(nx,nz),tx=nz,tz=-nx,n=Math.max(1,Math.round(hl*2/2.5)),w=hl*2/n;
    for(let i=0;i<n;i++){const u=-hl+(i+0.5)*w,x=cx+tx*u,z=cz+tz*u;if(!livre(x,z)||(pula&&pula(z,x)))continue;
      P.push({k:'cerco',x,z,yaw,w,h:2.3+R()*0.4,inc:(R()-0.5)*0.05,cor:R(),marca:R()<0.13,seed:R()});
      colBox(x+nx*0.02,z+nz*0.02,w/2+0.02,0.14,yaw,{solid:true,y0:-0.6,y1:3.2,cerco:true});
      if(R()<0.55){const a=R()*w-w/2,q=0.45+R()*0.4;GRASS.push({x:x+tx*a+nx*q,z:z+tz*a+nz*q,y:(quadraEm(x,z)?QUADRA_Y:0)-0.02,r:R()*6.283,s:0.6+R()*0.6,t:0.7+R()*0.3});}}};
  const BR=CERCO_BRECHAS,naBrecha=(L,v)=>L.some(b=>Math.abs(v-b)<BR.meia);
  trecho((C.x0+C.x1)/2,C.z0+E,(C.x1-C.x0)/2,0,1,(z,x)=>naBrecha(BR.N,x));trecho((C.x0+C.x1)/2,C.z1-E,(C.x1-C.x0)/2,0,-1,(z,x)=>naBrecha(BR.S,x));
  trecho(C.x1-E,(C.z0+C.z1)/2,(C.z1-C.z0)/2,-1,0,z=>z>CERCO_PORTO.z0&&z<CERCO_PORTO.z1);   // Etapa 20: abertura para o cais do porto
  trecho(C.x0+E,(C.z0+PAS[0])/2,(PAS[0]-C.z0)/2,1,0,z=>naBrecha(BR.W,z));trecho(C.x0+E,(PAS[1]+C.z1)/2,(C.z1-PAS[1])/2,1,0,z=>naBrecha(BR.W,z));
  // fim de rua: blocos de concreto, um carro atravessado e entulho na frente do tapume
  const cores=[0x6b6f74,0x2f3e5c,0x7a1f1a,0x8d8a80,0x3a4a3a,0xb0a690,0x5a3a2c];
  // não põe nada da barricada em cima de carro, caminhão, poste ou prédio que já estava ali (o tapume não conta)
  const ocupado=(x,z,r)=>{for(const c of colQuery(x,z,r+1)){if(!c.solid||c.cerco||c.sub)continue;if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return true;}
      else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,qx=clamp(lx,-c.hw,c.hw),qz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-qx,lz-qz)<r)return true;}}return!livre(x,z);};
  const barricada=(cx,cz,nx,nz,a)=>{const tx=nz,tz=-nx,yb=Math.atan2(-tz,tx),pt=(u,v)=>[cx+tx*u+nx*v,cz+tz*u+nz*v];
    for(const u of[-a+1.2,-a+3.5,a-1.3]){const[x,z]=pt(u,1.25+R()*0.5),yaw=yb+(R()-0.5)*0.35;if(ocupado(x,z,1.05))continue;P.push({k:'jersey',x,z,yaw,cor:R()});colBox(x,z,1.0,0.31,yaw,{solid:true,y0:-0.2,y1:0.85,barr:true});}
    for(let t=0;t<6;t++){const[x,z]=pt((R()-0.5)*a*0.7,3.7+R()*1.4);if(ocupado(x,z,2.25))continue;const yaw=Math.atan2(tx,tz)+(R()-0.5)*0.6;
      P.push({k:'carro',x,z,yaw,cor:cores[Math.floor(R()*cores.length)],aberto:false});colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.6,carro2:true,barr:true});break;}
    {const s=R()<0.5?-1:1,[x,z]=pt(s*(a-0.9),0.95),r=0.9+R()*0.4;if(!ocupado(x,z,r)){P.push({k:'entulho',x,z,r,seed:R()});colCircle(x,z,r*0.8,{entulho:true,y0:-0.3,y1:1.4+r*0.3,barr:true});}}};
  // corredor da estrada antes da entrada: tapume dos dois lados até a mata (ali o limite do corredor também era invisível, em campo aberto)
  const zc=x=>x<168?roadZ(x):8.2;
  for(let x=155;x<C.x0-0.1;x+=2.5){const xm=x+1.25,s=(zc(x+2.5)-zc(x))/2.5,L=Math.hypot(1,s);
    for(const sg of[-1,1]){const z=zc(xm)+sg*10.7,nx=sg*s/L,nz=-sg/L,yaw=Math.atan2(nx,nz),w=2.5*L+0.04;
      P.push({k:'cerco',x:xm,z,yaw,w,h:2.3+R()*0.4,inc:(R()-0.5)*0.05,cor:R(),marca:R()<0.13,seed:R(),campo:true});
      colBox(xm+nx*0.02,z+nz*0.02,w/2+0.02,0.14,yaw,{solid:true,y0:-3,y1:6,cerco:true});}}
  for(const r of RUAS_NS){if(!naBrecha(BR.N,r.x))barricada(r.x,C.z0+E,0,1,r.a);if(!naBrecha(BR.S,r.x))barricada(r.x,C.z1-E,0,-1,r.a);}
  for(const r of RUAS_EW){if(!(r.z>CERCO_PORTO.z0&&r.z<CERCO_PORTO.z1))barricada(C.x1-E,r.z,-1,0,r.a);if((r.z<PAS[0]||r.z>PAS[1])&&!naBrecha(BR.W,r.z))barricada(C.x0+E,r.z,1,0,r.a);}}

/* --- montagem da cidade --- */
const CID_LISTA=[
  {nome:'Edifício Aurora',esconderijo:2,tipo:'residencial',x0:213,x1:227,z0:19,z1:37,frente:'S',andares:4,aberturasTelhado:[{lado:'R',a:7.2,b:8.4},{lado:'R',a:15,b:16}],
   desc:'Edifício Aurora: apartamentos em 4 andares. Cozinha e quarto costumam ter comida e remédio. A escada de incêndio do beco sobe até o telhado.'},
  {nome:'Escritórios Central',tipo:'escritorio',x0:230.5,x1:246.5,z0:19,z1:35,frente:'S',andares:4,aberturasTelhado:[{lado:'L',a:7.2,b:8.4},{lado:'B',a:3.6,b:4.8}],
   desc:'Escritórios Central: mesas, arquivos e um cofre na sala de arquivo. A porta dos fundos tem alarme.'},
  {nome:'Mercado Bom Preço',tipo:'mercado',x0:213,x1:229,z0:40.5,z1:50.5,frente:'N',andares:1,desc:'Mercado Bom Preço: comida e água no salão e no estoque. A porta dos fundos tem alarme.'},
  {nome:'Hospital São Lucas',tipo:'hospital',x0:219,x1:241,z0:-25,z1:-3,frente:'N',andares:3,risco:true,entulho:1,
   desc:'Hospital São Lucas: ALTO RISCO. Remédios e kits, mas tem muito mais deles aqui dentro, e vários ficam quietos esperando. Farmácia trancada; o gerador fica nos fundos do térreo. A escada para o 2º andar está tomada de entulho.'},
  {nome:'Oficina do Zé',tipo:'oficina',x0:176,x1:194,z0:19,z1:31,frente:'S',andares:1,desc:'Oficina do Zé: ferramentas e peças. Sai fumaça do depósito de peças: lá dentro ninguém enxerga direito.'},
  {nome:'Edifício Bela Vista',tipo:'residencial',x0:230.5,x1:246.5,z0:38.5,z1:50.5,frente:'N',andares:4,aberturasTelhado:[{lado:'B',a:11.2,b:12.4}],alagado:true,entulho:2,esconderijo:3,
   desc:'Edifício Bela Vista: o térreo está alagado e a escada cedeu entre o 2º e o 3º andar. Lá em cima ninguém mexeu em nada.'}];
/* térreo alagado: lâmina d'água de 30 cm em todo o andar (anda devagar e faz barulho) */
function alagarTerreo(p){const E=0.25,y=p.y0;CID.aguas.push({x0:p.x0+E,x1:p.x1-E,z0:p.z0+E,z1:p.z1-E,y:y+0.3,yMin:y-2.2,predio:p});
  peca(p,E,p.W-E,y+0.27,y+0.3,E,p.D-E,0x22393a,0.62,1);for(const s of p.salas[0]||[])s.alagada=true;}
/* lance de escada tomado por entulho (primeiro lance que sobe do andar f): bloqueia gente e zumbi até alguém tirar */
function entulhoEscada(p,f){const uc=p.uc,vS=p.vS,ya=p.y0+f*p.H,u0=uc-1.3+0.08,u1=uc-0.05,v0=vS+1.15,v1=vS+3.1,c=pw(p,(u0+u1)/2,v0-0.15);
  const e={id:CID.entulhos.length,p,f,x:c[0],z:c[1],y:ya,ativo:true,u0,u1,v0,v1};e.col=boxL(p,u0,u1,v0,v1,ya,ya+2.3,{entulho:true});
  const N=p.escNos[f];N.a0.entulho=e;N.a1.entulho=e;CID.entulhos.push(e);return e;}
/* esconderijo atrás de um painel solto na parede de um apartamento: só aparece depois de examinar a parede */
function esconderijoNovo(p,f){const L=(p.salas[f]||[]).filter(s=>s.tipo==='apartamento');if(!L.length)return null;const D=CONT_DEF.painel,yE=0.3;
  // numa parede interna de um apartamento, longe de porta, janela, recipiente e móvel (precisa dar para ver e chegar)
  const paredes=s=>[{e:'v',k:s.v1-0.06,n:-1,a:s.u0,b:s.u1,ok:s.v1<p.D-yE},{e:'v',k:s.v0+0.06,n:1,a:s.u0,b:s.u1,ok:s.v0>yE},{e:'u',k:s.u1-0.06,n:-1,a:s.v0,b:s.v1,ok:s.u1<p.W-yE},{e:'u',k:s.u0+0.06,n:1,a:s.v0,b:s.v1,ok:s.u0>yE}];
  const livre=(s,w,t)=>{const u=w.e==='v'?t:w.k,v=w.e==='v'?w.k:t,fu=w.e==='v'?0:w.n*1.0,fv=w.e==='v'?w.n*1.0:0;
    if(CID.portas.some(d=>{if(d.p!==p||d.f!==f)return false;const l=plc(p,d.x,d.z);return Math.hypot(l[0]-u,l[1]-v)<1.4;}))return false;
    if(s.conts.some(c=>Math.hypot(c.u-u,c.v-v)<1.3||Math.hypot(c.u-(u+fu),c.v-(v+fv))<0.9))return false;
    const fr=[u+fu*0.55,v+fv*0.55];if(CID.moveis.some(m=>m.s===s&&((u+0.45>m.u0&&u-0.45<m.u1&&v+0.45>m.v0&&v-0.45<m.v1)||(fr[0]+0.5>m.u0&&fr[0]-0.5<m.u1&&fr[1]+0.5>m.v0&&fr[1]-0.5<m.v1))))return false;
    return{u,v};};
  let pick=null;
  for(const s of[L[Math.min(1,L.length-1)],...L]){for(const w of paredes(s)){if(!w.ok)continue;for(const fr of[0.3,0.7,0.45,0.55,0.2,0.8]){const t=w.a+0.6+(w.b-w.a-1.2)*fr,r=livre(s,w,t);if(r){pick={s,w,u:r.u,v:r.v};break;}}if(pick)break;}if(pick)break;}
  if(!pick)return null;const{s,w}=pick,yb=s.y+0.85,yawL=w.e==='v'?(w.n<0?Math.PI:0):(w.n<0?-Math.PI/2:Math.PI/2);
  const cu=pick.u+(w.e==='u'?w.n*0.07:0),cv=pick.v+(w.e==='v'?w.n*0.07:0);
  const c=contExtra(p,s,'painel','esconderijo',cu,cv,yb,yawL,'ec',{oculto:true,revelado:false});
  // pista: placa de madeira escura com parafusos e fresta, na altura do peito, e fita velha no reboco
  const placa=(a0,a1,y0,y1,d0,d1,cor)=>{const k0=w.k-w.n*d1,k1=w.k-w.n*d0;const lo=Math.min(k0,k1),hi=Math.max(k0,k1);   // d: distância saindo da parede para dentro da sala (negativo = dentro)
    if(w.e==='v')peca(p,(w.e==='v'?pick.u:0)+a0,pick.u+a1,y0,y1,lo,hi,cor,s.escura);else peca(p,lo,hi,y0,y1,pick.v+a0,pick.v+a1,cor,s.escura);};
  placa(-0.36,0.36,yb-0.04,yb+0.62,-0.018,0,0x5d4a38);placa(-0.3,0.3,yb+0.27,yb+0.29,-0.024,0,0x2a2018);
  for(const[da,dy]of[[-0.3,0.02],[0.3,0.02],[-0.3,0.55],[0.3,0.55]])placa(da-0.025,da+0.025,yb+dy-0.025,yb+dy+0.025,-0.03,0,0xb0b4b8);
  placa(-0.4,0.15,yb+0.66,yb+0.71,-0.01,0,0x8a7a5a);
  p.esconderijoC=c;return c;}
/* passarelas de tábua entre telhados: a quebrada precisa de conserto (3 tábuas e 2 pregos) para passar */
function passarelaNova(a,b,x0,x1,z0,z1,y,quebrada){const pa={id:CID.passarelas.length,a,b,x0,x1,z0,z1,y,quebrada,quebrada0:quebrada,x:(x0+x1)/2,z:(z0+z1)/2};CID.passarelas.push(pa);
  const ao=x1-x0>z1-z0;pa.ao=ao;const ea=ao?[x0+0.2,(z0+z1)/2]:[(x0+x1)/2,z0+0.2],eb=ao?[x1-0.2,(z0+z1)/2]:[(x0+x1)/2,z1-0.2];pa.pontas=[ea,eb];
  pa.na=noNovo(ea[0],y,ea[1],a.telhado,{passarela:pa});pa.nb=noNovo(eb[0],y,eb[1],b.telhado,{passarela:pa});ligar(pa.na,pa.nb);ligar(pa.na,a.telhado.no);ligar(pa.nb,b.telhado.no);
  if(!quebrada)passarelaPiso(pa);
  else{const L=ao?x1-x0:z1-z0,toco=(t0,t1)=>supAdd(ao?{t:'ret',x:x0+(t0+t1)/2*L,z:(z0+z1)/2,hw:(t1-t0)*L/2,hd:(z1-z0)/2,yaw:0,y,dono:a,passarela:true}:{t:'ret',x:(x0+x1)/2,z:z0+(t0+t1)/2*L,hw:(x1-x0)/2,hd:(t1-t0)*L/2,yaw:0,y,dono:a,passarela:true});
    pa.tocos=[toco(0,0.3),toco(0.75,1)];}
  return pa;}
function passarelaPiso(pa){if(pa.sup)return;pa.sup=supAdd({t:'ret',x:pa.x,z:pa.z,hw:(pa.x1-pa.x0)/2,hd:(pa.z1-pa.z0)/2,yaw:0,y:pa.y,dono:pa.a,passarela:true});}
/* caixa de suprimentos esquecida num telhado */
function contTeto(p,u,v,tab){const D=CONT_DEF.caixas,w=pw(p,u,v),y=p.yTopo;const c={id:'t'+p.id+'u'+Math.round(u)+'v'+Math.round(v),p,sala:p.telhado,tipo:'caixas',tabela:tab,x:w[0],z:w[1],y,yaw:p.yaw,hw:D.hw,hd:D.hd,h:D.h,estado:'fechado',itens:null,t:0,u,v,yawL:0};
  c.col=colBox(c.x,c.z,D.hw,D.hd,p.yaw,{solid:true,y0:y,y1:y+D.h,cont:c});CID.conts.push(c);p.telhado.conts.push(c);}
function gerarCidade(){RC=rng(424242);gerarQuadras();
  for(const sp of CID_LISTA){const p=Object.assign({andares:1},sp);p.id=CID.predios.length;CID.predios.push(p);p.salas=[];p.pecas=[];
    const F={S:[0,p.x0,p.z0],W:[Math.PI/2,p.x0,p.z1],N:[Math.PI,p.x1,p.z1],E:[-Math.PI/2,p.x1,p.z0]}[p.frente];
    p.yaw=F[0];p.ox=F[1];p.oz=F[2];p.c=Math.cos(p.yaw);p.s=Math.sin(p.yaw);const ns=p.frente==='S'||p.frente==='N';
    p.W=ns?p.x1-p.x0:p.z1-p.z0;p.D=ns?p.z1-p.z0:p.x1-p.x0;p.y0=PISO0;p.H=sp.H||ANDAR_H;
    if(p.casa)predioCasa(p);else if(p.andares>1)predioCorredor(p);else predioSalao(p);p.yTopo=p.casa?p.y0+p.andares*p.H:p.andares>1?p.y0+p.andares*p.H:p.y0+p.H*(p.alt||1.15);mobiliar(p);
    if(p.alagado)alagarTerreo(p);if(p.entulho!==undefined){entulhoEscada(p,p.entulho);if(p.tipo==='residencial')for(let f=p.entulho+1;f<p.andares;f++)for(const s of p.salas[f]||[])s.fragil=true;}if(p.esconderijo!==undefined)esconderijoNovo(p,p.esconderijo);
    if(!p.casa){const w=pw(p,p.W/2,0.9);CID.mirantes.push({id:CID.mirantes.length,p,x:w[0],z:w[1],y:p.yTopo});}}
  // passarelas: Aurora ↔ Central por cima do beco (inteira) e Central ↔ Bela Vista (quebrada)
  CID.passarelas=[];{const a=CID.predios[0],b=CID.predios[1],c=CID.predios[5],y=a.yTopo,z=a.z0+7.8;passarelaNova(a,b,a.x1-0.4,b.x0+0.4,z-0.6,z+0.6,y,false);
    passarelaNova(b,c,234.1,235.3,b.z1-0.4,c.z0+0.4,y,true);
    contTeto(b,5,12,'teto');contTeto(c,12.5,3,'teto');const H=CID.predios[3];contTeto(H,3,3,'teto');}
  // escada de emergência (de mão) no beco do Aurora, do chão ao telhado
  {const a=CID.predios[0],x=a.x1+0.25,z=a.z0+15.5,y1=a.yTopo;const via=viaReta(x,z,QUADRA_Y,y1,-Math.PI/2,{x:x+0.75,y:QUADRA_Y,z},{x:a.x1-0.8,y:y1,z,rumo:-Math.PI/2},a);VIAS.push(via);CID.escadasExt.push({p:a,via,x,z,y0:QUADRA_Y,y1});
}
  for(const j of CID.janelas){if(!j.quebrada||j.f>0)continue;const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw),xi=j.x-nx*0.8,zi=j.z-nz*0.8,s=salaEm(xi,j.y+0.3,zi);if(!s)continue;
    const a=noNovo(xi,j.y,zi,s,{janela:j}),b=noNovo(j.x+nx*0.9,QUADRA_Y,j.z+nz*0.9,'fora',{janela:j});ligar(a,b,3.5);ligar(a,s.no);j.nos=[a,b];}
  gerarPosto();tiposDeLote();gerarMetro();gerarRua2();gerarRua();gerarPostos();gerarCerco();}
/* zona (sala) onde está um ponto: prédio por andar, metrô, ou null = rua */
function salaEm(x,y,z){if(y<-20){const s=salaSubEm(x,y,z);if(s)return s;}if(!dentroCidade(x,z,2)&&!ruralEm(x,z,2))return null;
  if(y<-1){for(const s of CID.metro.partes)if(x>=s.x0&&x<=s.x1&&z>=s.z0&&z<=s.z1&&y<s.teto)return s;
    for(const a of CID.poroes){const s=a.sala,p=a.p;if(x<p.x0-0.5||x>p.x1+0.5||z<p.z0-0.5||z>p.z1+0.5)continue;const l=plc(p,x,z);if(l[0]>=s.u0-0.2&&l[0]<=s.u1+0.2&&l[1]>=s.v0-0.2&&l[1]<=s.v1+0.2)return s;}
    return null;}
  for(const p of CID.predios){if(x<p.x0-1.4||x>p.x1+1.4||z<p.z0-1.4||z>p.z1+1.4)continue;const l=plc(p,x,z),n=p.salas.length-1;
    if(p.porao&&y<p.y0-0.5){const s=p.porao.sala;if(l[0]>=s.u0-0.2&&l[0]<=s.u1+0.2&&l[1]>=s.v0-0.2&&l[1]<=s.v1+0.2)return s;}
    const f=clamp(Math.floor((y-p.y0+0.6)/p.H),0,n),ls=p.salas[f]||[];let best=null,bd=1e9;
    for(const s of ls){if(l[0]>=s.u0-0.1&&l[0]<=s.u1+0.1&&l[1]>=s.v0-0.1&&l[1]<=s.v1+0.1)return s;const d=Math.max(s.u0-l[0],l[0]-s.u1,0)+Math.max(s.v0-l[1],l[1]-s.v1,0);if(d<bd){bd=d;best=s;}}
    return bd<0.6?best:null;}
  return null;}
/* quanto um ponto está "dentro" (escuro): 0 na rua */
function interiorEm(x,y,z){const s=salaEm(x,y,z);if(s)return s.escura;const f=ferroInteriorEm(x,y,z);return f?f.escura:0;}
/* teto acima de um ponto dentro de prédio/metrô (para a câmera) */
function tetoEm(x,y,z){const s=salaEm(x,y,z);if(!s){const f=ferroInteriorEm(x,y,z);return f?f.teto:null;}if(s.metro)return s.teto;if(s.tipo==='telhado'||s.tipo==='sacada')return null;
  if(s.porao)return s.y+2.35;
  if(s.poco){const E=s.poco;if(s.f===0)return E.yc-0.35;if(s.f===E.fCab)return y<E.yR-0.3?E.yR-0.25:y+2.0;return null;}
  if(s.tipo==='escada')return s.f===s.p.andares?s.p.yTopo+2.6:y+2.0;if(s.p.casa)return s.y+s.p.H-0.22;return s.y+(s.p.andares>1?s.p.H-0.24:s.p.H*(s.p.alt||1.15)-0.28);}
