"""p180: Etapa 16, ponte de madeira (margem a margem por cima do rio, custo por trecho, atravessar andando sem cair na água, corrimão
segura) e deque na água doce (sai da margem sobre estacas, anda até a ponta, dá para pescar de lá)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const g=(x,z)=>X('ground')(x,z),cam=X('cam'),O=()=>X('OBRA'),ob=t=>X('OB').filter(o=>o.tipo===t),"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "naMargem=(s,lado,extra)=>{const R0=X('RIO'),q=X('rioPonto')(s),w=R0.larg(s)+(extra||1.6),px=q[0]+q[3]*w*lado,pz=q[1]-q[2]*w*lado;vai(px,pz,g(px,pz));P.yaw=Math.atan2(-q[3]*lado,q[2]*lado);P.body=P.yaw;P.pitch=0;"
     "cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(P.yaw),-0.25,Math.cos(P.yaw)];return{x:px,z:pz,larg:r2(R0.larg(s))};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"
         "n.invAdd('mochilaExpedicao',1);X('vestir')(P.inv.findIndex(q=>q&&q.id==='mochilaExpedicao'));"),
      j("dar({madeira:60,tabuas:120,pregos:60,corda:10});"),
      # ---- ponte: procura um trecho do rio onde ela cabe ----
      e("ponteLugar", "let best=null;for(let s=0.08;s<0.95&&!best;s+=0.03)for(const lado of[1,-1]){naMargem(s,lado);X('modoObra')(true);O().tipo='ponteMadeira';O().rot=0;X('obraAlvo')();const Q=O();"
        "if(Q.ok){best={s:r2(s),lado,n:Q.ext.n,L:r2(Math.hypot(Q.ext.bx-Q.ext.ax,Q.ext.bz-Q.ext.az)),nv:Q.ext.nv,custo:X('custoObra')('ponteMadeira'),fantasma:!!X('fantasmaAlto')()};break;}X('modoObra')(false);}"
        "window.__pl=best;if(!best)return{achou:false,motivo:O().motivo};return best;"),
      e("ponteFaz", "const b=window.__pl;naMargem(b.s,b.lado);X('modoObra')(true);O().tipo='ponteMadeira';X('obraAlvo')();const t0=conta('tabuas');X('colocarObra')();X('modoObra')(false);const o=ob('ponteMadeira')[0];"
        "return{feito:!!o,gastou:t0-conta('tabuas'),rampas:o&&o.sups.length,corrimao:o&&o.cols.length,malha:!!(o&&o.mesh)};"),
      j("const o=ob('ponteMadeira')[0],e=o.ext;vai(e.ax-Math.sin(o.yaw)*0.6,e.az-Math.cos(o.yaw)*0.6);P.yaw=o.yaw;P.body=o.yaw;n.cfg.cam='1';window.__minAcima=99;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.energia=100;const o=ob('ponteMadeira')[0];if(o.ext.nv!==null){const nA=X('aguaNivel')(P.x,P.z);if(nA!==null)window.__minAcima=Math.min(window.__minAcima,P.y-nA);}P.yaw=o.yaw;P.body=o.yaw;};"),
      ["down", "KeyW"], ["gwait", 6.0], ["up", "KeyW"], ["gwait", 0.4],
      e("ponteAtravessa", "const o=ob('ponteMadeira')[0],e=o.ext;return{noOutroLado:r2(Math.hypot(P.x-e.bx,P.z-e.bz)),andou:r2(Math.hypot(P.x-e.ax,P.z-e.az)),minAcimaDaAgua:r2(window.__minAcima),nadando:!!P.nada};"),
      # corrimão: no meio da ponte, andar de lado não derruba na água
      j("const o=ob('ponteMadeira')[0],e=o.ext;const mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;vai(mx,mz,X('ponteAltura')(e,0.5)+0.02);P.yaw=o.yaw+Math.PI/2;P.body=P.yaw;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.energia=100;};"),
      ["down", "KeyW"], ["gwait", 2.0], ["up", "KeyW"], ["gwait", 0.4],
      e("ponteCorrimao", "const o=ob('ponteMadeira')[0],e=o.ext,mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;return{lado:r2(Math.hypot(P.x-mx,P.z-mz)),altura:r2(P.y-X('ponteAltura')(e,0.5)),nadando:!!P.nada};")]
# ---- deque ----
s += [e("dequeLugar", "let best=null;const pb=ob('ponteMadeira')[0];for(let s=0.92;s>0.05&&!best;s-=0.03)for(const lado of[1,-1]){naMargem(s,lado,0.9);if(pb&&Math.hypot(P.x-pb.x,P.z-pb.z)<12)continue;X('modoObra')(true);O().tipo='deque';O().rot=0;X('obraAlvo')();const Q=O();"
        "if(Q.ok){best={s:r2(s),lado,y:r2(Q.y-Q.ext.nv),fantasma:!!X('fantasmaAlto')()};break;}X('modoObra')(false);}window.__dq=best;if(!best)return{achou:false,motivo:O().motivo};return best;"),
      e("dequeFaz", "const b=window.__dq;naMargem(b.s,b.lado,0.9);X('modoObra')(true);O().tipo='deque';X('obraAlvo')();X('colocarObra')();X('modoObra')(false);const o=ob('deque')[0];return{feito:!!o,pisos:o&&o.sups.length,cols:o&&o.cols.length};"),
      j("const o=ob('deque')[0];const w=X('localW')(o,0,-2.6);vai(w[0],w[1]);P.yaw=o.yaw;P.body=o.yaw;n.cfg.cam='1';window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.energia=100;};"),
      ["down", "KeyW"], ["gwait", 3.0], ["up", "KeyW"], ["gwait", 0.4],
      e("dequePonta", "const o=ob('deque')[0],l=[(P.x-o.x)*Math.cos(o.yaw)-(P.z-o.z)*Math.sin(o.yaw),(P.x-o.x)*Math.sin(o.yaw)+(P.z-o.z)*Math.cos(o.yaw)],sp=X('supEm')(P.x,P.z,P.y,0.3);"
        "n.invAdd('vara',1);sel('vara');const it=X('interAtual')();return{local:l.map(r2),noDeque:!!(sp&&sp.dono===o),y:r2(P.y-o.y),nadando:!!P.nada,pesca:it&&it.k,txt:it&&X('textoInter')(it)};")]
salvar('p180.json', s)
