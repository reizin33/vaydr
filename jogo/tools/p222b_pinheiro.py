"""p222b: pinheiro novo com a distância por nível de gráfico (PINHO_R). Confere no jogo, na mata mais cheia de pinheiros:
quantos pinheiros de perto ficam com o modelo novo e quantos com o detalhado antigo em cada nível (Baixo, Médio, Alto, Ultra),
triângulos; tempo de desenho com o pinheiro novo e sem ele no Alto e no Baixo (mesma cena); fotos da mata no Alto (3ª e 1ª
pessoa) e no Baixo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
GR = "const gr=(x,z)=>X('ground')(x,z),va=(x,z)=>vai(x,z,gr(x,z));"
ACHA = ("const dm=X('dentroMapa'),dc=X('dentroCidade'),pb=X('pointBlocked');const c=new Map();"
        "for(const t of X('TREES')){if(t.kind!==0||!t.alive||t.agua||t.alto)continue;const k=Math.floor(t.x/12)+','+Math.floor(t.z/12);c.set(k,(c.get(k)||0)+1);}"
        "let b=null,bn=0;for(const[k,v]of c){const[i,j]=k.split(',').map(Number),x=i*12+6,z=j*12+6;if(v>bn&&dm(x,z,-3)&&!dc(x,z,8)&&!pb(x,z,0.6)){bn=v;b=[x,z];}}window.__mata=b;")
s += [js("vivo();Z.length=0;G.hora=13;" + GR + ACHA + "va(window.__mata[0],window.__mata[1]);X('rebuildVeg')(true);"), ["gwait", 1.0]]
CONTA = ("const M=X('MESH'),PI=X('PINHO'),niv={};for(const g of['baixo','medio','alto','ultra']){n.cfg.graf=g;n.aplicarCfg&&n.aplicarCfg();X('rebuildVeg')(true);"
         "niv[g]={raio:X('PINHO_R')[g],perto:M.pineN.n,novo:PI.v.reduce((a,q)=>a+q.madeira.n,0),antigoDetalhado:PI.resto.n,"
         "triNovo:PI.v.reduce((a,q)=>a+q.madeira.n*(q.madeira.tri+q.agulha.tri),0),triAntigoDetalhado:PI.resto.n*M.pineN.count/3,triAntes:M.pineN.n*M.pineN.count/3};}"
         "n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();X('rebuildVeg')(true);return{mata:window.__mata,pronto:X('pinhoPronto')(),niv,erroGL:X('gl').getError()};")
s += [ev("niveis", CONTA)]
TEMPO = ("const gl=X('gl'),PI=X('PINHO'),px=X('PX_SYNC'),uc=X('updateCamera'),rd=X('render');P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;for(let i=0;i<30;i++)uc(0.05);"
         "const med=(modo,k)=>{const p0=PI.ok;if(modo==='antes')PI.ok=false;rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();"
         "for(let i=0;i<k;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}const t=(performance.now()-t0)/k;PI.ok=p0;return r2(t);};"
         "const R={novo:[],antes:[]};for(let r=0;r<2;r++)for(const m in R)R[m].push(med(m,3));"
         "return{msPorQuadro:R,media:{novo:r2((R.novo[0]+R.novo[1])/2),antes:r2((R.antes[0]+R.antes[1])/2)},graf:n.cfg.graf,novos:PI.v.reduce((a,q)=>a+q.madeira.n,0),erroGL:gl.getError()};")
s += [ev("tempo_alto", TEMPO)]
MATA = GR + "va(window.__mata[0],window.__mata[1]);X('rebuildVeg')(true);n.cfg.cam='3';P.yaw=0.6;P.body=P.yaw;P.pitch=-0.08;G.hora=13;"
s += foto("e27_mata_nova.png", MATA)
s += foto("e27_mata_1p.png", GR + "const T=X('TREES');let b=null,bd=1e9;for(const t of T){if(t.kind!==0||!t.alive)continue;const d=Math.hypot(t.x-window.__mata[0],t.z-window.__mata[1]);if(d<bd){bd=d;b=t;}}"
          "va(b.x-4.5,b.z-4.5);X('rebuildVeg')(true);n.cfg.cam='1';P.yaw=Math.atan2(b.x-P.x,b.z-P.z);P.body=P.yaw;P.pitch=0.25;G.hora=13;")
s += [js("n.cfg.graf='baixo';n.aplicarCfg&&n.aplicarCfg();" + MATA), ["gwait", 1.0], ev("tempo_baixo", TEMPO)]
s += foto("e27_mata_baixo.png", MATA)
s += [ev("fim", "return{erroGL:X('gl').getError(),pinheiro:X('pinhoPronto')()};")]
salvar('tools/p222b_pinheiro.json', s, vp=(960, 540))
