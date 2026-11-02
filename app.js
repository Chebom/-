/**
 * РАЙОН В КАДРЕ
 * Чтобы добавить снятые ролики, положите файлы 01.mp4 ... 05.mp4 в папку videos/.
 * Если ролики на YouTube, замените video: 'videos/01.mp4' на их ссылки.
 * Если есть свои фотографии, положите 01.jpg ... 05.jpg в папку photos/.
 */
const places = [
  {id:1,title:'Шуваловский парк',short:'Шуваловский парк',category:'Природа и история',area:'Парголово · Шувалово',address:'Санкт-Петербург, Шуваловский парк',lat:60.07528,lng:30.305,verified:true,description:'Шуваловский парк в Санкт‑Петербурге хранит следы разных народов. До XVIII века эти земли населяли финно‑угорские племена, позже — финны под властью Шведского королевства. После перехода земель к графам Шуваловым сюда переселили крестьян из Суздальской губернии. В XIX веке влияние европейских аристократов, в том числе французского графа Адольфа Полье, добавило парку особый культурный оттенок.',emoji:'♣',video:'https://disk.yandex.ru/i/o3e5Dqr8th9xvQ',photo:'photos/01.jpg'},
  {id:2,title:'Парк Лесотехнической академии',short:'Парк Лесотехнической академии',category:'Природа и наука',area:'Институтский переулок',address:'Санкт-Петербург, Институтский переулок, 5',lat:59.992054,lng:30.34363,verified:true,description:'Парк Лесотехнической академии начал свою историю с английской фермы А. Девидсона в начале XIX века. После создания Лесного института (1811) он стал центром научной жизни, объединившим представителей разных народов. Здесь учились и работали русские, немцы и другие специалисты, чьи исследования обогатили отечественное лесоводство. Память о них хранят могилы учёных на территории парка — например, профессора Дмитрия Кайгородова и садовника Эгберта Вольфа.',emoji:'❧',video:'https://disk.yandex.ru/i/fhYPf_kuod9eZw',photo:'photos/02.jpg'},
  {id:3,title:'Удельный рынок',short:'Удельный рынок',category:'Городская жизнь',area:'Удельная · Фермское шоссе',address:'Санкт-Петербург, Фермское шоссе, 41',lat:60.02107,lng:30.31112,verified:true,description:'Удельный рынок, известный с конца XIX века, исторически стал местом встречи разных народов Петербурга. Рядом находилась станция Удельная — важный транспортный узел, куда приезжали крестьяне из окрестных губерний. Здесь торговали русские, финны из ближайших ингерманландских деревень, евреи, немцы и представители других народов империи. В советское время рынок оставался многонациональным: сюда везли товары жители Ленинградской области и соседних республик СССР.',emoji:'✦',video:'https://disk.yandex.ru/i/jt5EaCXgOjxHrQ',photo:'photos/03.jpg'},
  {id:4,title:'Батенинский жилмассив',short:'Батенинский жилмассив',category:'Архитектура',area:'Сампсониевское · Лесная',address:'Санкт-Петербург, Батенинский жилмассив',lat:59.980051,lng:30.346806,verified:true,description:'Батенинский жилмассив — памятник конструктивизма на Лесном проспекте. Его имя восходит к русскому купцу Ф. С. Батенину, владельцу фарфорового завода. В 1930‑е годы здесь селились рабочие ленинградских предприятий — люди разных национальностей: русские, финны, украинцы, татары, — формируя многонациональный жилой район эпохи первых пятилеток.',emoji:'▥',video:'https://disk.yandex.ru/i/GVbX9MB0Sj4lWQ',photo:'photos/04.jpg'},
  {id:5,title:'Школа № 475',short:'Наша школа № 475',category:'Наша школа',area:'Парголово · Тихоокеанская улица',address:'Санкт-Петербург, пос. Парголово, Тихоокеанская ул., 10, корп. 2',lat:60.070321,lng:30.239287,verified:true,description:'Школа №475 — дружная семья, где учатся ребята разных национальностей. Каждый ученик приносит в класс что-то особенное: свои традиции, язык и культуру. В нашей школе нет места предрассудкам. Мы отмечаем праздники разных народов, делимся традициями. Мы разные, но едины в главном — в стремлении к знаниям и желании расти вместе.',emoji:'▤',video:'https://disk.yandex.ru/i/yXmSxG6cmQJv0g',photo:'photos/05.jpg'}
];
const $=id=>document.getElementById(id);
const list=$('placeList'),pins=$('mapPins'),stage=$('mapStage');
const modal=$('modal'),player=$('videoPlayer'),frame=$('videoFrame'),placeholder=$('videoPlaceholder');
let active=-1,lastFocus=null,map=null,online=false,leafletLoadPromise=null,toastTimer=null,yandexController=null,mediaRequestId=0;
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
  mediaRequestId++; // старые асинхронные ответы не должны заменять ролик нового места
  if(yandexController){yandexController.abort();yandexController=null}
  player.onloadedmetadata=null;
  player.onerror=null;
  player.pause();player.removeAttribute('src');player.load();player.hidden=true;player.muted=false;
  frame.src='about:blank';frame.hidden=true;placeholder.hidden=false;
  $('placeholderTitle').textContent='История скоро появится здесь';
  $('yandexChoices').hidden=true;
  $('yandexTry').disabled=false;
  $('yandexTry').textContent='Повторить загрузку видео';
  $('yandexStatus').textContent='Если видео не откроется на сайте, его можно посмотреть на Яндекс Диске.';
}
function youtubeEmbed(url){try{const parsed=new URL(url);const host=parsed.hostname.replace(/^www\./,'');let id=null;if(host==='youtu.be')id=parsed.pathname.slice(1).split('/')[0];if(host==='youtube.com'||host==='m.youtube.com')id=parsed.searchParams.get('v')||(parsed.pathname.match(/\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/)||[])[1];return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?rel=0`:null;}catch{return null}}
function isYandexDiskURL(value){
  try{const u=new URL(value);return u.protocol==='https:' && ['disk.yandex.ru','yadi.sk'].includes(u.hostname) && u.pathname.length>1}
  catch{return false}
}
function showVideo(place){
  clearMedia();const src=place.video;
  if(!src){$('placeholderInfo').textContent='Для этой точки ещё не указана ссылка на видео.';return}
  if(isYandexDiskURL(src)){
    $('placeholderTitle').textContent='Загружаем видео…';
    $('placeholderInfo').textContent='Подключаем видеосюжет с Яндекс Диска.';
    $('yandexWatch').href=src;
    // При открытии точки сразу получаем прямую ссылку — кнопка запуска больше не нужна.
    void tryYandexInline();
    return;
  }
  const youTube=youtubeEmbed(src);
  if(youTube){placeholder.hidden=true;frame.src=youTube;frame.hidden=false;return}
  if(/^https?:\/\//i.test(src)&&/(?:rutube\.ru\/play\/embed\/|vkvideo\.ru\/video_ext\.php|vk\.com\/video_ext\.php)/.test(src)){placeholder.hidden=true;frame.src=src;frame.hidden=false;return}
  if(/^https?:\/\//i.test(src)&&!/^https:\/\//i.test(src)){placeholder.hidden=false;$('placeholderInfo').textContent='Для внешних видеоссылок используйте защищённый адрес https://';return}
  player.src=src;player.hidden=false;placeholder.hidden=true;
  $('placeholderInfo').textContent=`Положите файл «${num(place.id)}.mp4» в папку videos. Или замените ссылку на видеоролик в app.js.`;
  player.onerror=()=>{player.hidden=true;placeholder.hidden=false};
  player.onloadedmetadata=()=>{placeholder.hidden=true;player.hidden=false};
}
async function tryYandexInline(){
  const current=active;
  const requestId=mediaRequestId;
  if(current<0||current>=places.length)return;
  const src=places[current].video;
  if(!isYandexDiskURL(src))return;
  const btn=$('yandexTry'),status=$('yandexStatus');
  const isCurrent=()=>active===current && mediaRequestId===requestId && !modal.hidden;
  btn.disabled=true;
  $('placeholderTitle').textContent='Загружаем видео…';
  $('placeholderInfo').textContent='Подключаем видеосюжет с Яндекс Диска.';
  $('yandexChoices').hidden=true;
  status.textContent='Получаем временную ссылку на видео.';
  if(yandexController)yandexController.abort();
  const controller=new AbortController();yandexController=controller;
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const api='https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key='+encodeURIComponent(src);
    const result=await fetch(api,{signal:controller.signal});
    if(!result.ok)throw new Error('Недоступна прямая ссылка');
    const response=await result.json();
    if(typeof response.href!=='string'||!response.href.startsWith('https://'))throw new Error('Ответ без ссылки на файл');
    if(!isCurrent()||controller.signal.aborted)return;
    player.src=response.href;
    player.preload='auto';
    player.hidden=false;
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{cleanup();reject(new Error('Не удалось загрузить видео'))},12000);
      const onReady=()=>{cleanup();resolve()};
      const onError=()=>{cleanup();reject(new Error('Сервер не разрешает просмотр'))};
      const onAbort=()=>{cleanup();reject(new Error('Загрузка отменена'))};
      const cleanup=()=>{clearTimeout(timeout);player.removeEventListener('loadedmetadata',onReady);player.removeEventListener('error',onError);controller.signal.removeEventListener('abort',onAbort)};
      player.addEventListener('loadedmetadata',onReady,{once:true});
      player.addEventListener('error',onError,{once:true});
      controller.signal.addEventListener('abort',onAbort,{once:true});
      player.load();
    });
    if(!isCurrent()||controller.signal.aborted)return;
    placeholder.hidden=true;
    // Браузеры часто запрещают автоматический запуск со звуком после загрузки по сети.
    // Пробуем со звуком, затем без звука; звук можно включить на самом видеоплеере.
    try{await player.play()}catch(e){
      if(!isCurrent())return;
      player.muted=true;
      try{await player.play()}catch(e2){/* Пользователь может нажать Play в самом плеере. */}
    }
  }catch(err){
    if(isCurrent()){
      player.pause();player.removeAttribute('src');player.load();player.hidden=true;
      placeholder.hidden=false;
      $('placeholderTitle').textContent='Не удалось загрузить видео';
      $('placeholderInfo').textContent='Попробуйте повторить загрузку или посмотрите ролик на Яндекс Диске.';
      $('yandexChoices').hidden=false;
      status.textContent='Видео временно недоступно для просмотра на сайте.';
    }
  }finally{
    clearTimeout(timer);
    if(yandexController===controller)yandexController=null;
    if(isCurrent())btn.disabled=false;
  }
}
$('yandexTry').addEventListener('click',tryYandexInline);
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
