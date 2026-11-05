"""p174f: fotos da Etapa 14 (aves, gavião e peixes). Bando de pardais e rolinhas no chão; bem-te-vi no poste; quero-quero; garça na
beira do lago; urubus rodando em cima de carcaça; gavião na luva (braço erguido); gavião no poleiro; peixe pulando no lago."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,AV=()=>X('AVES'),GV=()=>X('GAV'),cria=(t,x,z,yaw,y,ext)=>X('criarObra')(t,x,z,yaw||0,undefined,false,y,ext),"
     "ave=(sp,x,z,o)=>{const b=X('criarAve')(sp,x,z,o||{});b.t=99;return b;},"
     "_gr=X('ground'),_dm=X('dentroMapa'),_pb=X('pointBlocked'),_se=X('salaEm'),_an=X('aguaNivel'),_ap=X('aguaProfVeic'),_cq=X('colQuery'),_dc=X('dentroCidade'),_re=X('ruralEm'),"
     "dirLivre=(x,z)=>{let best=0,bl=-1;const g0=_gr(x,z);for(let k=0;k<24;k++){const a=k/24*6.283,dx=Math.sin(a),dz=Math.cos(a);let l=0;for(let d=1.5;d<=60;d+=1.5){const px=x+dx*d,pz=z+dz*d;"
     "const gp=_gr(px,pz);if(!_dm(px,pz,4)||_pb(px,pz,0.9)||_se(px,gp+0.6,pz)||(_an(px,pz)!==null&&_ap(px,pz)>0.4)||Math.abs(gp-g0)>d*0.35)break;l=d;}"
     "if(l>bl){bl=l;best=a;}}return{a:best,l:bl};};")
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);P.roupa.costas='mochilaExpedicao';G.hora=9.5;G.noite=false;G.chuva=0;n.cfg.cam='3';"
        "let c=null;const arv=(x,z,r)=>{let k=0;for(const q of _cq(x,z,r))if(q.tree&&(q.x-x)**2+(q.z-z)**2<r*r)k++;return k;};for(const[c0,c1]of[[-62,52],[-80,70],[118,-70],[60,96],[-50,40]])for(let rr=0;rr<=36&&!c;rr+=6)for(let k=0;k<12&&!c;k++){const a=k/12*6.283+rr,x=c0+Math.cos(a)*rr,z=c1+Math.sin(a)*rr;if(!_dm(x,z,8)||_dc(x,z,12)||_re(x,z,10)||arv(x,z,14)>0||_pb(x,z,2))continue;const g0=_gr(x,z);let plano=true;for(let q=0;q<8;q++){const b=q/8*6.283;if(Math.abs(_gr(x+Math.cos(b)*10,z+Math.sin(b)*10)-g0)>1.2)plano=false;}if(!plano)continue;const d=dirLivre(x,z);if(d.l>=30)c={x,z,a:d.a};}if(!c)c={x:-62,z:52,a:0};W.__c=c;"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);X('aveSpawn=()=>{}');AV().length=0;vai(c.x,c.z);P.yaw=c.a;P.body=P.yaw;"
        "const fx=Math.sin(c.a),fz=Math.cos(c.a),rx=Math.cos(c.a),rz=-Math.sin(c.a),x0=c.x+fx*4,z0=c.z+fz*4;W.__p0=[x0,z0];"
        "for(let i=0;i<6;i++)ave('pardal',x0+(Math.random()-0.5)*1.4,z0+(Math.random()-0.5)*1.0,{g:900});for(let i=0;i<2;i++)ave('rolinha',x0+rx*1.2+(Math.random()-0.5)*0.6,z0+rz*1.2,{g:901});"
        "const pt=cria('posteAmarrar',x0-rx*1.4,z0-rz*1.4,0);ave('bemtevi',pt.x,pt.z,{st:'pousado',y:pt.y+1.29,pouso:pt,g:902});"
        "ave('queroquero',x0+rx*3.2+fx*1.5,z0+rz*3.2+fz*1.5,{g:903});vai(x0-fx*30,z0-fz*30);"), ["gwait", 0.5]]
s += foto('p174_passaros.png', H + "const[x0,z0]=W.__p0,c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),y=X('ground')(x0,z0);G.camFix={pos:[x0-fx*2.0,y+0.75,z0-fz*2.0],tgt:[x0+fx*0.3,y+0.25,z0+fz*0.3],fov:0.95};", 0.2, 4.0)
# urubus rodando em cima de uma carcaça (visto de baixo, de longe)
s += [j("G.camFix=null;AV().length=0;const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);const b=X('criarBicho')('cervo',c.x+fx*20,c.z+fz*20,{});X('ferirBicho')(b,999,0,0,'tiro');W.__carc=b;"
        "for(let i=0;i<4;i++){const u=ave('urubu',b.x,b.z,{st:'plana',cx:b.x,cz:b.z,ch:X('ground')(b.x,b.z)+12+i*1.5,raio:6+i*1.6});u.carc=b;u.y=u.ch;u.ang=i*1.6;}"
        "const u2=ave('urubu',b.x+1.3,b.z+0.6,{});u2.carc=b;"), ["gwait", 1.5]]
s += foto('p174_urubus.png', H + "const b=W.__carc,c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a),y=X('ground')(b.x,b.z);G.camFix={pos:[b.x-fx*9,y+1.6,b.z-fz*9],tgt:[b.x,y+8,b.z],fov:1.15};", 0.2, 4.0)
# garça na beira do lago e peixe pulando
s += [j("G.camFix=null;AV().length=0;const L=X('LAGO');let p=null;for(let k=0;k<64&&!p;k++){const a=k/64*6.283;for(let r=0.6;r<1.3;r+=0.02){const x=L.x+Math.cos(a)*L.a*r,z=L.z+Math.sin(a)*L.b*r;"
        "if(X('lagoR')(x,z)>=1.02&&X('dentroMapa')(x,z,6)&&!X('pointBlocked')(x,z,0.6)&&X('densidadeMata')(x,z)<2){p={x,z,a};break;}}}W.__m=p;vai(p.x+Math.cos(p.a)*7,p.z+Math.sin(p.a)*7);W.__vaiDepois=[p.x+Math.cos(p.a)*30,p.z+Math.sin(p.a)*30];"
        "let g=null;for(let i=0;i<60&&!g;i++)g=X('avePontoPara')('garca');if(g){W.__g=ave('garca',g[0],g[1],{});W.__g.yaw=Math.atan2(L.x-g[0],L.z-g[1]);}const vd=W.__vaiDepois;if(X('dentroMapa')(vd[0],vd[1],4))vai(vd[0],vd[1]);"), ["gwait", 0.6]]
s += foto('p174_garca.png', H + "const g=W.__g;if(!g)return;const L=X('LAGO'),dx=g.x-L.x,dz=g.z-L.z,l=Math.hypot(dx,dz),y=X('ground')(g.x,g.z);G.camFix={pos:[g.x+dx/l*3.2+dz/l*1.5,y+1.4,g.z+dz/l*3.2-dx/l*1.5],tgt:[g.x,y+0.5,g.z],fov:0.95};", 0.2, 4.0)
s += [j("G.camFix=null;const L=X('LAGO'),p=W.__m,x=p.x+(L.x-p.x)*0.12,z=p.z+(L.z-p.z)*0.12;W.__pw=[x,z];X('peixePula')(x,z,'tucunare',2.5,false);"), ["gwait", 0.22]]
s += foto('p174_peixe.png', H + "const[x,z]=W.__pw,p=W.__m,y=X('aguaNivel')(x,z);G.camFix={pos:[x+(p.x-x)*0.5,y+1.2,z+(p.z-z)*0.5],tgt:[x,y+0.35,z],fov:0.9};", 0, 4.0)
# gavião na luva e no poleiro
s += [j("G.camFix=null;const c=W.__c;vai(c.x,c.z);P.yaw=c.a;P.body=P.yaw;inv('luvaFalcoaria',1);sel('luvaFalcoaria');const g=GV();Object.assign(g,{domado:true,x:P.x,y:P.y+10,z:P.z,st:'plana',modo:'segue',fome:10,tmUlt:G.tm,s:2.9});"), ["gwait", 6.0]]
s += foto('p174_luva.png', H + "const yw=P.body+0.9;G.camFix={pos:[P.x+Math.sin(yw)*2.6,P.y+1.9,P.z+Math.cos(yw)*2.6],tgt:[P.x,P.y+1.5,P.z],fov:0.9};", 0.3, 4.0)
s += [j("G.camFix=null;const c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);const p=cria('poleiro',P.x+fx*3,P.z+fz*3,c.a+Math.PI/2);W.__pol=p;const g=GV();g.modo='base';g.pol={x:p.x,z:p.z};g.st='volta';"
        "const i=P.inv.findIndex(q=>q&&q.id==='luvaFalcoaria');X('selecionar')((i+1)%6);"), ["gwait", 8.0]]
s += foto('p174_poleiro.png', H + "const p=W.__pol,c=W.__c,fx=Math.sin(c.a),fz=Math.cos(c.a);G.camFix={pos:[p.x-fx*3.6+Math.cos(c.a)*1.2,p.y+2.2,p.z-fz*3.6-Math.sin(c.a)*1.2],tgt:[p.x,p.y+2.1,p.z],fov:0.9};", 0.3, 4.0)
s += [j("G.camFix=null;X('abrirEstacao')(W.__pol);")]
s += foto('p174_painel.png', H + "", 0, 2.5)
salvar('p174f.json', s)
