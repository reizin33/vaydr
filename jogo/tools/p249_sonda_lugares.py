"""Procura onde pôr cada lugar escaneado: chão quase plano, longe dos lugares que já existem (PLACES, vila, cidade, trilho,
estação, rio, outros escaneados) e na distância certa da estrada. Desenha também uma planta do mapa com os candidatos.
Uso (na pasta jogo/): SAIDA=t_lug.html python3 build.py && python3 tools/p249_sonda_lugares.py t_lug.html shots/p249_mapa.png"""
import asyncio, sys, os, json, base64
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
PAG = sys.argv[1] if len(sys.argv) > 1 else 'test.html'; IMG = sys.argv[2] if len(sys.argv) > 2 else 'shots/p249_mapa.png'
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
# id do modelo: [estrada mín, estrada máx] (distância da beira), passo da busca, giros a testar, quantos
PEDIDOS_TODOS = {
    'casaAbandonada': dict(estrada=[5, 14], passo=3, giros=8, n=6, frente=True),
    'predioDestruido': dict(estrada=[4, 12], passo=3, giros=8, n=6, frente=True),
    'predioAbandonado': dict(estrada=[4, 14], passo=3, giros=8, n=8, frente=True, eixo='x'),
    'ruinaMata': dict(estrada=[30, 999], passo=6, giros=8, n=8, raio=125),
}
SO = sys.argv[3].split(',') if len(sys.argv) > 3 else None
PEDIDOS = {k: v for k, v in PEDIDOS_TODOS.items() if not SO or k in SO}
JS = r"""([pedidos])=>{const X=s=>__nnc.ev(s);const dm=X('dentroMapa'),gr=X('ground'),PL=X('PLACES'),ri=X('roadInfo'),dc=X('distCidade'),F=X('FERRO'),
  LX=X('LUGX'),LUG=X('LUGARES'),VL=X('VILA_LOTES');let agua=null;try{const RIO=X('RIO'),an=X('aguaNivel');if(RIO.ok)agua=an;}catch(e){}
  const ld=X('lugDist');
  function ferroD(x,z){let m=1e9;for(const pts of [F.pts,F.desvio||[]])for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=Math.max(0,Math.min(1,t));m=Math.min(m,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t));}return m;}
  const res={};
  for(const id in pedidos){const q=pedidos[id],t=LX[id].tam,W=t[0],D=t[2],R=Math.hypot(W,D)/2,out=[];
    for(let cx=-200;cx<=340;cx+=q.passo)for(let cz=-220;cz<=200;cz+=q.passo){
      if(!dm(cx,cz,R+4))continue;if(q.raio&&Math.hypot(cx,cz)>q.raio)continue;let ruim=false;
      for(const p of PL)if(Math.hypot(cx-p.x,cz-p.z)<p.r+p.blend+R+4){ruim=true;break;}if(ruim)continue;
      for(const l of VL)if(Math.hypot(cx-l.x,cz-l.z)<R+14){ruim=true;break;}if(ruim)continue;
      for(const L of LUG)if(L.m!==id&&ld(L,cx,cz)<R+10){ruim=true;break;}if(ruim)continue;
      if(dc(cx,cz)<R+3)continue;if(ferroD(cx,cz)<R+9)continue;if(Math.hypot(cx-F.est.x,cz-F.est.z)<R+16)continue;
      for(let g=0;g<q.giros;g++){const yaw=g*Math.PI*2/q.giros,c=Math.cos(yaw),s=Math.sin(yaw);let hs=[],rmin=1e9,ok=true;
        for(let u=-0.5;u<=0.5001&&ok;u+=0.125)for(let v=-0.5;v<=0.5001;v+=0.125){const lx=u*W,lz=v*D,x=cx+lx*c+lz*s,z=cz-lx*s+lz*c;
          if(agua&&agua(x,z)!==null){ok=false;break;}const r=ri(x,z);rmin=Math.min(rmin,r.d-(r.road?r.road.w/2:0));hs.push(gr(x,z));}
        if(!ok||rmin<q.estrada[0]||rmin>q.estrada[1])continue;
        let frente=0;if(q.frente){const ex=q.eixo==='x',m=(ex?W:D)/2+q.estrada[1]*0.5,fx=cx+(ex?m*c:m*s),fz=cz+(ex?-m*s:m*c),r=ri(fx,fz);frente=r.d-(r.road?r.road.w/2:0);   // a frente (+z do modelo, ou +x) virada para a estrada
          if(frente>rmin+1)continue;}
        const mn=Math.min(...hs),mx=Math.max(...hs);out.push({cx,cz,yaw:+yaw.toFixed(3),desnivel:+(mx-mn).toFixed(2),estrada:+rmin.toFixed(1),frente:+frente.toFixed(1)});}}
    out.sort((a,b)=>a.desnivel-b.desnivel);const esc=[];   // os melhores, espalhados (um por região)
    for(const o of out){if(esc.every(e=>Math.hypot(e.cx-o.cx,e.cz-o.cz)>40))esc.push(o);if(esc.length>=q.n)break;}
    res[id]={total:out.length,melhores:esc};}
  return res;}"""
CARROS = r"""()=>{const X=s=>__nnc.ev(s);const R=X('ROADS'),gr=X('ground'),PL=X('PLACES'),dc=X('distCidade'),out=[];
  for(const r of R){if(r.vila||r.cor==='trilha')continue;for(let i=0;i<r.pts.length-1;i++){const a=r.pts[i],b=r.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let s=4;s<L-4;s+=9){const t=s/L,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
      for(const lado of [-1,1]){const off=r.w/2+1.4,px=x-dz*off*lado,pz=z+dx*off*lado;if(dc(px,pz)<6)continue;
        let perto=false;for(const p of PL)if(Math.hypot(px-p.x,pz-p.z)<p.r+6){perto=true;break;}if(perto)continue;
        out.push({x:+px.toFixed(1),z:+pz.toFixed(1),yaw:+Math.atan2(-dz,dx).toFixed(3),estrada:r.cor,desn:+Math.abs(gr(px+dx*2,pz+dz*2)-gr(px-dx*2,pz-dz*2)).toFixed(2)});}}}}
  return out;}"""
PLANTA = r"""([cand])=>{const X=s=>__nnc.ev(s);const gr=X('ground'),R=X('ROADS'),PL=X('PLACES'),F=X('FERRO'),C=X('CIDADE'),LUG=X('LUGARES'),LX=X('LUGX');
  let agua=null;try{const RIO=X('RIO'),an=X('aguaNivel');if(RIO.ok)agua=an;}catch(e){}
  const x0=-210,x1=345,z0=-230,z1=205,k=2.2,W=Math.round((x1-x0)*k),H=Math.round((z1-z0)*k);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const im=g.createImageData(W,H);for(let j=0;j<H;j+=2)for(let i=0;i<W;i+=2){const x=x0+i/k,z=z0+j/k,h=gr(x,z),hx=gr(x+1,z)-h;let c=[110+h*3,130+h*2.4,90+h*2];
    if(agua&&agua(x,z)!==null)c=[70,110,150];const sh=1+hx*0.25;for(let a=0;a<2;a++)for(let b=0;b<2;b++){const o=((j+b)*W+i+a)*4;im.data[o]=c[0]*sh;im.data[o+1]=c[1]*sh;im.data[o+2]=c[2]*sh;im.data[o+3]=255;}}
  g.putImageData(im,0,0);const P=(x,z)=>[(x-x0)*k,(z-z0)*k];
  g.fillStyle='rgba(200,200,205,.6)';{const a=P(C.x0,C.z0),b=P(C.x1,C.z1);g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}
  for(const r of R){g.strokeStyle=r.cor==='asfalto'?'#333':r.cor==='trilha'?'#b98':'#a87';g.lineWidth=r.w*k;g.beginPath();r.pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.stroke();}
  g.strokeStyle='#522';g.lineWidth=2;g.beginPath();F.pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.stroke();
  g.font='bold 13px sans-serif';for(const p of PL){const q=P(p.x,p.z);g.strokeStyle='#fff';g.beginPath();g.arc(q[0],q[1],p.r*k,0,7);g.stroke();g.fillStyle='#000';g.fillText(p.nome,q[0]+4,q[1]-4);}
  const ret=(x,z,W,D,yaw,cor)=>{const c=Math.cos(yaw),s=Math.sin(yaw);g.fillStyle=cor;g.beginPath();[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([u,v],i)=>{const lx=u*W/2,lz=v*D/2,q=P(x+lx*c+lz*s,z-lx*s+lz*c);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.fill();};
  for(const L of LUG){const t=LX[L.m].tam;ret(L.x,L.z,t[0],t[2],L.yaw,'#e33');const q=P(L.x,L.z);g.fillStyle='#e33';g.fillText(L.nome,q[0]+8,q[1]+14);}
  const cores={casaAbandonada:'#f80',predioDestruido:'#a0f',predioAbandonado:'#0af',ruinaMata:'#0a4',carro:'#ff0'};
  for(const id in cand){const t=id==='carro'?[4.25,0,2.22]:LX[id].tam;cand[id].forEach((o,i)=>{ret(o.cx??o.x,o.cz??o.z,t[0],t[2],o.yaw,cores[id]);if(id!=='carro'){const q=P(o.cx,o.cz);g.fillStyle=cores[id];g.fillText(id.slice(0,5)+i,q[0]+6,q[1]-6);}});}
  for(let x=-200;x<=340;x+=50){const q=P(x,z0);g.fillStyle='#fff';g.fillText('x'+x,q[0],q[1]+14);}for(let z=-200;z<=200;z+=50){const q=P(x0,z);g.fillStyle='#fff';g.fillText('z'+z,q[0]+2,q[1]);}
  return cv.toDataURL('image/png');}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': 800, 'height': 500}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto('file://' + BASE + PAG + '#teste', wait_until='domcontentloaded', timeout=180000)
        await pg.wait_for_function("typeof __nnc!=='undefined'&&__nnc.G.modo==='menu'", timeout=240000, polling=500)
        await pg.evaluate("()=>{window.__semRender=true;}")
        r = await pg.evaluate(JS, [PEDIDOS]); print(json.dumps(r, ensure_ascii=False))
        cs = await pg.evaluate(CARROS); cs = [c for c in cs if c['desn'] < 0.4]; print('carros', len(cs), json.dumps(cs[::7][:30], ensure_ascii=False))
        cand = {k: v['melhores'] for k, v in r.items()}; cand['carro'] = cs[::7][:30]
        url = await pg.evaluate(PLANTA, [cand]); open(BASE + IMG, 'wb').write(base64.b64decode(url.split(',', 1)[1])); print('planta', IMG, 'erros', erros[:3])
        await b.close()
asyncio.run(main())
