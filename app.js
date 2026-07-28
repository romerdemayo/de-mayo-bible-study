const D=window.BIBLE_DATA,V=D.verses,B=D.books,$=s=>document.querySelector(s),view=$('#view');
const store={get:(k,d=[])=>{try{return JSON.parse(localStorage.getItem('dm_'+k)||JSON.stringify(d))}catch{return d}},set:(k,v)=>localStorage.setItem('dm_'+k,JSON.stringify(v))};
const I18N={
 en:{code:'EN',html:'en',
  navGroups:['Bible','Public Library','My Resources','Ministry Tools','Settings'],
  pages:{home:'⌂ Home',read:'📖 Read Bible',search:'🔎 Search',devotionals:'🌅 Devotionals',exhortations:'🎤 Exhortations',studies:'📚 Bible Studies',kidslibrary:'👧 Kids Lessons',prayerlibrary:'🙏 Prayer Library',favourites:'★ Favourites',highlights:'🖍 Highlights',verseNotes:'🗒 Verse Notes',notes:'📝 Study Notes',prayer:'🙏 Prayer Journal',myresources:'📁 Created Resources',sermon:'🎤 Sermon Builder',kids:'🧒 Kids Planner',reading:'📅 Chapter Tracker',plans:'🗓 Guided Reading Plans',salvation:'❤️ Salvation Guide',characters:'👥 Bible Characters',dictionary:'📘 Bible Dictionary',creator:'✨ Create Resource',help:'❓ Help & User Guide',backup:'🔒 Backup & Restore'},
  mobile:{home:'Home',read:'Read',search:'Search',prayer:'Prayer',more:'More'},
  footer:'Easy-English WEB Bible',privacy:'Your personal content stays on this device.',
  homeTitle:'Home',homeSub:'Read, study, pray, and prepare.',
  langTitle:'Language',langSub:'Choose English or Tagalog for the app menus and guides.',
  switched:'Language changed to English'},
 tl:{code:'TL',html:'tl',
  navGroups:['Bibliya','Pampublikong Aklatan','Aking mga Materyales','Mga Gamit sa Ministeryo','Mga Setting'],
  pages:{home:'⌂ Tahanan',read:'📖 Basahin ang Bibliya',search:'🔎 Maghanap',devotionals:'🌅 Mga Debosyonal',exhortations:'🎤 Mga Exhortation',studies:'📚 Pag-aaral ng Bibliya',kidslibrary:'👧 Aralin para sa Bata',prayerlibrary:'🙏 Aklatan ng Panalangin',favourites:'★ Mga Paborito',highlights:'🖍 Mga Highlight',verseNotes:'🗒 Tala sa Talata',notes:'📝 Tala sa Pag-aaral',prayer:'🙏 Prayer Journal',myresources:'📁 Ginawang Materyales',sermon:'🎤 Sermon Builder',kids:'🧒 Kids Planner',reading:'📅 Talaan ng Kabanata',plans:'🗓 Mga Gabay sa Pagbasa',salvation:'❤️ Gabay sa Kaligtasan',characters:'👥 Mga Tauhan sa Bibliya',dictionary:'📘 Diksyunaryo ng Bibliya',creator:'✨ Gumawa ng Materyales',help:'❓ Tulong at Gabay',backup:'🔒 Backup at Restore'},
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
 ['My Resources',[['favourites','★ Favourites'],['highlights','🖍 Highlights'],['verseNotes','🗒 Verse Notes'],['notes','📝 Study Notes'],['prayer','🙏 Prayer Journal'],['myresources','📁 Created Resources']]],
 ['Ministry Tools',[['sermon','🎤 Sermon Builder'],['kids','🧒 Kids Planner'],['reading','📅 Chapter Tracker'],['plans','🗓 Guided Reading Plans'],['salvation','❤️ Salvation Guide'],['characters','👥 Bible Characters'],['dictionary','📘 Bible Dictionary'],['creator','✨ Create Resource']]],
 ['Settings',[['help','❓ Help & User Guide'],['backup','🔒 Backup & Restore']]]
];
const pages=navGroups.flatMap(g=>g[1]);
const internalPages=['resource'];
const validPages=new Set([...pages.map(x=>x[0]),...internalPages]);
const mobilePages=[['home','⌂','Home'],['read','📖','Read'],['search','🔎','Search'],['prayer','🙏','Prayer']];
let state={page:'home',book:store.get('lastBook','John'),chapter:store.get('lastChapter',3),font:store.get('fontSize',19)};
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
function openBibleReference(reference){
 const r=parseBibleReference(reference);if(!r)return toast('Bible reference was not recognised');
 state.book=r.book;state.chapter=r.chapter;state.focusVerse=r.verse;store.set('returnToResource',true);route('read');
}
function wireScriptureLinks(){document.querySelectorAll('[data-bible-ref]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();openBibleReference(el.dataset.bibleRef)})}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove('show'),1800)}
function closeMenu(){const side=$('#sidebar'),overlay=$('#sidebarOverlay'),menu=$('#menu');side.classList.remove('open');overlay.classList.remove('open');document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}
function openMenu(){const side=$('#sidebar'),overlay=$('#sidebarOverlay'),menu=$('#menu');side.classList.add('open');overlay.classList.add('open');document.body.classList.add('menu-open');menu.setAttribute('aria-expanded','true')}
function toggleMenu(){const open=$('#sidebar').classList.contains('open');open?closeMenu():openMenu()}
function route(p,updateHash=true){if(!validPages.has(p))p='home';state.page=p;document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));closeMenu();if(updateHash&&location.hash!==`#${p}`)history.pushState(null,'',`#${p}`);render();window.scrollTo({top:0,behavior:'smooth'})}
buildNavigation();
$('#menu').onclick=toggleMenu;
$('#sidebarOverlay').onclick=closeMenu;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
window.addEventListener('popstate',()=>route(location.hash.slice(1)||'home',false));
$('#language').onclick=()=>setLanguage(appLanguage==='en'?'tl':'en');
$('#theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('dm_theme',document.body.classList.contains('dark')?'dark':'light')};
if(localStorage.getItem('dm_theme')==='dark')document.body.classList.add('dark');
function title(t,s){$('#pageTitle').textContent=t;$('#pageSub').textContent=s}
function localizeResource(x){return appLanguage==='tl'&&x&&x.tl?{...x,...x.tl}:x}
function ui(en,tl){return appLanguage==='tl'?tl:en}
function ref(v){return `${v.b} ${v.c}:${v.v}`}
function favs(){return store.get('favs')}
function isFav(r){return favs().some(x=>x.r===r)}
function toggleFav(v){let a=favs(),r=ref(v);a=isFav(r)?a.filter(x=>x.r!==r):[{r,x:v.x},...a];store.set('favs',a);toast(isFav(r)?'Added to favourites':'Removed from favourites');render()}
function highlights(){return store.get('highlights',{})}
function notesMap(){return store.get('verseNotes',{})}
function saveLast(){store.set('lastBook',state.book);store.set('lastChapter',state.chapter)}
function todayVerse(){const d=new Date(),i=Math.abs(Math.floor((d-new Date(d.getFullYear(),0,0))/86400000))%V.length;return V[i]}
function activeVerses(){return appLanguage==='tl'&&window.TAGALOG_VERSES?window.TAGALOG_VERSES:V}
function bibleName(){return appLanguage==='tl'?'Ang Dating Biblia (1905)':'World English Bible (WEB)'}
function showBibleLoading(){title(ui('Loading Bible…','Nilo-load ang Bibliya…'),ui('Please wait.','Sandali lamang.'));view.innerHTML=`<div class="card loading-card"><div class="spinner"></div><h2>${ui('Preparing the Bible','Inihahanda ang Bibliya')}</h2><p>${ui('The Tagalog Bible is downloaded only once and then kept in your browser cache.','Isang beses lamang ida-download ang Tagalog Bible at pagkatapos ay ise-save sa browser cache.')}</p></div>`}
function home(){
 title(lang().homeTitle,lang().homeSub);
 const f=favs().length,n=store.get('notes').length,p=store.get('prayers').length,h=Object.keys(highlights()).length,d=store.get('reading',{}),done=Object.keys(d).length,av=activeVerses(),tv=av[Math.abs(new Date().getDate())%av.length]||todayVerse();
 view.innerHTML=`<div class="hero"><div><span class="badge light">VERSION 31 • AI-ASSISTED BIBLE TOOLS</span><h2>${ui('Read Scripture. Grow in faith. Prepare to serve.','Basahin ang Salita. Lumago sa pananampalataya. Maglingkod.')}</h2><p>${ui('A professional bilingual Bible app with the WEB English Bible and Ang Dating Biblia (1905) in Tagalog.','Isang propesyonal na bilingual Bible app na may WEB English Bible at Ang Dating Biblia (1905) sa Tagalog.')}</p><div class="hero-actions"><button class="primary" id="continue">Continue ${esc(state.book)} ${state.chapter}</button><button class="ghost light-btn" onclick="route('search')">Search Bible</button></div></div><div class="verse-card"><span class="small-light">VERSE OF THE DAY</span><br>“${esc(tv.x)}”<br><small>${ref(tv)}</small></div></div>
 <div class="grid"><div class="card"><div class="metric">${done}</div><div>Chapters completed</div></div><div class="card"><div class="metric">${f}</div><div>Favourite verses</div></div><div class="card"><div class="metric">${h}</div><div>Highlighted verses</div></div><div class="card"><div class="metric">${n+p}</div><div>Notes and prayers</div></div></div>`;
 $('#continue').onclick=()=>route('read');
}
function readerToolbar(){const back=store.get('returnToResource',false)?`<button class="ghost" id="backToResource">← ${ui('Back to resource','Bumalik sa materyales')}</button>`:'';return `<div class="toolbar reader-tools">${back}<span class="translation-pill">${bibleName()}</span><select id="book">${B.map(x=>`<option ${x.name===state.book?'selected':''}>${x.name}</option>`).join('')}</select><button class="ghost" id="prev">←</button><button class="ghost" id="next">→</button><button class="ghost" id="smaller">A−</button><button class="ghost" id="larger">A+</button></div>`}
async function read(){
 title(ui('Read Bible','Basahin ang Bibliya'),ui('Tap a verse for highlight, note, or favourite options.','I-tap ang talata upang i-highlight, lagyan ng tala, o gawing paborito.'));
 if(appLanguage==='tl'&&!window.TAGALOG_VERSES){showBibleLoading();try{await window.DM_TAGALOG_BIBLE.load()}catch(e){view.innerHTML=`<div class="empty"><h2>Hindi ma-load ang Tagalog Bible</h2><p>Kumonekta sa internet sa unang paggamit, pagkatapos ay subukan muli.</p><button class="primary" onclick="read()">Subukan muli</button></div>`;return}}
 let AV=activeVerses(),book=B.find(x=>x.name===state.book)||B[0],vv=AV.filter(x=>x.b===state.book&&x.c===state.chapter),hm=highlights(),nm=notesMap();saveLast();
 view.innerHTML=`${readerToolbar()}<div class="reader"><div class="card chapter-list"><h3>${book.name}</h3>${Array.from({length:book.chapters},(_,i)=>`<button class="${i+1===state.chapter?'active':''}" data-ch="${i+1}">${i+1}</button>`).join('')}</div><article class="card scripture" style="font-size:${state.font}px"><h2>${state.book} ${state.chapter}</h2>${vv.map((v,i)=>{let r=ref(v),c=hm[r]||'';return `<div class="verse ${c?'highlight '+c:''} ${state.focusVerse===v.v?'reference-focus':''}" data-verse="${i}" id="v${v.v}"><sup>${v.v}</sup><span>${esc(v.x)}</span><div class="verse-actions"><button class="icon" title="Favourite" data-fav="${i}">${isFav(r)?'★':'☆'}</button>${nm[r]?'<span class="note-dot" title="Has note">●</span>':''}</div></div>`}).join('')}</article></div><div class="verse-sheet" id="verseSheet"></div>`;
 $('#book').onchange=e=>{state.book=e.target.value;state.chapter=1;state.focusVerse=null;store.set('returnToResource',false);read()};
 if($('#backToResource'))$('#backToResource').onclick=()=>{store.set('returnToResource',false);state.focusVerse=null;route('resource')};
 if(state.focusVerse){setTimeout(()=>{const target=document.getElementById('v'+state.focusVerse);target?.scrollIntoView({behavior:'smooth',block:'center'})},120)}
 document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{state.chapter=+b.dataset.ch;read()});
 document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(vv[+b.dataset.fav])});
 document.querySelectorAll('[data-verse]').forEach(el=>el.onclick=()=>openVerseSheet(vv[+el.dataset.verse]));
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
function openVerseSheet(v){const r=ref(v),hm=highlights(),nm=notesMap(),sheet=$('#verseSheet');sheet.className='verse-sheet open';sheet.innerHTML=`<div class="sheet-card"><button class="sheet-close" id="closeSheet">×</button><b>${r}</b><p>${esc(v.x)}</p><div class="colour-row"><button data-colour="yellow">Yellow</button><button data-colour="green">Green</button><button data-colour="blue">Blue</button><button data-colour="pink">Pink</button><button data-colour="">Clear</button></div><textarea id="verseNote" placeholder="${ui('Add your personal note...','Idagdag ang iyong personal na tala...')}">${esc(nm[r]||'')}</textarea><div class="ai-assist-row"><button class="ghost" id="verseAIDraft">✨ ${ui('Create Study Note','Gumawa ng Study Note')}</button><button class="ghost" id="verseAIPrompt">🤖 ${ui('Prepare AI Prompt','Ihanda ang AI Prompt')}</button></div><div class="notice small-note">${ui('The built-in draft works offline. The AI prompt is copied for use in ChatGPT and should be reviewed against Scripture.','Gumagana offline ang built-in draft. Kokopyahin ang AI prompt para gamitin sa ChatGPT at dapat suriin ayon sa Kasulatan.')}</div><div class="sheet-actions"><button class="ghost" id="sheetFav">${isFav(r)?'★ Remove favourite':'☆ Add favourite'}</button><button class="primary" id="saveVerseNote">${ui('Save note','I-save ang tala')}</button></div></div>`;
 $('#closeSheet').onclick=()=>sheet.classList.remove('open');
 document.querySelectorAll('[data-colour]').forEach(b=>b.onclick=()=>{let x=highlights(),c=b.dataset.colour;if(c)x[r]=c;else delete x[r];store.set('highlights',x);toast(c?'Verse highlighted':'Highlight cleared');read()});
 $('#sheetFav').onclick=()=>toggleFav(v);
 $('#verseAIDraft').onclick=()=>{$('#verseNote').value=verseNoteDraft(v);toast(ui('Study note draft created','Nagawa ang study note draft'))};
 $('#verseAIPrompt').onclick=async()=>{let prompt=verseNotePrompt(v);$('#verseNote').value=prompt;try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('AI prompt prepared and copied','Naihanda at nakopya ang AI prompt'))};
 $('#saveVerseNote').onclick=()=>{let x=notesMap(),val=$('#verseNote').value.trim();if(val)x[r]=val;else delete x[r];store.set('verseNotes',x);toast('Verse note saved');read()};
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
function highlightsPage(){title('Highlights','All verses you have colour-highlighted.');let hm=highlights(),items=Object.entries(hm).map(([r,c])=>{let v=V.find(x=>ref(x)===r);return v&&{v,c}}).filter(Boolean);view.innerHTML=items.length?`<div class="results">${items.map(x=>`<div class="result highlight ${x.c}"><b>${ref(x.v)}</b><p>${esc(x.v.x)}</p></div>`).join('')}</div>`:`<div class="empty">No highlighted verses yet. Tap a verse while reading.</div>`}
function verseNotes(){title('Verse Notes','Personal notes attached directly to Scripture.');let nm=notesMap(),items=Object.entries(nm);view.innerHTML=items.length?`<div class="results">${items.map(([r,n])=>{let v=V.find(x=>ref(x)===r);return `<div class="result"><b>${r}</b>${v?`<p>${esc(v.x)}</p>`:''}<div class="note-box">${esc(n)}</div></div>`}).join('')}</div>`:`<div class="empty">No verse notes yet. Tap a verse while reading.</div>`}
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

UPDATE / SAGOT SA PANALANGIN:
Petsa:
Ano ang nagbago:
Paano kumilos ang Diyos:
Susunod na panalangin:

KONKLUSYON AT NATUTUHAN:
Isulat kung ano ang itinuturo ng Diyos tungkol sa pagtitiwala, paghihintay, pasasalamat, o pagsunod.`:`PRAYER TOPIC: ${t}
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

UPDATE / ANSWER TO PRAYER:
Date:
What changed:
How God worked:
Next prayer:

CONCLUSION AND LEARNING:
Record what God is teaching about trust, waiting, gratitude, or obedience.`}
function ministryAssistPrompt(type,data){const kind=type==='study'?'Bible study notes':'prayer journal entry';return `Create a complete, editable ${kind} in ${appLanguage==='tl'?'Tagalog':'English'}. Title/request: “${data.title||''}”. Topic/person: “${data.topic||data.person||''}”. Main Scripture: “${data.scripture||''}”. Existing details: “${data.body||''}”. ${type==='study'?'Include objective, passage context, observation, careful interpretation, what it reveals about God, key doctrine or truth, supporting Scriptures, discussion questions, practical application, prayer, conclusion, and suggested learnings or next study steps.':'Include thanksgiving, surrender, specific requests, Scripture-guided prayer, a complete pastoral prayer, practical faith response, an update/answered-prayer section, conclusion, and spiritual learnings.'} Clearly distinguish Scripture from commentary. Do not invent Bible quotations, historical details, original-language meanings, promises, or claims that God guaranteed a particular outcome. Keep the content Christ-centred, biblically careful, compassionate, and ready for the user to edit.`}
function assistedGeneric(type,label,fields,assistType){let arr=store.get(type);title(label,ui('Create an assisted draft, edit it, then save it privately on this device.','Gumawa ng assisted draft, i-edit, at i-save nang pribado sa device na ito.'));view.innerHTML=`<div class="card"><div class="form-grid">${fields.map(f=>f.kind==='textarea'?`<textarea class="wide" id="${f.id}" placeholder="${f.label}"></textarea>`:`<input id="${f.id}" placeholder="${f.label}">`).join('')}<div class="wide ai-assist-row"><button class="ghost" id="assistDraft">✨ ${ui('Create Assisted Draft','Gumawa ng Assisted Draft')}</button><button class="ghost" id="assistPrompt">🤖 ${ui('Prepare ChatGPT Prompt','Ihanda ang ChatGPT Prompt')}</button><button class="ghost" id="assistClear">${ui('Clear','Burahin')}</button></div><div class="notice small-note wide">${ui('Built-in drafts work offline. ChatGPT prompts are copied for optional use and all generated content should be reviewed against Scripture.','Gumagana offline ang built-in drafts. Kokopyahin ang ChatGPT prompt para sa opsyonal na paggamit at dapat suriin ang lahat ng nilikhang content ayon sa Kasulatan.')}</div><button class="primary wide" id="save">${ui('Save Entry','I-save ang Entry')}</button></div></div><div class="entries">${arr.length?arr.map((x,i)=>`<div class="entry"><button class="danger" style="float:right" data-del="${i}">Delete</button><h3>${esc(x[fields[0].id]||'Untitled')}</h3>${fields.slice(1).map(f=>x[f.id]?`<p><b>${f.label}:</b> ${esc(x[f.id])}</p>`:'').join('')}<div class="meta">${x.date}</div></div>`).join(''):`<div class="empty">No entries yet.</div>`}</div>`;const values=()=>Object.fromEntries(fields.map(f=>[f.id,$('#'+f.id).value.trim()]));$('#assistDraft').onclick=()=>{$('#body').value=ministryAssistDraft(assistType,values());toast(ui('Assisted draft created','Nagawa ang assisted draft'))};$('#assistPrompt').onclick=async()=>{let prompt=ministryAssistPrompt(assistType,values());$('#body').value=prompt;try{await navigator.clipboard.writeText(prompt)}catch{}toast(ui('ChatGPT prompt prepared and copied','Naihanda at nakopya ang ChatGPT prompt'))};$('#assistClear').onclick=()=>fields.forEach(f=>$('#'+f.id).value='');$('#save').onclick=()=>{let x={date:new Date().toLocaleString(),...values()};if(!x[fields[0].id])return toast(ui('Add a title or prayer request first','Maglagay muna ng pamagat o prayer request'));arr.unshift(x);store.set(type,arr);assistedGeneric(type,label,fields,assistType)};document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{arr.splice(+b.dataset.del,1);store.set(type,arr);assistedGeneric(type,label,fields,assistType)})}
function notes(){assistedGeneric('notes',ui('Study Notes','Tala sa Pag-aaral'),[{id:'title',label:ui('Study title or reference','Pamagat o reference')},{id:'topic',label:ui('Topic or main truth','Paksa o pangunahing katotohanan')},{id:'scripture',label:ui('Main Bible passage','Pangunahing talata')},{id:'body',label:ui('Editable study notes, conclusion, and learnings','Editable study notes, konklusyon, at mga natutuhan'),kind:'textarea'}],'study')}
function prayer(){assistedGeneric('prayers',ui('Prayer Journal','Prayer Journal'),[{id:'title',label:ui('Prayer request','Kahilingan sa panalangin')},{id:'person',label:ui('Person, family, or ministry','Tao, pamilya, o ministry')},{id:'scripture',label:ui('Related Scripture','Kaugnay na talata')},{id:'body',label:ui('Details, prayer, updates, conclusion, and learnings','Detalye, panalangin, updates, konklusyon, at natutuhan'),kind:'textarea'}],'prayer')}
function sermon(){generic('sermons','Sermon Builder',[{id:'title',label:'Sermon title'},{id:'text',label:'Main Bible passage'},{id:'audience',label:'Audience or occasion'},{id:'body',label:'Main idea, outline, illustrations, and application',kind:'textarea'}])}
function kids(){generic('kids','Kids Ministry',[{id:'title',label:'Lesson title'},{id:'verse',label:'Memory verse'},{id:'age',label:'Age group'},{id:'body',label:'Opening prayer, Bible story, questions, activity, and closing prayer',kind:'textarea'}])}
function reading(){title('Reading Plan','Mark chapters complete as you read.');let done=store.get('reading',{}),total=Object.keys(done).length,pct=Math.round(total/1189*100);view.innerHTML=`<div class="card"><h3>Progress: ${total} of 1,189 chapters (${pct}%)</h3><progress value="${total}" max="1189"></progress></div><div class="grid book-progress">${B.map(b=>{let n=Array.from({length:b.chapters},(_,i)=>done[b.name+' '+(i+1)]).filter(Boolean).length;return `<div class="card"><h3>${b.name}</h3><p>${n} / ${b.chapters} chapters</p><select data-book="${b.name}"><option>Choose chapter</option>${Array.from({length:b.chapters},(_,i)=>`<option>${i+1}</option>`).join('')}</select><button class="primary" data-mark="${b.name}">Mark complete</button></div>`}).join('')}</div>`;document.querySelectorAll('[data-mark]').forEach(btn=>btn.onclick=()=>{let b=btn.dataset.mark,s=document.querySelector(`select[data-book="${CSS.escape(b)}"]`),c=+s.value;if(!c)return;done[b+' '+c]=true;store.set('reading',done);reading()})}

function backup(){
 title('My Backup','Export or restore only the personal information saved in this browser.');
 view.innerHTML=`<div class="privacy-card"><div class="privacy-icon">🔒</div><div><h3>This backup belongs to the person using this device</h3><p>GitHub Pages does not receive your notes. Highlights, journals, created resources, and progress are stored in this browser only. Another visitor gets a separate empty collection on their own device.</p></div></div><div class="card backup-actions"><button class="primary" id="export">Download My Private Backup</button><p class="meta">The downloaded JSON file remains wherever you choose to save it.</p><hr><label><b>Restore my backup</b></label><input type="file" id="file" accept="application/json"><button class="ghost" id="restore">Restore Selected File</button><hr><button class="danger" id="clear">Erase My Saved Data on This Device</button></div>`;
 $('#export').onclick=()=>{let o={version:6,created:new Date().toISOString(),data:{}};Object.keys(localStorage).filter(k=>k.startsWith('dm_')).forEach(k=>o.data[k]=localStorage.getItem(k));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:'application/json'}));a.download=`DeMayoBible_MyBackup_${new Date().toISOString().slice(0,10)}.json`;a.click();toast('Private backup downloaded')};
 $('#restore').onclick=()=>{let f=$('#file').files[0];if(!f)return toast('Choose a backup file first');let r=new FileReader;r.onload=()=>{try{let o=JSON.parse(r.result),data=o.data||o;Object.entries(data).forEach(([k,v])=>{if(k.startsWith('dm_'))localStorage.setItem(k,v)});alert('Your backup has been restored.');route('home')}catch{alert('That backup file could not be read.')}};r.readAsText(f)};
 $('#clear').onclick=()=>{if(confirm('Erase all of your saved Bible app data from this device?')){Object.keys(localStorage).filter(k=>k.startsWith('dm_')).forEach(k=>localStorage.removeItem(k));route('home')}}
}
function libraryShell(t,d,createType){return `<div class="library-head"><div><h2>${t}</h2><p>${d}</p></div><div class="library-search"><input id="libq" placeholder="${ui('Search this library...','Maghanap sa aklatang ito...')}"><button class="ghost" id="clearLib">${ui('Clear','Burahin')}</button></div></div><div class="library-actions"><button class="primary" id="createHere">＋ ${ui('Create','Gumawa ng')} ${createType}</button></div><div id="libres" class="library-grid"></div>`}
function wireLibrary(draw,type){$('#libq').oninput=e=>draw(e.target.value);$('#clearLib').onclick=()=>{$('#libq').value='';draw('');$('#libq').focus()};$('#createHere').onclick=()=>{store.set('creatorType',type);route('creator')}}
function openResource(kind,index){store.set('openResource',{kind,index});route('resource')}
function resource(){let o=store.get('openResource',null);if(!o)return route('home');let maps={devotional:DEVOTIONALS,exhortation:EXHORTATIONS,study:BIBLE_STUDIES,kids:KIDS_LESSONS,prayer:PRAYER_LIBRARY},raw=maps[o.kind]?.[o.index],x=localizeResource(raw);if(!x)return route('home');title(x.title,ui('Complete resource view','Kumpletong materyales'));let body='';
 if(o.kind==='devotional')body=`<span class="pill">${esc(x.theme)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Scripture','Pangunahing Talata')}</span>${scriptureLink(x.scripture)}</div><h3>${ui('Reflection','Pagninilay')}</h3><p>${esc(x.reflection)}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Reflection Questions','Mga Tanong sa Pagninilay')}</h3><ol>${x.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p><div class="resource-foot"><b>${ui('Memory Verse','Talatang Isasaulo')}:</b> ${scriptureLink(x.memory)}<br><b>${ui('Suggested reading','Iminungkahing pagbasa')}:</b> ${scriptureLink(x.reading)}</div>`;
 if(o.kind==='exhortation')body=`<span class="pill">${esc(x.category)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Scripture','Pangunahing Talata')}</span>${scriptureLink(x.main)}</div><p>${esc(x.intro)}</p>${x.points.map((p,i)=>`<section><h3>${i+1}. ${esc(p[0])}</h3><p>${esc(p[1])}</p></section>`).join('')}<h3>${ui('Supporting Scriptures','Mga Kaugnay na Talata')}</h3><p>${scriptureList(x.support)}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Challenge','Hamon')}</h3><p>${esc(x.challenge)}</p><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p>`;
 if(o.kind==='study')body=`<span class="pill">${esc(x.type)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Main Passage','Pangunahing Talata')}</span>${scriptureLink(x.passage)}</div><h3>${ui('Objective','Layunin')}</h3><p>${esc(x.objective)}</p><h3>${ui('Background','Konteksto')}</h3><p>${esc(x.background)}</p><h3>${ui('Discussion Questions','Mga Tanong sa Talakayan')}</h3><ol>${x.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3>${ui('Leader Notes','Tala para sa Leader')}</h3><p>${esc(x.leader_notes)}</p><h3>${ui('Application','Aplikasyon')}</h3><p>${esc(x.application)}</p><h3>${ui('Prayer','Panalangin')}</h3><p>${esc(x.prayer)}</p>`;
 if(o.kind==='kids')body=`<img class="lesson-hero" src="${esc(x.image||'')}" alt="${esc(x.title)}"><span class="pill">${ui('Ages','Edad')} ${esc(x.age)}</span><h2>${esc(x.title)}</h2><div class="scripture-banner"><span>${ui('Bible Story','Kuwento sa Biblia')}</span>${scriptureLink(x.story)}</div><h3>${ui('Opening Prayer','Pambungad na Panalangin')}</h3><p>${esc(x.opening)}</p><h3>${ui('Teaching Lesson','Aralin')}</h3><p>${esc(x.lesson)}</p><h3>${ui('Questions','Mga Tanong')}</h3><ol>${x.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><div class="idea-grid"><div><h3>🎲 ${ui('Activity','Gawain')}</h3><p>${esc(x.activity)}</p></div><div><h3>✂️ Craft</h3><p>${esc(x.craft)}</p></div></div><h3>${ui('Memory Verse','Talatang Isasaulo')}</h3><p>${scriptureLink(x.memory)}</p><h3>${ui('Closing Prayer','Pangwakas na Panalangin')}</h3><p>${esc(x.closing)}</p>`;
 if(o.kind==='prayer')body=`<span class="pill">${esc(x.category)}</span><h2>${esc(x.title)}</h2><div class="prayer-paper"><p>${esc(x.text)}</p></div>`;
 view.innerHTML=`<button class="ghost" id="backLib">← ${ui('Back to library','Bumalik sa aklatan')}</button><article class="resource-page">${body}<div class="resource-buttons"><button class="ghost" id="copyResource">${ui('Copy','Kopyahin')}</button><button class="ghost" id="printResource">${ui('Print','I-print')}</button></div></article>`;
 wireScriptureLinks();$('#backLib').onclick=()=>{store.set('returnToResource',false);route({devotional:'devotionals',exhortation:'exhortations',study:'studies',kids:'kidslibrary',prayer:'prayerlibrary'}[o.kind])};$('#copyResource').onclick=async()=>{await navigator.clipboard.writeText(view.querySelector('.resource-page').innerText);toast(ui('Resource copied','Nakopya ang materyales'))};$('#printResource').onclick=()=>window.print();
}
function devotionals(){title(ui('Devotionals','Mga Debosyonal'),ui('Clear, practical daily Bible reflections.','Malinaw at praktikal na pagninilay sa Biblia.'));view.innerHTML=libraryShell(ui('Daily Devotional Library','Aklatan ng mga Debosyonal'),ui('Open any card to read the complete devotional.','Buksan ang card upang basahin ang buong debosyonal.'),ui('Devotional','Debosyonal'));const draw=q=>{let list=DEVOTIONALS.map((raw,i)=>({...localizeResource(raw),_i:i,_raw:raw})).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=list.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.theme)}</span><h3>${esc(x.title)}</h3><b>${esc(x.scripture)}</b><p>${esc(x.reflection.slice(0,150))}…</p><span class="open-label">${ui('Open devotional →','Buksan ang debosyonal →')}</span></button>`).join('')||`<div class="empty">${ui('No devotionals found.','Walang nahanap na debosyonal.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('devotional',+b.dataset.i))};draw('');wireLibrary(draw,ui('Devotional','Debosyonal'))}
function exhortations(){title(ui('Exhortations','Mga Exhortation'),ui('Ready-to-use biblical encouragements.','Mga mensaheng biblikal na handang gamitin.'));view.innerHTML=libraryShell(ui('Exhortation Library','Aklatan ng mga Exhortation'),ui('Open any card for the complete teaching outline.','Buksan ang card para sa buong outline.'),ui('Exhortation','Exhortation'));const draw=q=>{let list=EXHORTATIONS.map((raw,i)=>({...localizeResource(raw),_i:i})).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=list.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.category)}</span><h3>${esc(x.title)}</h3><b>${esc(x.main)}</b><p>${esc(x.intro)}</p><span class="open-label">${ui('Open exhortation →','Buksan ang exhortation →')}</span></button>`).join('')||`<div class="empty">${ui('No exhortations found.','Walang nahanap na exhortation.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('exhortation',+b.dataset.i))};draw('');wireLibrary(draw,'Exhortation')}
function studies(){title(ui('Bible Studies','Pag-aaral ng Biblia'),ui('Leader-ready studies with questions and application.','Mga araling may tanong at aplikasyon para sa leader.'));view.innerHTML=libraryShell(ui('Bible Study Library','Aklatan ng Pag-aaral ng Biblia'),ui('Open any card for the complete study.','Buksan ang card para sa buong pag-aaral.'),ui('Bible Study','Pag-aaral'));const draw=q=>{let list=BIBLE_STUDIES.map((raw,i)=>({...localizeResource(raw),_i:i})).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=list.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.type)}</span><h3>${esc(x.title)}</h3><b>${esc(x.passage)}</b><p>${esc(x.objective)}</p><span class="open-label">${ui('Open study →','Buksan ang pag-aaral →')}</span></button>`).join('')||`<div class="empty">${ui('No studies found.','Walang nahanap na pag-aaral.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('study',+b.dataset.i))};draw('');wireLibrary(draw,ui('Bible Study','Pag-aaral'))}
function kidslibrary(){title(ui('Kids Lessons','Mga Aralin para sa Bata'),ui('Illustrated and interactive Bible lessons.','May larawan at gawain na mga aralin sa Biblia.'));view.innerHTML=libraryShell(ui("Children's Lesson Library",'Aklatan ng Aralin para sa Bata'),ui('Each lesson includes an illustration, prayers, activities, crafts, and questions.','Bawat aralin ay may larawan, panalangin, gawain, craft, at mga tanong.'),ui('Kids Lesson','Aralin'));const draw=q=>{let list=KIDS_LESSONS.map((raw,i)=>({...localizeResource(raw),_i:i})).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=list.map(x=>`<button class="resource-card illustrated" data-i="${x._i}"><img src="${esc(x.image||'')}" alt=""><div><span class="pill">${ui('Ages','Edad')} ${esc(x.age)}</span><h3>${esc(x.title)}</h3><b>${esc(x.story)}</b><p>${esc(x.lesson.slice(0,130))}…</p><span class="open-label">${ui('Open lesson →','Buksan ang aralin →')}</span></div></button>`).join('')||`<div class="empty">${ui('No lessons found.','Walang nahanap na aralin.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('kids',+b.dataset.i))};draw('');wireLibrary(draw,ui('Kids Lesson','Aralin'))}
function prayerlibrary(){title(ui('Prayer Library','Aklatan ng Panalangin'),ui('Prepared prayers for different seasons of life.','Mga panalangin para sa iba’t ibang panahon ng buhay.'));view.innerHTML=libraryShell(ui('Prayer Library','Aklatan ng Panalangin'),ui('Open any prayer to read, copy, or print it.','Buksan ang panalangin upang basahin, kopyahin, o i-print.'),ui('Prayer','Panalangin'));const draw=q=>{let list=PRAYER_LIBRARY.map((raw,i)=>({...localizeResource(raw),_i:i})).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));$('#libres').innerHTML=list.map(x=>`<button class="resource-card" data-i="${x._i}"><span class="pill">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text.slice(0,170))}…</p><span class="open-label">${ui('Open prayer →','Buksan ang panalangin →')}</span></button>`).join('')||`<div class="empty">${ui('No prayers found.','Walang nahanap na panalangin.')}</div>`;document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openResource('prayer',+b.dataset.i))};draw('');wireLibrary(draw,ui('Prayer','Panalangin'))}
const creatorFields={
 'Devotional':['Theme','Main Scripture','Audience','Tone','Length'],
 'Exhortation':['Theme','Main Scripture','Audience','Tone','Length'],
 'Prayer':['Prayer Topic','Scripture (optional)','Person or Group','Tone','Length'],
 'Bible Study':['Study Topic','Main Passage','Audience','Study Style','Length'],
 'Kids Lesson':['Lesson Theme','Bible Passage','Age Group','Learning Goal','Length']
};
function makeOfflineDraft(type,v){let topic=v[0]||'Growing in Faith',verse=v[1]||'Proverbs 3:5–6',aud=v[2]||'Adults',tone=v[3]||'Encouraging';if(type==='Prayer')return `Title: Prayer for ${topic}\n\nScripture focus: ${verse}\n\nFather, we come before You concerning ${topic.toLowerCase()}. Help ${aud.toLowerCase()} to trust Your character, receive Your wisdom, and walk in faithful obedience. Where there is fear, give peace. Where there is weakness, provide strength. Let Your Word guide every decision, and may this situation bring honour to Jesus Christ. Amen.`;if(type==='Kids Lesson')return `Title: ${topic}\nAge group: ${aud}\nBible passage: ${verse}\n\nOpening Prayer:\nDear God, help us listen to Your Word and learn how to follow You. Amen.\n\nMain Truth:\nGod is faithful, and we can respond with trust and obedience.\n\nBible Story:\nRead ${verse}. Explain the story in simple language and point children to what it teaches about God.\n\nDiscussion Questions:\n1. What happened in the story?\n2. What do we learn about God?\n3. What can we do this week?\n\nActivity:\nCreate a simple role-play or matching game connected to ${topic.toLowerCase()}.\n\nMemory Verse: ${verse}\n\nClosing Prayer:\nLord, help us remember and obey what we learned. Amen.`;if(type==='Bible Study')return `Title: ${topic}\nMain passage: ${verse}\nAudience: ${aud}\n\nObjective:\nUnderstand what the passage teaches about God, people, faith, and obedient living.\n\nObservation:\nRead the passage twice. Note repeated words, commands, promises, and important people or events.\n\nDiscussion Questions:\n1. What does the passage say?\n2. What does it reveal about God?\n3. What truth corrects or encourages us?\n4. How should we respond this week?\n\nLeader Note:\nKeep the main passage central and distinguish clearly between Scripture and application.\n\nApplication:\nChoose one specific act of obedience.\n\nPrayer:\nAsk God to help the group understand and live out His Word.`;if(type==='Exhortation')return `Title: ${topic}\nMain Scripture: ${verse}\nAudience: ${aud}\nTone: ${tone}\n\nIntroduction:\nOur circumstances may change, but God remains faithful. ${topic} calls us to listen to His Word and respond with trust.\n\n1. Remember who God is\nGod's character is the foundation of our confidence.\n\n2. Receive what Scripture says\nFaith grows as we submit our thoughts and feelings to God's truth.\n\n3. Respond with obedience\nBiblical encouragement should lead to a practical step of faith.\n\nApplication:\nName one area where this truth must shape your decisions today.\n\nClosing Challenge:\nDo not merely admire the message—live it.\n\nPrayer:\nLord, establish this truth in our hearts and help us obey You. Amen.`;return `Title: ${topic}\nScripture: ${verse}\nAudience: ${aud}\nTone: ${tone}\n\nReflection:\nGod invites us to meet Him in His Word. As we consider ${topic.toLowerCase()}, we are reminded that His character is trustworthy and His grace is sufficient. The passage calls us away from self-reliance and toward a faithful response rooted in prayer and obedience.\n\nApplication:\nIdentify one thought, habit, or decision that should change because of this Scripture.\n\nReflection Questions:\n1. What does this passage reveal about God?\n2. What response is God inviting from me?\n\nPrayer:\nFather, teach me through Your Word and help me live this truth today. Amen.`}
function creator(){let type=store.get('creatorType','Devotional');title('Create Resource','Create offline drafts or prepare a detailed ChatGPT prompt without an API key.');view.innerHTML=`<div class="creator-layout"><section class="card"><label><b>Resource type</b></label><select id="ctype">${Object.keys(creatorFields).map(x=>`<option ${x===type?'selected':''}>${x}</option>`).join('')}</select><div id="creatorInputs"></div><div class="creator-buttons"><button class="primary" id="offlineCreate">Create Offline Draft</button><button class="ghost" id="aiPrompt">Prepare ChatGPT Prompt</button><button class="ghost" id="clearCreator">Clear</button></div><div class="notice small-note">Offline Draft uses built-in biblical templates. “Prepare ChatGPT Prompt” does not use an API key; it creates a prompt for you to paste into ChatGPT.</div></section><section class="card"><div class="draft-head"><h3>Editable Draft</h3><span class="pill">Review before ministry use</span></div><textarea id="draft" class="draft-area" placeholder="Your generated draft will appear here..."></textarea><div class="creator-buttons"><button class="primary" id="saveDraft">Save to My Resources</button><button class="ghost" id="copyDraft">Copy</button><button class="ghost" id="openChat">Open ChatGPT</button></div></section></div>`;
 function fields(){type=$('#ctype').value;store.set('creatorType',type);$('#creatorInputs').innerHTML=creatorFields[type].map((x,i)=>`<label><span>${x}</span><input data-cf="${i}" placeholder="${x}"></label>`).join('')};fields();$('#ctype').onchange=fields;
 const vals=()=>[...document.querySelectorAll('[data-cf]')].map(x=>x.value.trim());
 $('#offlineCreate').onclick=()=>{$('#draft').value=makeOfflineDraft(type,vals());toast('Offline draft created')};
 $('#aiPrompt').onclick=()=>{let v=vals(),prompt=`Create a ${v[4]||'medium-length'} biblical ${type.toLowerCase()} about “${v[0]||'faith'}” based primarily on ${v[1]||'an appropriate Bible passage'}. Audience: ${v[2]||'adults'}. Tone/style: ${v[3]||'encouraging and pastoral'}. Include a clear title, main Scripture, faithful explanation of the passage in context, supporting Bible references, practical application, reflection or discussion questions, and a closing prayer. For a kids lesson, also include an opening prayer, simple Bible story, memory verse, activity, craft, and age-appropriate questions. Clearly distinguish Scripture from commentary. Do not invent quotations or claim that commentary is Scripture. Produce an editable ministry draft that should be reviewed before use.`;$('#draft').value=prompt;navigator.clipboard?.writeText(prompt);toast('ChatGPT prompt prepared and copied')};
 $('#clearCreator').onclick=()=>{document.querySelectorAll('[data-cf]').forEach(x=>x.value='');$('#draft').value=''};
 $('#copyDraft').onclick=async()=>{await navigator.clipboard.writeText($('#draft').value);toast('Draft copied')};$('#openChat').onclick=()=>window.open('https://chatgpt.com/','_blank','noopener');
 $('#saveDraft').onclick=()=>{let text=$('#draft').value.trim();if(!text)return toast('Create or paste a draft first');let a=store.get('createdResources');a.unshift({id:Date.now(),type,title:(text.match(/^Title:\s*(.+)/mi)||[])[1]||`${type} Draft`,text,created:new Date().toLocaleString()});store.set('createdResources',a);toast('Saved to My Resources')}
}
function myresources(){title('My Resources','Personal drafts saved only in this browser.');let a=store.get('createdResources');view.innerHTML=`<div class="privacy-card"><div class="privacy-icon">📁</div><div><h3>Private to this browser profile</h3><p>These drafts are not added to the public GitHub library. Use My Backup to move them to another device.</p></div></div><div class="entries">${a.length?a.map(x=>`<article class="entry"><span class="pill">${esc(x.type)}</span><h3>${esc(x.title)}</h3><div class="meta">${esc(x.created)}</div><pre class="saved-resource">${esc(x.text)}</pre><button class="ghost" data-copy="${x.id}">Copy</button> <button class="danger" data-del="${x.id}">Delete</button></article>`).join(''):'<div class="empty">You have not saved any created resources yet.</div>'}</div>`;document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{let x=a.find(y=>y.id==b.dataset.copy);await navigator.clipboard.writeText(x.text);toast('Copied')});document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this personal resource?')){a=a.filter(x=>x.id!=b.dataset.del);store.set('createdResources',a);myresources()}})}


function guidedPlans(){
 title(ui('Guided Reading Plans','Mga Gabay sa Pagbasa'),ui('Choose a plan and mark each day complete.','Pumili ng plano at markahan ang bawat araw na natapos.'));
 const plans=window.DM_READING_PLANS||[],progress=store.get('planProgress',{});
 view.innerHTML=`<div class="tool-grid">${plans.map(p=>{let done=p.readings.filter((_,i)=>progress[p.id+'-'+i]).length;return `<article class="card tool-card"><span class="pill">${p.days} ${ui('days','araw')}</span><h2>${esc(appLanguage==='tl'?p.tlTitle:p.title)}</h2><p>${done} / ${p.readings.length} ${ui('completed','natapos')}</p><progress value="${done}" max="${p.readings.length}"></progress><button class="primary" data-open-plan="${p.id}">${ui('Open plan','Buksan ang plano')}</button></article>`}).join('')}</div><div id="planDetail"></div>`;
 document.querySelectorAll('[data-open-plan]').forEach(b=>b.onclick=()=>showPlan(b.dataset.openPlan));
}
function showPlan(id){const p=(window.DM_READING_PLANS||[]).find(x=>x.id===id),progress=store.get('planProgress',{}),box=$('#planDetail');if(!p)return;box.innerHTML=`<section class="card plan-detail"><h2>${esc(appLanguage==='tl'?p.tlTitle:p.title)}</h2>${p.readings.map((r,i)=>{let key=p.id+'-'+i;return `<div class="plan-day ${progress[key]?'done':''}"><label><input type="checkbox" data-plan-check="${key}" ${progress[key]?'checked':''}><span><b>${ui('Day','Araw')} ${i+1}: ${scriptureLink(r[0])}</b><small>${esc(appLanguage==='tl'?r[2]:r[1])}</small></span></label><button class="ghost" data-plan-read="${esc(r[0])}">${ui('Read','Basahin')}</button></div>`}).join('')}</section>`;wireScriptureLinks();document.querySelectorAll('[data-plan-check]').forEach(c=>c.onchange=()=>{let x=store.get('planProgress',{});if(c.checked)x[c.dataset.planCheck]=true;else delete x[c.dataset.planCheck];store.set('planProgress',x);guidedPlans();setTimeout(()=>showPlan(id),0)});document.querySelectorAll('[data-plan-read]').forEach(b=>b.onclick=()=>openBibleReference(b.dataset.planRead));box.scrollIntoView({behavior:'smooth'});
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

function render(){({home,read,search,devotionals,exhortations,studies,kidslibrary,prayerlibrary,resource,creator,myresources,favourites,highlights:highlightsPage,verseNotes,notes,prayer,sermon,kids,reading,plans:guidedPlans,salvation:salvationGuide,characters:charactersPage,dictionary:dictionaryPage,help,backup}[state.page]||home)()}
route(location.hash.slice(1)||'home',false);
