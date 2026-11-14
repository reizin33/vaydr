"""Prévia FORA DO JOGO de modelos já convertidos (LUGX do 21h_lugares_dados.js, ou MATA do 21i): quatro vistas de cada modelo
(frente, três quartos, lado e de cima) com chão quadriculado de 1 m e um boneco de 1,75 m para dar a escala.
Serve para conferir escala, de que lado é a frente e se a textura entrou, antes de pôr no mapa.
Uso: python3 tools/previa_lugx.py saida.png id1 [id2 ...]"""
import sys, os, json, asyncio
from playwright.async_api import async_playwright
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SAI, IDS = sys.argv[1], sys.argv[2:]
t = open(BASE + 'src/21h_lugares_dados.js', encoding='utf-8').read(); LUGX = json.loads(t[t.index('const LUGX=') + 11:t.rindex(';')])
mods = {i: LUGX[i] for i in IDS}
html = r'''<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#101214;color:#eee;font:700 15px system-ui}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.c{position:relative}canvas{width:100%;display:block;background:#1a1d20}
.n{position:absolute;left:8px;top:6px;background:rgba(0,0,0,.6);padding:3px 8px;border-radius:4px}
.et{padding:8px 12px;background:#5a3c8c;display:inline-block;margin:6px}</style></head><body>
<div class="et">PRÉVIA FORA DO JOGO · modelos convertidos, antes de entrar no mapa</div><div id="g" class="g"></div>
<script>const MODS=__MODS__;
function dec(b,uv0,uvS){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const dv=new DataView(u.buffer);
 const nv=dv.getUint32(0,true),nt=dv.getUint32(4,true),lo=[0,1,2].map(k=>dv.getFloat32(8+k*4,true)),hi=[0,1,2].map(k=>dv.getFloat32(20+k*4,true));let o=32;
 const P=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){P[i]=lo[i%3]+dv.getUint16(o+i*2,true)/65535*(hi[i%3]-lo[i%3]);}o+=nv*6;
 const UV=new Float32Array(nv*2);for(let i=0;i<nv*2;i++){UV[i]=uv0[i%2]+dv.getUint16(o+i*2,true)/65535*uvS[i%2];}o+=nv*4;
 const big=nv>65535,I=big?new Uint32Array(nt*3):new Uint16Array(nt*3);for(let i=0;i<nt*3;i++)I[i]=big?dv.getUint32(o+i*4,true):dv.getUint16(o+i*2,true);o+=nt*3*(big?4:2);
 const N=new Float32Array(nv*3);for(let i=0;i<nv*3;i++)N[i]=dv.getInt8(o+i)/127;return{P,UV,N,I,big};}
const VS=`#version 300 es
in vec3 p;in vec3 n;in vec2 t;uniform mat4 M;out vec3 vn;out vec2 vt;out vec3 vp;void main(){vn=n;vt=t;vp=p;gl_Position=M*vec4(p,1.0);}`;
const FS=`#version 300 es
precision highp float;in vec3 vn;in vec2 vt;in vec3 vp;uniform sampler2D T;uniform int hasT;uniform vec3 C;uniform int grid;out vec4 o;
void main(){vec3 n=normalize(vn);if(!gl_FrontFacing)n=-n;vec3 L=normalize(vec3(0.5,0.9,0.35));float d=max(0.0,dot(n,L))*0.6+0.55;
 vec3 c=hasT==1?pow(texture(T,vt).rgb,vec3(2.2)):C;if(grid==1){vec2 g=abs(fract(vp.xz)-0.5);float l=step(0.48,max(g.x,g.y));c=mix(vec3(0.07),vec3(0.2),l);d=1.0;}
 o=vec4(pow(c*d,vec3(1.0/2.2)),1.0);}`;
function persp(f,a,n,fa){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];}
function look(e,c,u){const z=norm(sub(e,c)),x=norm(cross(u,z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1];}
function mul(a,b){const r=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];r[i*4+j]=s;}return r;}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
let pend=0;
for(const [id,m] of Object.entries(MODS)){const T=m.tam,R=Math.max(T[0],T[1],T[2]);
 for(const [vn,ang,el] of [['frente (+z)',0,0.18],['três quartos',Math.PI/4+Math.PI,0.35],['lado (+x)',Math.PI/2,0.15],['de cima',0.3,1.35]]){
  const box=document.createElement('div');box.className='c';const cv=document.createElement('canvas');cv.width=640;cv.height=420;box.appendChild(cv);
  const nm=document.createElement('div');nm.className='n';nm.textContent=id+' · '+vn+' · '+T.map(v=>v.toFixed(1)).join(' × ')+' m';box.appendChild(nm);document.getElementById('g').appendChild(box);
  const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true});const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0.1,0.11,0.12,1);gl.clear(16640);
  const dist=R*1.25+3,cy=T[1]*0.45,eye=[Math.sin(ang)*Math.cos(el)*dist,cy+Math.sin(el)*dist,Math.cos(ang)*Math.cos(el)*dist];
  const MVP=mul(persp(0.75,640/420,0.1,R*10+50),look(eye,[0,cy,0],[0,1,0]));gl.uniformMatrix4fv(gl.getUniformLocation(pr,'M'),false,new Float32Array(MVP));
  const draw=(P,N,UV,I,tex,cor,grid)=>{const vao=gl.createVertexArray();gl.bindVertexArray(vao);
   for(const [nmA,arr,sz] of [['p',P,3],['n',N,3],['t',UV,2]]){const loc=gl.getAttribLocation(pr,nmA);if(loc<0)continue;const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,sz,gl.FLOAT,false,0,0);}
   const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,I,gl.STATIC_DRAW);
   gl.uniform1i(gl.getUniformLocation(pr,'hasT'),tex?1:0);gl.uniform1i(gl.getUniformLocation(pr,'grid'),grid?1:0);gl.uniform3fv(gl.getUniformLocation(pr,'C'),cor||[0.6,0.6,0.6]);
   if(tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(pr,'T'),0);}
   gl.drawElements(gl.TRIANGLES,I.length,I instanceof Uint32Array?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT,0);};
  // chão de 1 m e boneco de 1,75 m ao lado
  const G=Math.ceil(R*0.8)+3;draw(new Float32Array([-G,0,-G,G,0,-G,G,0,G,-G,0,G]),new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]),new Float32Array(8),new Uint16Array([0,2,1,0,3,2]),null,null,true);
  {const bx=T[0]/2+0.8,P=[],N=[],I=[];const q=(x0,x1,y0,y1,z0,z1)=>{const b=P.length/3;const v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];for(const p of v){P.push(...p);N.push(0,1,0);}
     for(const f of [[0,1,2,0,2,3],[4,6,5,4,7,6],[0,4,5,0,5,1],[3,2,6,3,6,7],[0,3,7,0,7,4],[1,5,6,1,6,2]])for(const k of f)I.push(b+k);};
   q(bx,bx+0.4,0,1.45,-0.12,0.12);q(bx+0.08,bx+0.32,1.5,1.75,-0.1,0.1);draw(new Float32Array(P),new Float32Array(N),new Float32Array(P.length/3*2),new Uint16Array(I),null,[0.85,0.35,0.2],false);}
  for(const pt of m.partes){const d=dec(pt.b,pt.uv0,pt.uvS);
   if(pt.t){pend++;const img=new Image();img.onload=()=>{const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);draw(d.P,d.N,d.UV,d.I,tx,null,false);pend--;};img.src=pt.t;}
   else draw(d.P,d.N,d.UV,d.I,null,pt.cor,false);}}}
window.pronto=()=>pend===0;</script></body></html>'''
html = html.replace('__MODS__', json.dumps(mods))
caminho = os.path.join(os.path.dirname(os.path.abspath(SAI)), 'previa_lugx.html'); open(caminho, 'w').write(html)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = await b.new_page(viewport={'width': 1600, 'height': 300 + 270 * len(IDS)}, device_scale_factor=1)
        erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
        await pg.goto('file://' + caminho); await pg.wait_for_function('window.pronto&&window.pronto()', timeout=600000)
        await pg.wait_for_timeout(500); await pg.screenshot(path=SAI, full_page=True); print(SAI, erros[:3]); await b.close()
asyncio.run(main())
