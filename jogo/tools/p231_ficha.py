"""p231: ficha de cada arma na mochila (texto que o jogo monta): sem 'NaN', com tipo, dano, cabeça e o resto."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio()
s += [ev("fichas", "const I=X('ITEMS'),f=X('statsItem'),r={};for(const id of['pistola','espingarda','rifle','besta','arco','facao','machado','faca','molotov','bombaCaseira']){"
         "const d=I[id],h=f({id,n:1,mun:d.pente||0,dur:d.durMax},d),t=h.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim();r[id]={nan:/NaN/.test(h),texto:t.slice(0,240)};}return r;")]
salvar('tools/p231_ficha.json', s, vp=(1280, 720))
