/* ================= Etapa 16: módulo da casa por peça =================
   A casa nova é maior: módulo de 4 m (era 3) e pé-direito de 3,0 m (era 2,6). Cada peça guarda o módulo dela em ext.m: as
   peças de jogos antigos (sem ext.m) continuam com 3 m e tudo nelas funciona como antes. A peça nova herda o módulo da peça
   onde encaixa (pilar, plataforma ou parede vizinha); um pilar sozinho no chão começa uma casa nova, de 4 m. */
const CASA_M=4,CASA_KH=3.0/2.6;
function modK(o){return o&&o.ext&&o.ext.m===4?4/3:1;}
function modKH(o){return o&&o.ext&&o.ext.m===4?CASA_KH:1;}
function modExt(k,ext){return k>1.01?Object.assign({},ext||{},{m:4}):ext;}
/* escala do desenho: peças da casa esticam na horizontal; paredes, portas, janelas e telhado também crescem na altura */
const ESC_ALTURA=new Set(['paredeCasa','portaMadeira','janela','janelaAlta','paredeAlta','telhado']);
const ESC_LARG=new Set(['plataforma','parapeito','pilar','escadaInterna','muro','muroPedra','muroFerro','portao','portaoFerro']);
/* paredes da grade da casa que herdam o módulo (as de defesa grandes têm encaixe próprio) */
const CASA_ESCALA=new Set(['paredeCasa','portaMadeira','portaReforcada','janela','muro','muroPedra','muroFerro','portao','portaoFerro']);
function obraEsc(o){const k=modK(o);if(k===1)return null;if(ESC_ALTURA.has(o.tipo))return[k,modKH(o),k];if(ESC_LARG.has(o.tipo))return[k,1,k];return null;}
/* o fantasma no modo de construção usa a mesma escala da peça que vai nascer */
function obraEscFantasma(){if(!OBRA.ext||OBRA.ext.m!==4)return null;return obraEsc({tipo:OBRA.tipo,ext:OBRA.ext});}
function escTrs(M,o,lado){const e=obraEsc(o);return e?trs(M,o.x,o.y,o.z,0,o.yaw,0,e[0],e[1],e[2]*lado):trs(M,o.x,o.y,o.z,0,o.yaw,0,1,1,lado);}
/* tem teto em cima do ponto (x,y,z)? (piso de cima, telhado da plataforma ou o telhado da casa inteira) */
function tetoCobre(q,x,z,y){if(q.tipo==='telhadoCasa'){const e=q.ext||{};return q.y>y+1.2&&q.y<y+8&&noRet(x,z,q.x,q.z,q.yaw,(e.hw||2)+0.2,(e.hd||2)+0.2,0);}
  if(q.tipo!=='telhado'&&q.tipo!=='plataforma')return false;const k=modK(q);return Math.abs(q.x-x)<1.7*k&&Math.abs(q.z-z)<1.7*k&&q.y>y+1.2&&q.y<y+4.6*modKH(q);}
