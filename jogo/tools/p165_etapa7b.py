"""p165: zumbis e desafios (Etapa 7), parte B.
4 prédio-desafio (Armazém Norte): portas trancadas que não quebram nem forçam; fusível na caixa de ferramentas do Armazém Sul;
  pôr o fusível no quadro; puxar a alavanca liga a energia, abre o portão do estoque, toca o alarme (zumbis na rua e dois de
  emboscada no estoque); a mesa do supervisor tem o cartão; o cartão abre a sala de segurança; o armário tem coisas boas (com
  planta); dá para passar pelas portas abertas; salvar e carregar mantém tudo; um jogo salvo com a porta aberta à força volta a
  trancar; recomeça 5 dias depois, com você longe.
5 esconderijos sempre com recompensa: painel do Aurora (300 sorteios), alçapão do incêndio (500) e caixa enterrada (500).
6 chefes preservados."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const S=X('DSF'),D=()=>X('dsfD')(),pt=d=>d?d.estado:null,ids=c=>(c&&c.itens||[]).filter(Boolean).map(i=>i.id+'x'+i.n),"
     "pos=k=>X('dsfPos')(S[k]),portas=()=>({portao:pt(S.portao),cofre:pt(S.cofre),fundos:pt(S.fundos)});")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)z.vivo=false;n.Z.length=0;P.vida=100;};"
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;" + LIMPA),
      e("montado", "const p=S.p;const lv=k=>{const w=pos(k);return{x:r2(w[0]),z:r2(w[1]),livre:!X('pointBlocked')(w[0],w[1],0.25)};};"
                   "return{predio:p&&p.nome,portas:portas(),tiposPorta:[S.portao,S.cofre,S.fundos].map(d=>d&&d.tipo),quadro:lv('quadro'),alavanca:lv('alavanca'),"
                   "mesa:S.mesa&&{id:S.mesa.id,tab:S.mesa.tabela},armario:S.armario&&{id:S.armario.id,tab:S.armario.tabela},caixaSul:S.caixaSul&&{id:S.caixaSul.id,predio:S.caixaSul.p.nome},estado:D()};"),
      # portas: não quebram nem forçam
      j("n.invAdd('peDeCabra',1);const d=S.portao;window.__hp0=d.hp;X('danoPorta')(d,500,false);X('danoPorta')(d,500,true);X('portaUsar')(d,true);X('portaUsar')(S.cofre,true);X('portaUsar')(S.fundos,true);"),
      e("portasFortes", "return{portas:portas(),hp:[window.__hp0,S.portao.hp],textos:[S.portao,S.cofre,S.fundos].map(d=>X('portaTexto')(d).t)};"),
      # o fusível no Armazém Sul
      j("X('abrirCont')(S.caixaSul);X('fecharMochila')();"),
      e("caixaSul", "return{itens:ids(S.caixaSul)};"),
      j("const c=S.caixaSul;const i=c.itens.findIndex(q=>q&&q.id==='fusivel');if(i>=0){c.itens[i]=null;n.invAdd('fusivel',1);}"),
      # quadro e alavanca
      j("const w=pos('quadro');vai(w[0],w[1],S.ya);const p=S.p,c=X('pw')(p,S.quadro.u,S.vQ);mira(c[0],S.ya+1.1,c[1]);"), ["gwait", 0.3],
      e("noQuadro", "const a=X('interAtual')();return{alvo:a&&a.k,texto:a&&X('textoInter')(a),alavanca:X('INTER_K').dsf_alavanca.texto().t};"),
      j("X('INTER_K').dsf_alavanca.usar(S.alavanca,true);window.__semFus=JSON.stringify(D());X('INTER_K').dsf_quadro.usar();"),
      e("fusivel", "return{antes:window.__semFus,depois:D(),fusiveis:conta('fusivel'),texto:X('INTER_K').dsf_alavanca.texto()};"),
      j("window.__cadaPasso=null;window.__z0=Z.filter(z=>z.vivo).length;X('INTER_K').dsf_alavanca.usar(S.alavanca,true);const L=Z.filter(z=>z.vivo);"
        "window.__alarme={total:L.length-window.__z0,rua:L.filter(z=>z.st==='alerta').length,emboscada:L.filter(z=>z.tipo==='emboscada'&&z.st==='dorme').map(z=>{const s=X('salaEm')(z.x,z.y+0.3,z.z);return s&&s.tipo;})};" + LIMPA),
      e("ligou", "return{estado:D(),portas:portas(),alarme:window.__alarme,passaPortao:!X('pointBlocked')(S.portao.x,S.portao.z,0.2)};")]
s += foto('p165_quadro.png', H + "const p=S.p,w=X('pw')(p,S.quadro.u+0.45,S.vQ-2.2);vai(w[0],w[1],S.ya);const c=X('pw')(p,S.quadro.u+0.45,S.vQ);mira(c[0],S.ya+1.1,c[1]);n.cfg.cam='1';", 0.3, 3.0)
s += [j("n.cfg.cam='3';"),
      # cartão na mesa do supervisor e a sala de segurança
      j("X('abrirCont')(S.mesa);X('fecharMochila')();"),
      e("mesa", "return{itens:ids(S.mesa)};"),
      j("const c=S.mesa;const i=c.itens.findIndex(q=>q&&q.id==='cartaoArmazem');if(i>=0){c.itens[i]=null;n.invAdd('cartaoArmazem',1);}window.__xp0=G.xp+G.nivel*1000;window.__txt=X('portaTexto')(S.cofre);X('portaUsar')(S.cofre,false);"),
      e("cartao", "return{texto:window.__txt,portas:portas(),estado:D(),cartoes:conta('cartaoArmazem'),passa:!X('pointBlocked')(S.cofre.x,S.cofre.z,0.2)};"),
      j("X('abrirCont')(S.armario);X('fecharMochila')();"),
      e("armario", "return{itens:ids(S.armario)};"),
      # salvar e carregar
      j("X('salvarJogo')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;" + LIMPA), ["gwait", 0.3],
      e("carregou", "return{estado:D(),portas:portas(),armario:ids(X('DSF').armario)};"),
      # jogo salvo com o portão aberto à força (estado sem energia): volta a trancar
      j("const d=D();d.luz=false;d.cartao=false;X('portaEstado')(S.portao,'aberta');X('portaEstado')(S.cofre,'quebrada');X('salvarJogo')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;" + LIMPA), ["gwait", 0.3],
      e("voltouATrancar", "return{estado:D(),portas:portas()};"),
      # recomeço: 5 dias depois de concluído, com você longe
      j("const d=D();d.fus=true;d.luz=true;d.cartao=true;d.fim=G.dia-5;vai(F[0]+3,F[2]+3);"), ["gwait", 3],
      e("recomecou", "return{estado:D(),portas:portas(),mesa:S.mesa.estado,armario:S.armario.estado,caixaSul:S.caixaSul.estado};")]
# 5) esconderijos
s += [e("esconderijos", "const A=X('CID').predios.find(p=>p.nome==='Edifício Aurora').esconderijoC,B=X('CID').predios.find(p=>p.nome==='Edifício Bela Vista').esconderijoC;"
                        "const teste=c=>{let vaz=0,min=99;for(let k=0;k<300;k++){c.estado='fechado';c.itens=null;X('contEncher')(c);const q=(c.itens||[]).filter(Boolean).length;if(!q)vaz++;min=Math.min(min,q);}c.estado='fechado';c.itens=null;return{vazios:vaz,minimo:min};};"
                        "let vF=0,mF=99;for(let k=0;k<500;k++){const L=X('rollLoot')('esconderijo');if(!L.length)vF++;mF=Math.min(mF,L.length);}"
                        "let vC=0,mC=99;for(let k=0;k<500;k++){const L=X('sortearConteudo')('escondida');if(!L.length)vC++;mC=Math.min(mC,L.length);}"
                        "return{aurora:teste(A),belaVista:teste(B),incendio:{vazios:vF,minimo:mF},caixaEnterrada:{vazios:vC,minimo:mC,chanceVazia:X('CAIXA_CFG').vazia.escondida}};"),
      # 6) chefes
      e("chefes", "return{chefesR:X('CHEFES_R').map(c=>c.id+':'+(X('ZS')[c.id]?X('ZS')[c.id].hp:'?')),colosso:X('ZS').colosso&&X('ZS').colosso.hp,criarChefe:typeof X('criarChefe'),conq:X('CONQ').filter(c=>c.id==='caixaMilitar'||c.id==='armazemNorte').map(c=>c.nome)};")]
salvar('p165.json', s)
