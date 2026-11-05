"""p173f: fotos da Etapa 14 (cavalos). As cinco pelagens lado a lado no campo; o cavalo domado com cabresto, sela e alforjes; montado
trotando e galopando (câmera normal de terceira pessoa e de lado); em primeira pessoa; o painel do cavalo; a dica de domar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,H0=()=>X('CAVALOS')[0],"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_se=X('salaEm'),_an=X('aguaNivel'),_ap=X('aguaProfVeic'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm'),"
     "dirLivre=(x,z)=>{let best=0,bl=-1;const g0=_gr(x,z);for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "const gp=_gr(px,pz);if(!_dm(px,pz,4)||_pb(px,pz,0.9)||_se(px,gp+0.6,pz)||(_an(px,pz)!==null&&_ap(px,pz)>0.4)||Math.abs(gp-g0)>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=9.5;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[-62,52],[-80,70],[118,-70],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,12)||_re(x,z,10)||arv(x,z,14)>0||_pb(x,z,2))continue;const g0=_gr(x,z);let plano=true;for(let q=0;q<8;q++){const b=q/8*6.283;if(Math.abs(_gr(x+Math.cos(b)*10,z+Math.sin(b)*10)-g0)>1.2)plano=false;}if(!plano)continue;const d=dirLivre(x,z);if(d.l>=30)c={x,z,a:d.a};}if(!c)c={x:-62,z:52,a:0};W.__c=c;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);X('AVES').length=0;"
        "const fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a);W.__H=[];['','T','P','A','M'].forEach((v,i)=>{const o=(i-2)*2.4;const b=X('criarBicho')('cavalo',c.x+fx*10+rx*o,c.z+fz*10+rz*o,{var:v,varFixa:true,s:1,yaw:c.a+Math.PI/2});"
        "b.congelado=true;b.st='alerta';W.__H.push(b);});vai(c.x,c.z);P.yaw=c.a;P.body=P.yaw;"), ["gwait", 1.0]]
s += foto('p173_pelagens.png', H + "const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),y=X('ground')(c.x+fx*10,c.z+fz*10);G.camFix={pos:[c.x+fx*3.2,y+2.2,c.z+fz*3.2],tgt:[c.x+fx*10,y+1.0,c.z+fz*10],fov:1.1};", 0.5, 4.0)
# o cavalo domado com arreios, de lado
s += [j("G.camFix=null;const B=X('BICHOS');for(const b of W.__H.slice(1))B.splice(B.indexOf(b),1);const h=W.__H[0];h.congelado=false;h.conf=1;X('domarCavalo')(h);h.empinaT=0;h.sela=true;h.alforjes=true;h.modo='fica';h.fx=h.x;h.fz=h.z;h.congelado=true;h.st='alerta';h.yaw=W.__c.a+Math.PI/2;"), ["gwait", 0.6]]
s += foto('p173_arreios.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw),y=h.y;G.camFix={pos:[h.x-rx*3.4+fx*0.8,y+1.7,h.z-rz*3.4+fz*0.8],tgt:[h.x,y+1.05,h.z],fov:0.95};", 0.4, 4.0)
s += foto('p173_arreios_frente.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw),y=h.y;G.camFix={pos:[h.x+fx*2.6-rx*1.6,y+1.9,h.z+fz*2.6-rz*1.6],tgt:[h.x+fx*0.6,y+1.3,h.z+fz*0.6],fov:0.95};", 0.3, 3.5)
# montado: trote na câmera normal; galope de lado; primeira pessoa
s += [j("G.camFix=null;const h=H0();h.congelado=false;h.yaw=W.__c.a;h.folego=100;vai(h.x-Math.cos(h.yaw)*1.2,h.z+Math.sin(h.yaw)*1.2);X('montar')(h);P.yaw=h.yaw;P.pitch=-0.12;X('IN').mz=1;"), ["gwait", 2.5]]
s += foto('p173_trote.png', H + "X('IN').mz=1;", 0.6, 4.0)
s += [j("X('IN').mz=1;X('IN').run=true;"), ["gwait", 1.6]]
s += foto('p173_galope.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);G.camFix={pos:[h.x+rx*5.5+fx*1.5,h.y+1.9,h.z+rz*5.5+fz*1.5],tgt:[h.x,h.y+1.3,h.z],fov:0.9};", 0.1, 4.0)
s += [j("G.camFix=null;X('IN').run=false;X('IN').mz=0;"), ["gwait", 1.5]]
s += foto('p173_lado_parado.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);G.camFix={pos:[h.x-rx*4.2+fx*0.6,h.y+1.8,h.z-rz*4.2+fz*0.6],tgt:[h.x,h.y+1.45,h.z],fov:0.9};", 0.3, 4.0)
s += [j("G.camFix=null;n.cfg.cam='1';P.pitch=-0.25;X('IN').mz=1;"), ["gwait", 1.0]]
s += foto('p173_primeira.png', H + "X('IN').mz=1;", 0.3, 4.0)
s += [j("X('IN').mz=0;n.cfg.cam='3';X('descerDoCavalo')(false);"), ["gwait", 1.0]]
# painel do cavalo
s += [j("const h=H0();inv('feno',4);inv('escova',1);h.fome=55;X('abrirCavalo')(h);")]
s += foto('p173_painel.png', H + "", 0, 2.5)
# domar: dica na tela perto de um selvagem
s += [j("G.modo='jogo';X('tela')(null);const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);const b=X('criarBicho')('cavalo',c.x+fx*20,c.z+fz*20,{var:'T',varFixa:true,s:1});b.congelado=true;b.st='come';"
        "inv('maca',3);vai(b.x-fx*2.3,b.z-fz*2.3);P.agachado=true;P.agK=1;P.yaw=Math.atan2(b.x-P.x,b.z-P.z);P.body=P.yaw;P.pitch=-0.2;"), ["gwait", 0.8]]
s += foto('p173_domar.png', H + "", 0.3, 3.0)
salvar('p173f.json', s)
