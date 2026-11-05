/* ================= Lanterna de mão na mão =================
   Com a "Lanterna de mão" escolhida na barra, ela aparece na mão (3ª e 1ª pessoa, e no chão quando largada) e, ligada (F),
   o braço aponta para a frente e a luz sai da ponta dela (antes a luz saía do peito). Com outra coisa na mão a luz continua
   saindo do peito, como uma lanterna presa na roupa. Modelo: corpo de alumínio escuro com anéis de pegada, cabeça mais larga,
   lente que acende quando ligada, botão e tampa traseira. No espaço da mão: corpo ao longo de -y (a lente na ponta -y). */
ITEMS.lanterna.mao=true;
const LANT_PONTA=[0,-0.168,0];
function lanternaNaMao(){const s=selItem();return!!(s&&s.id==='lanterna'&&!CARRO.ativo&&P.alive);}
function lanternaGeo(lente){const g=new GB(4096,8),corpo=lin(0x2a2e33),escuro=lin(0x15171a),aro=lin(0x9aa1a8);
  if(lente){add(g,cylTris(0.0215,0.0215,0.002,20,{bottom:true}),mat(0,-0.1597,0),lin(0xfff1d0),{e:2.6});return g.data();}
  add(g,cylTris(0.0162,0.0162,0.152,20,{bottom:true}),mat(0,-0.102,0),corpo);                  // corpo
  for(let i=0;i<6;i++)add(g,cylTris(0.0171,0.0171,0.0045,20,{top:false}),mat(0,-0.072+i*0.011,0),escuro);   // anéis da pegada
  add(g,cylTris(0.0178,0.0255,0.05,20,{bottom:true}),mat(0,-0.152,0),corpo);                   // cabeça (alarga para a ponta)
  add(g,cylTris(0.0262,0.0262,0.016,20,{top:false}),mat(0,-0.168,0),aro);                      // aro da frente (tubo aberto)
  add(g,cylTris(0.0215,0.0215,0.002,20,{bottom:true}),mat(0,-0.158,0),lin(0x8c8a80));          // lente apagada
  add(g,cylTris(0.0168,0.0158,0.014,20,{bottom:true}),mat(0,0.05,0),escuro);                    // tampa traseira
  add(g,bevelTris(0.009,0.016,0.006,0.002),mat(0,-0.03,0.0175),escuro);                         // botão
  return g.data();}
{const _im=initMeshes;initMeshes=function(){const r=_im.apply(this,arguments);if(MESH.arma){MESH.arma.lanterna=litMesh(lanternaGeo(false));MESH.lanternaLente=litMesh(lanternaGeo(true));}return r;};}
/* ligada e na mão: o braço da lanterna vai para a frente (como mirar a pistola, só o braço direito) */
{const _aj=animarJogador;animarJogador=function(dt){_aj.apply(this,arguments);
  const alvo=lanternaNaMao()&&P.lanterna&&!P.acao&&!P.escala&&!P.montado?1:0;P.lantK=approach(P.lantK||0,alvo,dt*5);const k=P.lantK,o=P.ch.r;
  if(k>0.001){S3(o,5,lerp(o[15],-1.38,k),0,lerp(o[17],0.1,k));S3(o,6,lerp(o[18],-0.12,k),0,0);S3(o,11,lerp(o[33],0,k),lerp(o[34],0,k),lerp(o[35],0,k));}};}
