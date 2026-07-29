/*
 De Mayo Bible Ministry
 Copyright © 2026 Romer Sadio De Mayo
 All Rights Reserved. Unauthorised copying, modification, distribution, or sale is prohibited.
*/
const D=window.BIBLE_DATA,V=D.verses,B=D.books,$=s=>document.querySelector(s),view=$('#view');
const store={get:(k,d=[])=>{try{return JSON.parse(localStorage.getItem('dm_'+k)||JSON.stringify(d))}catch{return d}},set:(k,v)=>localStorage.setItem('dm_'+k,JSON.stringify(v))};
const I18N={
 en:{code:'EN',html:'en',
  navGroups:['Bible','Public Library','My Resources','Ministry Tools','Settings'],
  pages:{home:'⌂ Home',read:'📖 Read Bible',search:'🔎 Search',devotionals:'🌅 Devotionals',exhortations:'🎤 Exhortations',studies:'📚 Bible Studies',kidslibrary:'👧 Kids Lessons',prayerlibrary:'🙏 Prayer Library',favourites:'★ Favourites',highlights:'🖍 Highlights',verseNotes:'🗒 Verse Notes',notes:'📝 Bible Study Creator',prayer:'🙏 Prayer Creator',myresources:'📁 Created Resources',sermon:'🎤 Sermon Studio',kids:'🧒 Kids Ministry Studio',reading:'📅 Chapter Tracker',plans:'🗓 Guided Reading Plans',salvation:'❤️ Salvation Guide',characters:'👥 Bible Characters',dictionary:'📘 Bible Dictionary',creator:'✨ Create Resource',support:'❤️ Support the Ministry',help:'❓ Help & User Guide',about:'ℹ️ About & Copyright',backup:'🔒 Backup & Restore'},
  mobile:{home:'Home',read:'Read',search:'Search',prayer:'Prayer',more:'More'},
  footer:'Easy-English WEB Bible',privacy:'Your personal content stays on this device.',
  homeTitle:'Home',homeSub:'Read, study, pray, and prepare.',
  langTitle:'Language',langSub:'Choose English or Tagalog for the app menus and guides.',
  switched:'Language changed to English'},
 tl:{code:'TL',html:'tl',
  navGroups:['Bibliya','Pampublikong Aklatan','Aking mga Materyales','Mga Gamit sa Ministeryo','Mga Setting'],
  pages:{home:'⌂ Tahanan',read:'📖 Basahin ang Bibliya',search:'🔎 Maghanap',devotionals:'🌅 Mga Debosyonal',exhortations:'🎤 Mga Exhortation',studies:'📚 Pag-aaral ng Bibliya',kidslibrary:'👧 Aralin para sa Bata',prayerlibrary:'🙏 Aklatan ng Panalangin',favourites:'★ Mga Paborito',highlights:'🖍 Mga Highlight',verseNotes:'🗒 Tala sa Talata',notes:'📝 Gumawa ng Bible Study',prayer:'🙏 Prayer Creator',myresources:'📁 Ginawang Materyales',sermon:'🎤 Sermon Studio',kids:'🧒 Kids Ministry Studio',reading:'📅 Talaan ng Kabanata',plans:'🗓 Mga Gabay sa Pagbasa',salvation:'❤️ Gabay sa Kaligtasan',characters:'👥 Mga Tauhan sa Bibliya',dictionary:'📘 Diksyunaryo ng Bibliya',creator:'✨ Gumawa ng Materyales',support:'❤️ Suportahan ang Ministeryo',help:'❓ Tulong at Gabay',about:'ℹ️ Tungkol at Copyright',backup:'🔒 Backup at Restore'},
  mobile:{home:'Tahanan',read:'Basahin',search:'Hanapin',prayer:'Panalangin',more:'Iba pa'},
  footer:'Ang Dating Biblia (1905)',privacy:'Ang personal mong nilalaman ay nananatili sa device na ito.',
  homeTitle:'Tahanan',homeSub:'Magbasa, mag-aral, manalangin, at maghanda.',
  langTitle:'Wika',langSub:'Piliin ang English o Tagalog para sa mga menu at gabay ng app.',
  switched:'Tagalog na ang wika ng app'}
};
let appLanguage=store.get('language','en');
function lang(){return I18N[appLanguage]||I18N.en}
function buildNavigation(){
 const L=lang();
 $('#nav').innerHTML=navGroups.map((g,gi)=>`<div class="nav-section">${L.navGroups[gi]}</div>${g[1].map(p=>`<button data-page="${p[0]}">${L.pages[p[0]]||p[1]}</button>`).join('')}`).join('');
 const icons={home:'⌂',read:'📖',search:'🔎',prayer:'🙏'};
 $('#mobileNav').innerHTML=['home','read','search','prayer'].map(k=>`<button data-page="${k}"><span>${icons[k]}</span>${L.mobile[k]}</button>`).join('')+`<button data-action="menu"><span>☰</span>${L.mobile.more}</button>`;
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>route(b.dataset.page));
 document.querySelectorAll('[data-action="menu"]').forEach(b=>b.onclick=toggleMenu);
 $('#translationLabel').textContent=L.footer;$('#privacyLabel').textContent=L.privacy;
 $('#language').textContent=L.code;document.documentElement.lang=L.html;document.documentElement.dataset.language=appLanguage;
}
async function setLanguage(code){appLanguage=code==='tl'?'tl':'en';store.set('language',appLanguage);buildNavigation();if(appLanguage==='tl'&&!window.TAGALOG_VERSES){showBibleLoading();try{await window.DM_TAGALOG_BIBLE.load()}catch(e){toast('Hindi ma-load ang Tagalog Bible. Kailangan ng internet sa unang paggamit.')}}render();toast(lang().switched)}

const navGroups=[
 ['Bible',[['home','⌂ Home'],['read','📖 Read Bible'],['search','🔎 Search']]],
 ['Public Library',[['devotionals','🌅 Devotionals'],['exhortations','🎤 Exhortations'],['studies','📚 Bible Studies'],['kidslibrary','👧 Kids Lessons'],['prayerlibrary','🙏 Prayer Library']]],
 ['My Resources',[['favourites','★ Favourites'],['highlights','🖍 Highlights'],['verseNotes','🗒 Verse Notes'],['notes','📝 Bible Study Creator'],['prayer','🙏 Prayer Creator'],['myresources','📁 Created Resources']]],
 ['Ministry Tools',[['sermon','🎤 Sermon Studio'],['kids','🧒 Kids Ministry Studio'],['reading','📅 Chapter Tracker'],['plans','🗓 Guided Reading Plans'],['salvation','❤️ Salvation Guide'],['characters','👥 Bible Characters'],['dictionary','📘 Bible Dictionary'],['creator','✨ Create Resource']]],
 ['Settings',[['support','❤️ Support the Ministry'],['help','❓ Help & User Guide'],['about','ℹ️ About & Copyright'],['backup','🔒 Backup & Restore']]]
];
const pages=navGroups.flatMap(g=>g[1]);
const internalPages=['resource'];
const validPages=new Set([...pages.map(x=>x[0]),...internalPages]);
const mobilePages=[['home','⌂','Home'],['read','📖','Read'],['search','🔎','Search'],['prayer','🙏','Prayer']];
let state={page:'home',previousPage:'home',book:store.get('lastBook','John'),chapter:store.get('lastChapter',3),font:store.get('fontSize',19)};
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function parseBibleReference(input=''){
 const text=String(input).replace(/[–—]/g,'-').trim();
 const books=[...B].sort((a,b)=>b.name.length-a.name.length);
 for(const book of books){
  const name=book.name.replace(/[.*+?^${}()|\[\]\\]/g,'\\$&');
  const m=text.match(new RegExp(`(?:^|[^A-Za-z0-9])(${name})\\s+(\\d{1,3})(?::(\\d{1,3}))?`,'i'));
  if(m){const found=B.find(x=>x.name.toLowerCase()===m[1].toLowerCase());return {book:found.name,chapter:+m[2],verse:+(m[3]||1),label:m[0].trim()}}
 }
 return null;
}
function scriptureLink(reference,label=reference){
 const parsed=parseBibleReference(reference);
 return parsed?`<button type="button" class="scripture-link" data-bible-ref="${esc(reference)}" aria-label="Open ${esc(reference)} in Bible reader">${esc(label)}</button>`:esc(label);
}
function scriptureList(items=[]){return items.map(x=>scriptureLink(x)).join(', ')}
function extractBibleReferences(text=''){
 const book='(?:[1-3]\s*)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song(?: of Solomon)?|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)';
 const re=new RegExp('\\b'+book+'\\s+\\d{1,3}(?::\\d{1,3}(?:[-–]\\d{1,3})?)?','gi');
 return [...new Set((String(text).match(re)||[]).map(x=>x.replace(/\s+/g,' ').trim()))];
}
function customScripturePanel(text,primary=''){
 const refs=[...new Set([primary,...extractBibleReferences(text)].filter(Boolean))];
 if(!refs.length)return '';
 return `<section class="card scripture-index"><h3>📖 ${ui('Scriptures in this resource','Mga Talata sa Materyales')}</h3><p>${ui('Tap any reference to open it in the Bible reader.','Pindutin ang anumang talata upang buksan ito sa Bible reader.')}</p><div class="scripture-chip-list">${refs.map(r=>scriptureLink(r)).join('')}</div></section>`;
}
function renderTextWithScriptureLinks(text=''){
 let out=esc(String(text||''));
 const refs=extractBibleReferences(text).sort((a,b)=>b.length-a.length);
 refs.forEach(ref=>{
  const escapedRef=esc(ref);
  out=out.split(escapedRef).join(`<button type="button" class="scripture-link inline-scripture" data-bible-ref="${esc(ref)}" aria-label="Open ${esc(ref)} in Bible reader">${escapedRef}</button>`);
 });
 return out.replace(/\n/g,'<br>');
}

function presentationBodyHtml(text=''){
 const lines=String(text||'').replace(/\r/g,'').split('\n');
 let html='';
 for(const raw of lines){
  const line=raw.trim();
  if(!line){html+='<div class="presentation-spacer" aria-hidden="true"></div>';continue}
  const linked=renderTextWithScriptureLinks(line);
  if(/^#{1,3}\s+/.test(line)){const clean=line.replace(/^#{1,3}\s+/,'');html+=`<h2>${renderTextWithScriptureLinks(clean)}</h2>`}
  else if(/^[A-Z][A-Z0-9 /&'’()\-]{3,}:?$/.test(line) && line.length<90){html+=`<h2>${linked.replace(/:$/,'')}</h2>`}
  else if(/^\d+[.)]\s+/.test(line)||/^[•*-]\s+/.test(line)){html+=`<p class="presentation-list-item">${linked}</p>`}
  else html+=`<p>${linked}</p>`;
 }
 return html;
}
let activePresentationSnapshot=null;
const PRESENTATION_SESSION_KEY='dm_active_presentation_v85';
const PRESENTATION_RETURN_KEY='presentationReturnPayloadV85';
let pendingPresentationReturn=null;
function savePresentationReturn(snapshot){
 const payload=snapshot?{...snapshot,active:true}:null;
 pendingPresentationReturn=payload;
 store.set(PRESENTATION_RETURN_KEY,payload);
}
function getPresentationReturn(){
 if(pendingPresentationReturn&&pendingPresentationReturn.active)return pendingPresentationReturn;
 const payload=store.get(PRESENTATION_RETURN_KEY,null);
 if(payload&&payload.active){pendingPresentationReturn=payload;return payload}
 return null;
}
function clearPresentationReturn(){pendingPresentationReturn=null;store.set(PRESENTATION_RETURN_KEY,null)}
function savePresentationSnapshot(snapshot){
 activePresentationSnapshot=snapshot?{...snapshot}:null;
 try{if(snapshot)sessionStorage.setItem(PRESENTATION_SESSION_KEY,JSON.stringify(snapshot));else sessionStorage.removeItem(PRESENTATION_SESSION_KEY)}catch{}
}
function getPresentationSnapshot(){
 if(activePresentationSnapshot)return activePresentationSnapshot;
 try{const raw=sessionStorage.getItem(PRESENTATION_SESSION_KEY);if(raw){activePresentationSnapshot=JSON.parse(raw);return activePresentationSnapshot}}catch{}
 return null;
}
function clearPresentationSnapshot(){savePresentationSnapshot(null)}
function presentationOriginPage(explicit=''){
 const valid=new Set(['read','devotionals','exhortations','studies','kidslibrary','sermon','resource','myresources']);
 if(valid.has(explicit))return explicit;
 if(state.page==='resource'&&valid.has(state.previousPage))return state.previousPage;
 return valid.has(state.page)?state.page:'home';
}
function startResourcePresentation({title='',passage='',body='',image='',html='',restoreScroll=0,originPage=''}){
 document.getElementById('resourcePresentationOverlay')?.remove();
 const initialSnapshot={title,passage,body,image,html,scrollTop:Number(restoreScroll)||0,originPage:presentationOriginPage(originPage)};
 savePresentationSnapshot(initialSnapshot);
 pendingPresentationReturn={...initialSnapshot,active:true};
 const overlay=document.createElement('section');
 overlay.id='resourcePresentationOverlay';
 overlay.className='resource-presentation-overlay';
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay._presentationSnapshot=initialSnapshot;
 overlay.dataset.presentationActive='true';
 overlay.innerHTML=`<div class="presentation-toolbar"><button type="button" class="primary" id="exitResourcePresentation">✕ ${ui('Exit Presentation','Isara ang Presentation')}</button></div><article class="presentation-document">${image?`<img class="presentation-hero" src="${esc(image)}" alt="${esc(title||ui('Lesson illustration','Larawan ng aralin'))}">`:''}${title?`<h1>${esc(title)}</h1>`:''}${passage?`<div class="presentation-passage">${scriptureLink(passage)}</div>`:''}<div class="presentation-content">${html||presentationBodyHtml(body)}</div></article>`;
 document.body.appendChild(overlay);
 document.body.classList.add('resource-presentation-active');
 const close=()=>{const destination=initialSnapshot.originPage||'home';overlay.remove();document.body.classList.remove('resource-presentation-active');clearPresentationSnapshot();clearPresentationReturn();store.set('returnToPresentation',false);store.set('returnToResource',false);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});route(destination)};
 overlay.querySelector('#exitResourcePresentation').onclick=close;
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 makePresentationScripturesClickable(overlay);
 try{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{})}catch{}
 overlay.scrollTop=Number(restoreScroll)||0;
}

function userLibraryKey(kind){return ({study:'userBibleStudies',prayer:'userPrayers',kids:'userKidsLessons',devotional:'userDevotionals',exhortation:'userExhortations',sermon:'sermons'})[kind]||('user'+kind)}
function userLibrary(kind){return store.get(userLibraryKey(kind),[])}
function saveUserLibrary(kind,item){let a=userLibrary(kind);a.unshift({...item,id:item.id||Date.now(),kind,created:item.created||new Date().toLocaleString()});store.set(userLibraryKey(kind),a)}
function updateUserLibrary(kind,id,data){let a=userLibrary(kind),i=a.findIndex(x=>String(x.id)===String(id));if(i<0)return false;a[i]={...a[i],...data,modified:new Date().toLocaleString()};store.set(userLibraryKey(kind),a);return true}
function deleteUserLibrary(kind,id){let a=userLibrary(kind).filter(x=>String(x.id)!==String(id));store.set(userLibraryKey(kind),a)}
function openUserResource(kind,id){store.set('openResource',{kind,custom:true,id});route('resource')}

function resourceKey(kind,index){return kind+':'+index+':'+appLanguage}
function resourceOverrides(){return store.get('resourceOverrides',{})}
function resourceDeleted(){return store.get('resourceDeleted',{})}
function effectiveResource(kind,index,raw){let base=localizeResource(raw),over=resourceOverrides()[resourceKey(kind,index)];return over?{...base,...over}:base}
function isResourceDeleted(kind,index){return !!resourceDeleted()[kind+':'+index]}
function saveResourceOverride(kind,index,data){let all=resourceOverrides();all[resourceKey(kind,index)]=data;store.set('resourceOverrides',all)}
function resetResourceOverride(kind,index){let all=resourceOverrides();delete all[resourceKey(kind,index)];store.set('resourceOverrides',all)}
function hideResource(kind,index){let all=resourceDeleted();all[kind+':'+index]=true;store.set('resourceDeleted',all)}
function restoreResource(kind,index){let all=resourceDeleted();delete all[kind+':'+index];store.set('resourceDeleted',all)}
function lines(v){return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function pairs(v){return lines(v).map(x=>{let a=x.split('|');return [a.shift().trim(),a.join('|').trim()]})}
function resourceEditor(kind,x){let f=[];const input=(id,label,val,wide='')=>`<label class="field-label ${wide}">${label}<input id="ed_${id}" value="${esc(val||'')}"></label>`;const ta=(id,label,val,wide='wide')=>`<label class="field-label ${wide}">${label}<textarea id="ed_${id}" class="resource-edit-area">${esc(val||'')}</textarea></label>`;
 if(kind==='devotional')f=[input('title',ui('Title','Pamagat'),x.title,'wide'),input('theme',ui('Theme','Tema'),x.theme),input('scripture',ui('Main Scripture','Pangunahing Talata'),x.scripture),ta('reflection',ui('Reflection','Pagninilay'),x.reflection),ta('application',ui('Application','Aplikasyon'),x.application),ta('questions',ui('Reflection Questions — one per line','Mga Tanong — isa bawat linya'),(x.questions||[]).join('\n')),ta('prayer',ui('Prayer','Panalangin'),x.prayer),input('memory',ui('Memory Verse','Talatang Isasaulo'),x.memory),input('reading',ui('Suggested Reading','Iminungkahing Pagbasa'),x.reading)];
 if(kind==='exhortation')f=[input('title',ui('Title','Pamagat'),x.title,'wide'),input('category',ui('Category','Kategorya'),x.category),input('main',ui('Main Scripture','Pangunahing Talata'),x.main),ta('intro',ui('Introduction','Panimula'),x.intro),ta('points',ui('Teaching Points — Heading | Explanation, one per line','Teaching Points — Heading | Paliwanag, isa bawat linya'),(x.points||[]).map(a=>a.join(' | ')).join('\n')),ta('support',ui('Supporting Scriptures — one per line','Mga Kaugnay na Talata — isa bawat linya'),(x.support||[]).join('\n')),ta('application',ui('Application','Aplikasyon'),x.application),ta('challenge',ui('Challenge','Hamon'),x.challenge),ta('prayer',ui('Prayer','Panalangin'),x.prayer)];
 if(kind==='study')f=[input('title',ui('Title','Pamagat'),x.title,'wide'),input('type',ui('Study Type','Uri ng Pag-aaral'),x.type),input('passage',ui('Main Passage','Pangunahing Talata'),x.passage),ta('objective',ui('Objective','Layunin'),x.objective),ta('background',ui('Background and Context','Konteksto'),x.background),ta('questions',ui('Discussion Questions — one per line','Mga Tanong — isa bawat linya'),(x.questions||[]).join('\n')),ta('leader_notes',ui('Leader Notes','Tala para sa Leader'),x.leader_notes),ta('application',ui('Application','Aplikasyon'),x.application),ta('prayer',ui('Prayer','Panalangin'),x.prayer)];
 if(kind==='kids')f=[input('title',ui('Lesson Title','Pamagat ng Aralin'),x.title,'wide'),input('age',ui('Age Group','Edad'),x.age),input('story',ui('Bible Story Passage','Talata ng Kuwento'),x.story),input('image',ui('Picture Path','Path ng Larawan'),x.image,'wide'),ta('opening',ui('Opening Prayer','Pambungad na Panalangin'),x.opening),ta('lesson',ui('Teaching Lesson','Aralin'),x.lesson),ta('questions',ui('Questions — one per line','Mga Tanong — isa bawat linya'),(x.questions||[]).join('\n')),ta('activity',ui('Activity','Gawain'),x.activity),ta('craft','Craft',x.craft),input('memory',ui('Memory Verse','Talatang Isasaulo'),x.memory,'wide'),ta('closing',ui('Closing Prayer','Pangwakas na Panalangin'),x.closing)];
 if(kind==='prayer')f=[input('title',ui('Prayer Title','Pamagat ng Panalangin'),x.title,'wide'),input('category',ui('Category','Kategorya'),x.category,'wide'),ta('text',ui('Prayer','Panalangin'),x.text)];
 return `<div id="resourceEditor" class="card resource-editor"><h2>✏️ ${ui('Edit Resource','I-edit ang Materyales')}</h2><div class="form-grid">${f.join('')}</div><div class="creator-buttons"><button class="primary" id="saveResourceEdit">${ui('Save Changes','I-save ang Pagbabago')}</button><button class="ghost" id="cancelResourceEdit">${ui('Cancel','Kanselahin')}</button></div><div class="notice small-note">${ui('Your edits are saved only in this browser. The original built-in resource remains available through Restore Original.','Sa browser lamang mase-save ang edits. Maibabalik ang original gamit ang Restore Original.')}</div></div>`
}
function collectResourceEdit(kind){let g=id=>$('#ed_'+id)?.value.trim()||'',o={};
 if(kind==='devotional')o={title:g('title'),theme:g('theme'),scripture:g('scripture'),reflection:g('reflection'),application:g('application'),questions:lines(g('questions')),prayer:g('prayer'),memory:g('memory'),reading:g('reading')};
 if(kind==='exhortation')o={title:g('title'),category:g('category'),main:g('main'),intro:g('intro'),points:pairs(g('points')),support:lines(g('support')),application:g('application'),challenge:g('challenge'),prayer:g('prayer')};
 if(kind==='study')o={title:g('title'),type:g('type'),passage:g('passage'),objective:g('objective'),background:g('background'),questions:lines(g('questions')),leader_notes:g('leader_notes'),application:g('application'),prayer:g('prayer')};
 if(kind==='kids')o={title:g('title'),age:g('age'),story:g('story'),image:g('image'),opening:g('opening'),lesson:g('lesson'),questions:lines(g('questions')),activity:g('activity'),craft:g('craft'),memory:g('memory'),closing:g('closing')};
 if(kind==='prayer')o={title:g('title'),category:g('category'),text:g('text')};return o}

function openBibleReference(reference,sourceElement=null){
 const r=parseBibleReference(reference);if(!r)return toast('Bible reference was not recognised');
 const sourceOverlay=sourceElement?.closest?.('#resourcePresentationOverlay');
 const presentationOverlay=sourceOverlay||document.getElementById('resourcePresentationOverlay');
 const attachedSnapshot=presentationOverlay?._presentationSnapshot||null;
 const savedPresentation=attachedSnapshot||getPresentationReturn()||getPresentationSnapshot()||pendingPresentationReturn;
 const explicitlyFromPresentation=!!sourceOverlay||sourceElement?.dataset?.fromPresentation==='true'||document.body.classList.contains('resource-presentation-active')||!!presentationOverlay||!!pendingPresentationReturn;
 if(explicitlyFromPresentation&&savedPresentation){
  const payload={...savedPresentation,scrollTop:presentationOverlay?.scrollTop||savedPresentation.scrollTop||0,active:true};
  savePresentationSnapshot(payload);
  savePresentationReturn(payload);
  store.set('returnToPresentation',true);
  store.set('returnToResource',false);
 }else{
  clearPresentationReturn();
  store.set('returnToPresentation',false);
  store.set('returnToResource',true);
 }
 document.getElementById('resourcePresentationOverlay')?.remove();
 document.body.classList.remove('resource-presentation-active');
 document.getElementById('exitResourcePresentation')?.remove();
 state.book=r.book;state.chapter=r.chapter;state.focusVerse=r.verse;route('read');
}
function returnToPresentation(){
 const snapshot=getPresentationReturn()||getPresentationSnapshot();
 store.set('returnToPresentation',false);
 store.set('returnToResource',false);
 state.focusVerse=null;
 if(!snapshot){route('resource');return}
 clearPresentationReturn();
 startResourcePresentation({...snapshot,restoreScroll:snapshot.scrollTop||0});
}
function exitPresentationKeepBible(){
 const snapshot=getPresentationReturn()||getPresentationSnapshot();
 const destination=snapshot?.originPage||'home';
 document.getElementById('resourcePresentationOverlay')?.remove();
 document.getElementById('exitResourcePresentation')?.remove();
 document.body.classList.remove('resource-presentation-active');
 clearPresentationSnapshot();
 clearPresentationReturn();
 store.set('returnToPresentation',false);
 store.set('returnToResource',false);
 if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
 route(destination);
}
function wireScriptureLinks(root=document){
 root.querySelectorAll('[data-bible-ref]').forEach(el=>{
  el.type='button';
  el.style.pointerEvents='auto';
  if(el.closest('#resourcePresentationOverlay'))el.dataset.fromPresentation='true';
  el.onclick=e=>{e.preventDefault();e.stopPropagation();openBibleReference(el.dataset.bibleRef,el)};
 });
}
function makePresentationScripturesClickable(root){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  const parent=node.parentElement;
  if(!parent||parent.closest('button,a,script,style,textarea,input'))return;
  const text=node.nodeValue||'',refs=extractBibleReferences(text);
  if(!refs.length)return;
  let cursor=0,frag=document.createDocumentFragment();
  const matches=[];
  refs.forEach(ref=>{let start=text.indexOf(ref,cursor);if(start<0)start=text.indexOf(ref);if(start>=0)matches.push({ref,start,end:start+ref.length})});
  matches.sort((a,b)=>a.start-b.start);
  matches.forEach(m=>{if(m.start<cursor)return;if(m.start>cursor)frag.appendChild(document.createTextNode(text.slice(cursor,m.start)));const b=document.createElement('button');b.type='button';b.className='scripture-link inline-scripture';b.dataset.bibleRef=m.ref;b.textContent=m.ref;b.setAttribute('aria-label','Open '+m.ref+' in Bible reader');frag.appendChild(b);cursor=m.end});
  if(cursor<text.length)frag.appendChild(document.createTextNode(text.slice(cursor)));
  if(matches.length)node.replaceWith(frag);
 });
 wireScriptureLinks(root);
}
// Capture presentation context before any scripture button handler runs.
// This is deliberately independent of GitHub, service workers, and online status.
document.addEventListener('click',e=>{
 const target=e.target?.closest?.('[data-bible-ref]');
 if(!target)return;
 const overlay=document.getElementById('resourcePresentationOverlay');
 if(!overlay&&!document.body.classList.contains('resource-presentation-active'))return;
 const snapshot=overlay?._presentationSnapshot||getPresentationSnapshot()||pendingPresentationReturn;
 if(!snapshot)return;
 const payload={...snapshot,scrollTop:overlay?.scrollTop||snapshot.scrollTop||0,active:true};
 target.dataset.fromPresentation='true';
 savePresentationSnapshot(payload);
 savePresentationReturn(payload);
 store.set('returnToPresentation',true);
 store.set('returnToResource',false);
},true);
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove('show'),1800)}
function closeMenu(){const side=$('#sidebar'),overlay=$('#sidebarOverlay'),menu=$('#menu');side.classList.remove('open');overlay.classList.remove('open');document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}
function openMenu(){const side=$('#sidebar'),overlay=$('#sidebarOverlay'),menu=$('#menu');side.classList.add('open');overlay.classList.add('open');document.body.classList.add('menu-open');menu.setAttribute('aria-expanded','true')}
function toggleMenu(){const open=$('#sidebar').classList.contains('open');open?closeMenu():openMenu()}
function route(p,updateHash=true){if(!validPages.has(p))p='home';if(p!==state.page)state.previousPage=state.page||'home';state.page=p;document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));closeMenu();if(updateHash&&location.hash!==`#${p}`)history.pushState(null,'',`#${p}`);render();const back=$('#pageBack');if(back)back.hidden=p==='home';view.classList.remove('page-enter');void view.offsetWidth;view.classList.add('page-enter');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){const target=state.previousPage&&state.previousPage!==state.page?state.previousPage:'home';route(target)}
buildNavigation();
$('#menu').onclick=toggleMenu;
$('#pageBack').onclick=goBack;
$('#sidebarOverlay').onclick=closeMenu;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
window.addEventListener('popstate',()=>route(location.hash.slice(1)||'home',false));
$('#language').onclick=()=>setLanguage(appLanguage==='en'?'tl':'en');
$('#theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('dm_theme',document.body.classList.contains('dark')?'dark':'light')};
if(localStorage.getItem('dm_theme')==='dark')document.body.classList.add('dark');
function title(t,s){$('#pageTitle').textContent=t;$('#pageSub').textContent=s;const back=$('#pageBack');if(back)back.setAttribute('aria-label',ui('Return to previous page','Bumalik sa nakaraang pahina'))}
function localizeResource(x){return appLanguage==='tl'&&x&&x.tl?{...x,...x.tl}:x}
function ui(en,tl){return appLanguage==='tl'?tl:en}
function ref(v){return `${v.b} ${v.c}:${v.v}`}
function favs(){return store.get('favs')}
function isFav(r){return favs().some(x=>x.r===r)}
function toggleFav(v){let a=favs(),r=ref(v);a=isFav(r)?a.filter(x=>x.r!==r):[{r,x:v.x},...a];store.set('favs',a);toast(isFav(r)?'Added to favourites':'Removed from favourites');render()}
function highlights(){return store.get('highlights',{})}
function notesMap(){return store.get('verseNotes',{})}
function saveLast(){store.set('lastBook',state.book);store.set('lastChapter',state.chapter)}
function localDateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function recordReadingActivity(){let activity=store.get('readingActivity',{}),key=localDateKey();activity[key]=(activity[key]||0)+1;store.set('readingActivity',activity)}
function readingStreak(){let activity=store.get('readingActivity',{}),current=0,longest=0,run=0;for(let i=0;i<730;i++){let d=new Date();d.setDate(d.getDate()-i);if(activity[localDateKey(d)]){run++;if(i===current)current=run}else{if(i===0)continue;longest=Math.max(longest,run);if(current===0&&run)current=run;run=0}}longest=Math.max(longest,run,current);return {current,longest}}
function weekReadingDays(){let activity=store.get('readingActivity',{}),days=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);days.push({date:d,done:!!activity[localDateKey(d)]})}return days}
function dashboardPlanStats(){let plans=allReadingPlans(),progress=store.get('planProgress',{});let active=plans.find(p=>{let done=p.readings.filter((_,i)=>progress[p.id+'-'+i]).length;return done>0&&done<p.readings.length});if(!active)return {active:null,done:0,total:0};let done=active.readings.filter((_,i)=>progress[active.id+'-'+i]).length;return {active,done,total:active.readings.length}}
function dayOfYear(date=new Date()){const start=new Date(date.getFullYear(),0,0);const tzOffset=(start.getTimezoneOffset()-date.getTimezoneOffset())*60000;return Math.floor((date-start+tzOffset)/86400000)}
function dailyVerse(verses){const list=Array.isArray(verses)&&verses.length?verses:V;return list[(dayOfYear()-1)%list.length]}
function activeVerses(){return appLanguage==='tl'&&window.TAGALOG_VERSES?window.TAGALOG_VERSES:V}
function bibleName(){return appLanguage==='tl'?'Ang Dating Biblia (1905)':'World English Bible (WEB)'}
function showBibleLoading(){title(ui('Loading Bible…','Nilo-load ang Bibliya…'),ui('Please wait.','Sandali lamang.'));view.innerHTML=`<div class="card loading-card"><div class="spinner"></div><h2>${ui('Preparing the Bible','Inihahanda ang Bibliya')}</h2><p>${ui('The Tagalog Bible is downloaded only once and then kept in your browser cache.','Isang beses lamang ida-download ang Tagalog Bible at pagkatapos ay ise-save sa browser cache.')}</p></div>`}
function home(){
 title(ui('Bible Study Dashboard','Dashboard ng Bible Study'),ui('Continue reading, see your progress, and quickly return to the tools you already use.','Ipagpatuloy ang pagbasa, tingnan ang progreso, at mabilis na bumalik sa mga tool na ginagamit mo.'));
 const f=favs().length,n=store.get('notes').length,h=Object.keys(highlights()).length,d=store.get('reading',{}),done=Object.keys(d).length,av=activeVerses(),tv=dailyVerse(av),pct=Math.round(done/1189*100),streak=readingStreak(),week=weekReadingDays(),plan=dashboardPlanStats(),verseNotesCount=Object.keys(notesMap()).length;
 const greeting=new Date().getHours()<12?ui('Good morning','Magandang umaga'):new Date().getHours()<18?ui('Good afternoon','Magandang hapon'):ui('Good evening','Magandang gabi');
 const favourite=favs()[0];
 const planCard=plan.active?`<article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('GUIDED READING PLAN','GABAY SA PAGBASA')}</span><h3>${esc(appLanguage==='tl'?(plan.active.tlTitle||plan.active.title):plan.active.title)}</h3></div><b>${plan.done}/${plan.total}</b></div><div class="progress"><span style="width:${Math.round(plan.done/plan.total*100)}%"></span></div><p>${ui('Continue where you left off in your active plan.','Ipagpatuloy kung saan ka huminto sa iyong aktibong plano.')}</p><button class="primary" onclick="route('plans')">${ui('Continue plan','Ipagpatuloy ang plano')} →</button></article>`:`<article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('GUIDED READING PLANS','MGA GABAY SA PAGBASA')}</span><h3>${ui('Start a reading plan','Magsimula ng reading plan')}</h3></div><span>🗓</span></div><p>${ui('Choose a built-in plan or create a personalised plan when you are ready.','Pumili ng built-in plan o gumawa ng personalised plan kapag handa ka na.')}</p><button class="ghost" onclick="route('plans')">${ui('View plans','Tingnan ang mga plano')} →</button></article>`;
 const favouriteCard=favourite?`<article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('SAVED FAVOURITE','NA-SAVE NA PABORITO')}</span><h3>${esc(favourite.r)}</h3></div><span>★</span></div><p>“${esc(favourite.x)}”</p><button class="ghost" onclick="route('favourites')">${ui('Open favourites','Buksan ang mga paborito')} →</button></article>`:`<article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('FAVOURITE VERSES','MGA PABORITONG TALATA')}</span><h3>${ui('Save verses you want to revisit','Mag-save ng mga talatang nais balikan')}</h3></div><span>☆</span></div><p>${ui('Tap a verse while reading and select the favourite star.','I-tap ang talata habang nagbabasa at piliin ang favourite star.')}</p><button class="ghost" onclick="route('read')">${ui('Open Bible','Buksan ang Bibliya')} →</button></article>`;
 view.innerHTML=`<section class="growth-hero"><div><span class="badge light">VERSION 62 • MODERN UI</span><h2>${greeting} 👋</h2><p>${ui('Pick up where you stopped and keep your Bible study simple.','Magpatuloy kung saan ka huminto at panatilihing simple ang iyong Bible study.')}</p><div class="hero-actions"><button class="primary" id="continue">${ui('Continue reading','Ipagpatuloy ang pagbasa')} ${esc(state.book)} ${state.chapter}</button><button class="ghost light-btn" onclick="route('search')">${ui('Search the Bible','Maghanap sa Bibliya')}</button></div></div><div class="verse-card"><span class="small-light">${ui('VERSE OF THE DAY','TALATA NG ARAW')}</span><br>“${esc(tv.x)}”<br><small>${ref(tv)}</small></div></section>
 <section class="growth-summary-grid">
  <button class="card growth-stat" onclick="route('reading')"><span>📖</span><div><b>${done}</b><small>${ui('of 1,189 chapters completed','sa 1,189 kabanata ang natapos')}</small></div><strong>${pct}%</strong></button>
  <button class="card growth-stat" onclick="route('read')"><span>🔥</span><div><b>${streak.current}</b><small>${ui('day reading streak','araw na tuloy-tuloy')}</small></div><strong>${ui('Best','Pinakamataas')}: ${streak.longest}</strong></button>
  <button class="card growth-stat" onclick="route('highlights')"><span>🖍</span><div><b>${h}</b><small>${ui('saved highlights','na-save na highlight')}</small></div><strong>${ui('Open','Buksan')} →</strong></button>
  <button class="card growth-stat" onclick="route('verseNotes')"><span>🗒</span><div><b>${verseNotesCount}</b><small>${ui('verse notes','tala sa talata')}</small></div><strong>${ui('Open','Buksan')} →</strong></button>
 </section>
 <section class="growth-main-grid"><article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('THIS WEEK','NGAYONG LINGGO')}</span><h3>${ui('Days you opened the Bible','Mga araw na binuksan mo ang Bibliya')}</h3></div><b>${week.filter(x=>x.done).length}/7</b></div><div class="week-strip">${week.map(x=>`<div class="week-day ${x.done?'done':''}"><span>${x.date.toLocaleDateString(appLanguage==='tl'?'fil-PH':'en-NZ',{weekday:'short'}).slice(0,2)}</span><i>${x.done?'✓':'·'}</i></div>`).join('')}</div><button class="text-link" onclick="route('read')">${ui('Read the Bible →','Basahin ang Bibliya →')}</button></article>${planCard}</section>
 <section class="growth-main-grid">${favouriteCard}<article class="card growth-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('QUICK ACTIONS','MABILIS NA GAWAIN')}</span><h3>${ui('Go straight to a feature','Pumunta agad sa feature')}</h3></div><span>⚡</span></div><div class="activity-grid"><button onclick="route('read')"><b>📖</b><span>${ui('Open Bible','Buksan ang Bibliya')}</span></button><button onclick="route('search')"><b>🔎</b><span>${ui('Search','Maghanap')}</span></button><button onclick="route('plans')"><b>🗓</b><span>${ui('Guided Plans','Mga Gabay')}</span></button><button onclick="route('creator')"><b>✨</b><span>${ui('AI Create','AI Gumawa')}</span></button></div></article></section>
 <section class="card growth-panel activity-panel"><div class="panel-heading"><div><span class="eyebrow">${ui('MY SAVED STUDY','AKING NA-SAVE NA PAG-AARAL')}</span><h3>${ui('Your existing Bible study activity','Ang kasalukuyan mong Bible study activity')}</h3></div></div><div class="activity-grid"><button onclick="route('favourites')"><b>${f}</b><span>★ ${ui('Favourites','Paborito')}</span></button><button onclick="route('highlights')"><b>${h}</b><span>🖍 ${ui('Highlights','Highlights')}</span></button><button onclick="route('verseNotes')"><b>${verseNotesCount}</b><span>🗒 ${ui('Verse notes','Tala sa talata')}</span></button><button onclick="route('notes')"><b>${n}</b><span>📝 ${ui('Study notes','Study notes')}</span></button></div></section>
 <section class="card home-support-card"><div class="home-support-icon">❤️</div><div class="home-support-copy"><h3>${ui('Support De Mayo Bible Ministry','Suportahan ang De Mayo Bible Ministry')}</h3><p>${ui('Help keep this Bible ministry free and growing.','Tumulong upang manatiling libre at patuloy na lumago ang ministry na ito.')}</p></div><div class="home-support-actions"><a class="primary sponsor-button" href="https://github.com/sponsors/romerdemayo" target="_blank" rel="noopener noreferrer">❤️ ${ui('Sponsor on GitHub','Mag-sponsor sa GitHub')}</a><button class="ghost" id="learnSupport">${ui('Learn more','Alamin pa')}</button></div></section>`;
 $('#continue').onclick=()=>route('read');$('#learnSupport').onclick=()=>route('support');
}

function readerToolbar(){const inPresentation=store.get('returnToPresentation',false)||!!getPresentationReturn()||!!pendingPresentationReturn,back=inPresentation?`<button class="primary back-to-presentation" id="backToPresentation">← ${ui('Back to Presentation','Bumalik sa Presentation')}</button><button class="ghost exit-presentation-reader" id="exitPresentationKeepBible">✕ ${ui('Exit Presentation','Isara ang Presentation')}</button>`:(store.get('returnToResource',false)?`<button class="ghost" id="backToResource">← ${ui('Back to resource','Bumalik sa materyales')}</button>`:'');return `<div class="toolbar reader-tools">${back}<span class="translation-pill">${bibleName()}</span><select id="book">${B.map(x=>`<option ${x.name===state.book?'selected':''}>${x.name}</option>`).join('')}</select><button class="ghost" id="prev">←</button><button class="ghost" id="next">→</button><button class="ghost" id="smaller">A−</button><button class="ghost" id="larger">A+</button><button class="primary" id="presentBibleChapter">🖥️ ${ui('Present Chapter','I-present ang Kabanata')}</button></div>`}
function presentCurrentBibleChapter(){
 const verses=activeVerses().filter(x=>x.b===state.book&&x.c===state.chapter);
 const chapterTitle=`${state.book} ${state.chapter}`;
 const html=`<div class="bible-chapter-presentation">${verses.map(v=>`<p class="presentation-bible-verse${state.focusVerse===v.v?' reference-focus':''}"><sup>${v.v}</sup> ${esc(v.x)}</p>`).join('')}</div>`;
 startResourcePresentation({title:chapterTitle,html,originPage:'read'});
}
async function read(){
 title(ui('Read Bible','Basahin ang Bibliya'),ui('Tap a verse for highlight, note, or favourite options.','I-tap ang talata upang i-highlight, lagyan ng tala, o gawing paborito.'));
 if(appLanguage==='tl'&&!window.TAGALOG_VERSES){showBibleLoading();try{await window.DM_TAGALOG_BIBLE.load()}catch(e){view.innerHTML=`<div class="empty"><h2>Hindi ma-load ang Tagalog Bible</h2><p>Kumonekta sa internet sa unang paggamit, pagkatapos ay subukan muli.</p><button class="primary" onclick="read()">Subukan muli</button></div>`;return}}
 let AV=activeVerses(),book=B.find(x=>x.name===state.book)||B[0],vv=AV.filter(x=>x.b===state.book&&x.c===state.chapter),hm=highlights(),nm=notesMap();saveLast();recordReadingActivity();
 view.innerHTML=`${readerToolbar()}<div class="reader"><div class="card chapter-list"><h3>${book.name}</h3>${Array.from({length:book.chapters},(_,i)=>`<button class="${i+1===state.chapter?'active':''}" data-ch="${i+1}">${i+1}</button>`).join('')}</div><article class="card scripture" style="font-size:${state.font}px"><h2>${state.book} ${state.chapter}</h2>${vv.map((v,i)=>{let r=ref(v),c=hm[r]||'';return `<div class="verse ${c?'highlight '+c:''} ${state.focusVerse===v.v?'reference-focus':''}" data-verse="${i}" id="v${v.v}"><sup>${v.v}</sup><span>${esc(v.x)}</span><div class="verse-actions"><button class="icon" title="Favourite" data-fav="${i}">${isFav(r)?'★':'☆'}</button>${nm[r]?'<span class="note-dot" title="Has note">●</span>':''}</div></div>`}).join('')}</article></div><div class="verse-sheet" id="verseSheet"></div>`;
 $('#book').onchange=e=>{state.book=e.target.value;state.chapter=1;state.focusVerse=null;read()};
 if($('#backToPresentation'))$('#backToPresentation').onclick=returnToPresentation;
 if($('#exitPresentationKeepBible'))$('#exitPresentationKeepBible').onclick=exitPresentationKeepBible;
 if($('#backToResource'))$('#backToResource').onclick=()=>{store.set('returnToResource',false);state.focusVerse=null;route('resource')};
 if($('#presentBibleChapter'))$('#presentBibleChapter').onclick=presentCurrentBibleChapter;
 if(state.focusVerse){setTimeout(()=>{const target=document.getElementById('v'+state.focusVerse);target?.scrollIntoView({behavior:'smooth',block:'center'})},120)}
 document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{state.chapter=+b.dataset.ch;read()});
 document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(vv[+b.dataset.fav])});
 document.querySelectorAll('[data-verse]').forEach(el=>el.onclick=()=>openVerseSheet(vv[+el.dataset.verse],el));
 $('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);
 $('#smaller').onclick=()=>{state.font=Math.max(15,state.font-1);store.set('fontSize',state.font);read()};
 $('#larger').onclick=()=>{state.font=Math.min(28,state.font+1);store.set('fontSize',state.font);read()};
}
function verseNoteDraft(v){const r=ref(v);return appLanguage==='tl'?`TALATA: ${r}

PAGMAMASID:
Basahing mabuti ang talata: “${v.x}” Tukuyin ang mahahalagang salita, utos, pangako, babala, o katotohanan.

ANO ANG IPINAPAKITA NITO TUNGKOL SA DIYOS:
Ipinapaalala ng talatang ito na ang Diyos ay tapat at ang Kanyang Salita ay karapat-dapat sundin.

PANGUNAHING KATOTOHANAN:
Ang pananampalatayang biblikal ay hindi lamang kaalaman; humahantong ito sa pagtitiwala at pagsunod.

PERSONAL NA APLIKASYON:
Anong pag-iisip, ugali, desisyon, o relasyon ang kailangang iayon sa talatang ito? Isulat ang isang tiyak na hakbang na gagawin mo.

PANALANGIN:
Panginoon, tulungan Mo akong maunawaan at isabuhay ang katotohanan ng ${r}. Bigyan Mo ako ng karunungan, pananampalataya, at lakas na sumunod. Amen.

KONKLUSYON:
Ang ${r} ay paanyaya na tanggapin ang katotohanan ng Diyos at tumugon nang may pananampalataya.

MGA IMINUMUNGKAHING MATUTUHAN:
• Basahin ang buong kabanata para sa tamang konteksto.
• Hanapin ang mga kaugnay na talata.
• Isulat ang isang praktikal na pagsunod para sa linggong ito.
• Balikan ang tala at idagdag kung paano kumilos ang Diyos.`:`VERSE: ${r}

OBSERVATION:
Read the verse carefully: “${v.x}” Identify key words, commands, promises, warnings, or truths.

WHAT THIS REVEALS ABOUT GOD:
This verse reminds us that God is faithful and that His Word deserves our trust and obedience.

KEY TRUTH:
Biblical faith is not merely information; it leads to trust and obedient living.

PERSONAL APPLICATION:
What thought, habit, decision, or relationship should be brought into line with this verse? Record one specific action you will take.

PRAYER:
Lord, help me understand and live the truth of ${r}. Give me wisdom, faith, and strength to obey You. Amen.

CONCLUSION:
${r} invites us to receive God’s truth and respond with active faith.

SUGGESTED LEARNINGS:
• Read the whole chapter for context.
• Find related Scriptures.
• Record one practical act of obedience for this week.
• Revisit this note and add how God worked.`}
function verseNotePrompt(v){return `Create a careful, editable Bible verse study note for ${ref(v)} using this verse text: “${v.x}”. Use the ${appLanguage==='tl'?'Tagalog':'English'} language. Include: passage context, observation, important words, what the verse reveals about God, central biblical truth, supporting Scriptures, personal application, reflection questions, prayer, conclusion, and suggested learnings or next study steps. Clearly distinguish Scripture from commentary. Do not invent historical facts, Greek/Hebrew meanings, quotations, or cross-references. Encourage reading the whole chapter and reviewing the draft against Scripture.`}
function openVerseSheet(v,verseEl){const r=ref(v),hm=highlights(),nm=notesMap(),sheet=$('#verseSheet'),currentColour=hm[r]||'';document.querySelectorAll('.verse.note-open').forEach(x=>x.classList.remove('note-open'));verseEl=verseEl||document.getElementById('v'+v.v);verseEl?.classList.add('note-open');sheet.className='verse-sheet open inline-verse-sheet';if(verseEl)verseEl.insertAdjacentElement('afterend',sheet);sheet.innerHTML=`<div class="sheet-card"><button class="sheet-close" id="closeSheet">×</button><div class="verse-note-heading"><b>📝 ${ui('Verse Notes','Tala sa Talata')}</b><span>${r}</span></div><p class="verse-note-text">${esc(v.x)}</p><div class="highlight-tools"><div><b>${ui('Highlight colour','Kulay ng highlight')}</b><div class="colour-row"><button class="${currentColour==='yellow'?'selected':''}" data-colour="yellow">🟨 ${ui('Yellow','Dilaw')}</button><button class="${currentColour==='green'?'selected':''}" data-colour="green">🟩 ${ui('Green','Berde')}</button><button class="${currentColour==='blue'?'selected':''}" data-colour="blue">🟦 ${ui('Blue','Asul')}</button><button class="${currentColour==='pink'?'selected':''}" data-colour="pink">🩷 ${ui('Pink','Rosas')}</button></div></div>${currentColour?`<button class="danger remove-highlight" id="removeHighlight">✕ ${ui('Remove Highlight','Alisin ang Highlight')}</button>`:''}</div><textarea id="verseNote" placeholder="${ui('Add your personal note...','Idagdag ang iyong personal na tala...')}">${esc(nm[r]||'')}</textarea><div class="ai-assist-row"><button class="ghost" id="verseAIDraft">✨ ${ui('Create Study Note','Gumawa ng Study Note')}</button><button class="ghost" id="verseAIPrompt">🤖 ${ui('Prepare AI Prompt','Ihanda ang AI Prompt')}</button></div><div class="notice small-note">${ui('The built-in draft works offline. The AI prompt is copied for use in ChatGPT and should be reviewed against Scripture.','Gumagana offline ang built-in draft. Kokopyahin ang AI prompt para gamitin sa ChatGPT at dapat suriin ayon sa Kasulatan.')}</div><div class="sheet-actions"><button class="ghost" id="sheetFav">${isFav(r)?'★ Remove favourite':'☆ Add favourite'}</button>${nm[r]?`<button class="danger" id="removeVerseNote">${ui('Remove note','Burahin ang tala')}</button>`:''}<button class="primary" id="saveVerseNote">${ui('Save note','I-save ang tala')}</button></div></div>`;
 $('#closeSheet').onclick=()=>{sheet.classList.remove('open');verseEl?.classList.remove('note-open')};
 document.querySelectorAll('[data-colour]').forEach(b=>b.onclick=()=>{let x=highlights(),c=b.dataset.colour;x[r]=c;store.set('highlights',x);toast(ui('Highlight saved','Na-save ang highlight'));read()});
 if($('#removeHighlight'))$('#removeHighlight').onclick=()=>{if(!confirm(ui(`Remove the highlight from ${r}?`,`Alisin ang highlight sa ${r}?`)))return;let x=highlights();delete x[r];store.set('highlights',x);toast(ui('Highlight removed','Inalis ang highlight'));read()};
 $('#sheetFav').onclick=()=>toggleFav(v);
 $('#verseAIDraft').onclick=()=>{$('#verseNote').value=verseNoteDraft(v);toast(ui('Study note draft created','Nagawa ang study note draft'))};
 $('#verseAIPrompt').onclick=async()=>{let prompt=verseNotePrompt(v);$('#verseNote').value=prompt;try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('AI prompt prepared and copied','Naihanda at nakopya ang AI prompt'))};
 if($('#removeVerseNote'))$('#removeVerseNote').onclick=()=>{if(!confirm(ui(`Delete the note for ${r}?`,`Burahin ang tala para sa ${r}?`)))return;let x=notesMap();delete x[r];store.set('verseNotes',x);toast(ui('Verse note deleted','Nabura ang tala sa talata'));read()};
 $('#saveVerseNote').onclick=()=>{let x=notesMap(),val=$('#verseNote').value.trim();if(val)x[r]=val;else delete x[r];store.set('verseNotes',x);toast(ui('Verse note saved','Na-save ang tala sa talata'));read()};
}
function move(d){let bi=B.findIndex(x=>x.name===state.book),c=state.chapter+d;if(c<1&&bi>0){bi--;state.book=B[bi].name;c=B[bi].chapters}else if(c>B[bi].chapters&&bi<B.length-1){bi++;state.book=B[bi].name;c=1}state.chapter=c;read();window.scrollTo(0,0)}
function markText(text,q){if(!q)return esc(text);const safe=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return esc(text).replace(new RegExp(`(${safe})`,'ig'),'<mark>$1</mark>')}
async function search(){
 title(ui('Search Bible','Maghanap sa Bibliya'),ui('Search words, phrases, references, books, and testaments.','Maghanap ng salita, parirala, reference, aklat, at tipan.'));if(appLanguage==='tl'&&!window.TAGALOG_VERSES){showBibleLoading();try{await window.DM_TAGALOG_BIBLE.load()}catch(e){view.innerHTML='<div class="empty">Kailangan ng internet sa unang paggamit ng Tagalog Bible.</div>';return}}let AV=activeVerses();let recent=store.get('recentSearches',[]);
 view.innerHTML=`<div class="toolbar"><input id="q" placeholder="Try: faith, fear not, John 3:16"><select id="bookFilter"><option value="">All books</option>${B.map(x=>`<option>${x.name}</option>`).join('')}</select><select id="test"><option value="">Both Testaments</option><option value="OT">Old Testament</option><option value="NT">New Testament</option></select><button class="primary" id="go">Search</button></div>${recent.length?`<div class="recent">Recent: ${recent.map(x=>`<button data-recent="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}<div id="results" class="results"><div class="empty">Enter at least two characters to search.</div></div>`;
 function go(){let raw=$('#q').value.trim(),q=raw.toLowerCase(),t=$('#test').value,bf=$('#bookFilter').value;if(q.length<2)return;recent=[raw,...recent.filter(x=>x.toLowerCase()!==q)].slice(0,6);store.set('recentSearches',recent);let exact=q.match(/^(.+?)\s+(\d+):(\d+)$/),r;if(exact)r=AV.filter(v=>v.b.toLowerCase()===exact[1]&&v.c==exact[2]&&v.v==exact[3]);else r=AV.filter(v=>(!t||v.t===t)&&(!bf||v.b===bf)&&(v.x.toLowerCase().includes(q)||ref(v).toLowerCase().includes(q))).slice(0,400);$('#results').innerHTML=r.length?r.map((v,i)=>`<div class="result"><b>${ref(v)}</b><button class="icon" style="float:right" data-r="${i}">${isFav(ref(v))?'★':'☆'}</button><p>${markText(v.x,q)}</p><button class="text-link" data-open="${i}">Open chapter</button></div>`).join(''):`<div class="empty">No verses found.</div>`;document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>toggleFav(r[+b.dataset.r]));document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{let v=r[+b.dataset.open];state.book=v.b;state.chapter=v.c;route('read');setTimeout(()=>document.getElementById('v'+v.v)?.scrollIntoView({behavior:'smooth',block:'center'}),100)})}
 $('#go').onclick=go;$('#q').onkeydown=e=>{if(e.key==='Enter')go()};document.querySelectorAll('[data-recent]').forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.recent;go()});
}
function favourites(){title('Favourites','Verses you have starred for quick access.');let a=favs();view.innerHTML=a.length?`<div class="results">${a.map((x,i)=>`<div class="result"><b>${x.r}</b><button class="danger" style="float:right" data-del="${i}">Remove</button><p>${esc(x.x)}</p></div>`).join('')}</div>`:`<div class="empty">No favourites yet.</div>`;document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{a.splice(+b.dataset.del,1);store.set('favs',a);favourites()})}
function highlightsPage(){title(ui('Highlights','Mga Highlight'),ui('View, search, change, or remove your highlighted verses.','Tingnan, hanapin, palitan, o alisin ang mga na-highlight na talata.'));let hm=highlights(),all=Object.entries(hm).map(([r,c])=>{let v=activeVerses().find(x=>ref(x)===r)||V.find(x=>ref(x)===r);return v&&{v,c}}).filter(Boolean);view.innerHTML=`<div class="toolbar"><input id="highlightSearch" placeholder="${ui('Search highlights...','Maghanap sa highlights...')}"><select id="highlightColourFilter"><option value="">${ui('All colours','Lahat ng kulay')}</option><option value="yellow">${ui('Yellow','Dilaw')}</option><option value="green">${ui('Green','Berde')}</option><option value="blue">${ui('Blue','Asul')}</option><option value="pink">${ui('Pink','Rosas')}</option></select></div><div id="highlightResults"></div>`;
 function draw(){let q=$('#highlightSearch').value.trim().toLowerCase(),colour=$('#highlightColourFilter').value,items=all.filter(x=>(!colour||x.c===colour)&&(!q||ref(x.v).toLowerCase().includes(q)||x.v.x.toLowerCase().includes(q)));$('#highlightResults').innerHTML=items.length?`<div class="results">${items.map((x,i)=>`<div class="result highlight ${x.c}"><div class="highlight-card-actions"><button class="ghost" data-open-highlight="${i}">${ui('Open','Buksan')}</button><button class="ghost" data-change-highlight="${i}">${ui('Change colour','Palitan ang kulay')}</button><button class="danger" data-remove-highlight="${i}">${ui('Remove highlight','Alisin ang highlight')}</button></div><b>${ref(x.v)}</b><p>${esc(x.v.x)}</p></div>`).join('')}</div>`:`<div class="empty">${ui('No matching highlights.','Walang katugmang highlight.')}</div>`;
 document.querySelectorAll('[data-open-highlight]').forEach(b=>b.onclick=()=>{let x=items[+b.dataset.openHighlight];state.book=x.v.b;state.chapter=x.v.c;state.focusVerse=x.v.v;route('read');setTimeout(()=>document.getElementById('v'+x.v.v)?.scrollIntoView({behavior:'smooth',block:'center'}),100)});
 document.querySelectorAll('[data-change-highlight]').forEach(b=>b.onclick=()=>{let x=items[+b.dataset.changeHighlight];state.book=x.v.b;state.chapter=x.v.c;state.focusVerse=x.v.v;route('read');setTimeout(()=>{document.getElementById('v'+x.v.v)?.scrollIntoView({behavior:'smooth',block:'center'});openVerseSheet(x.v)},100)});
 document.querySelectorAll('[data-remove-highlight]').forEach(b=>b.onclick=()=>{let x=items[+b.dataset.removeHighlight],r=ref(x.v);if(!confirm(ui(`Remove the highlight from ${r}?`,`Alisin ang highlight sa ${r}?`)))return;let map=highlights();delete map[r];store.set('highlights',map);all=all.filter(y=>ref(y.v)!==r);toast(ui('Highlight removed','Inalis ang highlight'));draw()})}
 $('#highlightSearch').oninput=draw;$('#highlightColourFilter').onchange=draw;draw()}
function verseNotes(){title(ui('Verse Notes','Tala sa Talata'),ui('Edit or remove personal notes attached directly to Scripture.','I-edit o burahin ang personal na tala na nakakabit sa Kasulatan.'));let nm=notesMap(),items=Object.entries(nm);view.innerHTML=items.length?`<div class="results">${items.map(([r,n],i)=>{let v=V.find(x=>ref(x)===r);return `<div class="result" data-note-card="${i}"><div style="float:right;display:flex;gap:8px"><button class="ghost" data-edit-note="${i}">${ui('Edit','I-edit')}</button><button class="danger" data-delete-note="${i}">${ui('Delete','Burahin')}</button></div><b>${r}</b>${v?`<p>${esc(v.x)}</p>`:''}<div class="note-box" data-note-display="${i}">${esc(n)}</div><div data-note-editor="${i}" style="display:none;margin-top:12px"><textarea class="wide" data-note-input="${i}">${esc(n)}</textarea><div class="ai-assist-row"><button class="primary" data-save-note="${i}">${ui('Save Changes','I-save ang Pagbabago')}</button><button class="ghost" data-cancel-note="${i}">${ui('Cancel','Kanselahin')}</button></div></div></div>`}).join('')}</div>`:`<div class="empty">${ui('No verse notes yet. Tap a verse while reading.','Wala pang tala sa talata. I-tap ang isang talata habang nagbabasa.')}</div>`;
 document.querySelectorAll('[data-edit-note]').forEach(b=>b.onclick=()=>{let i=+b.dataset.editNote;document.querySelector(`[data-note-display="${i}"]`).style.display='none';document.querySelector(`[data-note-editor="${i}"]`).style.display='block';document.querySelector(`[data-note-input="${i}"]`).focus()});
 document.querySelectorAll('[data-cancel-note]').forEach(b=>b.onclick=()=>{let i=+b.dataset.cancelNote;document.querySelector(`[data-note-display="${i}"]`).style.display='block';document.querySelector(`[data-note-editor="${i}"]`).style.display='none'});
 document.querySelectorAll('[data-save-note]').forEach(b=>b.onclick=()=>{let i=+b.dataset.saveNote,[r]=items[i],val=document.querySelector(`[data-note-input="${i}"]`).value.trim(),x=notesMap();if(val)x[r]=val;else delete x[r];store.set('verseNotes',x);toast(ui('Verse note updated','Na-update ang tala sa talata'));verseNotes()});
 document.querySelectorAll('[data-delete-note]').forEach(b=>b.onclick=()=>{let i=+b.dataset.deleteNote,[r]=items[i];if(!confirm(ui(`Delete the note for ${r}?`,`Burahin ang tala para sa ${r}?`)))return;let x=notesMap();delete x[r];store.set('verseNotes',x);toast(ui('Verse note deleted','Nabura ang tala sa talata'));verseNotes()})}
function generic(type,label,fields){let arr=store.get(type);title(label,'Saved privately in this browser on this device.');view.innerHTML=`<div class="card"><div class="form-grid">${fields.map(f=>f.kind==='textarea'?`<textarea class="wide" id="${f.id}" placeholder="${f.label}"></textarea>`:`<input id="${f.id}" placeholder="${f.label}">`).join('')}<button class="primary wide" id="save">Save Entry</button></div></div><div class="entries">${arr.length?arr.map((x,i)=>`<div class="entry"><button class="danger" style="float:right" data-del="${i}">Delete</button><h3>${esc(x[fields[0].id]||'Untitled')}</h3>${fields.slice(1).map(f=>x[f.id]?`<p><b>${f.label}:</b> ${esc(x[f.id])}</p>`:'').join('')}<div class="meta">${x.date}</div></div>`).join(''):`<div class="empty">No entries yet.</div>`}</div>`;$('#save').onclick=()=>{let x={date:new Date().toLocaleString()};fields.forEach(f=>x[f.id]=$('#'+f.id).value.trim());if(!x[fields[0].id])return;arr.unshift(x);store.set(type,arr);generic(type,label,fields)};document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{arr.splice(+b.dataset.del,1);store.set(type,arr);generic(type,label,fields)})}
function ministryAssistDraft(type,data){const t=data.title||ui('Untitled Study','Pag-aaral'),topic=data.topic||data.person||ui('Faith and obedience','Pananampalataya at pagsunod'),refx=data.scripture||data.reference||ui('Add the main Bible passage','Idagdag ang pangunahing talata');if(type==='study')return appLanguage==='tl'?`PAMAGAT: ${t}
PAKSA: ${topic}
PANGUNAHING TALATA: ${refx}

LAYUNIN:
Maunawaan ang itinuturo ng talata tungkol sa Diyos, sa tao, at sa tapat na pamumuhay.

KONTEKSTO:
Basahin ang buong kabanata. Isulat kung sino ang nagsasalita, kanino ito sinabi, ano ang pangyayari, at bakit ito mahalaga.

PAGMAMASID:
• Mahahalagang salita o parirala:
• Mga utos, pangako, babala, o halimbawa:
• Mga inuulit na ideya:

PALIWANAG:
Ipaliwanag ang pangunahing mensahe ayon sa konteksto. Ihiwalay nang malinaw ang sinasabi ng Kasulatan sa personal na komentaryo.

ANO ANG IPINAPAKITA TUNGKOL SA DIYOS:
Isulat ang katotohanan tungkol sa karakter, gawain, o kalooban ng Diyos.

MGA TANONG SA PAG-AARAL:
1. Ano ang malinaw na sinasabi ng talata?
2. Ano ang ipinapakita nito tungkol sa Diyos?
3. Anong maling pag-iisip o gawain ang itinutuwid nito?
4. Anong pangako o utos ang dapat tugunan?
5. Paano ito isasabuhay ngayong linggo?

APLIKASYON:
Isulat ang isang tiyak, makatotohanan, at nasusukat na hakbang ng pagsunod.

PANALANGIN:
Panginoon, buksan Mo ang aming isip at puso upang maunawaan at sundin ang Iyong Salita. Amen.

KONKLUSYON:
Ibuod ang pangunahing katotohanan sa dalawa o tatlong pangungusap at magbigay ng malinaw na hamon.

MGA IMINUMUNGKAHING MATUTUHAN:
• Basahin ang talata sa iba pang salin.
• Suriin ang mga kaugnay na talata.
• Tukuyin ang isang katotohanang dapat tandaan.
• Magplano ng follow-up reflection sa susunod na linggo.`:`TITLE: ${t}
TOPIC: ${topic}
MAIN PASSAGE: ${refx}

OBJECTIVE:
Understand what the passage teaches about God, people, and faithful living.

CONTEXT:
Read the whole chapter. Record who is speaking, who is addressed, what is happening, and why it matters.

OBSERVATION:
• Important words or phrases:
• Commands, promises, warnings, or examples:
• Repeated ideas:

INTERPRETATION:
Explain the main message in context. Clearly separate what Scripture says from personal commentary.

WHAT THIS REVEALS ABOUT GOD:
Record the truth shown about God’s character, work, or will.

STUDY QUESTIONS:
1. What does the passage clearly say?
2. What does it reveal about God?
3. What wrong belief or behaviour does it correct?
4. What promise or command requires a response?
5. How should this be lived this week?

APPLICATION:
Write one specific, realistic, and measurable act of obedience.

PRAYER:
Lord, open our minds and hearts to understand and obey Your Word. Amen.

CONCLUSION:
Summarise the central truth in two or three sentences and give a clear closing challenge.

SUGGESTED LEARNINGS:
• Read the passage in another translation.
• Examine related Scriptures.
• Identify one truth to remember.
• Schedule a follow-up reflection next week.`;return appLanguage==='tl'?`PAKSA NG PANALANGIN: ${t}
TAO / MINISTRY: ${data.person||''}
KAUGNAY NA TALATA: ${refx}

KASALUKUYANG KALAGAYAN:
${data.body||'Isulat ang sitwasyon, pangangailangan, at mahahalagang detalye.'}

PASASALAMAT:
Ama, salamat sa Iyong kabutihan, katapatan, at presensya sa bawat panahon.

PAGSUKO:
Inilalagay namin sa Iyo ang kahilingang ito. Tulungan Mo kaming magtiwala sa Iyong karunungan at kalooban.

TIYAK NA KAHILINGAN:
• Magbigay ng karunungan at malinaw na patnubay.
• Maglaan ng lakas, kapayapaan, at kinakailangang tulong.
• Kumilos sa paraang magbibigay-luwalhati kay Cristo.

PANALANGING AYON SA KASULATAN:
Gamitin ang ${refx} bilang gabay, nang hindi inilalayo ang talata sa tamang konteksto.

PANANAMPALATAYA AT PAGSUNOD:
Ipakita kung may praktikal na hakbang, pakikipagkasundo, paghihintay, o paglilingkod na dapat gawin.

BUONG PANALANGIN:
Panginoon, alam Mo ang aming pangangailangan tungkol sa ${t.toLowerCase()}. Bigyan Mo kami ng karunungan, kapayapaan, lakas, at pananampalatayang sumunod. Kumilos Ka ayon sa Iyong mabuting kalooban, at gamitin ang sitwasyong ito para sa Iyong kaluwalhatian. Sa pangalan ni Jesus, amen.


PAGTATAPOS:
Sa pangalan ni Jesus, amen.`:`PRAYER TOPIC: ${t}
PERSON / MINISTRY: ${data.person||''}
RELATED SCRIPTURE: ${refx}

CURRENT SITUATION:
${data.body||'Record the situation, need, and important details.'}

THANKSGIVING:
Father, thank You for Your goodness, faithfulness, and presence in every season.

SURRENDER:
We place this request in Your hands. Help us trust Your wisdom and will.

SPECIFIC REQUESTS:
• Provide wisdom and clear guidance.
• Give strength, peace, and the help that is needed.
• Work in a way that brings honour to Christ.

SCRIPTURE-GUIDED PRAYER:
Use ${refx} as a guide without removing the verse from its proper context.

FAITH AND OBEDIENCE:
Record any practical step, reconciliation, waiting, or service that should follow.

COMPLETE PRAYER:
Lord, You know our need concerning ${t.toLowerCase()}. Give us wisdom, peace, strength, and faith to obey You. Work according to Your good will, and use this situation for Your glory. In Jesus’ name, amen.


CONCLUSION:
In Jesus’ name, amen.`}
function simpleResourceDefaults(type,data={}){
 const seed=(data.topic||data.person||data.title||'').trim();
 const low=seed.toLowerCase();
 const choices=[
  [['anxiety','worry','fear','peace','takot','pag-aalala'],ui('Finding Peace in God','Kapayapaan Mula sa Diyos'),'Philippians 4:6-7'],
  [['faith','trust','pananampalataya','tiwala'],ui('Walking by Faith','Pamumuhay sa Pananampalataya'),'Hebrews 11:1-6'],
  [['forgive','forgiveness','patawad','pagpapatawad'],ui('The Freedom of Forgiveness','Ang Kalayaan ng Pagpapatawad'),'Ephesians 4:31-32'],
  [['hope','encouragement','pag-asa','lakas'],ui('Hope That Does Not Disappoint','Pag-asang Hindi Bumabigo'),'Romans 5:3-5'],
  [['love','pag-ibig'],ui('Living in God’s Love','Pamumuhay sa Pag-ibig ng Diyos'),'1 Corinthians 13:4-7'],
  [['prayer','panalangin'],ui('Growing Through Prayer','Paglago sa Panalangin'),'Matthew 6:9-13'],
  [['salvation','kaligtasan'],ui('Saved by Grace','Iniligtas sa Biyaya'),'Ephesians 2:8-10']
 ];
 let found=choices.find(([keys])=>keys.some(k=>low.includes(k)))||choices[1];
 if(type==='prayer') return {title:data.title||ui(`Prayer for ${seed||'God’s Guidance'}`,`Panalangin para sa ${seed||'Gabay ng Diyos'}`),scripture:data.scripture||found[2]};
 if(type==='sermon') return {title:data.title||found[1],scripture:data.text||found[2],theme:data.theme||seed||ui('Faithful obedience to God','Tapat na pagsunod sa Diyos')};
 return {title:data.title||found[1],scripture:data.scripture||found[2],topic:data.topic||seed||ui('Faith and obedience','Pananampalataya at pagsunod')};
}
function ministryAssistPrompt(type,data){const d={...data,...simpleResourceDefaults(type,data)},kind=type==='study'?'Bible study':'prayer';return `Create a complete, editable ${kind} in ${appLanguage==='tl'?'Tagalog':'English'}. Use this title: “${d.title}”. Main topic/person: “${d.topic||d.person||''}”. Main Scripture: “${d.scripture}”. Existing details: “${d.instructions||d.details||d.body||''}”. ${type==='study'?'Include a brief introduction, passage context, three clear study points, supporting Scriptures, reflection questions, practical application, conclusion, and closing prayer.':'Include thanksgiving, surrender, specific requests, Scripture-guided prayer, a complete pastoral prayer, practical faith response, and a clear closing in Jesus’ name.'} Clearly distinguish Scripture from commentary. Do not invent Bible quotations or guarantee a particular outcome. Keep it Christ-centred, biblically careful, compassionate, and ready to edit.`}
function assistedGeneric(type,label,fields,assistType){let arr=store.get(type);title(label,ui('Enter only a topic if you wish. The app can create the title and Bible passage when they are blank.','Paksa lamang ang kailangang ilagay. Maaaring gumawa ang app ng pamagat at talata kapag blangko.'));view.innerHTML=`<div class="creator-layout"><section class="card"><div class="form-grid">${fields.map(f=>f.kind==='textarea'?`<textarea class="wide" id="${f.id}" placeholder="${f.label}"></textarea>`:`<input id="${f.id}" placeholder="${f.label}">`).join('')}<div class="wide ai-assist-row"><button class="primary" id="assistDraft">✨ ${ui('Create Complete Draft','Gumawa ng Kumpletong Draft')}</button><button class="ghost" id="assistPrompt">🤖 ${ui('Prepare AI Prompt','Ihanda ang AI Prompt')}</button><button class="ghost" id="assistClear">${ui('Clear','Burahin')}</button></div><div class="notice small-note wide">${ui('Title and Bible passage are optional. Leave them blank and the app will suggest them. Each saved item is stored separately and privately on this device.','Opsyonal ang pamagat at talata. Iwanang blangko at magmumungkahi ang app. Bawat nai-save ay hiwalay at pribado sa device na ito.')}</div></div></section><section class="card"><div class="draft-head"><h3>${ui('Editable Draft','Editable Draft')}</h3><span class="pill">${ui('Review before saving','Suriin bago i-save')}</span></div><textarea id="body" class="draft-area" placeholder="${ui('Your complete draft will appear here...','Lalabas dito ang kumpletong draft...')}"></textarea><div class="creator-buttons"><button class="primary" id="save">${assistType==='study'?ui('Save to Bible Study Library','I-save sa Bible Study Library'):ui('Save to Prayer Library','I-save sa Prayer Library')}</button><button class="ghost" id="copyEntry">${ui('Copy','Kopyahin')}</button></div></section></div><div class="entries">${arr.length?arr.map((x,i)=>`<div class="entry"><button class="danger" style="float:right" data-del="${i}">${ui('Delete','Burahin')}</button><h3>${esc(x.title||x[fields[0].id]||ui('Untitled','Walang pamagat'))}</h3>${x.scripture?`<p><b>${ui('Passage','Talata')}:</b> ${scriptureLink(x.scripture)}</p>`:''}<details><summary>${ui('Open saved item','Buksan ang naka-save')}</summary><pre class="saved-resource">${esc(x.body||'')}</pre></details><div class="meta">${x.date}</div></div>`).join(''):`<div class="empty">${ui('No saved items yet.','Wala pang naka-save.')}</div>`}</div>`;
 const values=()=>Object.fromEntries(fields.map(f=>[f.id,$('#'+f.id).value.trim()]));
 const applyDefaults=()=>{let v=values(),d=simpleResourceDefaults(assistType,v);if($('#title')&&!v.title)$('#title').value=d.title||'';if($('#scripture')&&!v.scripture)$('#scripture').value=d.scripture||'';return {...values(),...d,title:$('#title')?.value.trim()||d.title,scripture:$('#scripture')?.value.trim()||d.scripture};};
 $('#assistDraft').onclick=()=>{let d=applyDefaults();$('#body').value=ministryAssistDraft(assistType,d);toast(ui('Complete draft created','Nagawa ang kumpletong draft'))};
 $('#assistPrompt').onclick=async()=>{let d=applyDefaults(),prompt=ministryAssistPrompt(assistType,d);$('#body').value=prompt;try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('AI prompt prepared and copied','Naihanda at nakopya ang AI prompt'))};
 $('#assistClear').onclick=()=>fields.forEach(f=>$('#'+f.id).value='');
 $('#copyEntry').onclick=async()=>{if(!$('#body').value.trim())return;try{await navigator.clipboard.writeText($('#body').value);toast(ui('Copied','Nakopya'))}catch{}};
 $('#save').onclick=()=>{let d=applyDefaults(),x={date:new Date().toLocaleString(),...d,body:$('#body').value.trim()};if(!x.body)x.body=ministryAssistDraft(assistType,x);saveUserLibrary(assistType,{title:x.title,scripture:x.scripture,topic:x.topic||x.person||'',category:assistType==='prayer'?ui('My Prayers','Aking mga Panalangin'):ui('My Bible Studies','Aking mga Bible Study'),text:assistType==='prayer'?x.body:'',body:x.body,type:assistType==='study'?ui('Personal Study','Personal na Pag-aaral'):undefined});store.set(type,[]);toast(assistType==='study'?ui('Saved to Bible Study Library','Nai-save sa Bible Study Library'):ui('Saved to Prayer Library','Nai-save sa Prayer Library'));route(assistType==='study'?'studies':'prayerlibrary')};
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm(ui('Delete this saved item?','Burahin ang naka-save na ito?'))){arr.splice(+b.dataset.del,1);store.set(type,arr);assistedGeneric(type,label,fields,assistType)}});wireScriptureLinks()
}
function notes(){assistedGeneric('notes',ui('Simple Bible Study Creator','Simpleng Bible Study Creator'),[{id:'topic',label:ui('Topic (optional)','Paksa (opsyonal)')},{id:'title',label:ui('Title (optional — AI can create it)','Pamagat (opsyonal — maaaring gawin ng AI)')},{id:'scripture',label:ui('Bible passage (optional — AI can suggest it)','Talata (opsyonal — maaaring imungkahi ng AI)')},{id:'instructions',label:ui('Extra instructions or personal notes (optional)','Karagdagang tagubilin o personal notes (opsyonal)'),kind:'textarea'}],'study')}
function prayer(){assistedGeneric('prayers',ui('Simple Prayer Creator','Simpleng Prayer Creator'),[{id:'person',label:ui('Prayer topic or person (optional)','Paksa o tao (opsyonal)')},{id:'title',label:ui('Prayer title (optional — AI can create it)','Pamagat (opsyonal — maaaring gawin ng AI)')},{id:'scripture',label:ui('Related Scripture (optional — AI can suggest it)','Kaugnay na talata (opsyonal — maaaring imungkahi ng AI)')},{id:'details',label:ui('Important details (optional)','Mahahalagang detalye (opsyonal)'),kind:'textarea'}],'prayer')}

const SERMON_IDEAS=[
 {title:'Peace in the Middle of the Storm',text:'Mark 4:35-41',theme:'Jesus is present and powerful when life feels out of control',purpose:'Lead listeners to trust Christ rather than surrender to fear.',points:['The storm does not mean Jesus has abandoned us','Jesus has authority over what frightens us','Faith responds by trusting His presence and word'],support:['Psalm 46:1-3','Isaiah 41:10','Philippians 4:6-7'],challenge:'Name one fear, pray over it daily, and take one obedient step instead of letting fear decide.'},
 {title:'Walking by Faith, Not by Sight',text:'2 Corinthians 5:7',theme:'God calls His people to trust Him beyond what they can currently see',purpose:'Encourage practical obedience while waiting for clarity.',points:['Faith rests on God’s character','Faith obeys before every answer is visible','Faith keeps moving with hope'],support:['Proverbs 3:5-6','Hebrews 11:1','Romans 8:28'],challenge:'Choose one area where you have delayed obedience and take the next faithful step this week.'},
 {title:'The Grace That Changes Us',text:'Ephesians 2:8-10',theme:'We are saved by grace and created for a life of good works',purpose:'Help listeners receive grace and respond with grateful obedience.',points:['Grace is God’s gift, not our achievement','Salvation gives us a new identity','Grace sends us into purposeful service'],support:['Titus 2:11-12','2 Corinthians 5:17','James 2:17'],challenge:'Thank God for His grace, then serve one person in a practical way without seeking recognition.'},
 {title:'When God Seems Silent',text:'Psalm 13:1-6',theme:'Biblical faith can lament honestly while continuing to trust God',purpose:'Give hope to people who are waiting, grieving, or discouraged.',points:['Bring honest pain to God','Remember His steadfast love','Choose worship while waiting'],support:['Lamentations 3:22-24','Isaiah 40:31','Romans 12:12'],challenge:'Write an honest prayer of lament, then finish it by naming three truths about God.'},
 {title:'Forgiven People Forgive',text:'Ephesians 4:31-32',theme:'The forgiveness we receive in Christ reshapes how we treat others',purpose:'Call listeners toward healing, mercy, and wise reconciliation.',points:['Release bitterness before it rules the heart','Remember how Christ has forgiven us','Practise forgiveness with truth and wisdom'],support:['Colossians 3:13','Matthew 6:14-15','Romans 12:18'],challenge:'Pray for grace to forgive one person and take one safe, wise step toward peace.'},
 {title:'Abiding in Christ',text:'John 15:1-8',theme:'Lasting fruit grows from continual dependence on Jesus',purpose:'Move listeners from spiritual striving to daily communion with Christ.',points:['Jesus is the true source of life','Pruning can produce deeper fruit','Abiding shapes prayer, character, and service'],support:['Galatians 5:22-23','Psalm 1:1-3','Colossians 2:6-7'],challenge:'Set aside fifteen undistracted minutes each day this week to read, pray, and remain with Christ.'},
 {title:'Courage for the Next Step',text:'Joshua 1:1-9',theme:'God’s presence gives courage for faithful responsibility',purpose:'Strengthen listeners facing change, responsibility, or uncertainty.',points:['Courage begins with God’s promise','God’s Word steadies our decisions','Obedience turns courage into action'],support:['Deuteronomy 31:8','Psalm 27:1','2 Timothy 1:7'],challenge:'Identify the next right step God’s Word makes clear and do it before the week ends.'},
 {title:'A Life That Seeks First the Kingdom',text:'Matthew 6:25-34',theme:'Trusting the Father frees us to put His kingdom first',purpose:'Address anxiety and reorder daily priorities around God’s reign.',points:['The Father knows what we need','Worry cannot carry tomorrow','Kingdom priorities give today direction'],support:['Psalm 55:22','1 Peter 5:7','Philippians 4:19'],challenge:'Replace one repeated worry with prayer and one concrete kingdom-focused action.'},
 {title:'Faithful in the Small Things',text:'Luke 16:10',theme:'God values faithfulness in ordinary responsibilities',purpose:'Encourage consistency, integrity, and service in everyday life.',points:['Small choices reveal the heart','Faithfulness prepares us for greater trust','Ordinary service can honour God'],support:['Colossians 3:23-24','Matthew 25:21','Galatians 6:9'],challenge:'Choose one neglected responsibility and complete it faithfully as an act of worship.'},
 {title:'Hope That Holds',text:'Romans 5:1-5',theme:'Christian hope grows through God’s love even in suffering',purpose:'Help listeners endure hardship without losing confidence in God.',points:['We have peace with God through Christ','Trials can form perseverance and character','The Holy Spirit pours God’s love into our hearts'],support:['James 1:2-4','Hebrews 6:19','2 Corinthians 4:16-18'],challenge:'Encourage one person who is suffering and remind them of one specific promise of God.'}
];
function randomSermonIdea(saved=[]){
 const used=new Set((saved||[]).map(x=>(x.title||'').trim().toLowerCase()));
 const available=SERMON_IDEAS.filter(x=>!used.has(x.title.toLowerCase()));
 const pool=available.length?available:SERMON_IDEAS;
 return {...pool[Math.floor(Math.random()*pool.length)]};
}
function completeSermonDraft(data){
 const d=data.idea||randomSermonIdea([]), title=data.title||d.title, passage=data.text||d.text, theme=data.theme||d.theme;
 const points=d.points||['See what the passage reveals about God','Respond to the truth with faith','Live the message through practical obedience'];
 const refs=d.support||['Psalm 119:105','James 1:22','Colossians 3:17'];
 const challenge=d.challenge||'Choose one truth from this message and put it into practice this week.';
 return `SERMON STUDIO\n\nTITLE: ${title}\nMAIN PASSAGE: ${passage}\nCENTRAL THEME: ${theme}\nAUDIENCE / OCCASION: ${data.audience||'Church congregation'}\nMESSAGE FORMAT: ${sermonDepthLabel(data.depth)}\nPURPOSE: ${data.purpose||d.purpose||'Help listeners understand God’s Word and respond with faithful obedience.'}\n\nBIG IDEA\n${theme}. Because God is faithful, we can respond with trust, obedience, and hope.\n\nOPENING PRAYER\nLord, open our hearts and minds as we hear Your Word. Help us see Christ clearly, receive Your truth humbly, and obey You faithfully. In Jesus’ name, amen.\n\nSCRIPTURE READING\nRead ${passage}. Invite listeners to notice what the passage reveals about God, the human heart, and the response of faith.\n\nINTRODUCTION\nLife often tests what we truly believe. This passage meets us in real situations and reminds us that faith is not merely agreement with truth; it is a response to the God who speaks. Today we will see how ${theme.toLowerCase()}.\n\nBACKGROUND AND CONTEXT\nRead the verses before and after ${passage}. Identify the original setting, the people involved, and the main concern of the passage. Keep the sermon centred on what the text actually says, and clearly distinguish biblical truth from illustration or commentary.\n\nMAIN POINT 1 — ${points[0]}\nGod’s Word begins by directing our attention to who He is. Our circumstances may change quickly, but God’s character remains steady. Faith grows when we interpret our situation through His truth rather than interpreting God through our fear.\nSupporting Scripture: ${refs[0]}\nApplication: Name the belief or fear that competes with this truth. Bring it honestly to God and choose to trust what He has revealed.\n\nMAIN POINT 2 — ${points[1]}\nBiblical faith always calls for a response. The passage does not invite passive listening; it invites repentance, trust, courage, patience, forgiveness, or service. Grace does not leave us unchanged—it teaches us to walk in a new way.\nSupporting Scripture: ${refs[1]}\nApplication: Ask, “What must I stop, begin, believe, or obey because this passage is true?”\n\nMAIN POINT 3 — ${points[2]}\nTruth becomes visible through faithful action. We may not control every outcome, but we can choose the next obedient step. God often forms mature faith through repeated, ordinary acts of trust.\nSupporting Scripture: ${refs[2]}\nApplication: Choose one specific and realistic step you can complete this week.\n\nGOSPEL / CHRIST CONNECTION\nJesus is not merely an example of faithfulness; He is the Saviour who brings us to God, forgives our sin, and gives us new life. Through His death and resurrection, we receive grace to respond to God’s Word with confidence rather than condemnation.\n\nLIFE APPLICATION\n• Personal: Let this truth reshape one attitude or habit.\n• Family: Share the main passage and pray about one practical response together.\n• Church: Encourage or serve someone who needs this truth.\n• Community: Demonstrate Christ’s character through a visible act of love and integrity.\n\nREFLECTION QUESTIONS\n1. What does ${passage} reveal about God?\n2. What response does the passage call for?\n3. What obstacle makes obedience difficult for me?\n4. Which supporting Scripture strengthens the message?\n5. What will I do differently this week?\n\nCLOSING CHALLENGE\n${challenge}\n\nCONCLUSION\nReturn to the central truth: ${theme}. We do not leave merely informed; we leave invited to trust and obey. God’s grace is sufficient for the next faithful step.\n\nCLOSING PRAYER\nFather, thank You for speaking through Your Word. Help us remember what You have shown us and give us courage to obey. Form the character of Christ in us, strengthen those who are weary, and use our lives for Your glory. In Jesus’ name, amen.\n\nSUGGESTED READING\n${passage}\n${refs.join('\n')}\n\nPERSONAL TESTIMONY\n${data.testimony||'Add your own testimony here. Keep it truthful, relevant, and centred on what God has done.'}\n\nADDITIONAL NOTES\n${data.additional||data.notes||'Add local church application, illustrations, reminders, or extra teaching notes here.'}\n\nSPEAKER NOTES\n${data.notes||'Add delivery reminders, transitions, or clearly labelled illustrations here.'}`;
}

function sermonDepthLabel(depth){return ({devotion:ui('Devotional','Debosyonal'),short:ui('Short Message','Maikling Mensahe'),standard:ui('Standard Sermon','Karaniwang Sermon'),full:ui('Full Sermon','Buong Sermon'),extended:ui('Extended Teaching','Mas Malalim na Pagtuturo')})[depth]||ui('Full Sermon','Buong Sermon')}
function sermonDraft(data){const t=data.title||ui('A Faith That Responds','Pananampalatayang Tumutugon'),p=data.text||ui('Add the main Bible passage','Idagdag ang pangunahing talata'),th=data.theme||ui('Faithful obedience to God','Tapat na pagsunod sa Diyos'),a=data.audience||ui('Church congregation','Kongregasyon'),pu=data.purpose||ui('Help listeners understand the passage and respond in practical obedience.','Tulungan ang mga tagapakinig na maunawaan ang talata at tumugon sa praktikal na pagsunod.'),n=data.notes||ui('Add personal testimony, illustrations, church context, and reminders here.','Idagdag dito ang personal na patotoo, illustrations, church context, at reminders.'),d=sermonDepthLabel(data.depth);return appLanguage==='tl'?`SERMON STUDIO

PAMAGAT: ${t}
PANGUNAHING TALATA: ${p}
PANGUNAHING TEMA: ${th}
TAGAPAKINIG / OKASYON: ${a}
URI NG MENSAHE: ${d}
LAYUNIN: ${pu}

BIG IDEA
Isulat sa isang malinaw na pangungusap ang pangunahing katotohanang itinuturo ng talata.

OPENING PRAYER
Panginoon, buksan Mo ang aming puso at isip. Tulungan Mo kaming maunawaan ang Iyong Salita at tumugon nang may pananampalataya at pagsunod. Sa pangalan ni Jesus, amen.

OPENING SCRIPTURE
Basahin nang malinaw ang ${p}. Huwag magdagdag ng salita sa teksto; tukuyin kung ang anumang paliwanag ay commentary lamang.

INTRODUCTION / HOOK
• Magsimula sa isang tanong, sitwasyon, o maikling kuwento na kaugnay ng ${th}.
• Ipaliwanag kung bakit mahalaga ang mensahe sa ${a}.
• Ipakilala ang Big Idea at ang inaasahang tugon.

BACKGROUND AT CONTEXT
• Sino ang may-akda o tagapagsalita sa talata?
• Sino ang unang audience?
• Ano ang nangyayari bago at pagkatapos ng passage?
• Anong detalye sa mismong teksto ang mahalaga?
• I-verify ang historical at original-language claims bago gamitin.

MAIN POINT 1 — TINGNAN KUNG SINO ANG DIYOS
Paliwanag:
Ano ang ipinapakita ng passage tungkol sa character, gawa, authority, grace, o faithfulness ng Diyos?

Supporting Scripture:
Magdagdag lamang ng cross-references na nasuri sa Biblia.

Illustration:
[Maglagay ng personal o malinaw na illustration. Huwag ipakita bilang totoong pangyayari kung halimbawa lamang.]

Application:
Ano ang dapat paniwalaan, tigilan, simulan, o sundin?

Personal Notes:

MAIN POINT 2 — UNAWAIN ANG TUGON NG TAO
Paliwanag:
May command, warning, promise, example, sin, o invitation ba sa teksto?

Supporting Scripture:

Illustration:

Application:
Paano ito isasabuhay sa tahanan, trabaho, iglesia, at relationships?

Personal Notes:

MAIN POINT 3 — ISABUHAY ANG KATOTOHANAN
Paliwanag:
Iugnay ang truth ng passage sa isang malinaw at praktikal na act of obedience.

Supporting Scripture:

Illustration:

Application:
Pumili ng isang specific, realistic, at measurable na hakbang ngayong linggo.

Personal Notes:

GOSPEL / CHRIST CONNECTION
Ipaliwanag kung paano nauugnay ang passage sa person at work ni Jesus nang tapat sa context at sa kabuuang mensahe ng Kasulatan. Huwag pilitin ang connection.

LIFE APPLICATION
• Personal: Ano ang kailangang baguhin sa puso o gawain?
• Family: Paano ito isasabuhay sa tahanan?
• Church: Paano tayo maglilingkod o magpapalakas sa iba?
• Community: Paano makikita si Cristo sa ating kilos?

REFLECTION QUESTIONS
1. Ano ang pinakamalinaw na truth mula sa passage?
2. Ano ang ipinapakita nito tungkol sa Diyos?
3. Saan ako kailangang magsisi, magtiwala, o sumunod?
4. Sino ang maaari kong hikayatin gamit ang truth na ito?

CHALLENGE / CALL TO ACTION
Huwag lamang tandaan ang sermon. Pumili ng isang truth at isabuhay ito nang may pananampalataya ngayong linggo.

CONCLUSION
• Ibalik ang Big Idea.
• I-summarise ang tatlong main points.
• Ulitin ang malinaw na response na hinihingi ng passage.
• Magbigay ng pastoral encouragement na nakaugat sa Scripture, hindi sa guaranteed outcome.

CLOSING PRAYER
Panginoon, salamat sa Iyong Salita. Itanim Mo ang katotohanang ito sa aming puso. Bigyan Mo kami ng biyaya at lakas na sumunod, magmahal, at mamuhay para sa Iyong kaluwalhatian. Sa pangalan ni Jesus, amen.

SUGGESTED LEARNINGS / NEXT STUDY
• Basahin muli ang buong chapter.
• Suriin ang cross-references.
• Isulat kung paano nagbago ang iyong pagkaunawa.
• Balikan matapos ang isang linggo at itala kung paano mo naisabuhay ang truth.

SPEAKER NOTES
${n}`:`SERMON STUDIO

TITLE: ${t}
MAIN PASSAGE: ${p}
CENTRAL THEME: ${th}
AUDIENCE / OCCASION: ${a}
MESSAGE FORMAT: ${d}
PURPOSE: ${pu}

BIG IDEA
State the passage's central truth in one clear sentence.

OPENING PRAYER
Lord, open our hearts and minds. Help us understand Your Word and respond with faith and obedience. In Jesus’ name, amen.

OPENING SCRIPTURE
Read ${p} clearly. Do not add words to the text; identify any explanation as commentary.

INTRODUCTION / HOOK
• Begin with a question, situation, or short story connected to ${th}.
• Explain why this message matters to ${a}.
• Introduce the Big Idea and desired response.

BACKGROUND & CONTEXT
• Who is speaking or writing?
• Who was the original audience?
• What happens before and after the passage?
• Which details in the text are essential?
• Verify historical and original-language claims before using them.

MAIN POINT 1 — SEE WHO GOD IS
Explanation:
What does the passage reveal about God's character, work, authority, grace, or faithfulness?

Supporting Scripture:
Add only cross-references you have checked in the Bible.

Illustration:
[Add a personal or clearly labelled illustrative example.]

Application:
What should listeners believe, stop, begin, or obey?

Personal Notes:

MAIN POINT 2 — UNDERSTAND THE HUMAN RESPONSE
Explanation:
Does the text contain a command, warning, promise, example, sin, or invitation?

Supporting Scripture:

Illustration:

Application:
How should this shape home, work, church, and relationships?

Personal Notes:

MAIN POINT 3 — LIVE THE TRUTH
Explanation:
Connect the passage to a clear and practical act of obedience.

Supporting Scripture:

Illustration:

Application:
Choose one specific, realistic, measurable action for this week.

Personal Notes:

GOSPEL / CHRIST CONNECTION
Explain how the passage connects to the person and work of Jesus in a way faithful to its context and the whole message of Scripture. Do not force the connection.

LIFE APPLICATION
• Personal: What must change in my heart or habits?
• Family: How can this truth be lived at home?
• Church: How can we serve or strengthen others?
• Community: How can our actions make Christ visible?

REFLECTION QUESTIONS
1. What is the clearest truth in this passage?
2. What does it reveal about God?
3. Where must I repent, trust, or obey?
4. Who could I encourage with this truth?

CHALLENGE / CALL TO ACTION
Do not merely remember the sermon. Choose one truth and live it faithfully this week.

CONCLUSION
• Return to the Big Idea.
• Summarise the three main points.
• Repeat the clear response called for by the passage.
• Give pastoral encouragement grounded in Scripture, not a guaranteed outcome.

CLOSING PRAYER
Lord, thank You for Your Word. Plant this truth in our hearts. Give us grace and strength to obey, love, and live for Your glory. In Jesus’ name, amen.

SUGGESTED LEARNINGS / NEXT STUDY
• Read the whole chapter again.
• Check the cross-references.
• Record how your understanding changed.
• Review after one week and note how you applied the truth.

SPEAKER NOTES
${n}`}

function sermonPowerPointOutline(data){
 const title=data.title||ui('Sermon Title','Pamagat ng Sermon');
 const passage=data.text||ui('Main Bible Passage','Pangunahing Talata');
 const theme=data.theme||ui('Central Theme','Pangunahing Tema');
 const audience=data.audience||ui('Church Congregation','Kongregasyon');
 return appLanguage==='tl'?`POWERPOINT PRESENTATION SUGGESTION

SLIDE 1 — PAMAGAT
${title}
Pangunahing Talata: ${passage}
Tema: ${theme}

SLIDE 2 — LAYUNIN NG MENSAHE
• Tagapakinig: ${audience}
• Layunin: ${data.purpose||'Idagdag ang nais na tugon ng mga tagapakinig.'}

SLIDE 3 — PAMBUNGAD NA TALATA
• Ipakita ang pangunahing talata.
• I-highlight ang isang key phrase lamang.

SLIDE 4 — INTRODUCTION / HOOK
• Isang maikling tanong, sitwasyon, testimony, o larawan.
• Ipakilala kung bakit mahalaga ang mensahe.

SLIDE 5 — BACKGROUND AT CONTEXT
• May-akda at unang tagapakinig, kung tiyak.
• Sitwasyon ng passage.
• Pangunahing katotohanang dapat maunawaan.

SLIDE 6 — MAIN POINT 1
• Maikling heading.
• Isang pangunahing paliwanag.
• Isang supporting verse.
• Isang application statement.

SLIDE 7 — MAIN POINT 2
• Maikling heading.
• Isang pangunahing paliwanag.
• Isang illustration o halimbawa.
• Isang application statement.

SLIDE 8 — MAIN POINT 3
• Maikling heading.
• Isang pangunahing paliwanag.
• Isang supporting verse.
• Isang challenge para sa tagapakinig.

SLIDE 9 — CHRIST / GOSPEL CONNECTION
• Paano itinuturo ng passage ang character, gawain, biyaya, o pagliligtas ni Cristo?
• Panatilihing tapat sa pangunahing passage.

SLIDE 10 — PRAKTIKAL NA APPLICATION
• Sa personal na buhay
• Sa pamilya at relasyon
• Sa iglesia at paglilingkod
• Isang konkretong hakbang ngayong linggo

SLIDE 11 — REFLECTION QUESTIONS
• Ano ang ipinapakita ng Diyos sa akin?
• Ano ang kailangan kong baguhin o sundin?
• Sino ang kailangan kong hikayatin o paglingkuran?

SLIDE 12 — CONCLUSION
• Ulitin ang Big Idea sa isang pangungusap.
• I-summarise ang tatlong main points.
• Magbigay ng malinaw na call to action.

SLIDE 13 — CLOSING PRAYER
• Pasasalamat
• Pagsisisi at surrender
• Tulong upang maisabuhay ang mensahe

PRESENTATION NOTES
• Gumamit ng maiikling phrases, hindi mahahabang paragraph.
• Isang pangunahing ideya lamang bawat slide.
• Malaking font at malinaw na contrast.
• Ilagay ang buong paliwanag sa speaker notes, hindi sa slide.
• Suriing mabuti ang lahat ng verses bago ipakita.

PERSONAL NOTES
${data.notes||'Idagdag ang personal notes, testimony, larawan, at church announcements dito.'}`:`POWERPOINT PRESENTATION SUGGESTION

SLIDE 1 — TITLE
${title}
Main Passage: ${passage}
Theme: ${theme}

SLIDE 2 — MESSAGE PURPOSE
• Audience: ${audience}
• Purpose: ${data.purpose||'Add the response you want listeners to make.'}

SLIDE 3 — OPENING SCRIPTURE
• Display the main passage.
• Highlight only one key phrase.

SLIDE 4 — INTRODUCTION / HOOK
• Use one short question, situation, testimony, or image.
• Explain why the message matters.

SLIDE 5 — BACKGROUND AND CONTEXT
• Author and original audience, when certain.
• Situation surrounding the passage.
• Main truth listeners need to understand.

SLIDE 6 — MAIN POINT 1
• Short heading.
• One central explanation.
• One supporting verse.
• One application statement.

SLIDE 7 — MAIN POINT 2
• Short heading.
• One central explanation.
• One illustration or example.
• One application statement.

SLIDE 8 — MAIN POINT 3
• Short heading.
• One central explanation.
• One supporting verse.
• One challenge for the audience.

SLIDE 9 — CHRIST / GOSPEL CONNECTION
• How does the passage reveal Christ’s character, work, grace, or saving purpose?
• Keep the connection faithful to the main passage.

SLIDE 10 — PRACTICAL APPLICATION
• Personal life
• Family and relationships
• Church and ministry
• One specific action for this week

SLIDE 11 — REFLECTION QUESTIONS
• What is God showing me?
• What must I change or obey?
• Who should I encourage or serve?

SLIDE 12 — CONCLUSION
• Restate the Big Idea in one sentence.
• Summarise the three main points.
• Give one clear call to action.

SLIDE 13 — CLOSING PRAYER
• Thanksgiving
• Confession and surrender
• Help to live out the message

PRESENTATION NOTES
• Use short phrases rather than long paragraphs.
• Keep one main idea on each slide.
• Use large text and clear contrast.
• Put full explanations in speaker notes, not on the slide.
• Verify every Scripture reference before presenting.

PERSONAL NOTES
${data.notes||'Add personal notes, testimony, image ideas, and church announcements here.'}`
}
function sermonPrompt(data){return `Create a complete, editable Christian sermon in ${appLanguage==='tl'?'Tagalog':'English'} using a ${sermonDepthLabel(data.depth)} format. Title: “${data.title||''}”. Main passage: “${data.text||''}”. Theme: “${data.theme||''}”. Audience: “${data.audience||''}”. Purpose: “${data.purpose||''}”. Personal notes: “${data.notes||''}”. Organise it by ministry sections rather than visible minutes: Big Idea, opening prayer, Scripture reading, introduction/hook, background and context, three main points, careful explanation, checked cross-references, clearly labelled illustrations, personal notes under each point, practical application, Gospel/Christ connection faithful to the passage, reflection questions, challenge, conclusion, closing prayer, and suggested learning. Make the selected message format control depth and detail only. Distinguish Scripture from commentary. Do not invent quotations, historical facts, original-language meanings, promises, or guaranteed outcomes. Keep the main passage central and make every section editable.`}
function sermon(){
 let arr=store.get('sermons',[]);
 title(ui('Sermon Studio','Sermon Studio'),ui('Create a complete sermon, then personalise it with your testimony and additional notes. Every recognised Scripture can be opened in the Bible reader.','Gumawa ng kumpletong sermon at idagdag ang iyong patotoo at mga tala. Maaaring buksan sa Bible reader ang bawat nakikilalang talata.'));
 const saved=arr.length?arr.map((x,i)=>`<article class="entry sermon-card" data-sermon-card="${i}">
  <div class="saved-sermon-head"><div><h3>${esc(x.title||ui('Untitled sermon','Walang pamagat'))}</h3><p><b>${ui('Passage','Talata')}:</b> ${scriptureLink(x.text||'')}</p><p><b>${ui('Format','Uri')}:</b> ${esc(sermonDepthLabel(x.depth))}</p></div><div class="resource-buttons"><button class="primary" data-present="${i}">🖥️ ${ui('Present','I-present')}</button><button class="ghost" data-edit="${i}">✏️ ${ui('Edit','I-edit')}</button><button class="danger" data-del="${i}">${ui('Delete','Burahin')}</button></div></div>
  ${customScripturePanel([x.body,x.testimony,x.additional,x.notes].filter(Boolean).join('\n'),x.text)}
  <details><summary>${ui('Complete sermon — tap to open','Buong sermon — i-tap para buksan')}</summary><div class="saved-sermon readable-sermon">${renderTextWithScriptureLinks(x.body||'')}</div></details>
  ${x.testimony?`<section class="sermon-personal-section"><h4>🗣️ ${ui('Personal Testimony','Personal na Patotoo')}</h4><div>${renderTextWithScriptureLinks(x.testimony)}</div></section>`:''}
  ${x.additional?`<section class="sermon-personal-section"><h4>📝 ${ui('Additional Notes','Karagdagang Tala')}</h4><div>${renderTextWithScriptureLinks(x.additional)}</div></section>`:''}
  <div class="meta">${esc(x.date||'')}</div>
  <div class="card sermon-edit-panel" id="sermonEdit_${i}" hidden>
   <h3>✏️ ${ui('Edit Saved Sermon','I-edit ang Saved Sermon')}</h3>
   <div class="form-grid">
    <label class="field-label wide">${ui('Title','Pamagat')}<input id="se_title_${i}" value="${esc(x.title||'')}"></label>
    <label class="field-label">${ui('Main Bible passage','Pangunahing talata')}<input id="se_text_${i}" value="${esc(x.text||'')}"></label>
    <label class="field-label">${ui('Central theme','Pangunahing tema')}<input id="se_theme_${i}" value="${esc(x.theme||'')}"></label>
    <label class="field-label wide">${ui('Complete sermon content','Buong sermon content')}<textarea id="se_body_${i}" class="draft-area sermon-draft-area">${esc(x.body||'')}</textarea></label>
    <label class="field-label wide">${ui('Your personal testimony','Iyong personal na patotoo')}<textarea id="se_testimony_${i}" class="resource-edit-area">${esc(x.testimony||'')}</textarea></label>
    <label class="field-label wide">${ui('Additional notes, illustrations, or local application','Karagdagang tala, illustration, o local application')}<textarea id="se_additional_${i}" class="resource-edit-area">${esc(x.additional||'')}</textarea></label>
    <label class="field-label wide">${ui('Speaker notes and delivery reminders','Speaker notes at delivery reminders')}<textarea id="se_notes_${i}" class="resource-edit-area">${esc(x.notes||'')}</textarea></label>
   </div>
   <div class="creator-buttons"><button class="primary" data-save-edit="${i}">${ui('Save Changes','I-save ang Pagbabago')}</button><button class="ghost" data-cancel-edit="${i}">${ui('Cancel','Kanselahin')}</button></div>
  </div>
 </article>`).join(''):`<div class="empty">${ui('No saved sermons yet.','Wala pang naka-save na sermon.')}</div>`;
 view.innerHTML=`<div class="creator-layout"><section class="card"><div class="form-grid"><input id="title" placeholder="${ui('Sermon title','Pamagat ng sermon')}"><input id="text" placeholder="${ui('Main Bible passage','Pangunahing talata')}"><input id="theme" placeholder="${ui('Central theme or main truth','Pangunahing tema o katotohanan')}"><input id="audience" placeholder="${ui('Audience or occasion','Tagapakinig o okasyon')}"><input class="wide" id="purpose" placeholder="${ui('Purpose or desired response','Layunin o nais na tugon')}"><label class="field-label wide">${ui('Message format','Uri ng mensahe')}<select id="depth"><option value="devotion">${ui('Devotional','Debosyonal')}</option><option value="short">${ui('Short Message','Maikling Mensahe')}</option><option value="standard">${ui('Standard Sermon','Karaniwang Sermon')}</option><option value="full" selected>${ui('Full Sermon','Buong Sermon')}</option><option value="extended">${ui('Extended Teaching','Mas Malalim na Pagtuturo')}</option></select></label><textarea class="wide sermon-notes" id="testimony" placeholder="${ui('Your personal testimony (optional)','Iyong personal na patotoo (optional)')}"></textarea><textarea class="wide sermon-notes" id="additional" placeholder="${ui('Additional notes, illustrations, local church application, or extra points','Karagdagang tala, illustrations, local church application, o extra points')}"></textarea><textarea class="wide sermon-notes" id="notes" placeholder="${ui('Speaker notes and delivery reminders','Speaker notes at delivery reminders')}"></textarea><div class="wide ai-assist-row"><button class="primary" id="sermonDraft">✨ ${ui('Create Sermon by Points','Gumawa ng Sermon ayon sa Points')}</button><button class="ghost" id="sermonPrompt">🤖 ${ui('Prepare Detailed AI Prompt','Ihanda ang Detalyadong AI Prompt')}</button><button class="ghost" id="sermonPpt">📊 ${ui('PowerPoint Outline','PowerPoint Outline')}</button><button class="ghost" id="sermonClear">${ui('Clear','Burahin')}</button></div><div class="notice small-note wide">${ui('Leave all fields blank for a fresh complete sermon. You can edit the whole message, add your testimony, and add extra notes before or after saving.','Iwanang blanko ang lahat para sa bagong kumpletong sermon. Maaari mong i-edit ang buong mensahe at idagdag ang patotoo at extra notes bago o pagkatapos i-save.')}</div></div></section><section class="card"><div class="draft-head"><h3>${ui('Editable Sermon Workspace','Editable Sermon Workspace')}</h3><span class="pill">${ui('Point-Based','Ayon sa Points')}</span></div><textarea id="body" class="draft-area sermon-draft-area" placeholder="${ui('Your sermon workspace will appear here...','Lalabas dito ang sermon workspace...')}"></textarea><div class="creator-buttons"><button class="primary" id="sermonSave">${ui('Save Sermon','I-save ang Sermon')}</button><button class="primary" id="sermonPresentDraft">🖥️ ${ui('Present Sermon','I-present ang Sermon')}</button><button class="ghost" id="sermonCopy">${ui('Copy Draft','Kopyahin ang Draft')}</button></div><div id="pptPanel" class="notice" style="display:none;margin-top:14px"><div class="draft-head"><h3>📊 ${ui('PowerPoint Slide Outline','PowerPoint Slide Outline')}</h3><span class="pill">${ui('Suggestion only','Suggestion lamang')}</span></div><textarea id="pptBody" class="draft-area" style="min-height:360px"></textarea><div class="creator-buttons"><button class="primary" id="pptCopy">${ui('Copy PowerPoint Outline','Kopyahin ang PowerPoint Outline')}</button></div></div></section></div><div class="entries sermon-entries">${saved}</div>`;
 const values=()=>({title:$('#title').value.trim(),text:$('#text').value.trim(),theme:$('#theme').value.trim(),audience:$('#audience').value.trim(),purpose:$('#purpose').value.trim(),depth:$('#depth').value,testimony:$('#testimony').value.trim(),additional:$('#additional').value.trim(),notes:$('#notes').value.trim(),body:$('#body').value.trim()});
 $('#sermonDraft').onclick=()=>{let v=values(),blank=!v.title&&!v.text&&!v.theme&&!v.audience&&!v.purpose&&!v.testimony&&!v.additional&&!v.notes,idea=blank?randomSermonIdea(arr):null,d=idea||simpleResourceDefaults('sermon',v);if(!v.title)$('#title').value=d.title;if(!v.text)$('#text').value=d.text||d.scripture;if(!v.theme)$('#theme').value=d.theme;if(!v.purpose&&d.purpose)$('#purpose').value=d.purpose;$('#body').value=completeSermonDraft({...values(),idea});toast(blank?ui('A fresh complete sermon was selected and created','Pumili at gumawa ng bagong kumpletong sermon'):ui('Complete sermon created','Nagawa ang kumpletong sermon'))};
 $('#sermonPrompt').onclick=async()=>{let v=values(),d=simpleResourceDefaults('sermon',v);if(!v.title)$('#title').value=d.title;if(!v.text)$('#text').value=d.scripture;if(!v.theme)$('#theme').value=d.theme;let prompt=sermonPrompt(values());$('#body').value=prompt;try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('Detailed AI prompt prepared and copied','Naihanda at nakopya ang detalyadong AI prompt'))};
 $('#sermonPpt').onclick=()=>{let outline=sermonPowerPointOutline(values());$('#pptBody').value=outline;$('#pptPanel').style.display='block';$('#pptPanel').scrollIntoView({behavior:'smooth',block:'start'});toast(ui('PowerPoint outline prepared below','Naihanda sa ibaba ang PowerPoint outline'))};
 $('#pptCopy').onclick=async()=>{if(!$('#pptBody').value.trim())return;try{await navigator.clipboard.writeText($('#pptBody').value);toast(ui('PowerPoint outline copied','Nakopya ang PowerPoint outline'))}catch{toast(ui('Select the outline and copy it manually','Piliin ang outline at kopyahin nang manual'))}};
 $('#sermonClear').onclick=()=>{['title','text','theme','audience','purpose','testimony','additional','notes','body'].forEach(id=>$('#'+id).value='');$('#depth').value='full'};
 $('#sermonCopy').onclick=async()=>{if(!$('#body').value.trim())return toast(ui('Create or write a sermon first','Gumawa o sumulat muna ng sermon'));try{await navigator.clipboard.writeText($('#body').value);toast(ui('Sermon copied','Nakopya ang sermon'))}catch{toast(ui('Select the sermon and copy it manually','Piliin ang sermon at kopyahin nang manual'))}};
 $('#sermonPresentDraft').onclick=()=>{const v=values();if(!v.body&&!v.title&&!v.text)return toast(ui('Create or write a sermon first','Gumawa o sumulat muna ng sermon'));startResourcePresentation({title:v.title||ui('Sermon','Sermon'),passage:v.text||'',body:[v.body,v.testimony,v.additional,v.notes].filter(Boolean).join('\n\n'),originPage:'sermon'})};
 $('#sermonSave').onclick=()=>{let x={date:new Date().toLocaleString(),...values()};if(!x.title){let d=simpleResourceDefaults('sermon',x);x.title=d.title;x.text=x.text||d.scripture;x.theme=x.theme||d.theme}if(!x.body){let idea=randomSermonIdea(arr);if(!x.title)x.title=idea.title;if(!x.text)x.text=idea.text;if(!x.theme)x.theme=idea.theme;x.body=completeSermonDraft({...x,idea})}arr.unshift(x);store.set('sermons',arr);sermon()};
 document.querySelectorAll('[data-present]').forEach(b=>b.onclick=()=>{const i=+b.dataset.present,x=arr[i];if(!x)return;startResourcePresentation({title:x.title||ui('Sermon','Sermon'),passage:x.text||'',body:[x.body,x.testimony,x.additional,x.notes].filter(Boolean).join('\n\n'),originPage:'sermon'})});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm(ui('Delete this saved sermon?','Burahin ang saved sermon na ito?'))){arr.splice(+b.dataset.del,1);store.set('sermons',arr);sermon()}});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const panel=$('#sermonEdit_'+b.dataset.edit);panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'})});
 document.querySelectorAll('[data-cancel-edit]').forEach(b=>b.onclick=()=>{$('#sermonEdit_'+b.dataset.cancelEdit).hidden=true});
 document.querySelectorAll('[data-save-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.saveEdit,x=arr[i];x.title=$('#se_title_'+i).value.trim();x.text=$('#se_text_'+i).value.trim();x.theme=$('#se_theme_'+i).value.trim();x.body=$('#se_body_'+i).value.trim();x.testimony=$('#se_testimony_'+i).value.trim();x.additional=$('#se_additional_'+i).value.trim();x.notes=$('#se_notes_'+i).value.trim();x.modified=new Date().toLocaleString();store.set('sermons',arr);sermon();toast(ui('Sermon changes saved','Na-save ang pagbabago sa sermon'))});
 wireScriptureLinks();
}
function kidsFormatLabel(format){return ({simple:ui('Simple Lesson','Simpleng Aralin'),standard:ui('Standard Lesson','Karaniwang Aralin'),complete:ui('Complete Ministry Lesson','Kumpletong Ministry Lesson')})[format]||ui('Standard Lesson','Karaniwang Aralin')}
function kidsDraft(data){const t=data.title||ui('Learning to Trust God','Matutong Magtiwala sa Diyos'),p=data.passage||data.verse||ui('Add the main Bible passage','Idagdag ang pangunahing talata'),v=data.verse||p,a=data.age||ui('Ages 6–12','Edad 6–12'),g=data.goal||ui('Children will understand the Bible truth and choose one way to obey God.','Mauunawaan ng mga bata ang katotohanan sa Biblia at pipili ng isang paraan upang sundin ang Diyos.'),n=data.notes||ui('Add teacher notes, class needs, materials, or illustration ideas here.','Idagdag dito ang teacher notes, class needs, materials, o illustration ideas.'),f=kidsFormatLabel(data.format);return appLanguage==='tl'?`KIDS MINISTRY STUDIO

PAMAGAT: ${t}
BIBLE STORY / PASSAGE: ${p}
MEMORY VERSE: ${v}
AGE GROUP: ${a}
LESSON FORMAT: ${f}
LEARNING GOAL: ${g}

TEACHER PREPARATION
• Basahin ang buong passage at suriin ang context.
• Ihanda ang Biblia, visual aids, craft materials, at safe activity area.
• Iangkop ang language at activity sa edad at needs ng mga bata.
• Huwag magdagdag ng story details na wala sa Scripture.

OPENING PRAYER
Panginoon, salamat sa mga batang narito. Tulungan Mo kaming makinig, matuto, at sumunod sa Iyong Salita. Sa pangalan ni Jesus, amen.

WELCOME / ICEBREAKER
Gumamit ng simpleng tanong o activity na konektado sa tema ng ${t}.

MEMORY VERSE
${v}
• Basahin nang sabay-sabay.
• Ipaliwanag ang mahirap na salita.
• Gumamit ng actions, repetition, o word-card game.

BIBLE STORY
1. Introduction: Sino ang mga pangunahing tauhan at saan nangyayari ang story?
2. Problem or Need: Ano ang hamon sa passage?
3. God’s Work: Ano ang ginawa o sinabi ng Diyos?
4. Human Response: Paano tumugon ang mga tao?
5. Result: Ano ang nangyari at ano ang itinuturo nito?

MAIN POINT 1 — KILALANIN ANG DIYOS
Ano ang ipinapakita ng story tungkol sa character, power, love, o faithfulness ng Diyos?

MAIN POINT 2 — UNAWAIN ANG TAMANG TUGON
May command, warning, promise, o example bang dapat maunawaan ng mga bata?

MAIN POINT 3 — ISABUHAY ANG ARAL
Ano ang isang specific na paraan upang sumunod sa bahay, school, o church?

OBJECT LESSON / ILLUSTRATION
[Maglagay ng safe at simpleng object lesson. Sabihin nang malinaw kung illustration lamang ito.]

DISCUSSION QUESTIONS
1. Sino ang mga pangunahing tauhan?
2. Ano ang ginawa ng Diyos?
3. Ano ang natutuhan natin tungkol sa Diyos?
4. Ano ang tamang response?
5. Paano natin ito isasabuhay ngayong linggo?

ACTIVE GAME
Pumili ng movement game na nagre-review ng story o memory verse. Iwasan ang unsafe running, choking hazards, at activities na hindi angkop sa space.

CRAFT / QUIET ACTIVITY
Gumawa ng simple craft, drawing, matching activity, o take-home card na nagpapaalala sa main truth.

APPLICATION
• Sa bahay:
• Sa school:
• Sa church:
• Isang action ngayong linggo:

CONCLUSION
I-summarise ang Bible story, ulitin ang memory verse, at ipaalala ang isang malinaw na truth tungkol sa Diyos at isang act of obedience.

CLOSING PRAYER
Panginoon, salamat sa Iyong Salita. Tulungan Mo kaming magtiwala sa Iyo at isabuhay ang aming natutuhan. Ingatan Mo ang bawat bata at pamilya. Sa pangalan ni Jesus, amen.

PARENT / TAKE-HOME NOTE
Ngayong linggo, basahin muli ang ${p}, ulitin ang ${v}, at pag-usapan kung paano isasabuhay ang aral.

TEACHER NOTES
${n}`:`KIDS MINISTRY STUDIO

TITLE: ${t}
BIBLE STORY / PASSAGE: ${p}
MEMORY VERSE: ${v}
AGE GROUP: ${a}
LESSON FORMAT: ${f}
LEARNING GOAL: ${g}

TEACHER PREPARATION
• Read the whole passage and check its context.
• Prepare the Bible, visual aids, craft materials, and a safe activity area.
• Adapt language and activities to the children's age and needs.
• Do not add story details that are not in Scripture.

OPENING PRAYER
Lord, thank You for every child here. Help us listen, learn, and obey Your Word. In Jesus’ name, amen.

WELCOME / ICEBREAKER
Use a simple question or activity connected to ${t}.

MEMORY VERSE
${v}
• Read it together.
• Explain difficult words.
• Use actions, repetition, or a word-card game.

BIBLE STORY
1. Introduction: Who are the main people and where does the story happen?
2. Problem or Need: What challenge appears in the passage?
3. God's Work: What does God do or say?
4. Human Response: How do the people respond?
5. Result: What happens and what does it teach?

MAIN POINT 1 — KNOW WHO GOD IS
What does the story reveal about God's character, power, love, or faithfulness?

MAIN POINT 2 — UNDERSTAND THE RIGHT RESPONSE
Is there a command, warning, promise, or example children should understand?

MAIN POINT 3 — LIVE THE LESSON
What is one specific way to obey at home, school, or church?

OBJECT LESSON / ILLUSTRATION
[Add a safe, simple object lesson and clearly label it as an illustration.]

DISCUSSION QUESTIONS
1. Who are the main people?
2. What did God do?
3. What do we learn about God?
4. What is the right response?
5. How can we live this lesson this week?

ACTIVE GAME
Choose a movement game that reviews the story or memory verse. Avoid unsafe running, choking hazards, and activities unsuitable for the room.

CRAFT / QUIET ACTIVITY
Create a simple craft, drawing, matching activity, or take-home card that reinforces the main truth.

APPLICATION
• At home:
• At school:
• At church:
• One action this week:

CONCLUSION
Summarise the Bible story, repeat the memory verse, and reinforce one clear truth about God and one act of obedience.

CLOSING PRAYER
Lord, thank You for Your Word. Help us trust You and live what we learned. Protect every child and family. In Jesus’ name, amen.

PARENT / TAKE-HOME NOTE
This week, read ${p} again, practise ${v}, and discuss how to live the lesson.

TEACHER NOTES
${n}`}
function kidsPrompt(data){return `Create a complete, editable Christian children's Bible lesson in ${appLanguage==='tl'?'Tagalog':'English'} using a ${kidsFormatLabel(data.format)} format. Title/theme: “${data.title||''}”. Main passage: “${data.passage||''}”. Memory verse: “${data.verse||''}”. Age group: “${data.age||''}”. Learning goal: “${data.goal||''}”. Teacher notes: “${data.notes||''}”. Organise it by lesson sections rather than visible minutes: teacher preparation, opening prayer, welcome/icebreaker, memory verse activity, Bible story, three teaching points, object lesson, discussion questions, active game, craft/quiet activity, practical application, conclusion, closing prayer, parent take-home note, materials, and safety reminders. Keep it age-appropriate, Christ-centred, editable, and faithful to the passage. Do not invent Bible quotations, story details, historical facts, promises, or guaranteed outcomes.`}

function kidsPresentationOutline(data){const title=data.title||ui('Children’s Bible Lesson','Aralin sa Biblia para sa Bata'),passage=data.passage||data.story||ui('Add Bible passage','Idagdag ang talata'),verse=data.verse||data.memory||passage,age=data.age||ui('Children','Mga Bata'),goal=data.goal||data.lesson||ui('Know God’s truth and respond in faith and obedience.','Makilala ang katotohanan ng Diyos at tumugon nang may pananampalataya at pagsunod.');return appLanguage==='tl'?`KIDS PRESENTATION OUTLINE

SLIDE 1 — PAMAGAT
${title}
Tema: ${goal}
Edad: ${age}

SLIDE 2 — PAMBUNGAD NA TANONG
• Ano ang alam na ninyo tungkol sa paksang ito?
• Magbigay ng isang simpleng icebreaker na konektado sa lesson.

SLIDE 3 — TALATANG ISASAULO
${verse}
• Basahin nang sabay-sabay.
• Ulitin gamit ang actions o hand motions.

SLIDE 4 — BIBLE STORY
${passage}
• Ipakilala ang pangunahing tauhan at sitwasyon.
• Ipakita ang suggested visual: simpleng larawan o drawing ng eksena.

SLIDE 5 — ANO ANG NANGYARI?
• Unang mahalagang pangyayari
• Ikalawang mahalagang pangyayari
• Paano kumilos ang Diyos?

SLIDE 6 — TEACHING POINT 1
• Katotohanan tungkol sa Diyos
• Maikling paliwanag para sa mga bata
• Suggested picture o object lesson

SLIDE 7 — TEACHING POINT 2
• Katotohanan tungkol sa pananampalataya o pagsunod
• Isang halimbawa sa bahay o paaralan

SLIDE 8 — TEACHING POINT 3
• Paano ito nagtuturo tungkol kay Jesus
• Isang malinaw na gospel connection

SLIDE 9 — GAME O ACTIVITY
• Pangalan ng laro
• Layunin
• Materials
• Simpleng instructions

SLIDE 10 — CRAFT
• Craft title
• Materials
• Steps
• Safety reminder

SLIDE 11 — DISCUSSION QUESTIONS
1. Ano ang nangyari sa kuwento?
2. Ano ang natutuhan natin tungkol sa Diyos?
3. Ano ang maaari nating gawin ngayong linggo?

SLIDE 12 — LIFE APPLICATION
• Sa bahay
• Sa paaralan
• Sa iglesia
• Isang action challenge

SLIDE 13 — PANGWAKAS NA BUOD
• Ulitin ang main truth
• Ulitin ang memory verse
• Isang pangungusap na dapat tandaan

SLIDE 14 — CLOSING PRAYER
Maikling panalangin ng pasasalamat, pagtitiwala, at pagsunod.

SLIDE 15 — TAKE-HOME CHALLENGE
• Basahin muli ang ${passage}
• Sanayin ang ${verse}
• Ibahagi ang isang natutuhan sa pamilya

DESIGN SUGGESTIONS
• Gumamit ng malalaking font at kaunting salita bawat slide.
• Gumamit ng malinaw, child-friendly na visuals.
• Huwag punuin ang slides; ang teacher ang magpapaliwanag.`:`KIDS PRESENTATION OUTLINE

SLIDE 1 — TITLE
${title}
Theme: ${goal}
Age group: ${age}

SLIDE 2 — OPENING QUESTION
• What do you already know about this topic?
• Add one simple icebreaker connected to the lesson.

SLIDE 3 — MEMORY VERSE
${verse}
• Read it together.
• Repeat it using actions or hand motions.

SLIDE 4 — BIBLE STORY
${passage}
• Introduce the main person and setting.
• Suggested visual: a simple picture or drawing of the scene.

SLIDE 5 — WHAT HAPPENED?
• First important event
• Second important event
• How did God act?

SLIDE 6 — TEACHING POINT 1
• A truth about God
• Child-friendly explanation
• Suggested picture or object lesson

SLIDE 7 — TEACHING POINT 2
• A truth about faith or obedience
• One example from home or school

SLIDE 8 — TEACHING POINT 3
• How the lesson points to Jesus
• One clear gospel connection

SLIDE 9 — GAME OR ACTIVITY
• Game name
• Purpose
• Materials
• Simple instructions

SLIDE 10 — CRAFT
• Craft title
• Materials
• Steps
• Safety reminder

SLIDE 11 — DISCUSSION QUESTIONS
1. What happened in the story?
2. What did we learn about God?
3. What can we do this week?

SLIDE 12 — LIFE APPLICATION
• At home
• At school
• At church
• One action challenge

SLIDE 13 — CONCLUSION
• Repeat the main truth
• Repeat the memory verse
• One sentence to remember

SLIDE 14 — CLOSING PRAYER
A short prayer of thanks, trust, and obedience.

SLIDE 15 — TAKE-HOME CHALLENGE
• Read ${passage} again
• Practise ${verse}
• Share one lesson with the family

DESIGN SUGGESTIONS
• Use large fonts and only a few words per slide.
• Use clear, child-friendly visuals.
• Keep slides simple; the teacher provides the explanation.`}
function kidsResourcePack(data){const title=data.title||ui('Children’s Bible Lesson','Aralin sa Biblia para sa Bata'),passage=data.passage||data.story||ui('Add Bible passage','Idagdag ang talata'),verse=data.verse||data.memory||passage,age=data.age||ui('Children','Mga Bata'),goal=data.goal||data.lesson||ui('Know God’s truth and respond in faith and obedience.','Makilala ang katotohanan ng Diyos at tumugon nang may pananampalataya at pagsunod.'),notes=data.notes||'';return appLanguage==='tl'?`KIDS MINISTRY RESOURCE PACK

LESSON TITLE
${title}

BIBLE PASSAGE
${passage}

MEMORY VERSE
${verse}

AGE GROUP
${age}

MAIN LEARNING GOAL
${goal}

1. TEACHER PREPARATION
• Basahin ang passage sa context.
• Ihanda ang Bible, visual aids, activity materials, at craft supplies.
• I-check ang allergies, choking hazards, scissors, at room safety.
• Personal notes: ${notes}

2. PRESENTATION OUTLINE
${kidsPresentationOutline(data)}

3. GAME SUGGESTION
Bible Truth Relay
Objective: Ulitin ang main lesson at memory verse.
Materials: Verse cards o printed words.
Instructions: Hatiin sa teams, ayusin ang verse, at ipaliwanag ang isang natutuhan.
Small-group option: Gawin bilang matching game.

4. CRAFT SUGGESTION
Truth Reminder Card
Materials: Card paper, crayons, stickers, child-safe scissors, glue.
Instructions: Isulat ang memory verse at gumuhit ng larawan mula sa story.
Safety: Gumamit lamang ng age-appropriate materials at adult supervision.

5. OBJECT LESSON
Pumili ng isang simpleng bagay na konektado sa tema—halimbawa ilaw, bato, binhi, lubid, o regalo. Ipaliwanag nang malinaw na ang object ay illustration lamang at hindi bahagi ng Bible text.

6. WORSHIP SONG SUGGESTIONS
• Isang awit tungkol sa pag-ibig ng Diyos
• Isang awit tungkol sa pagtitiwala kay Jesus
• Isang action song na pamilyar sa mga bata
Teacher note: Pumili ng kanta na alam ng church at ang lyrics ay biblikal.

7. PARENT TAKE-HOME HANDOUT
Ngayong araw natutuhan namin: ${goal}
Bible passage: ${passage}
Memory verse: ${verse}
Tanong sa bahay:
1. Ano ang paborito mong bahagi ng story?
2. Ano ang natutuhan natin tungkol sa Diyos?
3. Paano natin ito maisasabuhay ngayong linggo?
Family prayer: Panginoon, tulungan Mo kaming alalahanin ang Iyong Salita at sundin Ka nang may kagalakan. Amen.
Weekly challenge: Basahin muli ang passage at gawin ang isang act of kindness o obedience.

8. TEACHER REVIEW
• Tama ba sa Scripture ang lesson?
• Simple ba para sa age group?
• Malinaw ba ang connection kay Jesus?
• May sapat bang participation ang mga bata?
• Ano ang babaguhin sa susunod?`:`KIDS MINISTRY RESOURCE PACK

LESSON TITLE
${title}

BIBLE PASSAGE
${passage}

MEMORY VERSE
${verse}

AGE GROUP
${age}

MAIN LEARNING GOAL
${goal}

1. TEACHER PREPARATION
• Read the passage in context.
• Prepare the Bible, visual aids, activity materials, and craft supplies.
• Check allergies, choking hazards, scissors, and room safety.
• Personal notes: ${notes}

2. PRESENTATION OUTLINE
${kidsPresentationOutline(data)}

3. GAME SUGGESTION
Bible Truth Relay
Objective: Reinforce the main lesson and memory verse.
Materials: Verse cards or printed words.
Instructions: Divide into teams, arrange the verse, then explain one lesson learned.
Small-group option: Use the cards as a matching game.

4. CRAFT SUGGESTION
Truth Reminder Card
Materials: Card paper, crayons, stickers, child-safe scissors, and glue.
Instructions: Write the memory verse and draw a picture from the story.
Safety: Use age-appropriate materials with adult supervision.

5. OBJECT LESSON
Choose one simple object connected to the theme—for example a light, rock, seed, rope, or gift. Clearly explain that the object is only an illustration and is not part of the Bible text.

6. WORSHIP SONG SUGGESTIONS
• One song about God’s love
• One song about trusting Jesus
• One familiar action song
Teacher note: Choose songs your church knows and check that the lyrics are biblical.

7. PARENT TAKE-HOME HANDOUT
Today we learned: ${goal}
Bible passage: ${passage}
Memory verse: ${verse}
Questions for home:
1. What was your favourite part of the story?
2. What did we learn about God?
3. How can we live this lesson this week?
Family prayer: Lord, help our family remember Your Word and obey You with joy. Amen.
Weekly challenge: Read the passage again and complete one act of kindness or obedience.

8. TEACHER REVIEW
• Is the lesson faithful to Scripture?
• Is it simple enough for the age group?
• Is the connection to Jesus clear?
• Did the children have enough participation?
• What should be improved next time?`}


function kidsIllustrationFor(title='',passage=''){
 const text=(title+' '+passage).toLowerCase();
 const rules=[
  [/creation|genesis 1/, 'images/creation.svg'],
  [/noah|ark|flood/, 'images/noah.svg'],
  [/abraham|isaac/, 'images/abraham.svg'],
  [/joseph/, 'images/joseph.svg'],
  [/baby moses|moses.*basket|exodus 2/, 'images/baby-moses.svg'],
  [/red sea|exodus 14/, 'images/red-sea.svg'],
  [/jericho|joshua 6/, 'images/jericho.svg'],
  [/david|goliath|1 samuel 17/, 'images/david.svg'],
  [/samuel|1 samuel 3/, 'images/samuel.svg'],
  [/elijah|widow|1 kings 17/, 'images/elijah-widow.svg'],
  [/jonah|great fish/, 'images/jonah.svg'],
  [/daniel|lion/, 'images/daniel.svg'],
  [/esther/, 'images/esther.svg'],
  [/ruth/, 'images/ruth.svg'],
  [/good samaritan|samaritan|luke 10/, 'images/samaritan.svg'],
  [/lost sheep|shepherd|luke 15/, 'images/sheep.svg'],
  [/storm|mark 4|calms/, 'images/storm.svg'],
  [/five thousand|loaves|john 6/, 'images/five-thousand.svg'],
  [/pentecost|acts 2/, 'images/pentecost.svg'],
  [/help|serve|kindness/, 'images/helping.svg']
 ];
 const match=rules.find(([re])=>re.test(text));
 return match?match[1]:'images/lesson-placeholder.svg';
}

function kidsRandomDefaults(){const ideas=appLanguage==='tl'?[['Ang Mabuting Samaritano','Luke 10:25–37','Luke 10:27','Pagmamahal at pagtulong sa kapwa'],['Si David at si Goliath','1 Samuel 17','Psalm 56:3','Pagtitiwala sa Diyos kapag natatakot'],['Si Jesus at ang Bagyo','Mark 4:35–41','Psalm 56:3','Pagtitiwala kay Jesus sa panahon ng takot'],['Ang Nawawalang Tupa','Luke 15:1–7','Luke 15:6','Mahalaga ang bawat tao sa Diyos'],['Daniel sa Yungib ng mga Leon','Daniel 6','Daniel 6:23','Katapatan sa Diyos'],['Paglikha ng Diyos','Genesis 1','Genesis 1:31','Ang Diyos ang mabuting Manlilikha']]:[['The Good Samaritan','Luke 10:25–37','Luke 10:27','Loving and helping others'],['David and Goliath','1 Samuel 17','Psalm 56:3','Trusting God when we are afraid'],['Jesus Calms the Storm','Mark 4:35–41','Psalm 56:3','Trusting Jesus in frightening times'],['The Lost Sheep','Luke 15:1–7','Luke 15:6','Every person matters to God'],["Daniel in the Lions’ Den",'Daniel 6','Daniel 6:23','Remaining faithful to God'],["God’s Creation",'Genesis 1','Genesis 1:31','God is our good Creator']];return ideas[Math.floor(Math.random()*ideas.length)]}
function simpleKidsLesson(data){const r=kidsRandomDefaults(),title=data.title||r[0],passage=data.passage||r[1],verse=data.verse||r[2],age=data.age||ui('Ages 6–12','Edad 6–12'),theme=data.theme||r[3];return appLanguage==='tl'?`PAMAGAT: ${title}
PANGUNAHING TALATA: ${passage}
TALATANG ISASAULO: ${verse}
EDAD: ${age}
TEMA: ${theme}

PAMBUNGAD NA PANALANGIN
Panginoong Diyos, salamat sa araw na ito. Buksan Mo ang aming isip at puso upang maunawaan ang Iyong Salita. Tulungan Mo kaming makinig, matuto, at sumunod sa Iyo. Sa pangalan ni Jesus, Amen.

LAYUNIN NG ARALIN
Sa pagtatapos ng aralin, mauunawaan ng mga bata ang pangunahing katotohanan ng ${theme.toLowerCase()} at makakapili ng isang praktikal na paraan upang isabuhay ito.

PAMBUNGAD / ICEBREAKER
Magtanong ng isang simpleng tanong na konektado sa tema. Pakinggan ang ilang sagot at iugnay ang mga ito sa aralin.

KUWENTO SA BIBLIA
Basahin ang ${passage}. Ikuwento ito sa simple at malinaw na paraan. Bigyang-diin kung sino ang Diyos, ano ang Kanyang ginawa, at kung paano tumugon ang mga tao. Huwag magdagdag ng detalye na wala sa Kasulatan.

PANGUNAHING KATOTOHANAN
${theme}. Ang Diyos ay mabuti at tapat. Inaanyayahan Niya tayong magtiwala sa Kanya at tumugon nang may pananampalataya at pagsunod.

MGA PANGUNAHING PUNTO
1. Ano ang ipinapakita ng kuwento tungkol sa Diyos?
2. Ano ang naging tugon ng mga tao?
3. Paano natin susundin ang Diyos ngayong linggo?

MGA TANONG SA TALAKAYAN
1. Sino-sino ang nasa kuwento?
2. Ano ang pinakamahalagang nangyari?
3. Ano ang natutuhan natin tungkol sa Diyos?
4. Ano ang natutuhan natin tungkol sa ating sarili?
5. Paano natin maisasabuhay ang aralin sa bahay, paaralan, o simbahan?

TALATANG ISASAULO
${verse}
Basahin nang sabay-sabay, ipaliwanag ang kahulugan, at ulitin gamit ang simpleng kilos ng kamay.

GAWAIN
Gumawa ng role-play, picture sequencing, o matching activity tungkol sa kuwento.

CRAFT
Gumawa ng “Truth Reminder Card.” Isulat ang ${verse} sa harap at isang praktikal na hakbang sa likod.

PRAKTIKAL NA HAMON
Pumili ng isang bagay na gagawin ngayong linggo bilang tugon sa aralin.

PAG-UULIT / KONKLUSYON
Ulitin ang pangunahing katotohanan, memory verse, at isang praktikal na hakbang.

PANGWAKAS NA PANALANGIN
Ama naming Diyos, salamat sa Iyong Salita. Tulungan Mo kaming tandaan ang natutuhan namin at isabuhay ito ngayong linggo. Sa pangalan ni Jesus, Amen.`:`TITLE: ${title}
MAIN PASSAGE: ${passage}
MEMORY VERSE: ${verse}
AGE GROUP: ${age}
THEME: ${theme}

OPENING PRAYER
Dear God, thank You for today. Open our minds and hearts to understand Your Word. Help us listen, learn, and obey You. In Jesus’ name, Amen.

LESSON AIM
By the end of the lesson, children will understand the main truth of ${theme.toLowerCase()} and choose one practical way to live it out.

WELCOME / ICEBREAKER
Ask a simple question connected to the theme. Hear a few answers and connect them naturally to the lesson.

BIBLE STORY
Read ${passage}. Retell it simply and clearly. Emphasise who God is, what He did, and how people responded. Do not add details that are not in Scripture.

BIG TRUTH
${theme}. God is good and faithful. He invites us to trust Him and respond with faith and obedience.

TEACHING POINTS
1. What does the story reveal about God?
2. How did the people respond?
3. How can we obey God this week?

DISCUSSION QUESTIONS
1. Who was in the story?
2. What was the most important thing that happened?
3. What do we learn about God?
4. What do we learn about ourselves?
5. How can we live this lesson at home, school, or church?

MEMORY VERSE
${verse}
Read it together, explain its meaning, and repeat it using simple hand actions.

ACTIVITY
Use a role-play, picture-sequencing game, or matching activity connected to the story.

CRAFT
Make a “Truth Reminder Card.” Write ${verse} on the front and one practical action on the back.

WEEKLY CHALLENGE
Choose one action this week in response to the lesson.

REVIEW / CONCLUSION
Repeat the big truth, memory verse, and one practical response.

CLOSING PRAYER
Father God, thank You for Your Word. Help us remember what we learned and live it out this week. In Jesus’ name, Amen.`}
function kids(){title(ui('Kids Ministry Studio','Kids Ministry Studio'),ui('Create a complete children’s Bible lesson with only a few optional details.','Gumawa ng kumpletong kids Bible lesson gamit ang ilang optional na detalye.'));view.innerHTML=`<div class="creator-layout"><section class="card"><h2>✨ ${ui('Simple Kids Lesson Creator','Simpleng Kids Lesson Creator')}</h2><p>${ui('All fields are optional. Leave them blank to create a random complete lesson.','Optional ang lahat ng field. Iwanang blanko upang gumawa ng random na kumpletong lesson.')}</p><div class="form-grid"><input id="title" placeholder="${ui('Lesson title or topic (optional)','Pamagat o topic (optional)')}"><input id="passage" placeholder="${ui('Bible passage (optional)','Talata sa Biblia (optional)')}"><input id="verse" placeholder="${ui('Memory verse (optional)','Talatang isasaulo (optional)')}"><input id="age" placeholder="${ui('Age group (optional)','Edad (optional)')}"><input class="wide" id="theme" placeholder="${ui('Main truth or lesson goal (optional)','Pangunahing katotohanan o layunin (optional)')}"><label class="field-label wide">${ui('Lesson illustration','Larawan ng aralin')}<select id="kidsImage"><option value="">${ui('Choose automatically','Awtomatikong piliin')}</option><option value="images/creation.svg">Creation</option><option value="images/noah.svg">Noah</option><option value="images/abraham.svg">Abraham</option><option value="images/joseph.svg">Joseph</option><option value="images/baby-moses.svg">Baby Moses</option><option value="images/red-sea.svg">Red Sea</option><option value="images/david.svg">David</option><option value="images/daniel.svg">Daniel</option><option value="images/esther.svg">Esther</option><option value="images/jonah.svg">Jonah</option><option value="images/samaritan.svg">Good Samaritan</option><option value="images/storm.svg">Jesus Calms the Storm</option><option value="images/sheep.svg">Lost Sheep</option><option value="images/five-thousand.svg">Feeding the Five Thousand</option><option value="images/pentecost.svg">Pentecost</option><option value="images/helping.svg">Helping Others</option><option value="images/lesson-placeholder.svg">General Bible Lesson</option></select></label><div id="kidsImagePreviewWrap" class="wide card" style="padding:12px"><b>${ui('Illustration preview','Preview ng larawan')}</b><img id="kidsImagePreview" src="images/lesson-placeholder.svg" alt="${ui('Kids lesson illustration','Larawan para sa kids lesson')}" style="display:block;width:100%;max-height:260px;object-fit:contain;margin-top:10px"></div><div class="wide creator-buttons"><button class="primary" id="kidsCreate">✨ ${ui('Create Complete Lesson','Gumawa ng Kumpletong Lesson')}</button><button class="ghost" id="kidsRandom">🎲 ${ui('Random Lesson','Random na Lesson')}</button><button class="ghost" id="kidsClear">${ui('Clear','Burahin')}</button></div></div><div class="notice small-note">${ui('Includes opening prayer, lesson aim, Bible story guide, teaching points, questions, memory verse, activity, craft, challenge, conclusion, and closing prayer. Review before teaching.','Kasama ang opening prayer, layunin, Bible story guide, teaching points, mga tanong, memory verse, activity, craft, hamon, conclusion, at closing prayer. Suriin bago ituro.')}</div></section><section class="card"><div class="draft-head"><h3>${ui('Editable Lesson','Editable na Lesson')}</h3><span class="pill">${ui('Complete Draft','Kumpletong Draft')}</span></div><textarea id="body" class="draft-area sermon-draft-area" placeholder="${ui('Your complete kids lesson will appear here...','Lalabas dito ang kumpletong kids lesson...')}"></textarea><div class="creator-buttons"><button class="primary" id="kidsSave">💾 ${ui('Save to Kids Lessons','I-save sa Kids Lessons')}</button><button class="ghost" id="kidsCopy">${ui('Copy Lesson','Kopyahin ang Lesson')}</button></div></section></div>`;const values=()=>({title:$('#title').value.trim(),passage:$('#passage').value.trim(),verse:$('#verse').value.trim(),age:$('#age').value.trim(),theme:$('#theme').value.trim(),image:$('#kidsImage')?.value||''});const create=(random=false)=>{if(random)['title','passage','verse','theme'].forEach(id=>$('#'+id).value='');let d=values(),r=kidsRandomDefaults();d.title=d.title||r[0];d.passage=d.passage||r[1];d.verse=d.verse||r[2];d.theme=d.theme||r[3];d.image=d.image||kidsIllustrationFor(d.title,d.passage);$('#title').value=d.title;$('#passage').value=d.passage;$('#verse').value=d.verse;$('#theme').value=d.theme;$('#kidsImage').value=d.image;$('#kidsImagePreview').src=d.image;$('#body').value=simpleKidsLesson(d);toast(ui('Complete kids lesson created','Nagawa ang kumpletong kids lesson'))};$('#kidsCreate').onclick=()=>create(false);$('#kidsRandom').onclick=()=>create(true);$('#kidsClear').onclick=()=>['title','passage','verse','age','theme','body'].forEach(id=>$('#'+id).value='');$('#kidsImage').value='';$('#kidsImagePreview').src='images/lesson-placeholder.svg';$('#kidsCopy').onclick=async()=>{if(!$('#body').value.trim())return toast(ui('Create a lesson first','Gumawa muna ng lesson'));try{await navigator.clipboard.writeText($('#body').value);toast(ui('Lesson copied','Nakopya ang lesson'))}catch{}};$('#kidsImage').onchange=()=>{$('#kidsImagePreview').src=$('#kidsImage').value||kidsIllustrationFor($('#title').value,$('#passage').value)};$('#kidsSave').onclick=()=>{if(!$('#body').value.trim())create(false);let d=values();saveUserLibrary('kids',{title:d.title,scripture:d.passage,passage:d.passage,memory:d.verse,age:d.age||ui('Ages 6–12','Edad 6–12'),theme:d.theme,image:d.image||kidsIllustrationFor(d.title,d.passage),type:ui('Personal Kids Lesson','Personal na Kids Lesson'),body:$('#body').value.trim()});toast(ui('Saved to Kids Lessons','Nai-save sa Kids Lessons'));route('kidslibrary')}}

function reading(){
 title(ui('Chapter Tracker','Talaan ng Kabanata'),ui('Mark chapters complete, or remove a chapter if it was marked by mistake.','Markahan ang natapos na kabanata, o alisin ito kung namarkahan nang hindi pa natatapos.'));
 let done=store.get('reading',{}),total=Object.keys(done).filter(k=>done[k]).length,pct=Math.round(total/1189*100);
 view.innerHTML=`<div class="card"><h3>${ui('Progress','Progreso')}: ${total} ${ui('of','sa')} 1,189 ${ui('chapters','kabanata')} (${pct}%)</h3><progress value="${total}" max="1189"></progress></div><div class="grid book-progress">${B.map(b=>{let completed=Array.from({length:b.chapters},(_,i)=>i+1).filter(c=>done[b.name+' '+c]);return `<div class="card"><h3>${b.name}</h3><p>${completed.length} / ${b.chapters} ${ui('chapters','kabanata')}</p><select data-book="${b.name}"><option value="">${ui('Choose chapter','Pumili ng kabanata')}</option>${Array.from({length:b.chapters},(_,i)=>`<option value="${i+1}">${i+1}${done[b.name+' '+(i+1)]?' ✓':''}</option>`).join('')}</select><div class="resource-buttons"><button class="primary" data-mark="${b.name}">${ui('Mark complete','Markahang natapos')}</button><button class="danger" data-unmark="${b.name}">${ui('Remove completion','Alisin ang pagkakatapos')}</button></div>${completed.length?`<small>${ui('Completed','Natapos')}: ${completed.join(', ')}</small>`:''}</div>`}).join('')}</div>`;
 const selected=(b)=>{let s=document.querySelector(`select[data-book="${CSS.escape(b)}"]`);return s?+s.value:0};
 document.querySelectorAll('[data-mark]').forEach(btn=>btn.onclick=()=>{let b=btn.dataset.mark,c=selected(b);if(!c)return toast(ui('Choose a chapter first','Pumili muna ng kabanata'));done[b+' '+c]=true;store.set('reading',done);reading()});
 document.querySelectorAll('[data-unmark]').forEach(btn=>btn.onclick=()=>{let b=btn.dataset.unmark,c=selected(b),key=b+' '+c;if(!c)return toast(ui('Choose a chapter first','Pumili muna ng kabanata'));if(!done[key])return toast(ui('That chapter is not marked complete','Hindi pa namarkahang natapos ang kabanatang iyon'));if(confirm(ui(`Remove ${key} from completed chapters?`,`Alisin ang ${key} sa mga natapos na kabanata?`))){delete done[key];store.set('reading',done);reading()}})
}

function backup(){
 title('My Backup','Export or restore only the personal information saved in this browser.');
 view.innerHTML=`<div class="privacy-card"><div class="privacy-icon">🔒</div><div><h3>This backup belongs to the person using this device</h3><p>GitHub Pages does not receive your notes. Highlights, journals, created resources, and progress are stored in this browser only. Another visitor gets a separate empty collection on their own device.</p></div></div><div class="card backup-actions"><button class="primary" id="export">Download My Private Backup</button><p class="meta">The downloaded JSON file remains wherever you choose to save it.</p><hr><label><b>Restore my backup</b></label><input type="file" id="file" accept="application/json"><button class="ghost" id="restore">Restore Selected File</button><hr><button class="danger" id="clear">Erase My Saved Data on This Device</button></div>`;
 $('#export').onclick=()=>{let o={version:6,created:new Date().toISOString(),data:{}};Object.keys(localStorage).filter(k=>k.startsWith('dm_')).forEach(k=>o.data[k]=localStorage.getItem(k));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:'application/json'}));a.download=`DeMayoBible_MyBackup_${new Date().toISOString().slice(0,10)}.json`;a.click();toast('Private backup downloaded')};
 $('#restore').onclick=()=>{let f=$('#file').files[0];if(!f)return toast('Choose a backup file first');let r=new FileReader;r.onload=()=>{try{let o=JSON.parse(r.result),data=o.data||o;Object.entries(data).forEach(([k,v])=>{if(k.startsWith('dm_'))localStorage.setItem(k,v)});alert('Your backup has been restored.');route('home')}catch{alert('That backup file could not be read.')}};r.readAsText(f)};
 $('#clear').onclick=()=>{if(confirm('Erase all of your saved Bible app data from this device?')){Object.keys(localStorage).filter(k=>k.startsWith('dm_')).forEach(k=>localStorage.removeItem(k));route('home')}}
}
function libraryShell(t,d,createType){return `<div class="library-head"><div><h2>${t}</h2><p>${d}</p></div><div class="library-search"><input id="libq" placeholder="${ui('Search this library...','Maghanap sa aklatang ito...')}"><button class="ghost" id="clearLib">${ui('Clear','Burahin')}</button></div></div><div class="library-actions"><button class="primary" id="createHere">＋ ${ui('Create','Gumawa ng')} ${createType}</button></div><div id="libres" class="library-grid"></div>`}
function wireLibrary(draw,type){$('#libq').oninput=e=>draw(e.target.value);$('#clearLib').onclick=()=>{$('#libq').value='';draw('');$('#libq').focus()};$('#createHere').onclick=()=>{const map={'Bible Study':'Bible Study','Pag-aaral':'Bible Study','Kids Lesson':'Kids Lesson','Aralin':'Kids Lesson','Devotional':'Devotional','Debosyonal':'Devotional','Exhortation':'Exhortation','Prayer':'Prayer','Panalangin':'Prayer'};store.set('creatorType',map[type]||type);route('creator')}}
function openResource(kind,index){store.set('openResource',{kind,index});route('resource')}
function improvedLibraryPrayer(x,details={}){const topic=details.topic||x.title||ui('this need','ang pangangailangang ito'),person=details.person||ui('the person or group concerned','ang taong o grupong ipinapanalangin'),scripture=details.scripture||ui('a suitable Bible passage','angkop na talata sa Biblia'),extra=details.extra||'',tone=details.tone||ui('warm, faith-filled, and pastoral','mainit, puno ng pananampalataya, at pastoral');if(appLanguage==='tl')return `PAMAGAT: ${x.title}\nKATEGORYA: ${x.category}\nPOKUS: ${topic}\nKAUGNAY NA KASULATAN: ${scripture}\nTONO: ${tone}\n\nPAGSAMBA AT PASASALAMAT\nAming Ama sa langit, lumalapit kami sa Iyo nang may pagpapakumbaba at pasasalamat. Ikaw ay mabuti, tapat, mahabagin, at makapangyarihan. Salamat sapagkat nakikinig Ka sa Iyong mga anak at inaanyayahan Mo kaming ilagak sa Iyo ang aming mga alalahanin.\n\nPAGSUKO\nIsinusuko namin sa Iyo ang ${topic.toLowerCase()}. Inaamin naming hindi namin kayang kontrolin ang lahat, kaya nagtitiwala kami sa Iyong karunungan, panahon, at banal na kalooban. Linisin Mo ang aming mga puso sa takot, pag-aalala, pagmamataas, at kawalan ng pananampalataya.\n\nTIYAK NA PANALANGIN\nPanginoon, aming itinataas si/ang ${person}. ${x.text} ${extra}\nIbigay Mo ang karunungang kailangan, lakas para sa bawat araw, kapayapaang nagmumula sa Iyo, at lakas ng loob na sumunod sa Iyong Salita. Magbukas Ka ng tamang mga pintuan at isara ang mga hindi naaayon sa Iyong kalooban.\n\nPANANAMPALATAYA AT PAGSUNOD\nTulungan Mo kaming hindi lamang humingi ng sagot kundi hanapin Ka mismo. Turuan Mo kaming maghintay nang may pananampalataya, kumilos nang may karunungan, magpatawad kung kailangan, at manatiling tapat habang hinihintay ang Iyong sagot.\n\nPAGTATAPOS\nNaniniwala kaming kaya Mong gumawa nang higit sa aming nauunawaan, ngunit higit sa lahat ay nais naming mangyari ang Iyong mabuti at banal na kalooban. Ingatan Mo ang aming puso at isip kay Cristo Jesus. Sa pangalan ni Jesus, Amen.\n\nPANSARILING TALA / SAGOT SA PANALANGIN\n• Ano ang ginawa ng Diyos?\n• Ano ang itinuro Niya sa akin?\n• Ano ang susunod kong hakbang ng pananampalataya?`;return `TITLE: ${x.title}\nCATEGORY: ${x.category}\nFOCUS: ${topic}\nRELATED SCRIPTURE: ${scripture}\nTONE: ${tone}\n\nADORATION AND THANKSGIVING\nHeavenly Father, we come before You with humility and gratitude. You are good, faithful, compassionate, and powerful. Thank You for hearing Your children and inviting us to bring every concern to You.\n\nSURRENDER\nWe surrender ${topic.toLowerCase()} to You. We acknowledge that we cannot control every outcome, so we trust Your wisdom, timing, and holy will. Cleanse our hearts from fear, anxiety, pride, and unbelief.\n\nSPECIFIC PRAYER\nLord, we lift up ${person}. ${x.text} ${extra}\nPlease provide the wisdom that is needed, strength for each day, peace that comes from You, and courage to obey Your Word. Open the right doors and close those that are not aligned with Your will.\n\nFAITH AND OBEDIENCE\nHelp us not only to seek an answer, but to seek You. Teach us to wait faithfully, act wisely, forgive when necessary, and remain obedient while we wait for Your response.\n\nCONCLUSION\nWe believe You are able to do more than we understand, yet above all we ask for Your good and holy will to be done. Guard our hearts and minds in Christ Jesus. In Jesus' name, Amen.\n\nPERSONAL NOTES / ANSWERED PRAYER\n• What has God done?\n• What has He taught me?\n• What is my next step of faith?`}
function libraryPrayerPrompt(x,details={}){return `Create a complete, editable Christian prayer in ${appLanguage==='tl'?'Tagalog':'English'} using the following existing library prayer as the foundation. Prayer title: “${x.title}”. Category: “${x.category}”. Prayer topic: “${details.topic||x.title}”. Person or group: “${details.person||''}”. Related Scripture: “${details.scripture||''}”. Desired tone: “${details.tone||'warm, faith-filled, pastoral, and biblically careful'}”. Additional details: “${details.extra||''}”. Existing prayer: “${x.text}”. Include adoration, thanksgiving, confession or surrender where appropriate, specific requests, Scripture-guided faith, practical obedience, a strong conclusion in Jesus' name, and a short section for answered-prayer notes or spiritual learning. Do not invent Bible quotations, promises, prophecies, or guarantees. Clearly distinguish Scripture from commentary. Keep the prayer compassionate, Christ-centred, and ready for the user to edit before ministry use.`}
function resource(){let o=store.get('openResource',null);if(!o)return route('home');
 if(o.custom){let x=userLibrary(o.kind).find(v=>String(v.id)===String(o.id));const customRoute=({study:'studies',prayer:'prayerlibrary',kids:'kidslibrary',devotional:'devotionals',exhortation:'exhortations'})[o.kind]||'myresources';if(!x)return route(customRoute);title(x.title,ui('Your saved resource','Iyong naka-save na materyales'));let passage=x.scripture||x.passage||x.main||'';let body=x.body||x.text||'';let kidsImage=o.kind==='kids'?(x.image||kidsIllustrationFor(x.title,passage)):'';view.innerHTML=`<button class="ghost" id="backLib">← ${ui('Back to library','Bumalik sa aklatan')}</button><article class="resource-page">${o.kind==='kids'?`<img id="savedKidsIllustration" src="${esc(kidsImage)}" alt="${esc(x.title||ui('Kids lesson illustration','Larawan ng kids lesson'))}" style="display:block;width:100%;max-height:420px;object-fit:contain;margin-bottom:18px">`:''}<span class="pill">${esc(x.category||x.type||ui('Personal Resource','Personal na Materyales'))}</span><label class="field-label">${ui('Title','Pamagat')}<input id="customResourceTitle" value="${esc(x.title||'')}"></label><label class="field-label">${ui('Main Bible Passage','Pangunahing Talata')}<input id="customResourcePassage" value="${esc(passage)}" placeholder="John 3:16"></label>${o.kind==='kids'?`<label class="field-label">${ui('Illustration path','Path ng larawan')}<input id="customKidsImage" value="${esc(kidsImage)}" placeholder="images/lesson-placeholder.svg"></label>`:''}${customScripturePanel(body,passage)}<label class="field-label">${ui('Editable Resource','Editable na Materyales')}<textarea id="customResourceBody" class="draft-area" style="min-height:520px">${esc(body)}</textarea></label><div class="resource-buttons"><button class="primary" id="saveCustomResource">${ui('Save Changes','I-save ang Pagbabago')}</button><button class="ghost" id="refreshScriptureLinks">📖 ${ui('Refresh Scripture Links','I-refresh ang Scripture Links')}</button>${['study','kids','exhortation','devotional'].includes(o.kind)?`<button class="primary" id="presentCustomResource">🖥️ ${ui('Present','I-present')}</button>`:''}<button class="ghost" id="copyCustomResource">${ui('Copy','Kopyahin')}</button><button class="danger" id="deleteCustomResource">${ui('Delete','Burahin')}</button></div></article>`;$('#backLib').onclick=()=>route(customRoute);$('#saveCustomResource').onclick=()=>{let body=$('#customResourceBody').value.trim(),titleValue=$('#customResourceTitle').value.trim()||x.title,passageValue=$('#customResourcePassage').value.trim();updateUserLibrary(o.kind,o.id,{title:titleValue,scripture:passageValue,passage:passageValue,main:passageValue,image:o.kind==='kids'?($('#customKidsImage')?.value.trim()||kidsIllustrationFor(titleValue,passageValue)):x.image,body,text:o.kind==='prayer'?body:x.text});toast(ui('Changes saved','Nai-save ang pagbabago'));resource()};$('#refreshScriptureLinks').onclick=()=>resource();if($('#presentCustomResource'))$('#presentCustomResource').onclick=()=>startResourcePresentation({title:$('#customResourceTitle').value.trim(),passage:$('#customResourcePassage').value.trim(),body:$('#customResourceBody').value,image:o.kind==='kids'?($('#customKidsImage')?.value.trim()||kidsImage):''});$('#copyCustomResource').onclick=async()=>{try{await navigator.clipboard.writeText($('#customResourceBody').value);toast(ui('Copied','Nakopya'))}catch{}};$('#deleteCustomResource').onclick=()=>{if(confirm(ui('Delete this saved resource?','Burahin ang naka-save na materyales?'))){deleteUserLibrary(o.kind,o.id);route(customRoute)}};wireScriptureLinks();return}
 let maps={devotional:DEVOTIONALS,exhortation:EXHORTATIONS,study:BIBLE_STUDIES,kids:KIDS_LESSONS,prayer:PRAYER_LIBRARY},raw=maps[o.kind]?.[o.index];if(!raw||isResourceDeleted(o.kind,o.index))return route({devotional:'devotionals',exhortation:'exhortations',study:'studies',kids:'kidslibrary',prayer:'prayerlibrary'}[o.kind]);let x=effectiveResource(o.kind,o.index,raw);title(x.title,ui('Complete resource view','Kumpletong materyales'));let body='';
 if(o.kind==='devotional')body=`<span class="pill">${esc(x.theme)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Scripture','Pangunahing Talata')}</span>${scriptureLink(x.scripture)}</div><h3>${ui('Reflection','Pagninilay')}</h3><p>${esc(x.reflection)}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Reflection Questions','Mga Tanong sa Pagninilay')}</h3><ol>${(x.questions||[]).map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p><div class="resource-foot"><b>${ui('Memory Verse','Talatang Isasaulo')}:</b> ${scriptureLink(x.memory)}<br><b>${ui('Suggested reading','Iminungkahing pagbasa')}:</b> ${scriptureLink(x.reading)}</div>`;
 if(o.kind==='exhortation')body=`<span class="pill">${esc(x.category)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Scripture','Pangunahing Talata')}</span>${scriptureLink(x.main)}</div><p>${esc(x.intro)}</p>${(x.points||[]).map((p,i)=>`<section><h3>${i+1}. ${esc(p[0])}</h3><p>${esc(p[1])}</p></section>`).join('')}<h3>${ui('Supporting Scriptures','Mga Kaugnay na Talata')}</h3><p>${scriptureList(x.support||[])}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Challenge','Hamon')}</h3><p>${esc(x.challenge)}</p><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p>`;
 if(o.kind==='study')body=`<span class="pill">${esc(x.type)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Passage','Pangunahing Talata')}</span>${scriptureLink(x.passage)}</div><h3>${ui('Objective','Layunin')}</h3><p>${esc(x.objective)}</p><h3>${ui('Background','Konteksto')}</h3><p>${esc(x.background)}</p><h3>${ui('Discussion Questions','Mga Tanong sa Talakayan')}</h3><ol>${(x.questions||[]).map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3>${ui('Leader Notes','Tala para sa Leader')}</h3><p>${esc(x.leader_notes)}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p>`;
 if(o.kind==='kids')body=`<img class="lesson-hero" src="${esc(x.image||'')}" alt="${esc(x.title)}"><span class="pill">${ui('Ages','Edad')} ${esc(x.age)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Bible Story','Kuwento sa Biblia')}</span>${scriptureLink(x.story)}</div><h3>${ui('Opening Prayer','Pambungad na Panalangin')}</h3><p>${esc(x.opening)}</p><h3>${ui('Teaching Lesson','Aralin')}</h3><p>${esc(x.lesson)}</p><h3>${ui('Questions','Mga Tanong')}</h3><ol>${(x.questions||[]).map(q=>`<li>${esc(q)}</li>`).join('')}</ol><div class="idea-grid"><div><h3>🎲 ${ui('Activity','Gawain')}</h3><p>${esc(x.activity)}</p></div><div><h3>✂️ Craft</h3><p>${esc(x.craft)}</p></div></div><h3>${ui('Memory Verse','Talatang Isasaulo')}</h3><p>${scriptureLink(x.memory)}</p><h3>${ui('Closing Prayer','Pangwakas na Panalangin')}</h3><p>${esc(x.closing)}</p><div class="resource-buttons"><button class="primary" id="libraryKidsPpt">📺 ${ui('Create Presentation Outline','Gumawa ng Presentation Outline')}</button><button class="ghost" id="libraryKidsPack">📦 ${ui('Create Resource Pack','Gumawa ng Resource Pack')}</button></div><div id="libraryKidsPanel" class="notice" style="display:none;margin-top:14px"><textarea id="libraryKidsBody" class="draft-area" style="min-height:420px"></textarea><button class="primary" id="libraryKidsCopy">${ui('Copy Resource','Kopyahin ang Resource')}</button></div>`;
 if(o.kind==='prayer')body=`<span class="pill">${esc(x.category)}</span><h2>${esc(x.title)}</h2><div class="prayer-paper"><p>${esc(x.text)}</p></div><section class="card prayer-ai-card"><h3>✨ ${ui('AI-Assisted Prayer Improvement','AI-Assisted na Pagpapahusay ng Panalangin')}</h3><p>${ui('Add optional details, then create a stronger editable prayer or prepare a prompt for ChatGPT.','Magdagdag ng opsyonal na detalye, pagkatapos ay gumawa ng mas kumpletong editable prayer o maghanda ng prompt para sa ChatGPT.')}</p><div class="form-grid"><input id="prayerAiTopic" value="${esc(x.title)}" placeholder="${ui('Prayer topic or need','Paksa o pangangailangan')}"><input id="prayerAiPerson" placeholder="${ui('Person, family, church, or group','Tao, pamilya, iglesia, o grupo')}"><input id="prayerAiScripture" placeholder="${ui('Related Scripture, optional','Kaugnay na talata, opsyonal')}"><select id="prayerAiTone"><option>${ui('Warm and pastoral','Mainit at pastoral')}</option><option>${ui('Powerful and faith-filled','Makapangyarihan at puno ng pananampalataya')}</option><option>${ui('Simple and comforting','Simple at nakaaaliw')}</option><option>${ui('Corporate church prayer','Panalangin para sa buong iglesia')}</option></select><textarea class="wide" id="prayerAiExtra" placeholder="${ui('Extra situation, requests, names, or details','Dagdag na sitwasyon, kahilingan, pangalan, o detalye')}"></textarea></div><div class="resource-buttons"><button class="primary" id="improveLibraryPrayer">✨ ${ui('Improve Prayer','Pagandahin ang Panalangin')}</button><button class="ghost" id="promptLibraryPrayer">🤖 ${ui('Prepare AI Prompt','Ihanda ang AI Prompt')}</button></div><div id="prayerAiPanel" style="display:none;margin-top:14px"><textarea id="prayerAiDraft" class="draft-area" style="min-height:520px"></textarea><div class="resource-buttons"><button class="primary" id="saveImprovedPrayer">${ui('Save as My Custom Prayer','I-save bilang Custom Prayer')}</button><button class="ghost" id="copyImprovedPrayer">${ui('Copy','Kopyahin')}</button></div><div class="notice small-note">${ui('Review generated wording and Scripture references before using it publicly.','Suriin ang generated wording at mga talata bago gamitin sa publiko.')}</div></div></section>`;
 let customised=!!resourceOverrides()[resourceKey(o.kind,o.index)];view.innerHTML=`<button class="ghost" id="backLib">← ${ui('Back to library','Bumalik sa aklatan')}</button><article class="resource-page" id="resourceDisplay">${body}<div class="resource-buttons"><button class="primary" id="editResource">✏️ ${ui('Edit','I-edit')}</button>${['devotional','exhortation','study','kids'].includes(o.kind)?`<button class="primary" id="presentBuiltInResource">🖥️ ${ui('Present','I-present')}</button>`:''}${customised?`<button class="ghost" id="resetResource">↺ ${ui('Restore Original','Ibalik ang Original')}</button>`:''}<button class="danger" id="removeResource">${ui('Remove','Alisin')}</button><button class="ghost" id="copyResource">${ui('Copy','Kopyahin')}</button><button class="ghost" id="printResource">${ui('Print','I-print')}</button></div></article><div id="resourceEditHost"></div>`;
 wireScriptureLinks();const back=()=>route({devotional:'devotionals',exhortation:'exhortations',study:'studies',kids:'kidslibrary',prayer:'prayerlibrary'}[o.kind]);$('#backLib').onclick=back;if($('#presentBuiltInResource'))$('#presentBuiltInResource').onclick=()=>{const clone=$('#resourceDisplay').cloneNode(true);clone.querySelectorAll('button:not(.scripture-link),.resource-buttons,.notice,textarea,input,select,label').forEach(el=>el.remove());startResourcePresentation({title:x.title||'',passage:x.scripture||x.story||x.text||x.main||'',image:o.kind==='kids'?(x.image||''):'',html:clone.innerHTML})};$('#copyResource').onclick=async()=>{await navigator.clipboard.writeText($('#resourceDisplay').innerText);toast(ui('Resource copied','Nakopya ang materyales'))};$('#printResource').onclick=()=>window.print();$('#editResource').onclick=()=>{$('#resourceEditHost').innerHTML=resourceEditor(o.kind,x);$('#resourceDisplay').style.display='none';$('#resourceEditor').scrollIntoView({behavior:'smooth',block:'start'});$('#cancelResourceEdit').onclick=()=>resource();$('#saveResourceEdit').onclick=()=>{let data=collectResourceEdit(o.kind);if(!data.title)return toast(ui('Please add a title','Maglagay ng pamagat'));saveResourceOverride(o.kind,o.index,data);toast(ui('Changes saved','Na-save ang pagbabago'));resource()}};$('#removeResource').onclick=()=>{if(confirm(ui('Remove this resource from your library on this device?','Alisin ang materyales na ito sa library sa device na ito?'))){hideResource(o.kind,o.index);back()}};if($('#resetResource'))$('#resetResource').onclick=()=>{if(confirm(ui('Restore the original built-in version?','Ibalik ang original na built-in version?'))){resetResourceOverride(o.kind,o.index);resource()}};
 if(o.kind==='prayer'){const details=()=>({topic:$('#prayerAiTopic').value.trim(),person:$('#prayerAiPerson').value.trim(),scripture:$('#prayerAiScripture').value.trim(),tone:$('#prayerAiTone').value,extra:$('#prayerAiExtra').value.trim()});const showPrayerDraft=text=>{$('#prayerAiDraft').value=text;$('#prayerAiPanel').style.display='block';$('#prayerAiPanel').scrollIntoView({behavior:'smooth',block:'start'})};$('#improveLibraryPrayer').onclick=()=>{showPrayerDraft(improvedLibraryPrayer(x,details()));toast(ui('Improved prayer created','Nagawa ang mas kumpletong panalangin'))};$('#promptLibraryPrayer').onclick=async()=>{let prompt=libraryPrayerPrompt(x,details());showPrayerDraft(prompt);try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('AI prompt prepared and copied','Naihanda at nakopya ang AI prompt'))};$('#copyImprovedPrayer').onclick=async()=>{try{await navigator.clipboard.writeText($('#prayerAiDraft').value);toast(ui('Prayer copied','Nakopya ang panalangin'))}catch{toast(ui('Select and copy manually','Piliin at kopyahin nang manual'))}};$('#saveImprovedPrayer').onclick=()=>{let text=$('#prayerAiDraft').value.trim();if(!text)return toast(ui('Create or write a prayer first','Gumawa o sumulat muna ng panalangin'));saveResourceOverride('prayer',o.index,{...x,text});toast(ui('Custom prayer saved','Na-save ang custom prayer'));resource()}}
 if(o.kind==='kids'){const kd={title:x.title,passage:x.story,story:x.story,verse:x.memory,memory:x.memory,age:x.age,goal:x.lesson,lesson:x.lesson,notes:x.activity+' '+x.craft};const show=text=>{$('#libraryKidsBody').value=text;$('#libraryKidsPanel').style.display='block';$('#libraryKidsPanel').scrollIntoView({behavior:'smooth',block:'start'})};$('#libraryKidsPpt').onclick=()=>show(kidsPresentationOutline(kd));$('#libraryKidsPack').onclick=()=>show(kidsResourcePack(kd));$('#libraryKidsCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#libraryKidsBody').value);toast(ui('Resource copied','Nakopya ang resource'))}catch{toast(ui('Select and copy manually','Piliin at kopyahin nang manual'))}}}
}
function devotionals(){title(ui('Devotionals','Mga Debosyonal'),ui('Built-in devotionals and your own saved creations.','Mga built-in devotional at sarili mong naka-save.'));view.innerHTML=libraryShell(ui('Daily Devotional Library','Aklatan ng mga Debosyonal'),ui('Open built-in devotionals or personal created devotionals.','Buksan ang built-in o personal na devotional.'),ui('Devotional','Debosyonal'));const draw=q=>{let mine=userLibrary('devotional').filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));let built=DEVOTIONALS.map((raw,i)=>({...effectiveResource('devotional',i,raw),_i:i})).filter(x=>!isResourceDeleted('devotional',x._i)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=(mine.length?`<h2>${ui('My Saved Devotionals','Aking Naka-save na Debosyonal')}</h2>`+mine.map(x=>`<button class="resource-card" data-custom-devotional="${x.id}"><span class="pill">${esc(x.theme||ui('Personal Devotional','Personal na Debosyonal'))}</span><h3>${esc(x.title)}</h3>${x.scripture?`<b>${esc(x.scripture)}</b>`:''}<p>${esc((x.body||'').slice(0,150))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')+(built.length?`<h2>${ui('Built-in Devotionals','Mga Built-in na Debosyonal')}</h2>`+built.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.theme)}</span><h3>${esc(x.title)}</h3><b>${esc(x.scripture)}</b><p>${esc((x.reflection||'').slice(0,150))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')||`<div class="empty">${ui('No devotionals found.','Walang nahanap na debosyonal.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('devotional',+b.dataset.i));document.querySelectorAll('[data-custom-devotional]').forEach(b=>b.onclick=()=>openUserResource('devotional',b.dataset.customDevotional))};draw('');wireLibrary(draw,ui('Devotional','Debosyonal'))}
function exhortations(){title(ui('Exhortations','Mga Exhortation'),ui('Built-in encouragements and your own saved creations.','Mga built-in encouragement at sarili mong naka-save.'));view.innerHTML=libraryShell(ui('Exhortation Library','Aklatan ng mga Exhortation'),ui('Open built-in exhortations or personal created exhortations.','Buksan ang built-in o personal na exhortation.'),ui('Exhortation','Exhortation'));const draw=q=>{let mine=userLibrary('exhortation').filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));let built=EXHORTATIONS.map((raw,i)=>({...effectiveResource('exhortation',i,raw),_i:i})).filter(x=>!isResourceDeleted('exhortation',x._i)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=(mine.length?`<h2>${ui('My Saved Exhortations','Aking Naka-save na Exhortation')}</h2>`+mine.map(x=>`<button class="resource-card" data-custom-exhortation="${x.id}"><span class="pill">${esc(x.category||ui('Personal Exhortation','Personal na Exhortation'))}</span><h3>${esc(x.title)}</h3>${x.scripture?`<b>${esc(x.scripture)}</b>`:''}<p>${esc((x.body||'').slice(0,150))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')+(built.length?`<h2>${ui('Built-in Exhortations','Mga Built-in na Exhortation')}</h2>`+built.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.category)}</span><h3>${esc(x.title)}</h3><b>${esc(x.main)}</b><p>${esc(x.intro)}</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')||`<div class="empty">${ui('No exhortations found.','Walang nahanap na exhortation.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('exhortation',+b.dataset.i));document.querySelectorAll('[data-custom-exhortation]').forEach(b=>b.onclick=()=>openUserResource('exhortation',b.dataset.customExhortation))};draw('');wireLibrary(draw,'Exhortation')}
function studies(){title(ui('Bible Studies','Pag-aaral ng Biblia'),ui('Built-in studies and your own saved Bible studies.','Mga built-in study at sarili mong naka-save na Bible study.'));view.innerHTML=libraryShell(ui('Bible Study Library','Aklatan ng Pag-aaral ng Biblia'),ui('Open built-in studies or your personal AI-created studies.','Buksan ang built-in o personal na AI-created studies.'),ui('Bible Study','Pag-aaral'));const draw=q=>{let mine=userLibrary('study').filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));let built=BIBLE_STUDIES.map((raw,i)=>({...effectiveResource('study',i,raw),_i:i})).filter(x=>!isResourceDeleted('study',x._i)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=(mine.length?`<h2>${ui('My Saved Bible Studies','Aking Naka-save na Bible Studies')}</h2>`+mine.map(x=>`<button class="resource-card" data-custom-study="${x.id}"><span class="pill">${esc(x.type||ui('Personal Study','Personal na Pag-aaral'))}</span><h3>${esc(x.title)}</h3>${x.scripture?`<b>${esc(x.scripture)}</b>`:''}<p>${esc((x.body||'').slice(0,150))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')+(built.length?`<h2>${ui('Built-in Bible Studies','Mga Built-in Bible Study')}</h2>`+built.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.type)}</span><h3>${esc(x.title)}</h3><b>${esc(x.passage)}</b><p>${esc(x.objective)}</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')||`<div class="empty">${ui('No studies found.','Walang nahanap na pag-aaral.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('study',+b.dataset.i));document.querySelectorAll('[data-custom-study]').forEach(b=>b.onclick=()=>openUserResource('study',b.dataset.customStudy))};draw('');wireLibrary(draw,ui('Bible Study','Pag-aaral'))}
function kidslibrary(){title(ui('Kids Lessons','Mga Aralin para sa Bata'),ui('Built-in lessons and your own saved Kids Ministry Studio lessons.','Mga built-in lesson at sarili mong naka-save mula sa Kids Ministry Studio.'));view.innerHTML=libraryShell(ui("Children's Lesson Library",'Aklatan ng Aralin para sa Bata'),ui('Open built-in lessons or your personal created lessons.','Buksan ang built-in o personal na ginawang lesson.'),ui('Kids Lesson','Aralin'));const draw=q=>{let mine=userLibrary('kids').filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));let built=KIDS_LESSONS.map((raw,i)=>({...effectiveResource('kids',i,raw),_i:i})).filter(x=>!isResourceDeleted('kids',x._i)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=(mine.length?`<h2>${ui('My Saved Kids Lessons','Aking Naka-save na Kids Lessons')}</h2>`+mine.map(x=>`<button class="resource-card illustrated" data-custom-kids="${x.id}"><img src="${esc(x.image||kidsIllustrationFor(x.title,x.scripture||x.passage))}" alt="${esc(x.title||ui('Kids lesson illustration','Larawan ng kids lesson'))}"><div><span class="pill">${esc(x.age||ui('Children','Mga Bata'))}</span><h3>${esc(x.title)}</h3>${x.scripture?`<b>${esc(x.scripture)}</b>`:''}<p>${esc((x.theme||x.body||'').slice(0,150))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></div></button>`).join(''):'')+(built.length?`<h2>${ui('Built-in Kids Lessons','Mga Built-in Kids Lesson')}</h2>`+built.map(x=>`<button class="resource-card illustrated" data-i="${x._i}"><img src="${esc(x.image||'')}" alt=""><div><span class="pill">${ui('Ages','Edad')} ${esc(x.age)}</span><h3>${esc(x.title)}</h3><b>${esc(x.story)}</b><p>${esc((x.lesson||'').slice(0,130))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></div></button>`).join(''):'')||`<div class="empty">${ui('No lessons found.','Walang nahanap na aralin.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('kids',+b.dataset.i));document.querySelectorAll('[data-custom-kids]').forEach(b=>b.onclick=()=>openUserResource('kids',b.dataset.customKids))};draw('');wireLibrary(draw,ui('Kids Lesson','Aralin'))}
function prayerlibrary(){title(ui('Prayer Library','Aklatan ng Panalangin'),ui('Built-in prayers and prayers you created and saved.','Mga built-in prayer at sarili mong ginawa at nai-save.'));view.innerHTML=libraryShell(ui('Prayer Library','Aklatan ng Panalangin'),ui('Open built-in prayers or your personal AI-created prayers.','Buksan ang built-in o personal na AI-created prayers.'),ui('Prayer','Panalangin'));const draw=q=>{let mine=userLibrary('prayer').filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));let built=PRAYER_LIBRARY.map((raw,i)=>({...effectiveResource('prayer',i,raw),_i:i})).filter(x=>!isResourceDeleted('prayer',x._i)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=(mine.length?`<h2>${ui('My Saved Prayers','Aking Naka-save na Panalangin')}</h2>`+mine.map(x=>`<button class="resource-card" data-custom-prayer="${x.id}"><span class="pill">${esc(x.category||ui('My Prayer','Aking Panalangin'))}</span><h3>${esc(x.title)}</h3>${x.scripture?`<b>${esc(x.scripture)}</b>`:''}<p>${esc((x.body||x.text||'').slice(0,170))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')+(built.length?`<h2>${ui('Built-in Prayers','Mga Built-in na Panalangin')}</h2>`+built.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc((x.text||'').slice(0,170))}…</p><span class="open-label">${ui('Open or edit →','Buksan o i-edit →')}</span></button>`).join(''):'')||`<div class="empty">${ui('No prayers found.','Walang nahanap na panalangin.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('prayer',+b.dataset.i));document.querySelectorAll('[data-custom-prayer]').forEach(b=>b.onclick=()=>openUserResource('prayer',b.dataset.customPrayer))};draw('');wireLibrary(draw,ui('Prayer','Panalangin'))}
const creatorFields={
 'Devotional':['Theme','Main Scripture','Audience','Tone','Length'],
 'Exhortation':['Theme','Main Scripture','Audience','Tone','Length'],
 'Prayer':['Prayer Topic','Scripture (optional)','Person or Group','Tone','Length'],
 'Bible Study':['Study Topic','Main Passage','Audience','Study Style','Length'],
 'Kids Lesson':['Lesson Theme','Bible Passage','Age Group','Learning Goal','Length']
};
function makeOfflineDraft(type,v){let topic=v[0]||'Growing in Faith',verse=v[1]||'Proverbs 3:5–6',aud=v[2]||'Adults',tone=v[3]||'Encouraging';if(type==='Prayer')return `Title: Prayer for ${topic}\n\nScripture focus: ${verse}\n\nFather, we come before You concerning ${topic.toLowerCase()}. Help ${aud.toLowerCase()} to trust Your character, receive Your wisdom, and walk in faithful obedience. Where there is fear, give peace. Where there is weakness, provide strength. Let Your Word guide every decision, and may this situation bring honour to Jesus Christ. Amen.`;if(type==='Kids Lesson')return `Title: ${topic}\nAge group: ${aud}\nBible passage: ${verse}\n\nOpening Prayer:\nDear God, help us listen to Your Word and learn how to follow You. Amen.\n\nMain Truth:\nGod is faithful, and we can respond with trust and obedience.\n\nBible Story:\nRead ${verse}. Explain the story in simple language and point children to what it teaches about God.\n\nDiscussion Questions:\n1. What happened in the story?\n2. What do we learn about God?\n3. What can we do this week?\n\nActivity:\nCreate a simple role-play or matching game connected to ${topic.toLowerCase()}.\n\nMemory Verse: ${verse}\n\nClosing Prayer:\nLord, help us remember and obey what we learned. Amen.`;if(type==='Bible Study')return `Title: ${topic}\nMain passage: ${verse}\nAudience: ${aud}\n\nObjective:\nUnderstand what the passage teaches about God, people, faith, and obedient living.\n\nObservation:\nRead the passage twice. Note repeated words, commands, promises, and important people or events.\n\nDiscussion Questions:\n1. What does the passage say?\n2. What does it reveal about God?\n3. What truth corrects or encourages us?\n4. How should we respond this week?\n\nLeader Note:\nKeep the main passage central and distinguish clearly between Scripture and application.\n\nApplication:\nChoose one specific act of obedience.\n\nPrayer:\nAsk God to help the group understand and live out His Word.`;if(type==='Exhortation')return `Title: ${topic}\nMain Scripture: ${verse}\nAudience: ${aud}\nTone: ${tone}\n\nIntroduction:\nOur circumstances may change, but God remains faithful. ${topic} calls us to listen to His Word and respond with trust.\n\n1. Remember who God is\nGod's character is the foundation of our confidence.\n\n2. Receive what Scripture says\nFaith grows as we submit our thoughts and feelings to God's truth.\n\n3. Respond with obedience\nBiblical encouragement should lead to a practical step of faith.\n\nApplication:\nName one area where this truth must shape your decisions today.\n\nClosing Challenge:\nDo not merely admire the message—live it.\n\nPrayer:\nLord, establish this truth in our hearts and help us obey You. Amen.`;return `Title: ${topic}\nScripture: ${verse}\nAudience: ${aud}\nTone: ${tone}\n\nReflection:\nGod invites us to meet Him in His Word. As we consider ${topic.toLowerCase()}, we are reminded that His character is trustworthy and His grace is sufficient. The passage calls us away from self-reliance and toward a faithful response rooted in prayer and obedience.\n\nApplication:\nIdentify one thought, habit, or decision that should change because of this Scripture.\n\nReflection Questions:\n1. What does this passage reveal about God?\n2. What response is God inviting from me?\n\nPrayer:\nFather, teach me through Your Word and help me live this truth today. Amen.`}
function ministryStudioSeed(topic=''){
 const sets=[
  {topic:ui('Trusting God in Uncertain Times','Pagtitiwala sa Diyos sa Panahon ng Kawalan ng Katiyakan'),title:ui('Faith Beyond What We See','Pananampalatayang Higit sa Nakikita'),scripture:'Proverbs 3:5-6'},
  {topic:ui('God’s Faithfulness','Katapatan ng Diyos'),title:ui('Great Is His Faithfulness','Dakila ang Kanyang Katapatan'),scripture:'Lamentations 3:22-23'},
  {topic:ui('Prayer and Peace','Panalangin at Kapayapaan'),title:ui('Peace Through Prayer','Kapayapaan sa Pamamagitan ng Panalangin'),scripture:'Philippians 4:6-7'},
  {topic:ui('Serving Others','Paglilingkod sa Kapwa'),title:ui('Called to Serve in Love','Tinawag na Maglingkod sa Pag-ibig'),scripture:'Galatians 5:13'},
  {topic:ui('Hope During Trials','Pag-asa sa Gitna ng Pagsubok'),title:ui('Hope That Holds Us','Pag-asang Humahawak sa Atin'),scripture:'Romans 5:3-5'},
  {topic:ui('Abiding in Christ','Pananatili kay Cristo'),title:ui('Remain in the True Vine','Manatili sa Tunay na Puno ng Ubas'),scripture:'John 15:1-8'}
 ];
 if(topic.trim()){let base=simpleResourceDefaults('study',{topic});return {topic,title:base.title,scripture:base.scripture}}
 return sets[Math.floor(Math.random()*sets.length)]
}

function ministryIdeaPool(){return [
 {topic:'Trusting God in uncertainty',title:'Faith When the Way Is Unclear',scripture:'Proverbs 3:5-6'},
 {topic:'God’s peace in anxious times',title:'Peace That Guards the Heart',scripture:'Philippians 4:4-9'},
 {topic:'Persevering through trials',title:'Joy and Growth in Trials',scripture:'James 1:2-8'},
 {topic:'Abiding in Christ',title:'Remain in the True Vine',scripture:'John 15:1-11'},
 {topic:'Living by faith',title:'Walking by Faith, Not by Sight',scripture:'2 Corinthians 5:1-10'},
 {topic:'Serving one another',title:'Called to Serve in Love',scripture:'Galatians 5:13-14'},
 {topic:'Forgiveness and grace',title:'Freely Forgiven, Ready to Forgive',scripture:'Colossians 3:12-15'},
 {topic:'Courage in God’s presence',title:'Be Strong and Courageous',scripture:'Joshua 1:1-9'},
 {topic:'Prayer that trusts God',title:'Pray Without Losing Heart',scripture:'Luke 18:1-8'},
 {topic:'The Good Shepherd',title:'Known and Kept by the Shepherd',scripture:'John 10:1-18'},
 {topic:'Hope in suffering',title:'A Living Hope',scripture:'1 Peter 1:3-9'},
 {topic:'Renewing the mind',title:'Transformed by the Renewal of Your Mind',scripture:'Romans 12:1-2'},
 {topic:'God’s faithfulness',title:'Great Is Your Faithfulness',scripture:'Lamentations 3:19-26'},
 {topic:'Love in action',title:'Love That Can Be Seen',scripture:'1 John 3:16-24'},
 {topic:'The armour of God',title:'Standing Firm in God’s Strength',scripture:'Ephesians 6:10-18'},
 {topic:'Jesus calms the storm',title:'Jesus Is Lord Over the Storm',scripture:'Mark 4:35-41'},
 {topic:'The Good Samaritan',title:'Go and Do Likewise',scripture:'Luke 10:25-37'},
 {topic:'David and Goliath',title:'Courage Bigger Than Fear',scripture:'1 Samuel 17'},
 {topic:'Daniel’s faithfulness',title:'Faithful When It Is Difficult',scripture:'Daniel 6'},
 {topic:'The lost sheep',title:'Every One Matters to God',scripture:'Luke 15:1-7'}
]}
function unusedMinistryIdea(type){
 const kind=({Devotional:'devotional',Exhortation:'exhortation','Bible Study':'study','Kids Lesson':'kids',Prayer:'prayer'})[type]||'study';
 const saved=userLibrary(kind); const used=new Set(saved.map(x=>String(x.title||'').toLowerCase().trim()));
 const available=ministryIdeaPool().filter(x=>!used.has(x.title.toLowerCase()));
 const pool=available.length?available:ministryIdeaPool();
 return pool[Math.floor(Math.random()*pool.length)];
}
function completeMinistryDraft(type,d){const t=d.title,topic=d.topic,s=d.scripture,a=d.audience||ui('Everyone','Lahat');
 if(type==='Prayer')return `TITLE: ${t}
TOPIC / PERSON: ${topic}
RELATED SCRIPTURE: ${s}
AUDIENCE: ${a}

SCRIPTURE FOCUS:
Read ${s} slowly and use its truth to guide the prayer.

THANKSGIVING:
Father, thank You for Your goodness, mercy, faithfulness, and presence.

SURRENDER:
We place this need before You and submit our plans, fears, and expectations to Your wisdom.

SPECIFIC PRAYER:
Lord, please give strength, wisdom, provision, healing according to Your will, protection, and peace for ${topic}. Help every person involved to trust You and walk faithfully.

SUPPORTING SCRIPTURES:
Philippians 4:6–7; Psalm 46:1; Isaiah 41:10

FAITH RESPONSE / APPLICATION:
Choose one practical act of faith today: pray again, forgive, ask for help, encourage someone, or take the next wise step.

CLOSING:
We trust Your character even while we wait for Your answer. Lead us by Your Spirit and keep us faithful. In Jesus’ name, amen.`;
 if(type==='Devotional')return `TITLE: ${t}\nTHEME: ${topic}\nMAIN SCRIPTURE: ${s}\nAUDIENCE: ${a}\n\nSUGGESTED READING:\n${s}; Psalm 119:105; James 1:22-25\n\nREFLECTION:\nGod meets us through His Word and calls us to trust His character. Read the passage in context and notice what it reveals about God, the human heart, and faithful living. Biblical devotion is more than receiving encouragement; it invites a response of worship, trust, repentance, and obedience.\n\nPRACTICAL APPLICATIONS:\n1. Write one truth from the passage that you need to remember today.\n2. Identify one attitude, habit, decision, or relationship that should change because of this truth.\n3. Choose one specific act of obedience you can complete within the next twenty-four hours.\n4. Share one encouragement from the passage with another person.\n\nGOOD SUGGESTIONS FOR TODAY:\n• Read the main passage twice in two different translations if available.\n• Pray the main truth back to God in your own words.\n• Put the key verse somewhere visible.\n• End the day by reviewing how you responded.\n\nREFLECTION QUESTIONS WITH SUGGESTED ANSWERS:\n1. What does this passage reveal about God?\nSuggested answer: It shows that God is faithful, present, wise, and worthy of trust. Adjust this answer to the exact emphasis of the passage.\n2. What does it expose or correct in me?\nSuggested answer: It may reveal fear, self-reliance, impatience, unbelief, or delayed obedience.\n3. What promise, command, warning, or example should I notice?\nSuggested answer: State the clearest promise or command from ${s} in your own words.\n4. What faithful response can I make today?\nSuggested answer: Choose one measurable action involving prayer, forgiveness, encouragement, service, or obedience.\n\nCONCLUSION:\nGod’s Word is not only information to understand but truth to live. Let this passage shape your thoughts, choices, relationships, and worship today.\n\nCLOSING PRAYER:\nFather, open my heart to Your Word. Help me trust You, obey what You show me, and reflect Christ in my daily life. Give me wisdom for today and grace to follow through. In Jesus’ name, amen.`;
 if(type==='Exhortation')return `TITLE: ${t}\nTHEME: ${topic}\nMAIN SCRIPTURE: ${s}\nAUDIENCE: ${a}\n\nSUGGESTED READING:\n${s}; Psalm 46:1; Isaiah 41:10; James 1:22\n\nINTRODUCTION:\nWe all face moments when faith must move from words into action. This passage calls us to remember who God is, receive His truth, and respond with courage and obedience.\n\n1. REMEMBER GOD’S CHARACTER\nOur confidence rests not in changing circumstances but in the unchanging character of God.\n\n2. RECEIVE THE TRUTH OF SCRIPTURE\nLet the passage correct fear, renew the mind, and strengthen faith. Keep the main text central and read it in context.\n\n3. RESPOND WITH OBEDIENCE\nTrue encouragement leads to a concrete next step: prayer, forgiveness, service, patience, generosity, or courageous witness.\n\nSUPPORTING SCRIPTURES:\nPsalm 46:1; Isaiah 41:10; Romans 12:2; James 1:22-25\n\nAI APPLICATION:\n1. Name the area where you have been hesitating or afraid.\n2. Write the truth from ${s} that speaks directly to that area.\n3. Take one obedient step within the next forty-eight hours.\n4. Ask a trusted believer to pray with you and help you remain accountable.\n\nCLOSING CHALLENGE:\nDo not leave this truth as a good idea. Carry it into your next conversation, decision, and act of service. Before this day ends, do one thing that demonstrates trust in God.\n\nCONCLUSION:\nThe God who calls us is faithful. We can move forward because His presence, promises, and Word are dependable.\n\nCLOSING PRAYER:\nFaithful God, establish this truth in our hearts. Replace fear with faith, delay with obedience, and discouragement with hope. Give us courage to live what we have heard and grace to encourage others. In Jesus’ name, amen.`;
 if(type==='Bible Study')return `TITLE: ${t}\nTOPIC: ${topic}\nMAIN PASSAGE: ${s}\nAUDIENCE: ${a}\n\nPREPARATION READING:\n${s}; Psalm 119:105; Romans 12:2; James 1:22-25\n\nOBJECTIVE:\nUnderstand what the passage teaches about God, people, faith, and obedient living, then identify a clear personal and group response.\n\nBACKGROUND AND CONTEXT:\nIdentify the biblical book, writer, original audience, surrounding chapter, and situation being addressed. Read before and after the selected verses so conclusions remain faithful to context.\n\nOBSERVATION:\n1. What happens or is taught in the passage?\n2. Which words or ideas are repeated?\n3. What commands, promises, warnings, contrasts, or examples appear?\n\nMAIN TEACHING POINTS:\n1. God reveals His character and purposes.\n2. Scripture exposes the condition and need of the human heart.\n3. Faith responds through trust, repentance, worship, and obedience.\n\nSUPPORTING SCRIPTURES:\nPsalm 119:105; Romans 12:1-2; 2 Timothy 3:16-17; James 1:22-25\n\nDISCUSSION QUESTIONS WITH SUGGESTED ANSWERS:\n1. What is the main message of the passage?\nSuggested answer: Summarise ${s} in one clear sentence, keeping the author’s main emphasis.\n2. What does it reveal about God?\nSuggested answer: It reveals God’s character, authority, mercy, faithfulness, holiness, or saving purpose as shown in the text.\n3. What does it reveal about people?\nSuggested answer: It shows our need for grace, our tendency toward fear or self-reliance, and our responsibility to respond in faith.\n4. Is there a command to obey, promise to trust, sin to avoid, or example to follow?\nSuggested answer: Identify the strongest one directly from the passage and explain it in everyday language.\n5. How does this passage connect to Jesus and the gospel?\nSuggested answer: Explain how the text points to Christ’s character, work, teaching, kingdom, grace, or the believer’s new life in Him.\n6. How can our group live this truth this week?\nSuggested answer: Choose one practical action that is specific, measurable, realistic, and rooted in the passage.\n\nPERSONAL APPLICATION:\nWrite one truth to believe, one behaviour to change, one person to encourage, and one action to complete this week.\n\nLEADER NOTES:\nInvite several answers before offering the suggested response. Keep returning the discussion to the main passage. The answers above are guides and should be edited to fit the exact context and audience.\n\nCONCLUSION:\nBiblical study is complete when understanding becomes faithful living. Return to the main passage and summarise its central truth together.\n\nCLOSING PRAYER:\nFather, give us understanding through Your Word and grace to obey what we have learned. Shape our minds, choices, and relationships through this truth. In Jesus’ name, amen.`;
 if(type==='Kids Lesson')return `LESSON TITLE: ${t}\nMAIN TRUTH: ${topic}\nBIBLE PASSAGE: ${s}\nAGE GROUP: ${d.audience||ui('Ages 6–12','Edad 6–12')}\n\nTEACHER PREPARATION:\nRead ${s} before class. Identify one clear truth about God and one simple response for children.\n\nILLUSTRATION IDEA:\nUse the lesson picture as a visual introduction. Ask the children what they notice, what they think may happen, and how the picture connects to the Bible story.\n\nOPENING PRAYER:\nDear God, help us listen, understand Your Word, and learn to follow Jesus. Amen.\n\nLESSON AIM:\nChildren will understand the main truth and choose one age-appropriate way to practise it.\n\nICEBREAKER:\nAsk children to share a time when they needed help, courage, patience, kindness, or trust.\n\nBIBLE STORY:\nRead or retell ${s} in simple language. Explain who was involved, what happened, what God did, and why it matters. Do not add details that are not in Scripture.\n\nTEACHING POINTS:\n1. God is good and faithful.\n2. We can listen to and trust His Word.\n3. Faith is shown through loving obedience.\n\nDISCUSSION QUESTIONS WITH SUGGESTED ANSWERS:\n1. Who were the main people in the story?\nSuggested answer: Name the people directly mentioned in ${s}.\n2. What happened first, next, and last?\nSuggested answer: Retell the main events in three simple steps.\n3. What do we learn about God?\nSuggested answer: God is good, powerful, faithful, loving, and worthy of trust, according to the story.\n4. What did the people do well or need to change?\nSuggested answer: Point to their faith, obedience, fear, kindness, or need to listen to God.\n5. What should we do this week?\nSuggested answer: Choose one simple action such as telling the truth, helping someone, praying, forgiving, sharing, or obeying quickly.\n\nMEMORY VERSE:\n${s}\nRead it together, explain its meaning, and repeat it with simple hand actions.\n\nGAME:\nCreate a team relay or matching game using key words, events, and the memory verse.\n\nCRAFT:\nMake a Scripture reminder card showing one scene from the story, the main truth, and one action step.\n\nWEEKLY CHALLENGE:\nDo one act of kindness or obedience and tell a parent or teacher what you learned.\n\nREVIEW AND CONCLUSION:\nRepeat the main truth together. Ask children to explain it in their own words and name one way to live it.\n\nPARENT TAKEAWAY:\nRead ${s} together at home and discuss one practical family application.\n\nCLOSING PRAYER:\nLord Jesus, thank You for Your Word. Help us remember this lesson, trust You, and obey You with joyful hearts. Amen.`;
 return ''
}
function creator(){let type=store.get('creatorType','Devotional');const types=['Devotional','Exhortation','Bible Study','Kids Lesson','Prayer'];if(!types.includes(type))type='Devotional';title(ui('AI Ministry Studio','AI Ministry Studio'),ui('Create a complete resource from a few details—or leave everything blank for a random lesson or message.','Gumawa ng kumpletong materyales mula sa kaunting detalye—o iwang blangko para sa random na aralin o mensahe.'));view.innerHTML=`<div class="creator-layout"><section class="card"><label class="field-label">${ui('What would you like to create?','Ano ang nais mong gawin?')}<select id="ctype">${types.map(x=>`<option ${x===type?'selected':''}>${x}</option>`).join('')}</select></label><div class="form-grid"><input id="studioTopic" placeholder="${ui('Topic or theme (optional)','Paksa o tema (opsyonal)')}"><input id="studioTitle" placeholder="${ui('Title (optional)','Pamagat (opsyonal)')}"><input id="studioScripture" placeholder="${ui('Bible passage (optional)','Talata sa Biblia (opsyonal)')}"><input id="studioAudience" placeholder="${ui('Audience or age group (optional)','Audience o edad (opsyonal)')}"><textarea class="wide" id="studioNotes" placeholder="${ui('Extra instructions or personal notes (optional)','Karagdagang tagubilin o personal notes (opsyonal)')}"></textarea><div class="wide ai-assist-row"><button class="primary" id="studioGenerate">✨ ${ui('Generate Complete Resource','Gumawa ng Kumpletong Materyales')}</button><button class="ghost" id="studioRandom">🎲 ${ui('Inspire Me','Bigyan Ako ng Inspirasyon')}</button><button class="ghost" id="studioPack">📦 ${ui('Generate Ministry Pack','Gumawa ng Ministry Pack')}</button><button class="ghost" id="studioClear">${ui('Clear','Burahin')}</button></div></div><div class="notice small-note">${ui('All fields are optional. Blank fields create a fresh random topic, title, Scripture, reading, conclusion, application, and prayer. Always review generated teaching against Scripture before ministry use.','Opsyonal ang lahat ng field. Kapag blangko, gagawa ito ng random na paksa, pamagat, talata, reading, conclusion, application, at prayer. Palaging suriin ayon sa Kasulatan bago gamitin.')}</div></section><section class="card"><div class="draft-head"><h3>${ui('Editable Complete Draft','Editable na Kumpletong Draft')}</h3><span class="pill">${ui('Review before saving','Suriin bago i-save')}</span></div><textarea id="draft" class="draft-area" style="min-height:620px" placeholder="${ui('Your complete ministry resource will appear here...','Lalabas dito ang kumpletong ministry resource...')}"></textarea><div class="creator-buttons"><button class="primary" id="saveDraft">${ui('Save to Correct Library','I-save sa Tamang Library')}</button><button class="ghost" id="copyDraft">${ui('Copy','Kopyahin')}</button></div></section></div>`;
 const fill=(forceRandom=false)=>{let topic=$('#studioTopic').value.trim(),blank=!topic&&!$('#studioTitle').value.trim()&&!$('#studioScripture').value.trim(),seed=(forceRandom||blank)?unusedMinistryIdea(type):ministryStudioSeed(topic);if(forceRandom||!topic)$('#studioTopic').value=seed.topic;if(forceRandom||!$('#studioTitle').value.trim())$('#studioTitle').value=seed.title;if(forceRandom||!$('#studioScripture').value.trim())$('#studioScripture').value=seed.scripture;return {topic:$('#studioTopic').value.trim(),title:$('#studioTitle').value.trim(),scripture:$('#studioScripture').value.trim(),audience:$('#studioAudience').value.trim(),notes:$('#studioNotes').value.trim()}};
 const generate=(random=false)=>{type=$('#ctype').value;store.set('creatorType',type);let d=fill(random);$('#draft').value=completeMinistryDraft(type,d)+(d.notes?`\n\nPERSONAL NOTES / EXTRA INSTRUCTIONS:\n${d.notes}`:'');toast(random?ui('A fresh random resource was created','Nagawa ang bagong random na materyales'):ui('Complete resource created','Nagawa ang kumpletong materyales'))};
 $('#studioGenerate').onclick=()=>generate(false);$('#studioRandom').onclick=()=>generate(true);$('#studioClear').onclick=()=>{['studioTopic','studioTitle','studioScripture','studioAudience','studioNotes','draft'].forEach(id=>$('#'+id).value='')};$('#ctype').onchange=()=>{type=$('#ctype').value;store.set('creatorType',type)};$('#copyDraft').onclick=async()=>{if(!$('#draft').value.trim())generate(false);try{await navigator.clipboard.writeText($('#draft').value);toast(ui('Copied','Nakopya'))}catch{}};
 $('#saveDraft').onclick=()=>{if(!$('#draft').value.trim())generate(false);let d=fill(false),body=$('#draft').value.trim(),map={'Devotional':['devotional','devotionals'],'Exhortation':['exhortation','exhortations'],'Bible Study':['study','studies'],'Kids Lesson':['kids','kidslibrary'],'Prayer':['prayer','prayerlibrary']},[kind,page]=map[type];saveUserLibrary(kind,{title:d.title,topic:d.topic,theme:d.topic,category:ui('Personal '+type,'Personal na '+type),type:ui('Personal '+type,'Personal na '+type),scripture:d.scripture,passage:d.scripture,main:d.scripture,age:d.audience,image:type==='Kids Lesson'?kidsIllustrationFor(d.title,d.scripture):undefined,text:type==='Prayer'?body:'',body});toast(ui(`Saved to ${type} Library`,`Nai-save sa ${type} Library`));route(page)};
 $('#studioPack').onclick=()=>{let d=fill(false),packTypes=['Devotional','Exhortation','Bible Study','Kids Lesson','Prayer'];packTypes.forEach((pt,i)=>{let kind=({Devotional:'devotional',Exhortation:'exhortation','Bible Study':'study','Kids Lesson':'kids',Prayer:'prayer'})[pt];saveUserLibrary(kind,{id:Date.now()+i,title:d.title+(pt==='Devotional'?' — Devotional':pt==='Exhortation'?' — Exhortation':pt==='Bible Study'?' — Bible Study':pt==='Kids Lesson'?' — Kids Lesson':' — Prayer'),topic:d.topic,theme:d.topic,category:'Ministry Pack',type:'Ministry Pack',scripture:d.scripture,passage:d.scripture,main:d.scripture,age:d.audience,body:completeMinistryDraft(pt,{...d,title:d.title}),text:pt==='Prayer'?completeMinistryDraft(pt,{...d,title:d.title}):''})});$('#draft').value=`MINISTRY PACK CREATED\n\nTheme: ${d.topic}\nMain Scripture: ${d.scripture}\n\n✓ Devotional saved to Devotional Library\n✓ Exhortation saved to Exhortation Library\n✓ Bible Study saved to Bible Study Library\n✓ Kids Lesson saved to Kids Lessons\n✓ Prayer saved to Prayer Library\n\nOpen each library to review, edit, copy, or delete its resource.`;toast(ui('Complete Ministry Pack saved to all five libraries','Nai-save ang Ministry Pack sa limang library'))}
}
function myresources(){title('My Resources','Personal drafts saved only in this browser.');let a=store.get('createdResources');view.innerHTML=`<div class="privacy-card"><div class="privacy-icon">📁</div><div><h3>Private to this browser profile</h3><p>These drafts are not added to the public GitHub library. Use My Backup to move them to another device.</p></div></div><div class="entries">${a.length?a.map(x=>`<article class="entry"><span class="pill">${esc(x.type)}</span><h3>${esc(x.title)}</h3><div class="meta">${esc(x.created)}</div><pre class="saved-resource">${esc(x.text)}</pre><button class="ghost" data-copy="${x.id}">Copy</button> <button class="danger" data-del="${x.id}">Delete</button></article>`).join(''):'<div class="empty">You have not saved any created resources yet.</div>'}</div>`;document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{let x=a.find(y=>y.id==b.dataset.copy);await navigator.clipboard.writeText(x.text);toast('Copied')});document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this personal resource?')){a=a.filter(x=>x.id!=b.dataset.del);store.set('createdResources',a);myresources()}})}



function allReadingPlans(){return [...(window.DM_READING_PLANS||[]),...store.get('customReadingPlans',[])]}
function guidedPlans(){
 title(ui('Guided Reading Plans','Mga Gabay sa Pagbasa'),ui('Use the built-in plans, create your own, or prepare an AI prompt for a longer personalised plan.','Gamitin ang built-in plans, gumawa ng sarili, o maghanda ng AI prompt para sa mas mahaba at personalised na plano.'));
 const plans=allReadingPlans(),progress=store.get('planProgress',{});
 view.innerHTML=`<section class="card"><h2>✨ ${ui('Create or expand a reading plan','Gumawa o palawakin ang reading plan')}</h2><div class="form-grid"><input id="planTitle" placeholder="${ui('Plan title','Pamagat ng plano')}"><input id="planTlTitle" placeholder="${ui('Tagalog title (optional)','Tagalog na pamagat (opsyonal)')}"><input id="planTheme" placeholder="${ui('Theme or goal, e.g. 30 days of prayer','Tema o layunin, hal. 30 araw ng panalangin')}"><input id="planDays" type="number" min="1" max="365" value="14" placeholder="${ui('Number of days','Bilang ng araw')}"></div><textarea id="planReadings" class="draft-area" style="min-height:180px" placeholder="${ui('One day per line: John 1 | Who Jesus is | Kung sino si Jesus','Isang araw bawat linya: John 1 | Who Jesus is | Kung sino si Jesus')}"></textarea><div class="resource-buttons"><button class="primary" id="saveCustomPlan">${ui('Save Custom Plan','I-save ang Custom Plan')}</button><button class="ghost" id="preparePlanAI">🤖 ${ui('Prepare AI Prompt','Ihanda ang AI Prompt')}</button><button class="ghost" id="clearPlanEditor">${ui('Clear','I-clear')}</button></div><div id="planAiPanel" style="display:none;margin-top:14px"><textarea id="planAiPrompt" class="draft-area" style="min-height:260px"></textarea><div class="resource-buttons"><button class="primary" id="copyPlanAI">${ui('Copy AI Prompt','Kopyahin ang AI Prompt')}</button><button class="ghost" id="openPlanChat">${ui('Open ChatGPT','Buksan ang ChatGPT')}</button></div><div class="notice small-note">${ui('Paste the AI result back into the readings box using: Scripture | English guidance | Tagalog guidance. Review every Scripture reference before saving.','I-paste ang AI result sa readings box gamit ang: Talata | English guidance | Tagalog guidance. Suriin ang bawat Scripture reference bago i-save.')}</div></div></section><div class="tool-grid">${plans.map(p=>{let done=p.readings.filter((_,i)=>progress[p.id+'-'+i]).length;return `<article class="card tool-card"><span class="pill">${p.readings.length} ${ui('days','araw')}</span><h2>${esc(appLanguage==='tl'?(p.tlTitle||p.title):p.title)}</h2><p>${done} / ${p.readings.length} ${ui('completed','natapos')}</p><progress value="${done}" max="${p.readings.length}"></progress><div class="resource-buttons"><button class="primary" data-open-plan="${p.id}">${ui('Open plan','Buksan ang plano')}</button>${p.custom?`<button class="ghost" data-edit-plan="${p.id}">${ui('Edit','I-edit')}</button><button class="danger" data-delete-plan="${p.id}">${ui('Delete','Alisin')}</button>`:''}</div></article>`}).join('')}</div><div id="planDetail"></div>`;
 const parseReadings=()=>$('#planReadings').value.split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{let a=line.split('|').map(x=>x.trim());return [a[0]||'',a[1]||'',a[2]||a[1]||'']}).filter(x=>x[0]);
 const clearEditor=()=>{$('#planTitle').value='';$('#planTlTitle').value='';$('#planTheme').value='';$('#planDays').value=14;$('#planReadings').value='';delete $('#saveCustomPlan').dataset.editId};
 $('#clearPlanEditor').onclick=clearEditor;
 $('#saveCustomPlan').onclick=()=>{let readings=parseReadings(),title=$('#planTitle').value.trim();if(!title)return toast(ui('Please add a plan title','Maglagay ng pamagat ng plano'));if(!readings.length)return toast(ui('Add at least one Scripture reading','Magdagdag ng kahit isang Scripture reading'));let a=store.get('customReadingPlans',[]),edit=$('#saveCustomPlan').dataset.editId,id=edit||('custom-'+Date.now()),plan={id,title,tlTitle:$('#planTlTitle').value.trim()||title,days:readings.length,readings,custom:true};if(edit){let i=a.findIndex(x=>x.id===edit);if(i>=0)a[i]=plan;else a.push(plan)}else a.push(plan);store.set('customReadingPlans',a);toast(ui('Reading plan saved','Na-save ang reading plan'));guidedPlans()};
 $('#preparePlanAI').onclick=()=>{let theme=$('#planTheme').value.trim()||$('#planTitle').value.trim()||ui('growing in faith','paglago sa pananampalataya'),days=Math.max(1,Math.min(365,+$('#planDays').value||14));let prompt=`Create a ${days}-day Christian Bible reading plan about “${theme}”. Use ${appLanguage==='tl'?'Tagalog and English':'English with a Tagalog translation'} for each day's short guidance. Return exactly one day per line in this format: Scripture reference | English guidance | Tagalog guidance. Use real Bible chapters or clear verse ranges, avoid repeating readings unless necessary, progress logically from foundation to application, keep each guidance sentence concise, and do not invent Bible quotations or references. The user will review and edit the plan before saving.`;$('#planAiPrompt').value=prompt;$('#planAiPanel').style.display='block';navigator.clipboard?.writeText(prompt);toast(ui('AI prompt prepared and copied','Naihanda at nakopya ang AI prompt'))};
 $('#copyPlanAI').onclick=async()=>{await navigator.clipboard.writeText($('#planAiPrompt').value);toast(ui('AI prompt copied','Nakopya ang AI prompt'))};$('#openPlanChat').onclick=()=>window.open('https://chatgpt.com/','_blank','noopener');
 document.querySelectorAll('[data-open-plan]').forEach(b=>b.onclick=()=>showPlan(b.dataset.openPlan));
 document.querySelectorAll('[data-edit-plan]').forEach(b=>b.onclick=()=>{let p=allReadingPlans().find(x=>x.id===b.dataset.editPlan);if(!p)return;$('#planTitle').value=p.title;$('#planTlTitle').value=p.tlTitle||'';$('#planDays').value=p.readings.length;$('#planReadings').value=p.readings.map(r=>r.join(' | ')).join('\n');$('#saveCustomPlan').dataset.editId=p.id;window.scrollTo({top:0,behavior:'smooth'});toast(ui('Plan loaded for editing','Na-load ang plano para i-edit'))});
 document.querySelectorAll('[data-delete-plan]').forEach(b=>b.onclick=()=>{if(!confirm(ui('Delete this custom reading plan?','Alisin ang custom reading plan na ito?')))return;let id=b.dataset.deletePlan;store.set('customReadingPlans',store.get('customReadingPlans',[]).filter(x=>x.id!==id));let pr=store.get('planProgress',{});Object.keys(pr).filter(k=>k.startsWith(id+'-')).forEach(k=>delete pr[k]);store.set('planProgress',pr);guidedPlans()});
}
function showPlan(id){const p=allReadingPlans().find(x=>x.id===id),progress=store.get('planProgress',{}),box=$('#planDetail');if(!p)return;box.innerHTML=`<section class="card plan-detail"><h2>${esc(appLanguage==='tl'?(p.tlTitle||p.title):p.title)}</h2>${p.readings.map((r,i)=>{let key=p.id+'-'+i;return `<div class="plan-day ${progress[key]?'done':''}"><label><input type="checkbox" data-plan-check="${key}" ${progress[key]?'checked':''}><span><b>${ui('Day','Araw')} ${i+1}: ${scriptureLink(r[0])}</b><small>${esc(appLanguage==='tl'?(r[2]||r[1]):r[1])}</small></span></label><button class="ghost" data-plan-read="${esc(r[0])}">${ui('Read','Basahin')}</button></div>`}).join('')}</section>`;wireScriptureLinks();document.querySelectorAll('[data-plan-check]').forEach(c=>c.onchange=()=>{let x=store.get('planProgress',{});if(c.checked)x[c.dataset.planCheck]=true;else delete x[c.dataset.planCheck];store.set('planProgress',x);guidedPlans();setTimeout(()=>showPlan(id),0)});document.querySelectorAll('[data-plan-read]').forEach(b=>b.onclick=()=>openBibleReference(b.dataset.planRead));box.scrollIntoView({behavior:'smooth'});
}

function salvationGuide(){
 title(ui('Salvation Guide','Gabay sa Kaligtasan'),ui('A simple biblical explanation of the good news of Jesus.','Isang payak na biblikal na paliwanag ng mabuting balita ni Jesus.'));
 view.innerHTML=`<article class="card long-form"><span class="pill">${ui('THE GOOD NEWS','ANG MABUTING BALITA')}</span><h2>${ui('How can I be saved?','Paano ako maliligtas?')}</h2>
 <h3>1. ${ui('God created us and loves us','Nilalang tayo ng Diyos at mahal Niya tayo')}</h3><p>${ui('God made us for relationship with Him. His love is holy, faithful, and good.','Nilalang tayo ng Diyos upang magkaroon ng ugnayan sa Kanya. Ang Kanyang pag-ibig ay banal, tapat, at mabuti.')}</p><p>${scriptureLink('John 3:16')} · ${scriptureLink('Genesis 1:27')}</p>
 <h3>2. ${ui('Sin separates us from God','Inihihiwalay tayo ng kasalanan sa Diyos')}</h3><p>${ui('Every person has sinned. We cannot repair this separation by our own effort or good works.','Lahat ng tao ay nagkasala. Hindi natin maaayos ang pagkakahiwalay na ito sa sarili nating lakas o mabubuting gawa.')}</p><p>${scriptureLink('Romans 3:23')} · ${scriptureLink('Romans 6:23')}</p>
 <h3>3. ${ui('Jesus died and rose again for us','Namatay at muling nabuhay si Jesus para sa atin')}</h3><p>${ui('Jesus Christ, the Son of God, lived without sin, died for our sins, and rose from the dead. He is the only Saviour.','Si Jesu-Cristo, ang Anak ng Diyos, ay namuhay nang walang kasalanan, namatay para sa ating mga kasalanan, at muling nabuhay. Siya lamang ang Tagapagligtas.')}</p><p>${scriptureLink('1 Corinthians 15:3')} · ${scriptureLink('John 14:6')}</p>
 <h3>4. ${ui('Respond with repentance and faith','Tumugon sa pagsisisi at pananampalataya')}</h3><p>${ui('Turn from sin, trust Jesus, confess Him as Lord, and receive the new life He gives. Salvation is God’s gift of grace.','Talikuran ang kasalanan, magtiwala kay Jesus, ipahayag Siyang Panginoon, at tanggapin ang bagong buhay na ibinibigay Niya. Ang kaligtasan ay kaloob ng biyaya ng Diyos.')}</p><p>${scriptureLink('Acts 3:19')} · ${scriptureLink('Romans 10:9')} · ${scriptureLink('Ephesians 2:8')}</p>
 <h3>${ui('A prayer of response','Panalangin ng pagtugon')}</h3><div class="notice">${ui('Lord Jesus, I admit that I have sinned and need Your forgiveness. I believe You died for my sins and rose again. I turn from my old way of life and place my trust in You. Be my Lord and Saviour. Give me new life and help me follow You. Amen.','Panginoong Jesus, inaamin kong ako ay nagkasala at kailangan ko ang Iyong kapatawaran. Naniniwala akong namatay Ka para sa aking mga kasalanan at muling nabuhay. Tinatalikuran ko ang dati kong pamumuhay at inilalagay ko ang aking tiwala sa Iyo. Ikaw ang maging Panginoon at Tagapagligtas ko. Bigyan Mo ako ng bagong buhay at tulungan Mo akong sumunod sa Iyo. Amen.')}</div>
 <p><b>${ui('Important:','Mahalaga:')}</b> ${ui('A prayer does not save by itself; Jesus saves those who genuinely turn to Him in faith. Begin reading the Gospel of John, pray, and connect with a faithful Bible-believing church.','Hindi ang panalangin mismo ang nagliligtas; si Jesus ang nagliligtas sa mga tunay na lumalapit sa Kanya sa pananampalataya. Simulang basahin ang Ebanghelyo ni Juan, manalangin, at makipag-ugnayan sa isang tapat na iglesiang naniniwala sa Bibliya.')}</p></article>`;wireScriptureLinks();
}
function charactersPage(){title(ui('Bible Characters','Mga Tauhan sa Bibliya'),ui('Meet people in Scripture and learn from their faith, failures, and God’s work in their lives.','Kilalanin ang mga tao sa Kasulatan at matuto sa kanilang pananampalataya, pagkukulang, at pagkilos ng Diyos sa kanilang buhay.'));let a=window.DM_BIBLE_CHARACTERS||[];view.innerHTML=`<input id="toolSearch" class="searchbox" placeholder="${ui('Search a character...','Maghanap ng tauhan...')}"><div id="toolResults" class="tool-grid"></div>`;const draw=()=>{let q=$('#toolSearch').value.toLowerCase();$('#toolResults').innerHTML=a.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`<article class="card tool-card"><h2>${esc(appLanguage==='tl'?x.tlName:x.name)}</h2><p>${esc(appLanguage==='tl'?x.tl:x.summary)}</p><button class="scripture-link" data-bible-ref="${esc(x.ref)}">${esc(x.ref)}</button></article>`).join('');wireScriptureLinks()};$('#toolSearch').oninput=draw;draw()}
function dictionaryPage(){title(ui('Bible Dictionary','Diksyunaryo ng Bibliya'),ui('Simple explanations of important Bible words.','Payak na paliwanag ng mahahalagang salita sa Bibliya.'));let a=window.DM_BIBLE_DICTIONARY||[];view.innerHTML=`<input id="toolSearch" class="searchbox" placeholder="${ui('Search a word...','Maghanap ng salita...')}"><div id="toolResults" class="tool-grid"></div>`;const draw=()=>{let q=$('#toolSearch').value.toLowerCase();$('#toolResults').innerHTML=a.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`<article class="card tool-card"><h2>${esc(appLanguage==='tl'?x.tlTerm:x.term)}</h2><p>${esc(appLanguage==='tl'?x.tl:x.definition)}</p><button class="scripture-link" data-bible-ref="${esc(x.ref)}">${esc(x.ref)}</button></article>`).join('');wireScriptureLinks()};$('#toolSearch').oninput=draw;draw()}


function support(){
 title(ui('Support the Ministry','Suportahan ang Ministeryo'),ui('Help keep De Mayo Bible Ministry free and growing.','Tumulong upang manatiling libre at patuloy na lumago ang De Mayo Bible Ministry.'));
 view.innerHTML=`<section class="support-hero card">
   <div class="support-heart">❤️</div>
   <span class="pill">${ui('GITHUB SPONSORS','GITHUB SPONSORS')}</span>
   <h2>${ui('Support De Mayo Bible Ministry','Suportahan ang De Mayo Bible Ministry')}</h2>
   <p>${ui('This Bible ministry app is provided free of charge for individuals, families, churches, teachers, and ministry leaders. Your sponsorship helps support continued development, maintenance, and the creation of more free Bible resources.','Ang Bible ministry app na ito ay ibinibigay nang libre para sa mga indibidwal, pamilya, iglesya, guro, at ministry leaders. Ang iyong sponsorship ay tumutulong sa patuloy na development, maintenance, at paggawa ng mas marami pang libreng Bible resources.')}</p>
   <blockquote>“${ui('Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.','Magbigay ang bawat isa ayon sa ipinasiya ng kaniyang puso, hindi mabigat sa loob o sapilitan, sapagkat iniibig ng Diyos ang nagbibigay nang masaya.')}”<br><strong>2 Corinthians 9:7</strong></blockquote>
   <a class="primary sponsor-button" href="https://github.com/sponsors/romerdemayo" target="_blank" rel="noopener noreferrer">❤️ ${ui('Become a GitHub Sponsor','Maging GitHub Sponsor')}</a>
   <p class="small-note">${ui('The button opens GitHub securely in a new tab. You may choose any available one-time or monthly sponsorship tier.','Bubuksan ng button ang GitHub nang ligtas sa bagong tab. Maaari kang pumili ng available na one-time o monthly sponsorship tier.')}</p>
 </section>
 <section class="card support-benefits">
   <h3>${ui('Your support helps with','Ang iyong suporta ay tumutulong sa')}</h3>
   <div class="support-grid">
    <div><span>📖</span><b>${ui('Bible study resources','Mga Bible study resource')}</b></div>
    <div><span>🙏</span><b>${ui('Prayer and devotional tools','Prayer at devotional tools')}</b></div>
    <div><span>🎤</span><b>${ui('Sermon preparation features','Sermon preparation features')}</b></div>
    <div><span>👧</span><b>${ui('Children’s ministry lessons','Mga aralin para sa bata')}</b></div>
    <div><span>🤖</span><b>${ui('AI ministry assistance','AI ministry assistance')}</b></div>
    <div><span>🛠️</span><b>${ui('Maintenance and improvements','Maintenance at improvements')}</b></div>
   </div>
   <p>${ui('Financial sponsorship is completely optional. You can also help by sharing the app, reporting problems, suggesting improvements, contributing documentation, and praying for the ministry.','Ganap na opsyonal ang financial sponsorship. Maaari ka ring tumulong sa pag-share ng app, pag-report ng problema, pagmungkahi ng improvements, pag-contribute sa documentation, at pananalangin para sa ministeryo.')}</p>
   <p><strong>${ui('Thank you for helping us continue sharing free Bible resources. God bless you.','Salamat sa pagtulong upang maipagpatuloy ang pagbabahagi ng libreng Bible resources. Pagpalain ka ng Diyos.')}</strong></p>
 </section>`;
}

function help(){
 title('Help & User Guide','A simple guide to using De Mayo Bible Ministry on any device.');
 view.innerHTML=`
 <section class="help-hero card">
   <div class="help-seal">📖</div>
   <div><span class="pill">WELCOME</span><h2>How to use De Mayo Bible Ministry</h2><p>The easy-to-read World English Bible (WEB) is built into the app, so Bible reading and searching can continue even without internet after the app has loaded.</p></div>
 </section>
 <section class="card"><h3>${appLanguage==='tl'?'Piliin ang Wika':'Choose Language'}</h3><p>${appLanguage==='tl'?'Ang mga menu at gabay ay maaaring ipakita sa English o Tagalog.':'Menus and guides can be displayed in English or Tagalog.'}</p><div class="language-panel"><button class="language-choice ${appLanguage==='en'?'active':''}" data-language-choice="en">🇬🇧 English</button><button class="language-choice ${appLanguage==='tl'?'active':''}" data-language-choice="tl">🇵🇭 Tagalog</button></div><div class="notice small-note">${appLanguage==='tl'?'Kapag Tagalog ang pinili, ang Bible text ay Ang Dating Biblia (1905). Kailangan lamang ng internet sa unang paggamit; pagkatapos ay maaari itong gumana mula sa browser cache.':'English uses the World English Bible (WEB). Tagalog uses the public-domain Ang Dating Biblia (1905). The Tagalog Bible needs internet on first use and is then stored in the browser cache.'}</div></section><div class="help-quick-grid">
   <button class="help-jump card" data-go="read"><span>📖</span><b>Read the Bible</b><small>Choose a book and chapter, adjust text size, highlight verses, add notes, and save favourites.</small></button>
   <button class="help-jump card" data-go="search"><span>🔎</span><b>Search Scripture</b><small>Search a word, phrase, book, or exact reference such as John 3:16.</small></button>
   <button class="help-jump card" data-go="devotionals"><span>📚</span><b>Use the Library</b><small>Open devotionals, exhortations, Bible studies, kids lessons, and prayers.</small></button>
   <button class="help-jump card" data-go="prayer"><span>🙏</span><b>Prayer Journal</b><small>Save private prayer requests, updates, Scriptures, and answered prayers on your device.</small></button>
 </div>
 <section class="help-sections">
   <details open><summary>Getting around the app</summary><div class="help-body"><p><b>On iPhone, Android, or tablet:</b> use the bottom navigation for Home, Read, Search, and Prayer. Tap <b>More</b> or the ☰ menu button to see every section.</p><p><b>On Windows or Mac:</b> use the menu on the left side.</p></div></details>
   <details open><summary>Opening a Scripture reference</summary><div class="help-body"><p>Scripture references inside devotionals, exhortations, Bible studies, kids lessons, and prayers are clickable. Tap a reference such as <b>Galatians 5:13</b> to open the built-in WEB Bible at that chapter. The selected verse is highlighted, and a <b>Back to resource</b> button returns you to the lesson.</p></div></details>
   <details><summary>Reading, highlighting, notes, and favourites</summary><div class="help-body"><ol><li>Open <b>Read Bible</b>.</li><li>Select a book and chapter.</li><li>Tap a verse to open its options.</li><li>Choose a highlight colour, add a note, or save it as a favourite.</li></ol><p>These personal items stay private in the browser on that device.</p></div></details>
   <details><summary>Using the public ministry library</summary><div class="help-body"><p>Choose Devotionals, Exhortations, Bible Studies, Kids Lessons, or Prayer Library. Search by title, topic, Scripture, or keyword. Tap a card to open the complete resource, then copy or print it when needed.</p></div></details>
   <details><summary>Prayer Journal and personal resources</summary><div class="help-body"><p>Your prayer journal, study notes, sermons, kids plans, highlights, favourites, and created resources are stored locally on your device. They are not visible to other visitors.</p></div></details>
   <details><summary>Backup and moving to another device</summary><div class="help-body"><p>Open <b>Backup & Restore</b>, then download your private backup. On another device, open the same page and restore that backup file.</p></div></details>
   <details><summary>Installing on a phone or computer</summary><div class="help-body"><p><b>iPhone/iPad:</b> open the site in Safari, tap Share, then <b>Add to Home Screen</b>.</p><p><b>Android:</b> open the site in Chrome, open the menu, then choose <b>Install app</b> or <b>Add to Home screen</b>.</p><p><b>Windows/Mac:</b> use the browser install icon when available, or bookmark the site.</p></div></details>
   <details><summary>When an older version appears</summary><div class="help-body"><p>Refresh the page. On an installed phone app, remove the old Home Screen copy, reopen the live website in Safari or Chrome, and install it again.</p></div></details>
 </section>`;
 document.querySelectorAll('.help-jump').forEach(b=>b.onclick=()=>route(b.dataset.go));document.querySelectorAll('[data-language-choice]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.languageChoice));
}

function about(){
 title(ui('About & Copyright','Tungkol at Copyright'),ui('Ownership, credits, and permitted use.','Pagmamay-ari, pagkilala, at pinahihintulutang paggamit.'));
 view.innerHTML=`<section class="card about-card">
   <div class="about-mark">✝</div>
   <span class="pill">DE MAYO BIBLE MINISTRY</span>
   <h2>${ui('Created by Romer Sadio De Mayo','Ginawa ni Romer Sadio De Mayo')}</h2>
   <p>${ui('A bilingual Christian ministry application designed in New Zealand to support Bible reading, study, prayer, sermon preparation, and children’s ministry.','Isang bilingual Christian ministry application na ginawa sa New Zealand para sa pagbabasa at pag-aaral ng Bibliya, panalangin, paghahanda ng sermon, at ministeryo para sa mga bata.')}</p>
   <div class="copyright-panel"><strong>Copyright © 2026 Romer Sadio De Mayo</strong><br>${ui('All Rights Reserved.','Lahat ng Karapatan ay Nakalaan.')}</div>
   <h3>${ui('Protected original work','Protektadong orihinal na gawa')}</h3>
   <p>${ui('The original application code, interface design, original devotionals, exhortations, Bible studies, kids lessons, prayer resources, and ministry templates are protected. They may not be copied, modified, redistributed, sublicensed, or sold without prior written permission.','Protektado ang orihinal na app code, disenyo, mga debosyonal, exhortation, Bible study, kids lesson, prayer resources, at ministry templates. Hindi maaaring kopyahin, baguhin, ipamahagi, i-sublicense, o ibenta nang walang paunang nakasulat na pahintulot.')}</p>
   <h3>${ui('Bible translations and third-party material','Mga salin ng Bibliya at third-party material')}</h3>
   <p>${ui('Copyright does not claim ownership of public-domain Bible translations or separately owned third-party material. The World English Bible and Ang Dating Biblia (1905) remain subject to their own legal status and attribution requirements.','Hindi inaangkin ng copyright na ito ang pagmamay-ari ng public-domain Bible translations o hiwalay na third-party material. Ang World English Bible at Ang Dating Biblia (1905) ay nananatiling sakop ng sarili nilang legal status at attribution requirements.')}</p>
   <div class="prepared-credit">${ui('Resources prepared using','Mga materyales na inihanda gamit ang')}<br><b>De Mayo Bible Ministry</b><br>© 2026 Romer Sadio De Mayo</div>
   <p class="small-note">Version 76 · ${ui('Developed in New Zealand','Ginawa sa New Zealand')}</p>
 </section>`;
}

function render(){({home,read,search,devotionals,exhortations,studies,kidslibrary,prayerlibrary,resource,creator,myresources,favourites,highlights:highlightsPage,verseNotes,notes,prayer,sermon,kids,reading,plans:guidedPlans,salvation:salvationGuide,characters:charactersPage,dictionary:dictionaryPage,support,help,about,backup}[state.page]||home)()}
route(location.hash.slice(1)||'home',false);
