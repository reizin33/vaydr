"""p178f: fotos da Etapa 16: casa de 4 m com paredes, porta, janela, telhado da casa (duas águas, pontudo e plano) e marco da base;
escada caracol vista do térreo e do andar de cima; escada reta da casa de 4 m (depois de trocar no painel)."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p177_mover as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'casa')
s = m.s[:k + 1]
H = m.H + ("const W=(o,lx,lz)=>X('localW')(o,lx,lz),esc=()=>X('OB').find(o=>o.tipo==='escadaInterna'),"
           "olha=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(y-(P.y+1.6),Math.hypot(dx,dz));};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s += [e("monta", "const b=ob('bau')[0];if(b)X('destruirObraSilenciosa')(b);const p=plat();"
        # paredes: porta no sul, janela no leste, parede no norte (o oeste já tem parede)
        "const r={porta:poe('portaMadeira',C[0]+2.1,C[1]-0.3,0).feito,janela:poe('janela',C[0]+4.3,C[1]+1.9,-Math.PI/2).feito,norte:poe('paredeCasa',C[0]+1.9,C[1]+4.3,Math.PI).feito};"
        # caracol no canto nordeste da plataforma (local +x,+z)
        "const c0=n.cfg.cam;n.cfg.cam='1';const a=W(p,-0.9,-0.9),t=W(p,1.3,1.3);vai(a[0],a[1],g(a[0],a[1]));const ey=P.y+1.62,dx=t[0]-P.x,dz=t[1]-P.z,ty=g(t[0],t[1]),d=Math.hypot(dx,ty-ey,dz);"
        "P.yaw=Math.atan2(dx,dz);cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];X('modoObra')(true);O().tipo='escadaCaracol';O().rot=0;X('obraAlvo')();r.caracolOk=O().ok;X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;"
        "r.caracol=!!esc();r.teto=noAlto('telhadoCasa',0,-1.0,-1.0).feito;r.marco=poe('marcoBase',C[0]-2,C[1]+6.5,0).feito;return r;")]
s += foto("e16_casa4_fora.png", H + "window.__semRender=false;n.cfg.cam='3';const p=plat();vai(p.x-7.5,p.z-8.5,g(p.x-7.5,p.z-8.5));olha(p.x,p.y-0.5,p.z);P.pitch=0.05;", antes=0.6, esp=3.0)
s += foto("e16_caracol_terreo.png", H + "window.__semRender=false;n.cfg.cam='1';const p=plat(),a=W(p,-1.5,-1.5);vai(a[0],a[1],g(a[0],a[1]));const o=esc();olha(o.x,o.y-1.6,o.z);", antes=0.6, esp=3.0)
s += foto("e16_caracol_cima.png", H + "window.__semRender=false;n.cfg.cam='1';const p=plat(),a=W(p,-1.6,-0.2);vai(a[0],a[1],p.y);const o=esc();olha(o.x,o.y-1.2,o.z);", antes=0.6, esp=3.0)
s += [e("pontudo", "const t=ob('telhadoCasa')[0];return X('ESTACAO_UI').tetoCasa.acao(t,'e_quatro');")]
s += foto("e16_teto_pontudo.png", H + "window.__semRender=false;n.cfg.cam='3';const p=plat();vai(p.x-7.5,p.z-8.5,g(p.x-7.5,p.z-8.5));olha(p.x,p.y-0.5,p.z);P.pitch=0.05;", antes=0.6, esp=3.0)
s += [e("plano", "const t=ob('telhadoCasa')[0];return[X('ESTACAO_UI').tetoCasa.acao(t,'e_plano'),X('ESTACAO_UI').tetoCasa.acao(t,'c_chapa')];")]
s += foto("e16_teto_plano.png", H + "window.__semRender=false;n.cfg.cam='3';const p=plat();vai(p.x+8,p.z-8.5,g(p.x+8,p.z-8.5));olha(p.x,p.y-0.5,p.z);P.pitch=0.05;", antes=0.6, esp=3.0)
s += [e("reta", "const p=plat(),a=W(p,-1.5,-1.5);vai(a[0],a[1],g(a[0],a[1]));return X('escadaTrocar')(esc(),'reta',false);")]
s += foto("e16_reta4.png", H + "window.__semRender=false;n.cfg.cam='1';const p=plat(),a=W(p,-1.5,-1.4);vai(a[0],a[1],g(a[0],a[1]));const o=esc(),q=X('escadaPontos')(o)[0];olha((o.x+q[0])/2,o.y-1.5,(o.z+q[1])/2);", antes=0.6, esp=3.0)
s += [e("fim", "return{mod:esc()&&(esc().ext.mod||'reta')};")]
salvar('p178f.json', s)
