"""p173g: refaz fotos da Etapa 14: galope visto de lado (no campo aberto, câmera calculada na hora), cabeça do cavalo de perto,
painel do cavalo (medidores numa linha) e a dica de domar aparecendo na tela."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,H0=()=>W.__h,"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_se=X('salaEm'),_an=X('aguaNivel'),_ap=X('aguaProfVeic'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm'),"
     "dirLivre=(x,z)=>{let best=0,bl=-1;const g0=_gr(x,z);for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "const gp=_gr(px,pz);if(!_dm(px,pz,4)||_pb(px,pz,0.9)||_se(px,gp+0.6,pz)||(_an(px,pz)!==null&&_ap(px,pz)>0.4)||Math.abs(gp-g0)>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=9.5;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[118,-70],[-62,52],[-80,70],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,12)||_re(x,z,10)||arv(x,z,18)>0||_pb(x,z,2))continue;const g0=_gr(x,z);let plano=true;for(let q=0;q<8;q++){const b=q/8*6.283;if(Math.abs(_gr(x+Math.cos(b)*10,z+Math.sin(b)*10)-g0)>1.2)plano=false;}if(!plano)continue;const d=dirLivre(x,z);if(d.l>=40)c={x,z,a:d.a};}if(!c)c={x:-62,z:52,a:0};W.__c=c;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);X('AVES').length=0;"
        "const h=X('criarBicho')('cavalo',c.x,c.z,{var:'A',varFixa:true,s:1,yaw:c.a});W.__h=h;h.conf=1;X('domarCavalo')(h);h.empinaT=0;h.sela=true;h.alforjes=true;h.folego=100;"
        "vai(c.x-Math.cos(c.a)*1.2,c.z+Math.sin(c.a)*1.2);X('montar')(h);P.yaw=c.a;P.pitch=-0.12;h.yaw=c.a;h.v=9;X('IN').mz=1;X('IN').run=true;"), ["gwait", 1.2]]
s += foto('p173_galope.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);G.camFix={pos:[h.x+rx*6+fx*2.0,h.y+1.7,h.z+rz*6+fz*2.0],tgt:[h.x+fx*0.5,h.y+1.25,h.z+fz*0.5],fov:0.9};", 0, 4.0)
# cabeça de perto (parado, de lado)
s += [j("G.camFix=null;X('IN').run=false;X('IN').mz=0;"), ["gwait", 2.0],
      j("X('descerDoCavalo')(false);const h=H0();h.modo='fica';h.fx=h.x;h.fz=h.z;"), ["gwait", 1.0],
      j("const h=H0();h.congelado=true;h.st='alerta';const c=W.__c;vai(h.x-Math.sin(h.yaw)*5,h.z-Math.cos(h.yaw)*5);")]
s += foto('p173_cabeca.png', H + "const h=H0(),rx=Math.cos(h.yaw),rz=-Math.sin(h.yaw),fx=Math.sin(h.yaw),fz=Math.cos(h.yaw);G.camFix={pos:[h.x+rx*2.4+fx*1.6,h.y+1.75,h.z+rz*2.4+fz*1.6],tgt:[h.x+fx*1.0,h.y+1.45,h.z+fz*1.0],fov:0.85};", 0.3, 4.0)
# painel (medidores numa linha só)
s += [j("G.camFix=null;const h=H0();inv('feno',4);inv('escova',1);h.fome=55;X('abrirCavalo')(h);")]
s += foto('p173_painel.png', H + "", 0, 2.5)
# domar: a dica aparece na tela (desenha alguns quadros antes da foto para o prompt achar o lugar)
s += [j("G.modo='jogo';X('tela')(null);const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);const b=X('criarBicho')('cavalo',c.x+fx*24,c.z+fz*24,{var:'T',varFixa:true,s:1});b.congelado=true;b.st='come';W.__b=b;"
        "inv('maca',3);vai(b.x-fx*2.3,b.z-fz*2.3);P.agachado=true;P.agK=1;P.yaw=Math.atan2(b.x-P.x,b.z-P.z);P.body=P.yaw;P.pitch=-0.2;window.__semRender=false;"), ["gwait", 0.8]]
s += foto('p173_domar.png', H + "", 0.3, 3.0)
salvar('p173g.json', s)
