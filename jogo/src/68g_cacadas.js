/* ================= Caçadas no "O que fazer" (v10.8.4) =================
   Os cinco chefes da região (O Açougueiro, O Sargento, Paciente Zero, O Maquinista e O Fazendeiro) já existiam, com toca,
   boato no rádio e saque, mas não apareciam na lista do que fazer. Agora, depois de ouvir o boato (ou de ver o chefe), cada
   um entra no "O que fazer" como Caçada (letra X, vermelho): onde ele fica, o boato (como lutar) e o que ele deixa no chão. */
ATIV_TIPOS.chefe={nome:'Caçada',cor:'#e8604e',l:'X'};
ativFonte(()=>{if(!G.chefesR||typeof CHEFES_R==='undefined')return[];const L=[];
  for(const d of CHEFES_R){const st=G.chefesR[d.id];if(!st||(!st.ouviu&&!st.visto&&st.st!=='morto'))continue;
    let p=st.L;if(!p){let q=null;try{q=lugarChefeR(d);}catch(e){q=null;}if(!q)continue;p=st.L={x:q.x,y:q.y,z:q.z};}
    L.push({id:'chefe-'+d.id,tipo:'chefe',nome:'Caçada: '+d.nome,x:p.x,z:p.z,r:18,feito:st.st==='morto',
      falta:st.st==='morto'?'derrubado':d.boato,premio:ativPremio(d.loot)});}
  return L;});
