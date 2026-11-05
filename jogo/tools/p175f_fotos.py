"""p175f: fotos da Etapa 15. Curral com vacas (e um bezerro), ovelha e cabra, cocho com feno, bebedouro com água e cerca saindo
do curral; galinheiro com galinhas e pintinhos ciscando; colmeia com abelhas perto da horta; composteira e biodigestor com a
chama azul; estábulo com o cavalo na baia; galinhas soltas na fazenda; o aviso de época no canteiro; painéis do galinheiro e
do curral."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),owl=(o,u,v)=>X('owl')(o,u,v),"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_se=X('salaEm'),_an=X('aguaNivel'),_ap=X('aguaProfVeic'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm'),"
     "dirLivre=(x,z)=>{let best=0,bl=-1;const g0=_gr(x,z);for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "const gp=_gr(px,pz);if(!_dm(px,pz,4)||_pb(px,pz,0.9)||_se(px,gp+0.6,pz)||(_an(px,pz)!==null&&_ap(px,pz)>0.4)||Math.abs(gp-g0)>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};},"
     "dom=(t,x,z,K,o)=>{const b=X('criarBicho')(t,x,z,Object.assign({},o||{}));X('domarCria')(b);if(K){b.modo='curral';b.curral={x:K.x,z:K.z};}b.fome=10;b.sede=10;return b;},"
     "V=()=>{const c=W.__c;return{c,fx:Math.sin(c.a),fz:Math.cos(c.a),rx:Math.cos(c.a),rz:-Math.sin(c.a)};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=9.5;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[-62,52],[-80,70],[118,-70],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,12)||_re(x,z,10)||arv(x,z,16)>0||_pb(x,z,2))continue;const g0=_gr(x,z);let plano=true;for(let q=0;q<8;q++){const b=q/8*6.283;if(Math.abs(_gr(x+Math.cos(b)*12,z+Math.sin(b)*12)-g0)>1.4)plano=false;}if(!plano)continue;const d=dirLivre(x,z);if(d.l>=30)c={x,z,a:d.a};}if(!c)c={x:-62,z:52,a:0};W.__c=c;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);X('AVES').length=0;vai(c.x,c.z);"
        # curral com bichos, cocho, bebedouro e cerca
        "const{fx,fz,rx,rz}=V(),a=c.a;const K=cria('curral',c.x+fx*14,c.z+fz*14,a);W.__K=K;const o1=owl(K,-2.2,1.7),o2=owl(K,1.0,1.9);"
        "const co=cria('cocho',o1[0],o1[1],a);co.itens[0]=X('newItem')('feno',6);const be=cria('bebedouro',o2[0],o2[1],a);be.ext.agua=36;"
        "for(const u of[5.1,7.1,9.1]){const p=[K.x+rx*u,K.z+rz*u];cria('cerca',p[0],p[1],a);}"
        "const q=(u,v)=>owl(K,u,v);let p=q(-1.6,-0.6);dom('vaca',p[0],p[1],K,{yaw:a+1.2});p=q(0.6,-1.2);dom('vaca',p[0],p[1],K,{var:'',yaw:a-0.4});p=q(-0.4,0.4);const bz=dom('vaca',p[0],p[1],K,{s:0.5,yaw:a+2.4});bz.nasc=G.tm;"
        "p=q(2.4,0.2);dom('ovelha',p[0],p[1],K,{yaw:a-1.9});p=q(-3.0,0.9);dom('cabra',p[0],p[1],K,{yaw:a+0.3});"
        # galinheiro com galinhas e pintinhos
        "const g=cria('galinheiro',c.x+rx*9,c.z+rz*9,a+Math.PI/2);W.__g=g;X('galPasso')(g);Object.assign(g.ext,{g:5,comida:15,agua:10,ovos:3});g.ext.pin=[G.tm,G.tm];"
        # colmeia com horta e enxame
        "const h=cria('horta',c.x-rx*10.5,c.z-rz*10.5,a);h.ext.cresce=0.7;const cm=cria('colmeia',c.x-rx*8,c.z-rz*8+0.5,a);W.__cm=cm;X('colPasso')(cm);cm.ext.enxame=true;cm.ext.prodTm=G.tm;cm.ext.mel=4;cm.ext.cera=2;"
        # composteira e biodigestor
        "const cp=cria('composteira',c.x-fx*7+rx*2.2,c.z-fz*7+rz*2.2,a);W.__cp=cp;const bd=cria('biodigestor',c.x-fx*7-rx*1.6,c.z-fz*7-rz*1.6,a);W.__bd=bd;X('bioPasso')(bd);bd.ext.gas=60;bd.ext.carga=3;X('bioPasso')(bd);"
        # estábulo com o cavalo na baia
        "const e=cria('estabulo',c.x+fx*5-rx*13,c.z+fz*5-rz*13,a+Math.PI);W.__eb=e;const pe=owl(e,0,0.1);const hc=X('criarBicho')('cavalo',pe[0],pe[1],{var:'P',varFixa:true,s:1,yaw:a});hc.conf=1;X('domarCavalo')(hc);hc.empinaT=0;hc.modo='amarrado';hc.fx=pe[0];hc.fz=pe[1];hc.yaw=a;W.__hc=hc;"
        "vai(c.x,c.z);"), ["gwait", 4]]
s += foto('p175_curral.png', H + "const K=W.__K,{fx,fz,rx,rz}=V(),y=X('ground')(K.x,K.z);G.camFix={pos:[K.x-fx*10.5+rx*5.5,y+4.6,K.z-fz*10.5+rz*5.5],tgt:[K.x+rx*1.5,y+0.4,K.z+rz*1.5],fov:1.0};", 0.3, 4.0)
s += foto('p175_curral_perto.png', H + "const K=W.__K,{fx,fz,rx,rz}=V(),y=X('ground')(K.x,K.z);G.camFix={pos:[K.x-fx*4.2-rx*1.0,y+2.1,K.z-fz*4.2-rz*1.0],tgt:[K.x+fx*0.2,y+0.7,K.z+fz*0.2],fov:1.05};", 0.2, 4.0)
s += foto('p175_galinheiro.png', H + "G.camFix=null;const g=W.__g,{fx,fz,rx,rz}=V(),y=X('ground')(g.x,g.z);G.camFix={pos:[g.x-rx*4.2-fx*2.2,y+1.9,g.z-rz*4.2-fz*2.2],tgt:[g.x,y+0.6,g.z],fov:1.0};", 2.5, 4.0)
s += foto('p175_colmeia.png', H + "const o=W.__cm,{fx,fz,rx,rz}=V(),y=X('ground')(o.x,o.z);vai(o.x+rx*3,o.z+rz*3);G.camFix={pos:[o.x+rx*2.2-fx*1.6,y+1.4,o.z+rz*2.2-fz*1.6],tgt:[o.x-rx*0.5,y+0.75,o.z-rz*0.5],fov:1.0};", 1.0, 4.0)
s += foto('p175_composteira_biodigestor.png', H + "const a=W.__cp,b=W.__bd,{fx,fz,rx,rz}=V(),mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,y=X('ground')(mx,mz);vai(mx+rx*9,mz+rz*9);G.camFix={pos:[mx+fx*4.4+rx*0.8,y+2.3,mz+fz*4.4+rz*0.8],tgt:[mx,y+0.7,mz],fov:1.0};", 0.5, 4.0)
s += foto('p175_estabulo.png', H + "const e=W.__eb,p=owl(e,1.6,-5.2),y=X('ground')(e.x,e.z);vai(p[0],p[1]);G.camFix={pos:[p[0],y+2.0,p[1]],tgt:[e.x,y+1.1,e.z],fov:1.0};", 1.0, 4.0)
# painéis
s += [j("G.camFix=null;const g=W.__g,{rx,rz}=V();vai(g.x-rx*2.6,g.z-rz*2.6);inv('milho',4);inv('agua',2);G.modo='jogo';X('abrirEstacao')(g);")]
s += foto('p175_painel_galinheiro.png', H + "", 0, 2.5)
s += [j("X('fecharEstacao')();const K=W.__K,p=owl(K,0,-4.4);vai(p[0],p[1]);G.modo='jogo';X('abrirEstacao')(K);")]
s += foto('p175_painel_curral.png', H + "", 0, 2.5)
# galinhas soltas na fazenda
s += [j("X('fecharEstacao')();G.camFix=null;const f=X('PLACES').find(p=>p.id==='fazenda');let p=null;for(let k=0;k<24&&!p;k++){const a=k/24*6.283,x=f.x+Math.cos(a)*25,z=f.z+Math.sin(a)*25;if(_dm(x,z,4)&&!_pb(x,z,0.6)&&!_se(x,_gr(x,z)+0.6,z))p={x,z};}vai(p.x,p.z);"), ["gwait", 4]]
s += foto('p175_galinhas_soltas.png', H + "const L=X('AVES').filter(b=>b.sp==='galinha'&&b.sitio);const b=L[0];if(!b)return;const dx=P.x-b.x,dz=P.z-b.z,l=Math.hypot(dx,dz)||1,y=X('ground')(b.x,b.z);G.camFix={pos:[b.x+dx/l*2.4,y+1.0,b.z+dz/l*2.4],tgt:[b.x,y+0.3,b.z],fov:1.0};", 0.2, 4.0)
# aviso de época no canteiro (inverno)
s += [j("G.camFix=null;G.dia=22;const D=X('PLANTIO_DEF').filter(d=>d.tipo==='fazenda'),d=D[2],S=X('plantioD')();S[d.id]=-1;inv('sementes',5);G.plantioSel=0;const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;vai(mx,mz+1.2);P.yaw=Math.atan2(mx-P.x,mz-P.z);P.body=P.yaw;P.pitch=-0.35;window.__semRender=false;"), ["gwait", 0.8]]
s += foto('p175_epoca.png', H + "", 0.3, 3.5)
salvar('p175f.json', s)
