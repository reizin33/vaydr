"""p222e: tempo de desenho na versão final, na mata mais cheia de pinheiros, nos níveis Baixo, Médio e Alto: tudo novo, pinheiro
antigo (capim e galhos novos), e tudo como antes (pinheiro e capim antigos, sem galhos). Mesma cena, alternando, 2 rodadas."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
GR = "const gr=(x,z)=>X('ground')(x,z),va=(x,z)=>vai(x,z,gr(x,z));"
ACHA = ("const dm=X('dentroMapa'),dc=X('dentroCidade'),pb=X('pointBlocked');const c=new Map();"
        "for(const t of X('TREES')){if(t.kind!==0||!t.alive||t.agua||t.alto)continue;const k=Math.floor(t.x/12)+','+Math.floor(t.z/12);c.set(k,(c.get(k)||0)+1);}"
        "let b=null,bn=0;for(const[k,v]of c){const[i,j]=k.split(',').map(Number),x=i*12+6,z=j*12+6;if(v>bn&&dm(x,z,-3)&&!dc(x,z,8)&&!pb(x,z,0.6)){bn=v;b=[x,z];}}window.__mata=b;")
s += [js("vivo();Z.length=0;G.hora=13;" + GR + ACHA + "va(window.__mata[0],window.__mata[1]);")]
TEMPO = ("const gl=X('gl'),M=X('MESH'),GM=X('GRAMA'),PI=X('PINHO'),GA=X('GALHO_M'),px=X('PX_SYNC'),uc=X('updateCamera'),rd=X('render');X('rebuildVeg')(true);X('rebuildGrass')();"
         "P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;n.cfg.cam='3';for(let i=0;i<30;i++)uc(0.05);"
         "const med=(modo,k)=>{const g0=GM.ok,p0=PI.ok,gn=GA.map(m=>m.n);if(modo!=='novo')PI.ok=false;if(modo==='antes'){GM.ok=false;GA.forEach(m=>m.n=0);}"
         "rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<k;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}"
         "const t=(performance.now()-t0)/k;GM.ok=g0;PI.ok=p0;GA.forEach((m,i)=>m.n=gn[i]);return r2(t);};"
         "const R={novo:[],pinhoAntigo:[],antes:[]};for(let r=0;r<2;r++)for(const m in R)R[m].push(med(m,3));const md=a=>r2((a[0]+a[1])/2);"
         "return{graf:n.cfg.graf,media:{novo:md(R.novo),pinhoAntigo:md(R.pinhoAntigo),antes:md(R.antes)},msPorQuadro:R,pinheirosNovos:PI.v.reduce((a,q)=>a+q.madeira.n,0),"
         "triPinheiros:PI.v.reduce((a,q)=>a+q.madeira.n*(q.madeira.tri+q.agulha.tri),0),capim:GM.v.reduce((a,m)=>a+m.n,0),galhos:GA.map(m=>m.n),erroGL:gl.getError()};")
for g in ['baixo', 'medio', 'alto']:
    s += [js("n.cfg.graf='" + g + "';n.aplicarCfg&&n.aplicarCfg();" + GR + "va(window.__mata[0],window.__mata[1]);"), ["gwait", 1.0], ev("tempo_" + g, TEMPO)]
salvar('tools/p222e_tempo.json', s, vp=(960, 540))
