"""p209: Etapa 25, correções achadas na conferência final: a vela agora vai na lamparina (no lugar dos 2 gravetos); um tipo de
construção que não existe não trava o modo de construção; os zumbis do Alto que não acham lugar para nascer ficam na conta e
nascem depois (o número guardado não some)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const RE=X('REG_ESTADO'),D=()=>X('arcD')(),vivos=()=>Z.filter(z=>z.vivo&&z.arc).length,"
     "passo=()=>X('regPasso')(0.6,true),ir=(x,z)=>{vai(x,z,X('chaoEm')(x,z,X('ground')(x,z)+1));passo();};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      # vela na lamparina
      e("velaCusto", "const co=X('custoObra');const g0=conta('graveto');if(g0)X('invRemove')('graveto',g0);const semVela=JSON.stringify(co('lamparina'));"
        "n.invAdd('vela',2);n.invAdd('sucata',6);n.invAdd('pano',3);return{semVela,comVela:JSON.stringify(co('lamparina')),parede:JSON.stringify(co('lampParede')),gravetos:conta('graveto')};"),
      e("velaColoca", "vai(F[0]+5,F[2]+4);P.yaw=0;P.pitch=-0.4;const n0=X('OB').length;try{X('modoObra')(true);X('OBRA').tipo='lamparina';X('obraAlvo')();X('colocarObra')();}finally{X('modoObra')(false);}"
        "const o=X('OB')[X('OB').length-1];return{colocou:X('OB').length===n0+1,tipo:o&&o.tipo,velas:conta('vela'),sucata:conta('sucata'),pano:conta('pano'),gravetos:conta('graveto')};"),
      # tipo de construção que não existe
      e("tipoInvalido", "let erro=null;try{X('modoObra')(true);X('OBRA').tipo='naoExiste';X('obraAlvo')();}catch(err){erro=String(err);}return{erro,tipoAgora:X('OBRA').tipo,existe:!!X('OBRAS')[X('OBRA').tipo]};"),
      ["gwait", 0.6],
      e("tipoInvalidoQuadros", "const t=X('OBRA').tipo;X('modoObra')(false);return{tipo:t,construindo:!!X('OBRA').ativo};"),
      # zumbis do Alto que não acham lugar
      j("ir(40,-232);"), ["gwait", 1.5],
      j("ir(40,-232);for(const z of Z)if(z.arc){z.vivo=false;}for(let i=Z.length-1;i>=0;i--)if(Z[i].arc)Z.splice(i,1);X('ARC_POV').feito=true;X('ARC_POV').faltam=0;const d=D();d.zVivos=-1;d.zDia=0;"
        "window.__pl=X('pontoLivre');X('pontoLivre=function(){return false;}');window.__k=X('arcPovoar')();"),
      e("semLugar", "return{nivel:RE.alto,nasceram:window.__k,vivos:vivos(),faltam:X('ARC_POV').faltam,guardados:D().zVivos};"),
      ["gwait", 2.0],
      e("semLugarDepois", "return{vivos:vivos(),faltam:X('ARC_POV').faltam,guardados:D().zVivos};"),
      j("X('pontoLivre=window.__pl');"),
      ["gwait", 16.0],
      e("comLugar", "return{vivos:vivos(),faltam:X('ARC_POV').faltam,guardados:D().zVivos};"),
      j("ir(0,0);"), ["gwait", 1.5],
      e("foiEmbora", "return{nivel:RE.alto,vivos:vivos(),guardados:D().zVivos};")]
salvar('p209.json', s, vp=(640, 360))
