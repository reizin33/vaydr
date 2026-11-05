"""p158: escada interna da casa. Fora da casa e na parede da porta é recusada; dentro, encostada na parede leste, ela abre o piso
de cima. O jogador sobe andando do térreo ao andar de cima, sai pelo lado do patamar, o guarda-corpo segura quem está em cima,
desce de volta, salvar e carregar mantém a abertura, a segunda escada é recusada, a escada quebrada fecha o piso e a plataforma
que cai leva a escada junto. Com fotos do térreo e do andar de cima (SEMFOTO=1 pula)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
H = ("const C=[2,-19],g=(x,z)=>X('ground')(x,z),cr=X('criarObra'),cam=X('cam'),plat=()=>X('OB').find(o=>o.tipo==='plataforma'),"
     "esc=()=>X('OB').find(o=>o.tipo==='escadaInterna'),"
     "mirarEsc=(px,pz,yaw,rot)=>{const c0=n.cfg.cam;n.cfg.cam='1';vai(px,pz,g(px,pz));P.yaw=yaw;P.body=yaw;P.pitch=0;cam.fwd=[Math.sin(yaw),0,Math.cos(yaw)];"
     "X('modoObra')(true);X('OBRA').tipo='escadaInterna';X('OBRA').rot=rot||0;X('obraAlvo')();const O=X('OBRA'),r={ok:O.ok,motivo:O.motivo,ext:O.ext};n.cfg.cam=c0;return r;},"
     "loc=(x,z)=>{const p=plat();return[r2(x-p.x),r2(z-p.z)];},"
     "piso=()=>{const p=plat();return{sups:p.sups?p.sups.length:(p.sup?1:0),cols:p.cols?p.cols.length:(p.col?1:0),furo:p.furo?p.furo.map(r2):null,malha:!!p.mesh};};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
MONTA = ("for(const[i,k]of[[0,0],[3,0],[0,3],[3,3]])cr('pilar',C[0]+i,C[1]+k,0,undefined,false,g(C[0]+i,C[1]+k),{top:2.4});"
         "cr('plataforma',C[0]+1.5,C[1]+1.5,0,undefined,false,2.4,{apoio:'pilar',nivel:0});"
         "cr('portaMadeira',C[0]+1.5,C[1],0,undefined,false,g(C[0]+1.5,C[1]));cr('paredeCasa',C[0],C[1]+1.5,Math.PI/2,undefined,false,g(C[0],C[1]+1.5));"
         "cr('paredeCasa',C[0]+1.5,C[1]+3,Math.PI,undefined,false,g(C[0]+1.5,C[1]+3));cr('paredeCasa',C[0]+3,C[1]+1.5,Math.PI/2,undefined,false,g(C[0]+3,C[1]+1.5));"
         "cr('paredeAlta',C[0]+3,C[1]+1.5,Math.PI/2,undefined,false,2.4);")
s = inicio("window.__casa3=true;X('FAUNA_POP').ativosMax=0;")
s += [j("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;G.chuva=0;" + MONTA + "n.invAdd('tabuas',40);n.invAdd('pregos',30);"),
      e("casa", "const p=plat();return{platY:r2(p.y),chao:r2(g(C[0]+1.5,C[1]+1.5)),piso:piso()};"),
      # recusas: fora da casa; olhando a parede da porta
      e("fora", "const r=mirarEsc(C[0]-2,C[1]+1.5,Math.PI/2);X('modoObra')(false);return{ok:r.ok,motivo:r.motivo};"),
      e("paredePorta", "const r=mirarEsc(C[0]+1.5,C[1]+1.8,Math.PI);X('modoObra')(false);return{ok:r.ok,motivo:r.motivo};"),
      # dentro da casa, olhando a parede leste: o pé fica do lado sul (mais perto), sobe para o norte
      e("mira", "const r=mirarEsc(C[0]+1.0,C[1]+0.9,Math.PI/2);const k=X('OB').length,t0=n.invCount('tabuas');X('colocarObra')();X('modoObra')(false);"
                "const q=esc();return{ok:r.ok,motivo:r.motivo,ext:r.ext,feito:X('OB').length>k,tabuasGastas:t0-n.invCount('tabuas'),"
                "escada:q&&{o:loc(q.x,q.z),yaw:r2(q.yaw),sups:q.sups.length,cols:q.cols.length,malha:!!q.mesh},piso:piso()};")]
# sobe andando: começa na frente do pé, olhando para o norte
s += [j("const q=esc();const pe=X('localW')(q,0,2.17+0.25);vai(pe[0],pe[1],g(pe[0],pe[1]));P.yaw=q.yaw+Math.PI;P.body=P.yaw;P.pitch=0;window.__turbo=2;window.__y0=P.y;"),
      ["gwait", 0.3], ["down", "w"], ["until", "(()=>{const n=__nnc,pl=n.OB.find(o=>o.tipo==='plataforma');return n.P.y>pl.y-0.05;})()", 25], ["gwait", 0.25], ["up", "w"],
      js("window.__turbo=6;"), ["gwait", 0.3],
      e("subiu", "const p=plat(),s=X('supEm')(P.x,P.z,P.y,0.2);return{y0:r2(window.__y0-p.y),dy:r2(P.y-p.y),pos:loc(P.x,P.z),em:s&&s.dono&&s.dono.tipo,vida:Math.round(P.vida)};"),
      # sai pelo lado do patamar (para oeste) e fica no piso de cima
      j("P.yaw=-Math.PI/2;P.body=P.yaw;window.__turbo=2;"), ["down", "w"], ["gwait", 0.35], ["up", "w"], js("window.__turbo=6;"), ["gwait", 0.3],
      e("saiu", "const p=plat(),s=X('supEm')(P.x,P.z,P.y,0.2);return{dy:r2(P.y-p.y),pos:loc(P.x,P.z),em:s&&s.dono&&s.dono.tipo};"),
      # guarda-corpo do lado da abertura: andando para leste a partir do meio do piso, não cai
      j("const p=plat();vai(p.x+0.1,p.z-0.2,p.y);P.yaw=Math.PI/2;P.body=P.yaw;window.__turbo=2;"), ["down", "w"], ["gwait", 1.2], ["up", "w"], js("window.__turbo=6;"), ["gwait", 0.3],
      e("grade", "const p=plat();return{dy:r2(P.y-p.y),pos:loc(P.x,P.z)};"),
      # guarda-corpo do fim da abertura: do canto sudeste, andando para o norte
      j("const p=plat();vai(p.x+0.98,p.z-1.25,p.y);P.yaw=0;P.body=0;window.__turbo=2;"), ["down", "w"], ["gwait", 1.2], ["up", "w"], js("window.__turbo=6;"), ["gwait", 0.3],
      e("gradeFim", "const p=plat();return{dy:r2(P.y-p.y),pos:loc(P.x,P.z)};"),
      # desce: entra no patamar pelo lado e desce o lance para o sul
      j("const p=plat();vai(p.x+0.25,p.z+1.15,p.y);P.yaw=Math.PI/2;P.body=P.yaw;window.__turbo=2;"), ["down", "w"], ["gwait", 0.35], ["up", "w"],
      j("P.yaw=Math.PI;P.body=P.yaw;"), ["down", "w"], ["until", "(()=>{const n=__nnc,g=n.ev('ground');return n.P.y<g(n.P.x,n.P.z)+0.08;})()", 25], ["gwait", 0.4], ["up", "w"], js("window.__turbo=6;"), ["gwait", 0.3],
      e("desceu", "const p=plat();return{acimaDoChao:r2(P.y-g(P.x,P.z)),pos:loc(P.x,P.z),vida:Math.round(P.vida)};")]
# salvar e carregar: a abertura e a escada voltam
s += [j("const p=plat();vai(p.x-0.8,p.z,g(p.x-0.8,p.z));"), ["gwait", 0.3], js("__nnc.salvarJogo()"),
      ["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.4],
      e("carregou", "const q=esc();return{escada:q&&{sups:q.sups.length,cols:q.cols.length,ext:q.ext},piso:piso()};"),
      e("segunda", "const r=mirarEsc(C[0]+2.0,C[1]+1.5,-Math.PI/2);X('modoObra')(false);return{ok:r.ok,motivo:r.motivo};")]
s += [e("fotoInfo", "const q=esc();return{o:loc(q.x,q.z)};")]
FOT = os.environ.get('SEMFOTO') != '1'
if FOT:
    s += foto("830_escada_interna.png", H + "G.hora=10;const p=plat();vai(p.x-1.0,p.z+0.9,g(p.x-1.0,p.z+0.9));P.yaw=P.body=Math.PI*0.75;"
              "G.camFix={pos:[p.x-1.15,g(p.x,p.z)+1.55,p.z-1.2],tgt:[p.x+1.0,g(p.x,p.z)+1.2,p.z+0.6],fov:1.15};", 0.6, 4.0)
    s += foto("831_escada_interna_cima.png", H + "G.hora=10;const p=plat();vai(p.x-1.0,p.z+1.0,p.y);P.yaw=P.body=Math.PI*0.6;"
              "G.camFix={pos:[p.x-1.3,p.y+1.75,p.z-1.25],tgt:[p.x+0.9,p.y-0.4,p.z+0.4],fov:1.15};", 0.6, 4.0)
# quebrou: o piso fecha; a plataforma que cai leva a escada
s += [e("quebrou", "X('destruirObra')(esc());return{escada:!!esc(),piso:piso()};"),
      e("refeita", "const r=mirarEsc(C[0]+1.0,C[1]+0.9,Math.PI/2);X('colocarObra')();X('modoObra')(false);return{ok:r.ok,escada:!!esc(),piso:piso()};"),
      e("caiu", "X('destruirObra')(plat());return{plataforma:!!plat(),escada:!!esc()};")]
salvar('p158.json', s)
