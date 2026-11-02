/**
 * КОД ЕДИНСТВА · ВЫБОРГСКАЯ СТОРОНА
 * Для подключения видео измените поле video у соответствующей точки.
 * Для VK Видео используйте ссылку вида https://vkvideo.ru/video-123_456
 * Надёжнее всего вставлять URL из VK: Поделиться → Экспортировать → Код для вставки → src.
 * Можно использовать https://vkvideo.ru/video_ext.php?oid=...&id=...&hash=...
 * Фото (необязательно): photos/01.jpg, 02.jpg ... 05.jpg.
 */
const places = [
  {id:1,title:'Шуваловский парк',short:'Шуваловский парк',category:'Природа и история',area:'Парголово · Шувалово',address:'Санкт-Петербург, Шуваловский парк',lat:60.07528,lng:30.305,verified:true,description:'Шуваловский парк в Санкт‑Петербурге хранит следы разных народов. До XVIII века эти земли населяли финно‑угорские племена, позже — финны под властью Шведского королевства. После перехода земель к графам Шуваловым сюда переселили крестьян из Суздальской губернии. В XIX веке влияние европейских аристократов, в том числе французского графа Адольфа Полье, добавило парку особый культурный оттенок.',emoji:'♣',video:'https://vkvideo.ru/video-242801556_456239021',photo:'photos/01.jpg'},
  {id:2,title:'Парк Лесотехнической академии',short:'Парк Лесотехнической академии',category:'Природа и наука',area:'Институтский переулок',address:'Санкт-Петербург, Институтский переулок, 5',lat:59.992054,lng:30.34363,verified:true,description:'Парк Лесотехнической академии начал свою историю с английской фермы А. Девидсона в начале XIX века. После создания Лесного института (1811) он стал центром научной жизни, объединившим представителей разных народов. Здесь учились и работали русские, немцы и другие специалисты, чьи исследования обогатили отечественное лесоводство. Память о них хранят могилы учёных на территории парка — например, профессора Дмитрия Кайгородова и садовника Эгберта Вольфа.',emoji:'❧',video:'https://vkvideo.ru/video-242801556_456239019',photo:'photos/02.jpg'},
  {id:3,title:'Удельный рынок',short:'Удельный рынок',category:'Городская жизнь',area:'Удельная · Фермское шоссе',address:'Санкт-Петербург, Фермское шоссе, 41',lat:60.02107,lng:30.31112,verified:true,description:'Удельный рынок, известный с конца XIX века, исторически стал местом встречи разных народов Петербурга. Рядом находилась станция Удельная — важный транспортный узел, куда приезжали крестьяне из окрестных губерний. Здесь торговали русские, финны из ближайших ингерманландских деревень, евреи, немцы и представители других народов империи. В советское время рынок оставался многонациональным: сюда везли товары жители Ленинградской области и соседних республик СССР.',emoji:'✦',video:'https://vkvideo.ru/video-242801556_456239018',photo:'photos/03.jpg'},
  {id:4,title:'Батенинский жилмассив',short:'Батенинский жилмассив',category:'Архитектура',area:'Сампсониевское · Лесная',address:'Санкт-Петербург, Батенинский жилмассив',lat:59.980051,lng:30.346806,verified:true,description:'Батенинский жилмассив — памятник конструктивизма на Лесном проспекте. Его имя восходит к русскому купцу Ф. С. Батенину, владельцу фарфорового завода. В 1930‑е годы здесь селились рабочие ленинградских предприятий — люди разных национальностей: русские, финны, украинцы, татары, — формируя многонациональный жилой район эпохи первых пятилеток.',emoji:'▥',video:'https://vkvideo.ru/video-242801556_456239022',photo:'photos/04.jpg'},
  {id:5,title:'Школа № 475',short:'Наша школа № 475',category:'Наша школа',area:'Парголово · Тихоокеанская улица',address:'Санкт-Петербург, пос. Парголово, Тихоокеанская ул., 10, корп. 2',lat:60.070321,lng:30.239287,verified:true,description:'Школа №475 — дружная семья, где учатся ребята разных национальностей. Каждый ученик приносит в класс что-то особенное: свои традиции, язык и культуру. В нашей школе нет места предрассудкам. Мы отмечаем праздники разных народов, делимся традициями. Мы разные, но едины в главном — в стремлении к знаниям и желании расти вместе.',emoji:'▤',video:'https://vkvideo.ru/video-242801556_456239017',photo:'photos/05.jpg'}
];
const $=id=>document.getElementById(id);
const list=$('placeList'),pins=$('mapPins'),stage=$('mapStage');
const modal=$('modal'),player=$('videoPlayer'),frame=$('videoFrame'),placeholder=$('videoPlaceholder');
let active=-1,lastFocus=null,map=null,online=false,leafletLoadPromise=null,toastTimer=null;
const num=n=>String(n).padStart(2,'0');
// Географические координаты преобразуются в положение на иллюстрированной схеме.
const geoBounds={left:30.211,right:30.389,top:60.087,bottom:59.967};
const mapXY=place=>({x:Math.min(93,Math.max(7,(place.lng-geoBounds.left)/(geoBounds.right-geoBounds.left)*100)),y:Math.min(91,Math.max(8,(geoBounds.top-place.lat)/(geoBounds.top-geoBounds.bottom)*100))});
function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),4200)}
function cardMarkup(place){return `<button class="place-button" type="button" data-place="${place.id-1}" aria-label="Открыть видео: ${place.title}"><span class="place-num">${num(place.id)}</span><span class="place-image tone-${place.id}"><span class="pictogram">${place.emoji}</span><img src="${place.photo}" alt="" loading="lazy" onerror="this.style.display='none'"></span><span class="place-info"><span class="place-title" style="display:block">${place.title}</span><span class="place-category" style="display:block">${place.area}</span></span><span class="place-arrow" aria-hidden="true">↗</span></button>`}
function pinMarkup(place){const p=mapXY(place);return `<button class="map-pin" style="left:${p.x}%;top:${p.y}%" type="button" data-place="${place.id-1}" title="${place.title}: открыть видео"><span class="map-marker">${num(place.id)}</span><span class="map-pin-label">${place.short}</span></button>`}
list.innerHTML=places.map(cardMarkup).join('');pins.innerHTML=places.map(pinMarkup).join('');
function setHighlight(index){document.querySelectorAll('[data-place]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.place)===index));document.querySelectorAll('.map-pin').forEach(el=>el.classList.toggle('active',Number(el.dataset.place)===index));}
function clearMedia(){
  player.onloadedmetadata=null;
  player.onerror=null;
  player.pause();player.removeAttribute('src');player.load();player.hidden=true;
  // Останавливаем воспроизведение VK при закрытии окна или смене точки.
  frame.src='about:blank';frame.hidden=true;
  placeholder.hidden=false;
  $('videoExternal').hidden=true;
}
function youtubeEmbed(url){
  try{const u=new URL(url);const host=u.hostname.replace(/^www\./,'');let id=null;
    if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
    if(host==='youtube.com'||host==='m.youtube.com')id=u.searchParams.get('v')||(u.pathname.match(/\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/)||[])[1];
    return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`:null;
  }catch{return null}
}
function vkEmbed(source){
  try{
    const u=new URL(source);
    if(u.protocol!=='https:'||!['vkvideo.ru','vk.com','vk.ru'].includes(u.hostname))return null;
    let embed;
    if(u.pathname==='/video_ext.php' && /^-?\d+$/.test(u.searchParams.get('oid')||'') && /^\d+$/.test(u.searchParams.get('id')||'')){
      // При использовании src из официального кода VK сохраняется нужный hash.
      embed=u;
    }else{
      const match=u.pathname.match(/^\/video(-?\d+)_(\d+)\/?$/);
      if(!match)return null;
      embed=new URL('https://vkvideo.ru/video_ext.php');
      embed.searchParams.set('oid',match[1]);
      embed.searchParams.set('id',match[2]);
      embed.searchParams.set('hd','2');
      const hash=u.searchParams.get('hash')||u.searchParams.get('h');
      if(hash)embed.searchParams.set('hash',hash);
    }
    embed.searchParams.set('autoplay','1');
    embed.searchParams.set('muted','1');
    return embed.toString();
  }catch{return null}
}
function showVideo(place){
  clearMedia();
  const src=place.video;
  if(!src){$('placeholderInfo').textContent='Этот видеосюжет пока не добавлен. Скоро он появится здесь.';return}
  const vkURL=vkEmbed(src);
  if(vkURL){
    $('videoExternal').href=/\/video_ext\.php/.test(src)?`https://vkvideo.ru/video${new URL(src).searchParams.get('oid')}_${new URL(src).searchParams.get('id')}`:src;
    $('videoExternal').hidden=false;
    placeholder.hidden=true;frame.hidden=false;frame.src=vkURL;
    return;
  }
  const youTube=youtubeEmbed(src);
  if(youTube){placeholder.hidden=true;frame.hidden=false;frame.src=youTube;return}
  if(/^https:\/\/(?:rutube\.ru\/play\/embed\/)/.test(src)){
    placeholder.hidden=true;frame.hidden=false;frame.src=src;return;
  }
  if(/^https:\/\//i.test(src)){
    $('placeholderInfo').textContent='Для этого видео нужна ссылка на встроенный плеер, а не обычная ссылка на страницу.';return;
  }
  player.src=src;player.hidden=false;placeholder.hidden=true;
  player.onerror=()=>{player.hidden=true;placeholder.hidden=false;$('placeholderInfo').textContent='Не удалось загрузить видеофайл.'};
}
function openPlace(index){if(index<0||index>=places.length)return;const place=places[index];if(modal.hidden){lastFocus=document.activeElement}active=index;setHighlight(index);$('modalCounter').textContent=`ИСТОРИЯ ${num(place.id)} / 05`;$('modalCategory').textContent=place.category;$('modalTitle').textContent=place.title;$('modalDescription').textContent=place.description;$('modalAddress').textContent=place.address;$('modalStep').textContent=`${num(place.id)} / 05`;$('modalMapLink').href=`https://yandex.ru/maps/?pt=${place.lng},${place.lat}&z=16&l=map`;$('modalMapLink').title=place.verified?'Показать местоположение':'Координаты приблизительные';modal.hidden=false;document.body.style.overflow='hidden';showVideo(place);$('closeModal').focus({preventScroll:true});}
function closeModal(){if(modal.hidden)return;modal.hidden=true;document.body.style.overflow='';clearMedia();setHighlight(-1);active=-1;if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
function navigate(delta){if(active<0)return;openPlace((active+delta+places.length)%places.length)}
$('closeModal').addEventListener('click',closeModal);$('prevPlace').addEventListener('click',()=>navigate(-1));$('nextPlace').addEventListener('click',()=>navigate(1));modal.querySelector('.modal-shade').addEventListener('click',closeModal);
document.addEventListener('click',e=>{const btn=e.target.closest('[data-place]');if(btn)openPlace(Number(btn.dataset.place))});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')closeModal();if(e.key==='ArrowLeft')navigate(-1);if(e.key==='ArrowRight')navigate(1);if(e.key==='Tab'){const els=Array.from(modal.querySelectorAll('button,a,video[controls]')).filter(x=>x.offsetParent!==null);const i=els.indexOf(document.activeElement);if(!els.length)return;if(e.shiftKey&&i===0){e.preventDefault();els[els.length-1].focus()}else if(!e.shiftKey&&i===els.length-1){e.preventDefault();els[0].focus()}}});
list.addEventListener('mouseover',e=>{const el=e.target.closest('[data-place]');if(el)document.querySelectorAll('.map-pin').forEach(pin=>pin.classList.toggle('active',pin.dataset.place===el.dataset.place))});list.addEventListener('mouseleave',()=>{if(active<0)document.querySelectorAll('.map-pin').forEach(pin=>pin.classList.remove('active'))});
$('copyrightYear').textContent=new Date().getFullYear();
// Опционально: подробная онлайн-карта. Сайт полностью работает и без неё.
function loadStylesheet(url){return new Promise((resolve,reject)=>{const el=document.createElement('link');el.rel='stylesheet';el.href=url;el.onload=resolve;el.onerror=reject;document.head.appendChild(el)})}
function loadScript(url){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=url;el.async=true;el.onload=resolve;el.onerror=reject;document.head.appendChild(el)})}
function ensureLeaflet(){if(window.L)return Promise.resolve();if(!leafletLoadPromise)leafletLoadPromise=Promise.all([loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'),loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js')]).catch(e=>{leafletLoadPromise=null;throw e});return leafletLoadPromise}
function startMap(){const L=window.L;map=L.map('realMap',{scrollWheelZoom:false,zoomControl:true});const bounds=L.latLngBounds(places.map(p=>[p.lat,p.lng]));map.fitBounds(bounds.pad(.15));let loaded=false;const tile=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'});tile.on('tileload',()=>{loaded=true});tile.on('tileerror',()=>{});tile.addTo(map);places.forEach(place=>{const html=`<div class="online-pin">${num(place.id)}</div>`;const marker=L.marker([place.lat,place.lng],{icon:L.divIcon({html,className:'',iconSize:[39,39],iconAnchor:[19,19]})}).addTo(map);marker.bindTooltip(place.title,{direction:'top',offset:[0,-16]});marker.on('click',()=>openPlace(place.id-1))});map._allBounds=bounds;map._tileLoaded=()=>loaded;}
function switchToScheme(){online=false;stage.classList.remove('online');$('mapSwitchText').textContent='Подробная карта';if(map)map.invalidateSize();}
function switchToOnline(){online=true;stage.classList.add('online');$('mapSwitchText').textContent='Вернуться к схеме';if(map){map.invalidateSize();map.fitBounds(map._allBounds.pad(.15))}}
$('toggleOnlineMap').addEventListener('click',async()=>{if(online){switchToScheme();return}const btn=$('toggleOnlineMap');btn.disabled=true;$('mapSwitchText').textContent='Загружаем карту…';try{await ensureLeaflet();if(!map)startMap();switchToOnline();setTimeout(()=>{if(online&&map&&!map._tileLoaded()){switchToScheme();toast('Подробная карта сейчас недоступна. Используйте схему или ссылку на Яндекс Карты в карточке места.')}},4500)}catch(e){switchToScheme();toast('Не удалось загрузить онлайн-карту. Схема и видеоточки продолжают работать.')}finally{btn.disabled=false}});
$('resetMap').addEventListener('click',()=>{if(online&&map){map.fitBounds(map._allBounds.pad(.15));toast('На карте показаны все 5 мест')}else{document.querySelectorAll('.map-pin').forEach(pin=>pin.classList.remove('active'));toast('На схеме показаны все 5 точек — нажмите любую метку')}});
