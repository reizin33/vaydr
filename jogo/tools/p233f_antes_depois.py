"""p233f (Parte 2): fotos de antes e depois da borda aberta, do mesmo lugar e do mesmo ângulo, nas duas versões.
Uso: python3 tools/p233f_antes_depois.py antes   (roda com SRC=versão antiga)
     python3 tools/p233f_antes_depois.py depois  (roda com SRC=versão nova)
1 do círculo antigo (r=140), olhando para oeste: antes a parede de mato a 10 m; depois a mata subindo o morro
2 do círculo antigo ao sul (r=140), olhando para o sul
3 o mapa grande"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
q = sys.argv[1] if len(sys.argv) > 1 else 'depois'
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=11;")]
s += foto(q + "_oeste.png", "vai(-140,3);P.yaw=-Math.PI/2;P.body=P.yaw;P.pitch=-0.03;G.hora=11;")
s += foto(q + "_sul.png", "vai(-24,138);P.yaw=0.1;P.body=P.yaw;P.pitch=-0.03;G.hora=11;")
s += [js("vai(-140,3);X('regD')().morros&&(X('regD')().morros.descoberta=1);X('abrirMapa')();window.__semRender=false;window.__turbo=1;"), ["wait", 2.5], ["shot", q + "_mapa.png"],
      js("X('fecharMapa')();window.__semRender=true;window.__turbo=6;")]
salvar('tools/p233f_' + q + '.json', s, vp=(960, 540))
