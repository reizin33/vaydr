"""p172f: fotos da Etapa 13. A rede de água montada num lugar aberto perto da clareira (poço com bomba e gerador, canos ponta com
ponta, fervedor aceso com vapor, barril, caixa d'água e irrigador regando a horta), o modo de construção com a aba Água e o cano
fantasma grudando na ponta do último cano, e o painel do fervedor. O lugar é escolhido na hora: sem árvore perto e com todos os
canos aceitos pelo encaixe de verdade (alvoCano)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),W=window;")
def j(c): return js(H + c)
MONTA = (
    "const arvores=(x,z,r)=>{let n=0;for(const c of X('colQuery')(x,z,r))if(c.tree&&(c.x-x)**2+(c.z-z)**2<r*r)n++;return n;};"
    "const tenta=(x,z)=>{const L=[];const cr=(...a)=>{const o=cria(...a);if(!o)throw 0;L.push(o);return o;};"
    " const cn=(xx,zz,yy)=>{const r=X('alvoCano')(xx,zz,yy);if(!r.ok)throw 0;return cr('cano',r.x,r.z,r.yaw,r.y,r.ext);};"
    " try{if(arvores(x+3,z+1,7)>0)throw 0;for(const o of X('OB'))if(Math.hypot(o.x-x-3,o.z-z-1)<8)throw 0;vai(x+2,z+2);const gy=X('ground')(x,z);for(const[a,b]of[[0,0],[6,0],[0,4],[6,4],[3,-3]])if(Math.abs(X('ground')(x+a,z+b)-gy)>0.6)throw 0;"
    "  const p=cr('poco',x,z,0);const r=X('alvoBomba')(x+1.4,z+0.2,0);if(!r.ok)throw 0;const b=cr('bombaAgua',r.x,r.z,r.yaw,r.y);"
    "  const g=cr('gerador',x+2.5,z-3.4,0.3);g.ext.comb=1;g.ext.ligado=true;"
    "  const c1=cn(b.x+0.7,b.z,Math.PI/2),c2=cn(c1.ext.b[0]+0.2,c1.ext.b[1],Math.PI/2);const f=cr('fervedor',c2.ext.b[0]+0.87,c2.ext.b[1],0);f.ext.comb=120;"
    "  const c3=cn(f.x+0.9,f.z,Math.PI/2);const br=cr('barrilAgua',c3.ext.b[0]+0.67,c3.ext.b[1],0);const c4=cn(f.x,f.z+0.9,0);const cx=cr('caixaAgua',c4.ext.b[0],c4.ext.b[1]+1.15,0);"
    "  const c5=cn(cx.x+1.2,cx.z,Math.PI/2),c6=cn(c5.ext.b[0]+0.2,c5.ext.b[1],Math.PI/2);const ir=cr('irrigador',c6.ext.b[0]+0.3,c6.ext.b[1],0);const h=cr('horta',ir.x+1.7,ir.z+0.3,Math.PI/2);h.ext.cresce=0.35;"
    "  return{f,br,c6,x,z};}catch(e){for(const o of L)X('destruirObraSilenciosa')(o);return null;}};"
    "let R=null;for(const[c0,c1]of[[F[0],F[2]],[-62,52],[118,-70],[-80,72]])for(let rr=0;rr<=30&&!R;rr+=6)for(let k=0;k<12&&!R;k++){const a=k/12*6.283+rr*0.37;R=tenta(c0+Math.cos(a)*rr,c1+Math.sin(a)*rr);}if(!R)throw new Error('sem lugar aberto para a rede');W.__R=R;W.__x=R.x;W.__z=R.z;W.__f=R.f;W.__ult=R.c6;W.__br=R.br;"
    "X('aguaSujo=true');G.tm+=20;X('aguaPasso')(20);vai(R.x-3,R.z+3);")
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);G.hora=10;G.noite=false;G.chuva=0;n.cfg.cam='3';" + MONTA), ["gwait", 1.0]]
s += [ev('rede', H + "return 'rede em '+(W.__x-F[0]).toFixed(1)+','+(W.__z-F[2]).toFixed(1)+' barril '+W.__br.ext.agua;")]
s += foto('p172_rede.png', H + "const x=W.__x,z=W.__z,y=X('ground')(x,z);W.__f.ferveAte=G.tm+30;G.camFix={pos:[x+2.5,y+4.2,z-7.5],tgt:[x+3.6,y+0.5,z+1.6],fov:1.05};vai(x-6,z-6);", 2.0, 5.0)
s += foto('p172_fervedor.png', H + "const f=W.__f;W.__f.ferveAte=G.tm+30;G.camFix={pos:[f.x-1.6,f.y+1.7,f.z-2.2],tgt:[f.x+0.8,f.y+0.7,f.z+0.4],fov:0.95};", 1.5, 4.0)
# modo de construção: aba Água e o cano fantasma grudando na ponta do último cano
s += [j("G.camFix=null;const b=W.__br;vai(b.x+3.4,b.z+0.1);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=-0.42;X('OBRA').tipo='cano';X('OBRA').rot=Math.PI;X('modoObra')(true);"), ["gwait", 0.6]]
s += foto('p172_construir.png', H + "", 0.4, 4.0)
s += [j("X('modoObra')(false);")]
s += [j("vai(W.__f.x-1.3,W.__f.z-0.5);X('abrirEstacao')(W.__f);")]
s += foto('p172_painel.png', H + "", 0, 2.5)
salvar('p172f.json', s)
