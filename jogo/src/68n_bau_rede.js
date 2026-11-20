/* ================= Baú dos abrigos: um só para a rede inteira (v10.8.6) =================
   Himalaia (19/11/2026): "coisas que se conectam". Os baús dos abrigos viraram um só: o que você guarda num abrigo aceso, pega
   em qualquer outro abrigo aceso (Matriz, Sabiá, São José, Cais...). São 32 lugares, o dobro de um baú comum. Junto com a
   viagem entre abrigos, a rede passa a ser o seu depósito pelo mapa.
   O que já estava guardado em cada abrigo passa sozinho para o baú da rede; se não couber, o resto fica no baú daquele
   abrigo (abre primeiro ele, até esvaziar). */
const BAU_REDE_N=32;
function bauRede(){const D=ativD();if(!Array.isArray(D.bauRede))D.bauRede=new Array(BAU_REDE_N).fill(null);const B=D.bauRede;while(B.length<BAU_REDE_N)B.push(null);
  for(const id in D.abrigos||{}){const S=D.abrigos[id];if(!S||!Array.isArray(S.bau))continue;let resto=false;
    for(let i=0;i<S.bau.length;i++){const it=S.bau[i];if(!it)continue;const d=ITEMS[it.id];if(!d){resto=true;continue;}
      if(d.max>1)for(const t of B)if(t&&t.id===it.id&&t.n<d.max&&it.n>0&&mesmaQual(t,it.q)){const k=Math.min(it.n,d.max-t.n);juntarPilha(t,k,it);t.n+=k;it.n-=k;}
      if(it.n>0){const j=B.indexOf(null);if(j<0){resto=true;continue;}B[j]=it;}S.bau[i]=null;}
    if(!resto)S.bau=null;}
  return B;}
INTER_K.abrigoBau={texto:A=>{const S=abrigoD(A.id),resto=Array.isArray(S.bau)&&S.bau.some(Boolean);
    return{t:'Baú dos abrigos',s:resto?'o baú da rede encheu: o que não coube ficou neste abrigo':'o mesmo baú em todos os abrigos acesos'};},
  usar:A=>{bauRede();const S=abrigoD(A.id);if(Array.isArray(S.bau)&&S.bau.some(Boolean)){abrirBau({itens:S.bau,nome:'Baú: '+A.nome+' (o que não coube no baú da rede)'});return;}
    abrirBau({itens:bauRede(),nome:'Baú dos abrigos (o mesmo em todos)'});dica('bauRede','corpo','O baú dos abrigos é um só: o que você guarda aqui, pega em qualquer abrigo aceso.');}};
