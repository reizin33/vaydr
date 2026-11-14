"""Ícones da mochila tirados dos modelos 3D de verdade (prévia renderizada FORA do jogo, no Chromium).
Cada item com modelo vira uma foto 256x256 de fundo transparente, na mesma luz para todos:
  · ferramenta e arma comprida (machado, facão, taco, pé de cabra...) deitada na diagonal, mostrando o lado largo
  · coisa chata (caderno, cartão, mapa) vista de cima, um pouco inclinada
  · o resto (lata, galão, caixa, fruta) em pé, de três quartos
Uso: python3 -I tools/icones3d.py mapa.json pasta_saida [folha.png]
mapa.json: {"itemId": {"m": "caminho/modelo.glb ou .zip", "rot": [rx, ry, rz] (graus, depois da arrumação automática),
            "jeito": "auto|comprido|chato|empe", "zoom": 1.0, "so": "nome de material (só as partes com esse nome)"}}"""
import sys, os, io, json, base64, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
import lugares_banco as LB

MAPA, SAI = json.load(open(sys.argv[1])), sys.argv[2]
FOLHA = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None
PASTAS = sys.argv[4].split(':') if len(sys.argv) > 4 else []          # onde procurar os modelos pelo nome (ph_<nome>.glb, <nome>.glb)
JS = sys.argv[5] if len(sys.argv) > 5 else None                        # arquivo do jogo com os ícones (WebP 128 px)
def acha(m):
    if os.path.exists(m): return m
    for d in PASTAS:
        for n in ('ph_' + m + '.glb', m + '.glb', m):
            if os.path.exists(os.path.join(d, n)): return os.path.join(d, n)
    raise FileNotFoundError(m)
os.makedirs(SAI, exist_ok=True)

def tex_url(z, nome, lado=512):
    try:
        im = Image.open(io.BytesIO(z.read(nome)))
    except Exception:
        return None
    alfa = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alfa else 'RGB')
    if max(im.size) > lado:
        k = lado / max(im.size); im = im.resize((max(1, int(im.size[0] * k)), max(1, int(im.size[1] * k))), Image.LANCZOS)
    b = io.BytesIO()
    if alfa: im.save(b, 'PNG'); mt = 'png'
    else: im.save(b, 'JPEG', quality=88); mt = 'jpeg'
    return 'data:image/%s;base64,%s' % (mt, base64.b64encode(b.getvalue()).decode())

def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()

def preparar(item, cfg):
    z, partes = LB.ler_gltf(acha(cfg['m']))
    if cfg.get('so'): partes = [p for p in partes if cfg['so'].lower() in p['nome'].lower()] or partes
    if cfg.get('caixa'):   # só o pedaço do modelo dentro desta caixa (frações da caixa inteira: x0,x1,y0,y1,z0,z1), p.ex. um item de um conjunto
        P = np.concatenate([p['P'] for p in partes]); lo, hi = P.min(0), P.max(0); cx = cfg['caixa']
        a0 = lo + (hi - lo) * np.array(cx[0::2]); a1 = lo + (hi - lo) * np.array(cx[1::2]); novas = []
        for p in partes:
            ce = p['P'][p['I']].mean(1); m = np.all((ce >= a0) & (ce <= a1), axis=1)
            if m.any():   # só os vértices usados (o enquadramento olha todos os vértices da parte)
                I = p['I'][m]; usados, novo = np.unique(I, return_inverse=True)
                novas.append(dict(p, P=p['P'][usados], UV=p['UV'][usados], I=novo.reshape(-1, 3)))
        partes = novas
    P = np.concatenate([p['P'][np.unique(p['I'])] for p in partes]); c = (P.min(0) + P.max(0)) / 2; R = np.linalg.norm(P - c, axis=1).max() or 1
    out = []
    for p in partes:
        V = (p['P'] - c) / R; I = p['I'].astype(np.int64)
        if len(I) > 60000:   # modelo pesado: um a cada tantos triângulos não muda o ícone, mas a normal fica igual
            pass
        A, B, C = V[I[:, 0]], V[I[:, 1]], V[I[:, 2]]; fn = np.cross(B - A, C - A)
        N = np.zeros_like(V); np.add.at(N, I[:, 0], fn); np.add.at(N, I[:, 1], fn); np.add.at(N, I[:, 2], fn)
        N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
        fator = p['fator'] if p.get('fator') else [1, 1, 1, 1]
        out.append({'P': b64(V.astype('<f4')), 'N': b64(N.astype('<f4')), 'UV': b64(p['UV'].astype('<f4')), 'I': b64(I.astype('<u4')),
                    'n': int(len(I) * 3), 't': tex_url(z, p['img']) if p['img'] else None, 'f': [float(v) for v in fator[:4]]})
    return {'id': item, 'partes': out, 'rot': cfg.get('rot', [0, 0, 0]), 'jeito': cfg.get('jeito', 'auto'), 'zoom': cfg.get('zoom', 1.0)}

HTML = r'''<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="512" height="512"></canvas><script>
const cv=document.getElementById('c'),gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:true});
const VS=`#version 300 es
in vec3 p;in vec3 n;in vec2 t;uniform mat4 M;uniform mat3 R;out vec3 vn;out vec2 vt;out float vz;void main(){vn=R*n;vt=t;vec4 q=M*vec4(p,1.0);vz=q.z;gl_Position=q;}`;
const FS=`#version 300 es
precision highp float;in vec3 vn;in vec2 vt;in float vz;uniform sampler2D T;uniform int hasT;uniform vec4 F;out vec4 o;
void main(){vec4 a=hasT==1?texture(T,vt):vec4(1.0);if(a.a<0.4)discard;vec3 c=pow(a.rgb,vec3(2.2))*pow(F.rgb,vec3(1.0));
 vec3 N=normalize(vn);if(!gl_FrontFacing)N=-N;
 vec3 L1=normalize(vec3(-0.45,0.75,0.6)),L2=normalize(vec3(0.7,0.2,0.35)),L3=normalize(vec3(0.1,0.5,-0.9));
 float d=max(dot(N,L1),0.0)*1.05+max(dot(N,L2),0.0)*0.35+0.32+0.18*N.y;
 float rim=pow(1.0-max(N.z,0.0),3.0)*0.35+max(dot(N,L3),0.0)*0.25;
 vec3 h=normalize(L1+vec3(0,0,1));float s=pow(max(dot(N,h),0.0),40.0)*0.25;
 vec3 col=c*d+vec3(rim*0.6)+vec3(s);col=col/(1.0+col*0.25);o=vec4(pow(col,vec3(1.0/2.2)),1.0);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o;}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const U=k=>gl.getUniformLocation(pr,k);
function dec(b,T){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new T(u.buffer);}
const mul3=(a,b)=>{const r=new Array(9).fill(0);for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)r[i*3+j]+=a[i*3+k]*b[k*3+j];return r;};
const rx=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c];},ry=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c];},rz=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1];};
const ap=(R,v)=>[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
function loadImg(u){return new Promise(r=>{if(!u)return r(null);const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=u;});}
window.foto=async function(M){gl.viewport(0,0,512,512);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 const partes=[];for(const p of M.partes){partes.push({P:dec(p.P,Float32Array),N:dec(p.N,Float32Array),UV:dec(p.UV,Float32Array),I:dec(p.I,Uint32Array),img:await loadImg(p.t),f:p.f});}
 /* eixos principais (caixa): comprido, médio e curto */
 let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const p of partes)for(let i=0;i<p.P.length;i+=3)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p.P[i+k]);hi[k]=Math.max(hi[k],p.P[i+k]);}
 const d=[0,1,2].map(k=>hi[k]-lo[k]),ord=[0,1,2].sort((a,b)=>d[b]-d[a]);let jeito=M.jeito;
 if(jeito==='auto')jeito=d[ord[0]]>2.2*d[ord[1]]?'comprido':d[ord[2]]<0.16*d[ord[1]]?'chato':'empe';
 const E=k=>{const v=[0,0,0];v[k]=1;return v;};let R;
 if(jeito==='comprido'){const a=E(ord[0]),b=E(ord[2]),c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];   // comprido -> x, curto -> z (lado largo para a câmera)
   R=[a[0],a[1],a[2],c[0]*-1,c[1]*-1,c[2]*-1,b[0],b[1],b[2]];R=mul3(rz(0.72),R);R=mul3(rx(-0.28),mul3(ry(0.35),R));}
 else if(jeito==='chato'){const a=E(ord[0]),b=E(ord[2]),c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
   R=[a[0],a[1],a[2],c[0]*-1,c[1]*-1,c[2]*-1,b[0],b[1],b[2]];R=mul3(rx(-0.55),mul3(rz(0.25),R));}
 else{R=mul3(rx(0.38),ry(-0.62));}
 R=mul3(rz(M.rot[2]*Math.PI/180),mul3(rx(M.rot[0]*Math.PI/180),mul3(ry(M.rot[1]*Math.PI/180),R)));
 /* enquadra: caixa da peça já girada (câmera ortográfica) */
 let a0=[1e9,1e9,1e9],a1=[-1e9,-1e9,-1e9];for(const p of partes)for(let i=0;i<p.P.length;i+=3){const v=ap(R,[p.P[i],p.P[i+1],p.P[i+2]]);for(let k=0;k<3;k++){a0[k]=Math.min(a0[k],v[k]);a1[k]=Math.max(a1[k],v[k]);}}
 const cx=(a0[0]+a1[0])/2,cy=(a0[1]+a1[1])/2,cz=(a0[2]+a1[2])/2,s=0.86*M.zoom*2/Math.max(a1[0]-a0[0],a1[1]-a0[1]),dz=Math.max(a1[2]-a0[2],1e-3);
 /* M = ortho * R (coluna: gl usa coluna) */
 const m=[R[0]*s,R[3]*s,-R[6]/dz,0, R[1]*s,R[4]*s,-R[7]/dz,0, R[2]*s,R[5]*s,-R[8]/dz,0, -cx*s,-cy*s,cz/dz,1];
 gl.uniformMatrix4fv(U('M'),false,new Float32Array(m));gl.uniformMatrix3fv(U('R'),true,new Float32Array(R));
 for(const p of partes){const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  for(const[nm,arr,sz]of[['p',p.P,3],['n',p.N,3],['t',p.UV,2]]){const l=gl.getAttribLocation(pr,nm);if(l<0)continue;const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,sz,gl.FLOAT,false,0,0);}
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,p.I,gl.STATIC_DRAW);
  if(p.img){const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,p.img);gl.generateMipmap(gl.TEXTURE_2D);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.uniform1i(U('hasT'),1);}else gl.uniform1i(U('hasT'),0);
  gl.uniform4fv(U('F'),p.f);gl.drawElements(gl.TRIANGLES,p.I.length,gl.UNSIGNED_INT,0);}
 return {url:cv.toDataURL('image/png'),jeito};};
</script></body></html>'''

async def main():
    from playwright.async_api import async_playwright
    pag = os.path.join(SAI, '_icones.html'); open(pag, 'w').write(HTML)
    feitos = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = await b.new_page(viewport={'width': 512, 'height': 512}); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)))
        await pg.goto('file://' + pag)
        for item, cfg in MAPA.items():
            try:
                M = preparar(item, cfg)
                r = await pg.evaluate('M=>window.foto(M)', M)
                raw = base64.b64decode(r['url'].split(',', 1)[1]); im = Image.open(io.BytesIO(raw)).convert('RGBA').resize((256, 256), Image.LANCZOS)
                im.save(os.path.join(SAI, item + '.png')); feitos[item] = r['jeito']; print(item, r['jeito'], flush=True)
            except Exception as e:
                print(item, 'ERRO', str(e)[:200], flush=True)
        await b.close()
        if erros: print('erros da página:', erros[:3])
    if JS and feitos:
        linhas = []
        for it in feitos:
            im = Image.open(os.path.join(SAI, it + '.png')).convert('RGBA').resize((128, 128), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'WEBP', quality=86, method=6)
            linhas.append('%s:"data:image/webp;base64,%s"' % (json.dumps(it), base64.b64encode(b.getvalue()).decode()))
        open(JS, 'w').write('/* ícones da mochila tirados dos modelos 3D (tools/icones3d.py, mapa em tools/icones3d_mapa.json). Gerado: não editar à mão. */\n'
                            'const ICO3D={\n' + ',\n'.join(linhas) + '};\n')
        print('js', JS, os.path.getsize(JS))
    if FOLHA and feitos:
        from PIL import ImageDraw
        ids = list(feitos); col = 8; lin = (len(ids) + col - 1) // col; W = Image.new('RGB', (col * 150, lin * 170 + 40), (34, 30, 26)); dr = ImageDraw.Draw(W)
        dr.text((10, 12), 'PREVIA RENDERIZADA FORA DO JOGO - icones da mochila tirados dos modelos 3D', fill=(240, 200, 120))
        for i, it in enumerate(ids):
            x, y = (i % col) * 150, (i // col) * 170 + 40
            dr.rounded_rectangle((x + 8, y + 4, x + 142, y + 138), 10, fill=(58, 50, 42), outline=(110, 90, 60))
            ic = Image.open(os.path.join(SAI, it + '.png')).resize((120, 120), Image.LANCZOS); W.paste(ic, (x + 15, y + 11), ic)
            dr.text((x + 10, y + 144), it[:22], fill=(230, 220, 200))
        W.save(FOLHA); print('folha', FOLHA)

asyncio.run(main())
