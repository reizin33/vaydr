/* ================= fabricação: etapas, desbloqueios, bancada, conserto e desmontagem ================= */
const FAB_CATS=[['todas','Tudo','i-grade'],['ferramentas','Ferramentas','i-picareta'],['armas','Armas','i-taco'],['roupas','Roupas','i-camisa'],['cura','Cura','i-bandagem'],['materiais','Materiais','i-corda']];
const ETAPA_NOME=['','Básica','Intermediária','Avançada'];
const EST_NOME=['Na mão','Bancada','Oficina'];
/* manuais: achados uma vez em lugares fixos; ensinam receitas (não ocupam a mochila) */
const MANUAIS={
  manualMecanico:{nome:'Manual do mecânico',local:'posto-oficina',onde:'na oficina do posto de gasolina',ensina:'a transformar a bancada em oficina'},
  cadernoCaca:{nome:'Caderno de caça',local:'faz-casa',onde:'na casa da fazenda',ensina:'a costurar o casaco de pele'},
  guiaSocorros:{nome:'Guia de primeiros socorros',local:'vila-farmacia',onde:'na farmácia da vila',ensina:'a montar o kit médico'}};
const OFICINA_CUSTO={tabuas:8,pregos:6,sucata:4};
/* conserto: custo para recuperar o item inteiro; paga-se a fração do dano (arredondada para cima) */
const REPARO={machadoPedra:{fibra:3,graveto:1},facaPedra:{fibra:2,graveto:1},picareta:{fibra:3,graveto:1},lanca:{fibra:2,graveto:1},porrete:{pano:2},
  taco:{madeira:1,sucata:1},tacoCravado:{pregos:3,madeira:1},faca:{sucata:1},machado:{sucata:2,madeira:1},facao:{sucata:2}};
/* desmontar: itens sem receita devolvem esta tabela; os com receita devolvem metade dos materiais */
const DESMONTE_FIXO={machado:{sucata:2,madeira:1},facao:{sucata:2},pistola:{sucata:2}};

function fabNovo(){return{nv:1,manuais:{},visto:{},noite1:false,tj:0,reg:{fab:0,cons:0,desm:0,gasto:{},marcos:{}}};}
function fabCarregar(f){const n=fabNovo();
  if(f&&typeof f==='object'){n.nv=f.nv>=2?2:1;Object.assign(n.manuais,f.manuais||{});Object.assign(n.visto,f.visto||{});n.noite1=!!f.noite1;n.tj=+f.tj||0;
    if(f.reg)Object.assign(n.reg,f.reg,{gasto:Object.assign({},f.reg.gasto||{}),marcos:Object.assign({},f.reg.marcos||{})});}
  for(const s of P.inv)if(s)n.visto[s.id]=1;for(const k of ROUPA_SLOTS)if(P.roupa[k])n.visto[P.roupa[k]]=1;
  for(const o of OB)if(o.itens)for(const s of o.itens)if(s)n.visto[s.id]=1;
  if(G.dia>=2)n.noite1=true;return n;}

/* estado de cada receita: livre (conhecida desde o início), nova (descoberta) ou travada (ainda indisponível) */
function receitaEstado(r){const d=r.desb;if(!d)return'livre';
  if(d.item)return G.fab.visto[d.item]?'nova':'travada';
  if(d.manual)return G.fab.manuais[d.manual]?'nova':'travada';
  if(d.oficina)return G.fab.nv>=2?'nova':'travada';return'livre';}
const receitaLiberada=r=>receitaEstado(r)!=='travada';
function desbTexto(r){const d=r.desb;if(!d)return'';
  if(d.item)return'Libera quando você pegar '+ITEMS[d.item].nome.toLowerCase()+' pela primeira vez.';
  if(d.manual){const m=MANUAIS[d.manual];return'Ache o '+m.nome+' '+m.onde+'.';}
  if(d.oficina)return'Transforme a bancada em oficina (nível 2).';return'';}
function estacaoOk(r){if(!r.est)return true;if(typeof r.est==='string')return pertoEstacao(r.est);return pertoBancada()&&G.fab.nv>=r.est;}
function ferramentaOk(r){return!r.ferramenta||!!temLamina();}
/* substitutos: se faltar o material principal, usa a alternativa (ex.: 1 corda no lugar de 3 fibras) */
function custoReceita(r){const c=Object.assign({},r.custo);let alt=null;
  if(r.alt)for(const k in r.alt){const[ak,an]=r.alt[k];if(invCount(k)<c[k]&&invCount(ak)>=an+(c[ak]||0)){delete c[k];c[ak]=(c[ak]||0)+an;alt=k;}}
  return{c,alt};}
function podeFabricar(r){return receitaLiberada(r)&&estacaoOk(r)&&ferramentaOk(r)&&invHas(custoReceita(r).c);}
function motivoFalta(r){if(!receitaLiberada(r))return desbTexto(r);
  if(r.est&&!estacaoOk(r)){if(typeof r.est==='string')return'Vá até '+ESTACOES[r.est].ir+'.';if(!pertoBancada())return'Vá até uma bancada: a da clareira ou uma construída (B → Bancada de trabalho).';return'Primeiro transforme a bancada em oficina.';}
  if(!ferramentaOk(r))return'Precisa de uma faca ou outra lâmina na mochila.';
  if(!invHas(custoReceita(r).c))return'Faltam: '+faltaLista(custoReceita(r).c)+'.';return'';}
function faltaLista(c){return Object.entries(c).filter(([k,n])=>invCount(k)<n).map(([k,n])=>(n-invCount(k))+' '+ITEMS[k].nome.toLowerCase()).join(', ');}
function anotarGasto(c){for(const k in c)G.fab.reg.gasto[k]=(G.fab.reg.gasto[k]||0)+c[k];}
function marco(id){if(G.fab.reg.marcos[id]===undefined)G.fab.reg.marcos[id]=Math.round(G.fab.tj/60);}

function fabricar(i,quieto){const r=RECIPES[i];if(!r||!podeFabricar(r))return false;const{c}=custoReceita(r);const qm=invPayQ(c);anotarGasto(c);
  const dF=ITEMS[r.faz],ex=qm!==null&&(dF.tipo==='roupa'||dF.qual)?{q:qm}:undefined;if(ex&&dF.durMax)ex.dur=durMaxDe({id:r.faz,q:qm});
  const left=invAdd(r.faz,r.n,ex);if(left){soltarItens([[r.faz,left]],P.x,P.z,P.y);feed('Sem espaço: ficou no chão',true);}
  const d=ITEMS[r.faz];G.fab.reg.fab++;marco(r.faz);if(typeof diarioEvento==='function'&&(d.tipo==='roupa'||r.etapa>=3||r.est))diarioEvento('Fabricou: '+d.nome.toLowerCase()+(ex&&d.tipo==='roupa'?' ('+QUAL_NOME[qm].toLowerCase()+')':''),'geral');
  if(!quieto){sfx('construir');feed('Fabricou '+d.nome.toLowerCase()+(ex&&d.tipo==='roupa'?' ('+QUAL_NOME[qm].toLowerCase()+')':'')+(r.n>1?' × '+r.n:''));}ganharXP(d.tipo==='roupa'?15:r.etapa>=3?20:4);progresso('fabricar');
  if(d.tipo==='roupa'){progresso('roupa');dica('vestir','corpo','Pronto! Abra a mochila, toque na peça e escolha Vestir.');}
  if(!quieto){invRender();hudBarra();}return true;}
/* fabricar várias de uma vez (a quantidade escolhida no painel); para sozinho se o material acabar no meio */
function fabricarVarios(i,n){const r=RECIPES[i];if(!r)return 0;let k=0;while(k<(n||1)&&fabricar(i,true))k++;
  if(k){const d=ITEMS[r.faz],tot=k*r.n;sfx('construir');feed('Fabricou '+d.nome.toLowerCase()+(tot>1?' × '+tot:''));invRender();hudBarra();}return k;}
/* quantas vezes dá para fabricar com o que tem na mochila agora */
function fabMaximo(r){const{c}=custoReceita(r);let m=99;for(const k in c)if(c[k]>0)m=Math.min(m,Math.floor(invCount(k)/c[k]));return Math.max(0,m);}

/* bancada nível 2: oficina */
function oficinaFalta(){const f=[];if(!G.fab.manuais.manualMecanico)f.push('manual');if(!invHas(OFICINA_CUSTO))f.push('materiais');if(!pertoBancada())f.push('bancada');return f;}
function melhorarBancada(){if(G.fab.nv>=2||oficinaFalta().length)return false;invPay(OFICINA_CUSTO);anotarGasto(OFICINA_CUSTO);G.fab.nv=2;marco('oficina');
  sfx('construir');sfx('missao');ganharXP(60);{const bp=bancadaPerto(),bx=bp?bp.x:BENCH[0],bz=bp?bp.z:BENCH[1];poeira(bx,(bp?bp.y:ground(bx,bz))+0.6,bz,8);}
  toast('habilidade','Oficina montada! Agora a bancada faz mochila reforçada, taco com pregos e munição.');invRender();hudBarra();return true;}

/* conserto (na bancada): custo proporcional ao dano */
function custoConserto(s){const b=REPARO[s.id],d=ITEMS[s.id];if(!b||!d||!d.durMax||s.dur===undefined)return null;const f=1-s.dur/durMaxDe(s);if(f<0.03)return{};
  const c={};for(const k in b)c[k]=Math.max(1,Math.ceil(b[k]*f));return c;}
function consertar(i){const s=P.inv[i];if(!s)return false;const c=custoConserto(s);if(!c||!Object.keys(c).length||!pertoBancada()||!invHas(c))return false;
  invPay(c);anotarGasto(c);s.dur=durMaxDe(s);G.fab.reg.cons++;sfx('construir');feed('Consertou: '+ITEMS[s.id].nome.toLowerCase());ganharXP(3);progresso('consertar');invRender();hudBarra();return true;}

/* desmontar: devolve parte do material, proporcional ao estado do item */
function retornoDesmonte(s){const d=ITEMS[s.id];if(!d||(d.tipo!=='arma'&&d.tipo!=='roupa'))return null;
  const q=d.durMax&&s.dur!==undefined?clamp(s.dur/durMaxDe(s),0,1):1;let base=DESMONTE_FIXO[s.id],fator=1;
  if(!base){const r=RECIPES.find(r=>r.faz===s.id);if(!r)return null;base=r.custo;fator=0.5;}
  const out={};for(const k in base){if(ITEMS[k].tipo!=='material')continue;const v=Math.floor(base[k]*fator*q);if(v>0)out[k]=v;}
  if(!Object.keys(out).length){const k=Object.keys(base).find(k=>ITEMS[k].tipo==='material');if(k)out[k]=1;}
  return Object.keys(out).length?out:null;}
function desmontar(i){const s=P.inv[i];if(!s)return false;const out=retornoDesmonte(s);if(!out)return false;P.inv[i]=null;if(P.sel===i)P.aim=0;
  const ganhos=[];for(const k in out){const left=invAdd(k,out[k]);if(left)soltarItens([[k,left]],P.x,P.z,P.y);ganhos.push(out[k]+' '+ITEMS[k].nome.toLowerCase());}
  G.fab.reg.desm++;sfx('quebrar');feed('Desmontou: '+ganhos.join(', '));invRender();hudBarra();return true;}

/* descobertas */
function listaE(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1];}
function marcarVisto(id){if(!G.fab||G.fab.visto[id])return;G.fab.visto[id]=1;if(id==='lanterna'&&!(P.bat>0)){P.bat=60;setTimeout(()=>toast('corpo','Lanterna de mão! Com ela na mochila, a luz (F) fica forte. Ela gasta pilha: as pilhas aparecem nas caixas.'),900);}
  const novas=RECIPES.filter(r=>r.desb&&r.desb.item===id).map(r=>ITEMS[r.faz].nome.toLowerCase());
  if(novas.length&&G.modo!=='menu')setTimeout(()=>toast('habilidade',(novas.length>1?'Novas receitas: ':'Nova receita: ')+listaE(novas)+'. Veja na aba Fabricar.'),700);}
function manualDoLocal(localId){for(const k in MANUAIS)if(MANUAIS[k].local===localId&&!G.fab.manuais[k])return k;return null;}
function acharManual(id){if(G.fab.manuais[id])return;G.fab.manuais[id]=1;marco(id);const m=MANUAIS[id];if(typeof diarioDescobre==='function')diarioDescobre('manual',id,m.nome);sfx('missao');ganharXP(30);
  toast('habilidade','Você achou o '+m.nome+'! Ele ensina '+m.ensina+'. Veja na aba Fabricar.');}
function obraLiberada(k){const D=OBRAS[k];return!D.desb||(D.desb==='noite1'&&!!(G.fab&&G.fab.noite1))||(D.desb==='oficina'&&!!(G.fab&&G.fab.nv>=2))||(D.desb.startsWith('planta')&&!!(G.fab&&G.fab.reg.marcos[D.desb]!==undefined));}
function travaObra(k,curto){const d=OBRAS[k].desb;if(d&&d.startsWith('planta'))return curto?'pede a planta':' · precisa achar e estudar a planta';return d==='oficina'?(curto?'pede oficina':' · melhore a bancada para oficina'):(curto?'após a 1ª noite':' · libera depois da primeira noite');}
function liberarNoite1(){if(G.fab.noite1)return;G.fab.noite1=true;
  setTimeout(()=>toast('radio','Quem aguenta a primeira noite aprende rápido: agora dá para erguer muro de pedra e portão. É no modo de construção.'),9000);}
