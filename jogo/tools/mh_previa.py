"""Prévia FORA DO JOGO do corpo do MakeHuman (saída do mh_corpo.py): página WebGL2 com quatro vistas (frente, três quartos,
costas, e um quadro com o rosto em cima e os pés descalços embaixo), marcada "PRÉVIA FORA DO JOGO". Com o nome de um .png no fim,
também fotografa a página (Chromium sem placa de vídeo) para mandar ao dono.
Uso: python3 -I tools/mh_previa.py corpo.json PASTA_DATA_DO_MAKEHUMAN saida.html [foto.png]"""
import sys, os, json, base64, struct, io, asyncio
JS, D, SAI = sys.argv[1], sys.argv[2], sys.argv[3]
FOTO = sys.argv[4] if len(sys.argv) > 4 else None
d = json.load(open(JS))

def b64(fmt, arr): return base64.b64encode(struct.pack('<%d%s' % (len(arr), fmt), *arr)).decode()
anos = 25 + 130 * (d['parametros']['idade'] - 0.5) if d['parametros']['idade'] >= 0.5 else 1 + 48 * d['parametros']['idade']
alt = d['altura_m']
olhos = d.get('olhos'); tex = ''
if olhos:
    # olhos sem índice: posição, normal e UV por canto de triângulo (a UV muda na costura da textura)
    P, N, U, T = olhos['pos'], olhos['nor'], olhos['uv'], olhos['tri']
    EP, EN = [], []
    for i in T: EP += P[i * 3:i * 3 + 3]; EN += N[i * 3:i * 3 + 3]
    EU = U
    from PIL import Image
    im = Image.open(os.path.join(D, olhos['textura'])).convert('RGBA').resize((512, 512), Image.LANCZOS)
    bf = io.BytesIO(); im.save(bf, 'PNG', optimize=True); tex = 'data:image/png;base64,' + base64.b64encode(bf.getvalue()).decode()

dados = ('const POS=new Float32Array(b("%s"));const NOR=new Float32Array(b("%s"));const TRI=new Uint32Array(b("%s"));'
         % (b64('f', d['pos']), b64('f', d['nor']), b64('I', d['tri'])))
if olhos: dados += ('const EP=new Float32Array(b("%s"));const EN=new Float32Array(b("%s"));const EU=new Float32Array(b("%s"));const ETEX="%s";'
                    % (b64('f', EP), b64('f', EN), b64('f', EU), tex))
else: dados += 'const EP=null;'
sub = ('Corpo base do MakeHuman (CC0) com as medidas do sobrevivente: homem de %d anos, em forma, %s m, com os olhos do MakeHuman encaixados. '
       'Ainda sem a pele, o cabelo, a barba e as sobrancelhas de verdade, que vêm nos arquivos que você vai mandar. A bermuda aqui é só cor.'
       % (round(anos), ('%.2f' % alt).replace('.', ',')))

html = r'''<!doctype html><html><head><meta charset="utf-8"><title>Prévia do corpo</title><style>
body{margin:0;background:#0b0d0e;color:#ece4d2;font:600 15px system-ui,sans-serif;overflow:hidden}
canvas{display:block;width:100vw;height:100vh}
.et{position:fixed;left:24px;top:18px;padding:8px 14px;background:#5a3c8c;color:#fff;font:800 17px system-ui;letter-spacing:.04em;border-radius:4px}
.sub{position:fixed;left:24px;top:62px;color:#c9c2b2;font:600 14px system-ui;max-width:1500px}
.r{position:fixed;bottom:16px;font:700 13px system-ui;color:#a9ae9f;letter-spacing:.12em;text-transform:uppercase}
</style></head><body><canvas id="c"></canvas>
<div class="et">PRÉVIA FORA DO JOGO</div>
<div class="sub">__SUB__</div>
<div class="r" style="left:5%">frente</div><div class="r" style="left:30%">três quartos</div><div class="r" style="left:55%">costas</div><div class="r" style="left:80%">rosto e pés descalços</div>
<script>
const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer;
__DADOS__
const cv=document.getElementById('c'),gl=cv.getContext('webgl2',{antialias:true});const W=cv.width=innerWidth,H=cv.height=innerHeight;
const LUZ=`vec3 L1=normalize(F*.75+R*.55+vec3(0.,.9,0.)),L2=normalize(-R*.8+F*.3+vec3(0.,.4,0.)),L3=normalize(-F+vec3(0.,.6,0.));`;
const vs=`#version 300 es
in vec3 p;in vec3 n;in vec2 u;uniform mat4 M;out vec3 vn;out vec3 vp;out vec2 vu;void main(){vn=n;vp=p;vu=u;gl_Position=M*vec4(p,1.);}`;
// pele: luz que "dobra" (wrap), um pouco de vermelho por baixo da pele (subsuperfície) e brilho fraco
const fsPele=`#version 300 es
precision highp float;in vec3 vn;in vec3 vp;in vec2 vu;uniform vec3 E;uniform vec3 R;uniform vec3 F;uniform float A;out vec4 o;
void main(){vec3 vc=vec3(.80,.60,.48);float y=vp.y/A;if(y>.335&&y<.585&&abs(vp.x)<.215){vc=vec3(.20,.27,.33);if(y>.565)vc*=.7;}
vec3 N=normalize(vn),V=normalize(E-vp);${LUZ}
float w=.35;float d1=max(0.,(dot(N,L1)+w)/(1.+w)),d2=max(0.,(dot(N,L2)+w)/(1.+w))*.35,rim=pow(1.-max(0.,dot(N,V)),3.)*.35;
vec3 sss=vec3(.25,.06,.03)*smoothstep(.0,.35,1.-abs(dot(N,L1)));vec3 H=normalize(L1+V);float sp=pow(max(0.,dot(N,H)),40.)*.12;
vec3 amb=mix(vec3(.10,.09,.08),vec3(.22,.24,.27),N.y*.5+.5);vec3 col=vc*(d1*vec3(1.,.95,.88)+d2*vec3(.6,.7,.85)+amb)+vc*sss*.6+sp+rim*vec3(.55,.6,.7)*max(0.,dot(N,L3)+.4);
col=pow(col,vec3(1./1.15));o=vec4(col,1.);}`;
// olho: o globo usa a textura do MakeHuman; a córnea (parte transparente da textura) só dá o brilho molhado por cima
const fsOlho=`#version 300 es
precision highp float;in vec3 vn;in vec3 vp;in vec2 vu;uniform vec3 E;uniform vec3 R;uniform vec3 F;uniform sampler2D T;uniform int corn;out vec4 o;
void main(){vec4 t=texture(T,vu);vec3 N=normalize(vn),V=normalize(E-vp);${LUZ}
if(corn==0){if(t.a<.5)discard;float d=max(0.,dot(N,L1))*.42+max(0.,dot(N,L2))*.1+.58;float lum=dot(t.rgb,vec3(.3,.59,.11));
vec3 c=t.rgb*mix(1.1,1.5,smoothstep(.2,.45,lum))*d*vec3(1.,.96,.91);c=mix(vec3(dot(c,vec3(.3,.59,.11))),c,.78);o=vec4(min(vec3(1.),c),1.);}
else{if(t.a>=.5)discard;vec3 H=normalize(L1+V);float sp=pow(max(0.,dot(N,H)),260.)*1.6+pow(max(0.,dot(N,normalize(L2+V))),200.)*.5;
float fr=pow(1.-max(0.,dot(N,V)),4.)*.18;float a=clamp(sp+fr,0.,1.);o=vec4(vec3(sp+fr*.7),a);}}`;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x;}
function prog(f){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.bindAttribLocation(p,0,'p');gl.bindAttribLocation(p,1,'n');gl.bindAttribLocation(p,2,'u');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);return p;}
function vao(lista,idx){const v=gl.createVertexArray();gl.bindVertexArray(v);lista.forEach(([arr,k],i)=>{if(!arr)return;const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,k,gl.FLOAT,false,0,0);});
 if(idx){const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);}gl.bindVertexArray(null);return v;}
const pPele=prog(fsPele),pOlho=prog(fsOlho),vCorpo=vao([[POS,3],[NOR,3]],TRI),vOlho=EP?vao([[EP,3],[EN,3],[EU,2]]):null;
function mul(a,b){const r=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];r[i*4+j]=s;}return r;}
function persp(f,a,n,fa){const t=1/Math.tan(f/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]);}
function look(e,c){const z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z[0]/=l;z[1]/=l;z[2]/=l;const x=[z[2],0,-z[0]];l=Math.hypot(...x);x[0]/=l;x[2]/=l;const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
 return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]);}
const A=__ALT__,vw=W/4,vh=H-110;
const vistas=[[0,20,vh,[0,A*.55,4.3],[0,A*.5,0],.6],[1,20,vh,[2.9,A*.62,3.1],[0,A*.5,0],.6],[2,20,vh,[0,A*.55,-4.3],[0,A*.5,0],.6],
  [3,20+vh/2+6,vh/2-6,[.27,A*.94,.66],[0,A*.928,.01],.5],[3,20,vh/2-6,[.38,.42,1.05],[0,.05,.12],.5]];
function uni(p,M,e,c){gl.useProgram(p);gl.uniformMatrix4fv(gl.getUniformLocation(p,'M'),false,M);gl.uniform3fv(gl.getUniformLocation(p,'E'),e);
 const f=[c[0]-e[0],0,c[2]-e[2]],l=Math.hypot(f[0],f[2]);f[0]/=-l;f[2]/=-l;gl.uniform3fv(gl.getUniformLocation(p,'F'),f);gl.uniform3fv(gl.getUniformLocation(p,'R'),[f[2],0,-f[0]]);
 const a=gl.getUniformLocation(p,'A');if(a)gl.uniform1f(a,A);}
function desenhar(){gl.enable(gl.DEPTH_TEST);gl.clearColor(.043,.051,.055,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 for(const[i,y0,hh,e,c,f]of vistas){gl.viewport(i*vw,y0,vw,hh);const M=mul(persp(f,vw/hh,.02,50),look(e,c));
  uni(pPele,M,e,c);gl.bindVertexArray(vCorpo);gl.drawElements(gl.TRIANGLES,TRI.length,gl.UNSIGNED_INT,0);
  if(vOlho){uni(pOlho,M,e,c);gl.uniform1i(gl.getUniformLocation(pOlho,'T'),0);gl.bindVertexArray(vOlho);
   gl.uniform1i(gl.getUniformLocation(pOlho,'corn'),0);gl.drawArrays(gl.TRIANGLES,0,EP.length/3);
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1i(gl.getUniformLocation(pOlho,'corn'),1);gl.drawArrays(gl.TRIANGLES,0,EP.length/3);
   gl.depthMask(true);gl.disable(gl.BLEND);}}
 window.__pronto=true;}
if(EP){const im=new Image();im.onload=()=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);desenhar();};im.src=ETEX;}
else desenhar();
</script></body></html>'''
html = html.replace('__SUB__', sub).replace('__DADOS__', dados).replace('__ALT__', '%.3f' % alt)
open(SAI, 'w', encoding='utf-8').write(html)
print(json.dumps({'html': SAI, 'kb': round(len(html) / 1024), 'olhos': bool(olhos), 'anos': round(anos, 1)}))

if FOTO:
    from playwright.async_api import async_playwright
    async def foto():
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
            pg = await b.new_page(viewport={'width': 1920, 'height': 1080}); erros = []
            pg.on('pageerror', lambda e: erros.append(str(e)[:300])); pg.on('console', lambda m: erros.append(m.text[:300]) if m.type == 'error' else None)
            await pg.goto('file://' + os.path.abspath(SAI)); await pg.wait_for_function('window.__pronto===true', timeout=180000)
            await pg.screenshot(path=FOTO); await b.close()
            print(json.dumps({'foto': FOTO, 'erros': erros}))
    asyncio.run(foto())
