/* ================= Corta-cadeado (item novo, modelo do Poly Haven) =================
   Alicate grande de cortar cadeado e corrente. Abre SEM BARULHO os contêineres trancados do porto (o pé de cabra também abre,
   mas faz barulho e chama os zumbis). Não vem no começo: aparece em oficinas, garagens e depósitos da cidade, na oficina do
   posto e nos celeiros. Aparece na mão (modelo em 62b_mod3d.js) e gasta com o uso. */
iconesNovos({'i-cortaCadeado':'<path d="M8.5 21 10.6 12M15.5 21l-2.1-9"/><path d="M10.6 12 12 9.6l1.4 2.4"/><path d="M12 9.6 9.4 3.5M12 9.6l2.6-6.1"/><circle cx="12" cy="9.6" r="1"/>'});
Object.assign(ITEMS,{cortaCadeado:{nome:'Corta-cadeado',icon:'i-cortaCadeado',max:1,tipo:'util',mao:true,durMax:24,
  desc:'Alicate grande de cortar cadeado e corrente. Abre sem barulho os contêineres trancados do porto (o pé de cabra arromba, mas faz barulho). Gasta com o uso.'}});
{const L=(t,e)=>{if(LOOT[t]&&!LOOT[t].some(x=>x[0]===e[0]))LOOT[t].push(e);};L('oficina',['cortaCadeado',1,1,0.05]);L('celeiro',['cortaCadeado',1,1,0.04]);
  if(typeof CID_LOOT!=='undefined')for(const[t,c]of[['oficina',0.06],['deposito',0.05],['garagem',0.04]])if(CID_LOOT[t]&&!CID_LOOT[t].some(x=>x[0]==='cortaCadeado'))CID_LOOT[t].push(['cortaCadeado',c,1,1]);}
/* contêiner com cadeado no porto: com o corta-cadeado na mochila, corta sem barulho (ele tem preferência sobre o pé de cabra) */
{const K=INTER_K.contCadeado,_tx=K.texto,_us=K.usar;
  K.texto=function(c){if(invCount('cortaCadeado'))return{t:'Cortar o cadeado do contêiner',s:'corta-cadeado · sem barulho',hold:true};return _tx.apply(this,arguments);};
  K.usar=function(c){const cc=P.inv.find(q=>q&&q.id==='cortaCadeado');if(!cc)return _us.apply(this,arguments);
    gastar(cc,1);c.st='aberto';portoD().abertos[c.id]=1;contAbrirInter(c);sfx('estalo',c.x,c.z,0.8);ganharXP(6);feed('Cadeado cortado: o contêiner abriu sem barulho');
    if(PORTO_M){liberarMesh(PORTO_M.conts);PORTO_M.conts=geoConteineres();}};}
