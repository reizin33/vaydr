"""p174g: refaz a foto do peixe pulando no lago (câmera na beira, olhando o pulo)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = "const W=window;"
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};G.hora=9.5;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "try{const L=X('LAGO'),an=X('aguaNivel'),gr=X('ground');let best=null;for(let k=0;k<48&&!best;k++){const a=k/48*6.283;"
        "for(let r=1.25;r>0.5;r-=0.02){const x=L.x+Math.cos(a)*L.a*r,z=L.z+Math.sin(a)*L.b*r;if(an(x,z)!==null&&X('aguaProfVeic')(x,z)>0.6){"
        "const bx=L.x+Math.cos(a)*L.a*(r+0.1),bz=L.z+Math.sin(a)*L.b*(r+0.1);best={x,z,a,bx,bz};break;}}}"
        "W.__pw=best;const sx=L.x+Math.cos(best.a)*L.a*1.35,sz=L.z+Math.sin(best.a)*L.b*1.35;W.__sh=[sx,sz];vai(sx,sz);P.yaw=Math.atan2(best.x-sx,best.z-sz);P.body=P.yaw;}catch(e){W.__err=String(e);}"), ["gwait", 0.5],
      ev("ponto", "const W=window;return{p:W.__pw,err:W.__err||null,nivel:W.__pw&&X('aguaNivel')(W.__pw.x,W.__pw.z)};"),
      j("const p=W.__pw;X('peixePula')(p.x,p.z,'dourado',2.8,false);"), ["gwait", 0.25]]
s += foto('p174_peixe.png', H + "const p=W.__pw,y=X('aguaNivel')(p.x,p.z);const dx=p.x-W.__sh[0],dz=p.z-W.__sh[1],l=Math.hypot(dx,dz)||1;G.camFix={pos:[p.x-dx/l*4.2+dz/l*1.2,y+1.3,p.z-dz/l*4.2-dx/l*1.2],tgt:[p.x,y+0.45,p.z],fov:0.85};", 0, 4.0)
salvar('p174g.json', s)
