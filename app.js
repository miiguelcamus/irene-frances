(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var H=window.IF_HOURS||[],RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// parallax suave de los arcos del fondo
var FA=$('.framas');
if(FA&&!RM){var tf=0;addEventListener('scroll',function(){if(tf)return;tf=requestAnimationFrame(function(){tf=0;FA.style.transform='translate3d(0,'+(-scrollY*.05).toFixed(1)+'px,0)'})},{passive:true})}


// cabecera
var top=$('.top'),VID=$$('.vidrio,.rd'),tkv=0;function sc(){if(top)top.classList.toggle('sc',scrollY>30);if(tkv)return;tkv=requestAnimationFrame(function(){tkv=0;var a=(135+scrollY*.12)%360;VID.forEach(function(v){v.style.setProperty('--ang',a+'deg')})})}sc();addEventListener('scroll',sc,{passive:true});
var bg=$('.burger'),mm=$('.mm');
if(bg)bg.addEventListener('click',function(){var o=bg.getAttribute('aria-expanded')!=='true';bg.setAttribute('aria-expanded',o);mm.classList.toggle('on',o);mm.setAttribute('aria-hidden',!o);document.body.style.overflow=o?'hidden':'';sc()});
$$('.mm a').forEach(function(a){a.addEventListener('click',function(){if(bg.getAttribute('aria-expanded')==='true')bg.click()})});

// abierto ahora (lunes = 0)
function mins(t){var p=t.split(':');return +p[0]*60+ +p[1]}
var now=new Date(),wd=(now.getDay()+6)%7,m=now.getHours()*60+now.getMinutes(),txt=null,open=false,NOM=['el lunes','el martes','el miércoles','el jueves','el viernes','el sábado','el domingo'];
(H[wd]||[]).forEach(function(r){if(m>=mins(r[0])&&m<mins(r[1])){open=true;txt='Abierto ahora · hasta las '+r[1]}});
if(!open){var hoy=(H[wd]||[]).filter(function(r){return mins(r[0])>m})[0];
 if(hoy)txt='Cerrado ahora · abre a las '+hoy[0];
 else for(var i=1;i<8;i++){var d=(wd+i)%7;if(H[d]&&H[d].length){txt='Cerrado · abre '+(i===1?'mañana':NOM[d])+' a las '+H[d][0][0];break}}}
$$('[data-open]').forEach(function(b){b.lastElementChild.textContent=txt;b.classList.toggle('cl',!open)});
$$('.hours li').forEach(function(li){if(+li.dataset.d===now.getDay())li.classList.add('today')});

// aparición escalonada por grupo
var io='IntersectionObserver' in window&&!RM?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -30px'}):null;
var g=new Map();
$$('.rv').forEach(function(el){var p=el.parentElement,n=g.get(p)||0;g.set(p,n+1);if(io){el.style.transitionDelay=Math.min(n,7)*90+'ms';io.observe(el)}else el.classList.add('in')});

// mapa del cuerpo: cada punto enseña qué se trata ahí
var MP=$('.mapa');
if(MP){var zs=$$('[data-z]',MP),fs=$$('[data-zf]',MP),cs=$$('[data-zc]',MP),za=5,auto=!RM,ti;
 function zona(i){za=i;zs.forEach(function(z,k){z.classList.toggle('on',k===i);z.setAttribute('aria-pressed',k===i)});fs.forEach(function(f,k){f.hidden=k!==i});cs.forEach(function(c,k){c.classList.toggle('on',k===i)})}
 function para(){auto=false;clearInterval(ti)}
 zs.forEach(function(z,k){z.addEventListener('click',function(){para();zona(k)});z.addEventListener('mouseenter',function(){para();zona(k)})});
 cs.forEach(function(c,k){c.addEventListener('click',function(){para();zona(+c.dataset.zc)})});
 zona(5);
 if(auto){var vis=false;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(MP);ti=setInterval(function(){if(auto&&vis&&!document.hidden)zona((za+1)%zs.length)},5200)}
}

// cómo trabajo: la rama crece con el scroll, suavizado
var CR=$('[data-crece]');
if(CR){
 var lis=$$('[data-cp]',CR),segs=$$('[data-seg]',CR),hjs=$$('[data-hj]',CR),aves=$('[data-aves]',CR),cn=$('[data-cn]',CR),N=lis.length;
 var o2=0,s2=0,run=false;
 function cl(v){return Math.max(0,Math.min(1,v))}
 function lee2(){var r=CR.getBoundingClientRect(),tot=r.height-innerHeight;o2=cl(-r.top/Math.max(1,tot))}
 function pinta2(){
  var f=s2*N*1.02,cur=Math.min(N-1,Math.floor(f));cn.textContent=cur+1;
  for(var k=0;k<N;k++){
   var d=f-k-.5,o=cl(1-Math.max(0,Math.abs(d)-.32)*3.4);if(k===0&&f<.5)o=1;if(k===N-1&&f>N-.5)o=1;
   var y=-Math.sign(d)*Math.max(0,Math.abs(d)-.32)*70;
   lis[k].style.opacity=o.toFixed(3);lis[k].style.transform='translateY('+y.toFixed(1)+'px)';lis[k].style.visibility=o<.01?'hidden':'visible';
   var g=f+.85;segs[k].style.strokeDashoffset=(1-cl((g-k)*1.1)).toFixed(4);
   hjs[k].classList.toggle('on',g-k>=.95);hjs[k].classList.toggle('ahora',k===cur);
  }
  aves.classList.toggle('on',f>N-.35);
 }
 function bucle2(){var d=o2-s2;s2+=d*(RM?1:.07);if(Math.abs(d)<.0004)s2=o2;pinta2();if(s2!==o2)requestAnimationFrame(bucle2);else run=false}
 function pide2(){lee2();if(!run){run=true;requestAnimationFrame(bucle2)}}
 addEventListener('scroll',pide2,{passive:true});addEventListener('resize',pide2);lee2();s2=o2;pinta2();
}

// demo del panel: pestañas, confirmar citas, buscar pacientes
var PN=$('.pn');
if(PN){
 var hoy=$('[data-hoy]');if(hoy){var tx=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});hoy.textContent=tx.charAt(0).toUpperCase()+tx.slice(1)}
 $$('[data-tab]').forEach(function(b){b.addEventListener('click',function(){$$('[data-tab]').forEach(function(x){x.classList.toggle('on',x===b)});$$('[data-p]').forEach(function(s){s.classList.toggle('on',s.dataset.p===b.dataset.tab)})})});
 var citas=$('[data-citas]'),kHoy=$('[data-k-hoy]'),kPend=$('[data-k-pend]'),kSem=$('[data-k-sem]');
 function recuenta(){var li=$$('li',citas);kHoy.textContent=li.length;kPend.textContent=li.filter(function(x){return x.classList.contains('pend')}).length}
 citas.addEventListener('click',function(e){var b=e.target.closest('[data-conf]');if(!b)return;var li=b.closest('li');if(li.classList.contains('ok'))return;li.classList.remove('pend');li.classList.add('ok');$('.est',li).textContent='Confirmada';b.textContent='Confirmada ✓';recuenta();aviso('Cita de '+$('b',li).textContent+' confirmada')});
 // nueva cita desde el panel
 var dlg=$('[data-dlg]'),nf=$('[data-nf]'),nh=$('[data-nh]'),nerr=$('[data-nerr]'),toast=$('[data-toast]'),tt;
 [[570,780],[960,1170]].forEach(function(r){for(var mm=r[0];mm<=r[1];mm+=30){var o=document.createElement('option');o.value=mm;o.textContent=Math.floor(mm/60)+':'+('0'+mm%60).slice(-2);nh.appendChild(o)}})
 function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
 function aviso(t){toast.textContent=t;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},3200)}
 function abre(){nf.reset();nerr.textContent='';var d=new Date();if(d.getDay()===6)d.setDate(d.getDate()+2);if(d.getDay()===0)d.setDate(d.getDate()+1);nf.d.value=ymd(d);nh.value='1020';
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');setTimeout(function(){nf.n.focus()},50)}
 function cierra(){if(dlg.close)dlg.close();else dlg.removeAttribute('open')}
 $$('[data-nueva]').forEach(function(b){b.addEventListener('click',abre)});
 $$('[data-cerrar]',dlg).forEach(function(b){b.addEventListener('click',cierra)});
 dlg.addEventListener('click',function(e){if(e.target===dlg)cierra()});
 var hoyD=new Date();hoyD.setHours(0,0,0,0);var lunes=new Date(hoyD);lunes.setDate(hoyD.getDate()-((hoyD.getDay()+6)%7));
 // las citas de "hoy" del ejemplo van en la columna del día de hoy en la agenda
 (function(){var c=(hoyD.getDay()+6)%7;if(c<1||c>4)return;var A=$('[data-col="0"]'),B=$('[data-col="'+c+'"]');if(!A||!B)return;var fa=[].slice.call(A.children),fb=[].slice.call(B.children);fa.forEach(function(x){B.appendChild(x)});fb.forEach(function(x){A.appendChild(x)})})();

 nf.addEventListener('submit',function(e){e.preventDefault();
  var n=nf.n.value.trim(),mot=nf.m.value,min=+nh.value,hora=nh.options[nh.selectedIndex].textContent,ok=nf.c.checked,dv=nf.d.value;
  if(!n){nerr.textContent='Escribe el nombre del paciente.';nf.n.focus();return}
  if(!dv){nerr.textContent='Elige el día de la cita.';return}
  var p=dv.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]),wd=d.getDay();
  if(wd===0||wd===6){nerr.textContent='Los fines de semana la consulta está cerrada. Elige otro día.';return}
  if(min>=(wd===5?1140:1200)){nerr.textContent='Ese día se cierra a las '+(wd===5?'19:00':'20:00')+'. Elige una hora antes.';return}
  if(d<hoyD){nerr.textContent='Ese día ya ha pasado.';return}
  var esHoy=d.getTime()===hoyD.getTime(),col=Math.round((d-lunes)/864e5),enSemana=col>=0&&col<5;
  if(esHoy&&$$('li',citas).some(function(li){return +li.dataset.min===min})){nerr.textContent='Ya tienes una cita hoy a las '+hora+'.';return}
  var nombre=n.split(/\s+/).map(function(w,i){return i?w.charAt(0).toUpperCase()+'.':w.charAt(0).toUpperCase()+w.slice(1)}).slice(0,2).join(' ');
  if(esHoy){var li=document.createElement('li');li.className=(ok?'ok':'pend')+' nueva';li.dataset.min=min;
   li.innerHTML='<time>'+hora+'</time><div><b></b><small></small></div><span class="est">'+(ok?'Confirmada':'Por confirmar')+'</span><button class="btn-c" data-conf>'+(ok?'Confirmada ✓':'Confirmar')+'</button><span class="wa-i">'+($('.wa-i',citas)?$('.wa-i',citas).innerHTML:'')+'</span>';
   $('b',li).textContent=nombre;$('small',li).textContent=mot;
   var antes=$$('li',citas).filter(function(x){return +x.dataset.min>min})[0];citas.insertBefore(li,antes||null);recuenta()}
  if(enSemana){var c=$('[data-col="'+col+'"]');if(c){var i=document.createElement('i');i.className='nueva';i.style.setProperty('--t',(min/60-9).toFixed(2));i.style.setProperty('--d','1');i.innerHTML='<b>'+hora+'</b>';i.appendChild(document.createTextNode(nombre));c.appendChild(i);kSem.textContent=+kSem.textContent+1}}
  var tb=$('[data-pacs]');if(tb){var tr=document.createElement('tr');tr.className='nueva';tr.innerHTML='<td><b></b></td><td></td><td></td><td>1</td>';$('b',tr).textContent=nombre;tr.children[1].textContent=mot;tr.children[2].textContent=esHoy?'Hoy':'Próxima: '+d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});tb.insertBefore(tr,tb.firstChild)}
  cierra();
  aviso('Cita guardada: '+d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric'})+' a las '+hora+' · '+nombre);
 });
 var bus=$('[data-bus]');if(bus)bus.addEventListener('input',function(){var q=bus.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');$$('.pt tbody tr').forEach(function(tr){tr.style.display=tr.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').indexOf(q)>-1?'':'none'})});
}

// galería: flechas y arrastre
var gal=$('[data-gal]');
if(gal){
 $$('[data-g]').forEach(function(b){b.addEventListener('click',function(){var w=gal.querySelector('.gi').offsetWidth+18;gal.scrollBy({left:+b.dataset.g*w,behavior:RM?'auto':'smooth'})})});
 var x0=null,s0=0,mov=false;
 gal.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;x0=e.clientX;s0=gal.scrollLeft;mov=false;gal.classList.add('drag')});
 addEventListener('pointermove',function(e){if(x0===null)return;var dx=e.clientX-x0;if(Math.abs(dx)>4)mov=true;gal.scrollLeft=s0-dx});
 addEventListener('pointerup',function(){if(x0===null)return;x0=null;gal.classList.remove('drag')});
 gal.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();$('[data-g="'+(e.key==='ArrowRight'?1:-1)+'"]').click()}});
}

// reservar
var days=$('[data-days]');if(!days)return;
var st={v:null,p:null,d:null,t:null},slots=$('[data-slots]'),fm=$('[data-form]'),send=$('[data-send]'),tk=$('.tk');
var DN=['dom','lun','mar','mié','jue','vie','sáb'],ML=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],DL=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
$$('[data-svc] .opt').forEach(function(b){b.addEventListener('click',function(){$$('[data-svc] .opt').forEach(function(x){x.classList.toggle('on',x===b)});st.v=b.dataset.v;sum()})});
// huecos ocupados de ejemplo, siempre los mismos para el mismo día
function ocupado(key){var h=2166136261;for(var i=0;i<key.length;i++){h^=key.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%10<3}
var base=new Date();base.setHours(0,0,0,0);
for(var i=0;i<14;i++){(function(i){var d=new Date(base);d.setDate(base.getDate()+i);
 var b=document.createElement('button');b.type='button';b.innerHTML='<small>'+DN[d.getDay()]+'</small><b>'+d.getDate()+'</b><small>'+ML[d.getMonth()].slice(0,3)+'</small>';
 b.setAttribute('aria-label',DL[d.getDay()]+' '+d.getDate()+' de '+ML[d.getMonth()]);
 if(!(H[(d.getDay()+6)%7]||[]).length){b.disabled=true;b.title='Cerrado'}
 b.addEventListener('click',function(){$$('button',days).forEach(function(x){x.classList.toggle('on',x===b)});st.d=d;st.t=null;pinta();sum(1)});
 days.appendChild(b)})(i)}
function pinta(){slots.innerHTML='';var rs=H[(st.d.getDay()+6)%7]||[],n=new Date(),hay=0,key=st.d.toDateString();
 rs.forEach(function(r,ri){var a=mins(r[0]),z=mins(r[1]);var lab=document.createElement('p');lab.className='grp';lab.textContent=rs.length>1?(ri?'Tarde':'Mañana'):'Horario';slots.appendChild(lab);
  for(var m=a;m+30<=z;m+=30){(function(m){if(st.d.toDateString()===n.toDateString()&&m<=n.getHours()*60+n.getMinutes()+20)return;
   var t=Math.floor(m/60)+':'+('0'+m%60).slice(-2),b=document.createElement('button');b.type='button';b.textContent=t;hay++;
   if(ocupado(key+t)){b.disabled=true;b.setAttribute('aria-label',t+', ocupado')}
   b.addEventListener('click',function(){$$('button',slots).forEach(function(x){x.classList.toggle('on',x===b)});st.t=t;sum()});slots.appendChild(b)})(m)}});
 if(!hay)slots.innerHTML='<p class="empty">Hoy ya no quedan horas. Prueba otro día.</p>'}
fm.addEventListener('input',function(){sum()});
function sum(t){
 $('[data-s=v]').textContent=st.v||'—';$('[data-s=n]').textContent=fm.n.value.trim()||'—';
 if(st.d){$('[data-cd]').textContent=st.d.getDate();$('[data-cw]').textContent=DL[st.d.getDay()];$('[data-cm]').textContent='de '+ML[st.d.getMonth()]}
 $('[data-ch]').textContent=st.t||'--:--';
 if(t){tk.classList.remove('tick');void tk.offsetWidth;tk.classList.add('tick')}
 send.disabled=!(st.v&&st.d&&st.t&&fm.n.value.trim()&&fm.t.value.trim())}
send.addEventListener('click',function(){var msg='Hola Irene, quería pedir cita.\n\nMotivo: '+st.v+'\nDía: '+DL[st.d.getDay()]+' '+st.d.getDate()+' de '+ML[st.d.getMonth()]+' a las '+st.t+'\nNombre: '+fm.n.value.trim()+'\nTeléfono: '+fm.t.value.trim()+(fm.m.value.trim()?'\n\n'+fm.m.value.trim():'');
 window.open(window.IF_WA+'?text='+encodeURIComponent(msg),'_blank','noopener')});
})();
