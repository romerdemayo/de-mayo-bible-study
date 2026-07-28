/* De Mayo Bible Studies v21 - Ang Dating Biblia (1905) loader
   Source: seven1m/open-bibles (Public Domain)
   The 6 MB XML is loaded only when Tagalog Bible is selected and is cached by the browser/service worker. */
(function(){
  const SOURCE='https://raw.githubusercontent.com/seven1m/open-bibles/master/tgl-tagalog.osis.xml';
  const BOOK_MAP={
    Gen:'Genesis',Exod:'Exodus',Lev:'Leviticus',Num:'Numbers',Deut:'Deuteronomy',Josh:'Joshua',Judg:'Judges',Ruth:'Ruth',
    '1Sam':'1 Samuel','2Sam':'2 Samuel','1Kgs':'1 Kings','2Kgs':'2 Kings','1Chr':'1 Chronicles','2Chr':'2 Chronicles',
    Ezra:'Ezra',Neh:'Nehemiah',Esth:'Esther',Job:'Job',Ps:'Psalms',Prov:'Proverbs',Eccl:'Ecclesiastes',Song:'Song of Solomon',
    Isa:'Isaiah',Jer:'Jeremiah',Lam:'Lamentations',Ezek:'Ezekiel',Dan:'Daniel',Hos:'Hosea',Joel:'Joel',Amos:'Amos',Obad:'Obadiah',
    Jonah:'Jonah',Mic:'Micah',Nah:'Nahum',Hab:'Habakkuk',Zeph:'Zephaniah',Hag:'Haggai',Zech:'Zechariah',Mal:'Malachi',
    Matt:'Matthew',Mark:'Mark',Luke:'Luke',John:'John',Acts:'Acts',Rom:'Romans','1Cor':'1 Corinthians','2Cor':'2 Corinthians',
    Gal:'Galatians',Eph:'Ephesians',Phil:'Philippians',Col:'Colossians','1Thess':'1 Thessalonians','2Thess':'2 Thessalonians',
    '1Tim':'1 Timothy','2Tim':'2 Timothy',Titus:'Titus',Phlm:'Philemon',Heb:'Hebrews,Jas:James','1Pet':'1 Peter','2Pet':'2 Peter',
    '1John':'1 John','2John':'2 John','3John':'3 John',Jude:'Jude',Rev:'Revelation'
  };
  // Correct accidental combined key above without changing compatibility.
  BOOK_MAP.Heb='Hebrews'; BOOK_MAP.Jas='James';
  let promise=null;
  function parse(xmlText){
    const doc=new DOMParser().parseFromString(xmlText,'application/xml');
    if(doc.querySelector('parsererror')) throw new Error('The Tagalog Bible file could not be read.');
    const verses=[];
    doc.querySelectorAll('verse[osisID]').forEach(node=>{
      const parts=(node.getAttribute('osisID')||'').split('.');
      if(parts.length<3) return;
      const b=BOOK_MAP[parts[0]]; if(!b) return;
      const c=Number(parts[1]),v=Number(parts[2]);
      const x=(node.textContent||'').replace(/\s+/g,' ').trim();
      if(x) verses.push({b,c,v,x,t:verses.length<23145?'OT':'NT'});
    });
    if(verses.length<30000) throw new Error('The Tagalog Bible download was incomplete.');
    return verses;
  }
  window.DM_TAGALOG_BIBLE={
    source:SOURCE,
    translation:'Ang Dating Biblia (1905)',
    license:'Public Domain',
    load(){
      if(window.TAGALOG_VERSES) return Promise.resolve(window.TAGALOG_VERSES);
      if(promise) return promise;
      promise=fetch(SOURCE,{mode:'cors'}).then(r=>{if(!r.ok)throw new Error('Unable to download the Tagalog Bible.');return r.text()})
        .then(parse).then(v=>window.TAGALOG_VERSES=v).catch(err=>{promise=null;throw err});
      return promise;
    }
  };
})();
