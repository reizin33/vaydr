/* ================= Etapa 18: manual e ajuda dos reboques ================= */
{const _ms=mnSecObra;mnSecObra=function(k,tab){if(RTIPOS[k])return'mecanica';return _ms.apply(this,arguments);};}
MANUAL_EXTRA.push(()=>{const G_=(id,nome,icon,desc,est,ferr,proc,obs)=>({id,sec:'mecanica',nome,icon,trav:false,como:'desde o começo',desc,ing:{},est:{nome:est,icon,onde:''},ferr,proc,res:null,obs,tipo:'Guia'});
  return[G_('x:reboques','Reboques: engatar e dirigir','i-reboque','Leve o barco até a água ou um veículo quebrado até a base.','Onde: reboque de barco perto do cais do lago; plataforma no sítio do triciclo; ou construa (aba Oficina)',['Nenhuma'],
      ['Pare o veículo com a traseira na lança do reboque, desça e toque E na lança: engata. Toque de novo para desengatar.',
       'Puxam: caminhonete (tudo), carro (reboque de barco com barco; plataforma com moto ou triciclo) e triciclo (reboque vazio ou com a jangada). Moto não tem engate.',
       'Com reboque o veículo acelera menos, corre menos, freia mais longe, vira mais devagar e gasta mais gasolina, ainda mais com carga.',
       'Em ré o reboque dobra; se passar do ponto ele trava: ande para a frente para endireitar.'],
      ['Segure E no reboque para ver a carga, o guincho e quem consegue puxar.','O reboque de barco entra um pouco na água (rampa); fundo demais, ele para.']),
    G_('x:guincho','Guincho e carga presa','i-guincho','O guincho puxa o barco ou o veículo para cima do reboque, mesmo quebrado.','Onde: segure E no reboque',['2 cordas para prender a carga'],
      ['Segure E no reboque → Puxar com o guincho: puxa o barco (da água ou do chão) ou o carro, a moto ou o triciclo que estiver a até 16 m da traseira.',
       'Prenda a carga com 2 cordas antes de andar. Solta, ela escorrega numa freada forte, numa curva rápida ou numa batida e cai do reboque.',
       'Para descer: a plataforma desce o veículo pela rampa de trás (precisa de espaço); o reboque de barco põe o barco na água com a traseira na beira (até 10 m).',
       'Dá para consertar o veículo em cima do reboque: segure E nele.'],
      ['As cordas voltam quando você solta ou descarrega.','Quando chegar o mar, os reboques servem nas praias e nas docas também.']),
    G_('x:guinchoCam','Guincho da caminhonete','i-guincho','Um guincho na frente da caminhonete arrasta outro veículo até ela.','Onde: oficina do veículo (segure E na caminhonete)',['Kit de ferramentas'],
      ['Na oficina da caminhonete: Instalar guincho na frente (4 sucata, 2 corda e 1 peça de motor).','Depois: Puxar com o guincho traz o veículo parado mais perto (até 18 m) para a frente da caminhonete, mesmo quebrado ou na água rasa.'],
      ['Útil para tirar um carro afogado da beira do rio ou alinhar com a plataforma.'])];});
{const p=document.querySelector('#t-ajuda [data-e17p]');if(p&&!document.querySelector('#t-ajuda [data-e18p]'))p.insertAdjacentHTML('afterend','<p data-e18p>Reboques: há um reboque de barco perto do cais do lago e uma plataforma no sítio do triciclo (e dá para construir mais na aba Oficina). Pare a traseira da caminhonete (ou do carro) na lança, desça e toque E na lança para engatar. Segure E no reboque para puxar a carga com o guincho, prender com 2 cordas e descarregar. Carga solta cai numa freada forte. Com reboque o veículo fica mais lento e gasta mais.</p>');}
