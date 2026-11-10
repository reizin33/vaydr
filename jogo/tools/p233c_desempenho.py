"""p233c (Parte 2): tempo de desenho perto da borda nova, comparado com a clareira e a mata de dentro (mesma qualidade 'alto').
Em cada ponto: olhando para fora e para dentro, 2 rodadas de 3 quadros, com a vegetação refeita para o lugar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=12;")]
MED = ("const gl=X('gl'),px=X('PX_SYNC'),rd=X('render'),uc=X('updateCamera');X('rebuildVeg')(true);X('rebuildGrass')();const r={};"
       "for(const[nome,yaw]of[['fora',window.__yaw],['dentro',window.__yaw+Math.PI]]){P.yaw=yaw;P.body=yaw;P.pitch=-0.05;for(let i=0;i<30;i++)uc(0.05);rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);"
       "const t=[];for(let k=0;k<2;k++){const t0=performance.now();for(let i=0;i<3;i++){rd();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}t.push((performance.now()-t0)/3);}r[nome]=r2((t[0]+t[1])/2);}"
       "let arv=0;for(const t of X('TREES'))if(!t.agua&&Math.hypot(t.x-P.x,t.z-P.z)<60)arv++;r.arvores60m=arv;r.reg=(X('regiaoEm')(P.x,P.z)||{}).id;r.erroGL=gl.getError();return r;")
for nome, x, z, yaw in (("clareira", 4, 4, -1.57), ("mataDentro", -110, 6, -1.57), ("circuloAntigo", -150, 4, -1.57), ("morros", -172, 2, -1.57), ("beiraNova", -186, 2, -1.57), ("morrosSul", -20, 182, 0.0)):
    s += [js(f"vai({x},{z});window.__yaw={yaw};"), ["gwait", 0.6], ev(nome, MED)]
salvar('tools/p233c_desempenho.json', s, vp=(960, 540))
