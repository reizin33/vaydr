"""p206: Etapa 25, desempenho em base grande e em áreas cheias (nível Alto, tempo de desenho com a placa de vídeo junto):
base com 220 construções na clareira, horda de 40 zumbis na cidade, porto com o navio e a tripulação, Alto do Rio Claro com a
pousada e os zumbis da região, e a mata comum para comparar. O teste roda sem placa de vídeo (desenho por software): vale a
comparação entre os lugares, não o número absoluto."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const zera=()=>{window.__perf={passo:0,veg:0,render:0,hud:0,n:0};},mede=()=>{const p=window.__perf;return{criadas:window.__nob,falhas:window.__nobFalhas,quadros:p.n,msPasso:p.n?Math.round(p.passo/p.n*10)/10:null,msDesenho:p.n?Math.round(p.render/p.n*10)/10:null,obras:X('OB').length,zumbis:Z.filter(z=>z.vivo).length};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=1;window.__perfSync=true;window.__semRender=true;vivo();Z.length=0;G.hora=11;n.cfg.graf='alto';n.cfg.grafManual=true;X('aplicarCfg')();X('perfDone=true');window.__cadaPasso=()=>{P.vida=100;P.fome=100;P.sede=100;};")]
def mede(nome, pos):
    return [j(pos + "window.__semRender=false;"), ["gwait", 0.4, 900], j("zera();"), ["gwait", 0.6, 900], e(nome, "const r=mede();window.__semRender=true;return r;")]   # janela curta: sem placa de vídeo cada quadro leva segundos
s += mede("mata", "vai(F[0]+40,F[2]+30);P.yaw=-2.3;")
s += [j("n.invAdd('tabuas',2000);n.invAdd('pregos',2000);n.invAdd('madeira',2000);n.invAdd('pedra',2000);const tipos=['paredeCasa','muro','pilar','barricada','bau','muroPedra','fogueira','plataforma'];let k=0,falhas=0;"
        "for(let i=0;i<15;i++)for(let jj=0;jj<15;jj++){if(k>=220)break;const x=F[0]-21+i*3,z=F[2]-21+jj*3;if(Math.hypot(x-F[0],z-F[2])<4)continue;try{X('criarObra')(tipos[(i*15+jj)%tipos.length],x,z,(i%2)*Math.PI/2);k++;}catch(e){falhas++;}}window.__nob=k;window.__nobFalhas=falhas;")]
s += mede("baseGrande", "vai(F[0]+2,F[2]+26);P.yaw=Math.PI;")
s += [j("for(const z of Z)z.vivo=false;Z.length=0;")]
s += mede("cidadeHorda", "vai(254,5);P.yaw=Math.PI/2;for(let i=0;i<40;i++){const a=i/40*6.283;ZZ('walker',254+Math.cos(a)*(14+i%3*4),5+Math.sin(a)*(14+i%3*4));}")
s += [j("for(const z of Z)z.vivo=false;Z.length=0;")]
s += mede("porto", "vai(346,40);P.yaw=Math.PI/2;")
s += mede("altoPousada", "vai(50,-238,X('ground')(50,-238));P.yaw=-Math.PI/2;")
salvar('p206.json', s, vp=(960, 540))
