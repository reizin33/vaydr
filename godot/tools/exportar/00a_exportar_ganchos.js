/* ===== EXPORTAÇÃO PARA O GODOT (só no build de exportação, tools do Godot; NÃO entra no jogo) =====
   Guarda os dados de cada malha (os vértices que iriam para a placa de vídeo) e a imagem de cada textura, para o
   exportador do Godot ler depois da montagem do mundo. As funções são declaradas no mesmo escopo e "sobem" (hoisting),
   então dá para embrulhar daqui mesmo as que são declaradas em módulos de depois. */
const __EXP={n:0};
{const _l=litMesh;litMesh=function(d){const m=_l.apply(this,arguments);try{m.__d=d;__EXP.n++;}catch(e){}return m;};
 const _i=instMesh;instMesh=function(d,max){const m=_i.apply(this,arguments);try{m.__d=d;}catch(e){}return m;};
 const _u=unMesh;unMesh=function(d,dyn){const m=_u.apply(this,arguments);try{if(!dyn)m.__d=d;}catch(e){}return m;};
 const _t=terMesh;terMesh=function(T){const m=_t.apply(this,arguments);try{m.__T=T;}catch(e){}return m;};
 const _tm=texMesh;texMesh=function(f,uv,tex){const m=_tm.apply(this,arguments);try{m.__uv=uv;}catch(e){}return m;};
 const _sk=skTextura;skTextura=function(url){const t=_sk.apply(this,arguments);try{t.__url=url;}catch(e){}return t;};}
