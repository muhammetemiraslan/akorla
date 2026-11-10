const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugify=s=>s.toLocaleLowerCase("tr").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
/* ---------- CHORDS ---------- */
const NOTES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLAT={Db:"C#",Eb:"D#",Gb:"F#",Ab:"G#",Bb:"A#"};
const OPEN={ // low E -> high e, -1 = mute
 "C":[-1,3,2,0,1,0],"Cmaj7":[-1,3,2,0,0,0],"C7":[-1,3,2,3,1,0],
 "D":[-1,-1,0,2,3,2],"Dm":[-1,-1,0,2,3,1],"D7":[-1,-1,0,2,1,2],"Dsus4":[-1,-1,0,2,3,3],"Dm7":[-1,-1,0,2,1,1],
 "E":[0,2,2,1,0,0],"Em":[0,2,2,0,0,0],"E7":[0,2,0,1,0,0],"Em7":[0,2,0,0,0,0],
 "F":[1,3,3,2,1,1],"Fmaj7":[-1,-1,3,2,1,0],
 "G":[3,2,0,0,0,3],"G7":[3,2,0,0,0,1],
 "A":[-1,0,2,2,2,0],"Am":[-1,0,2,2,1,0],"A7":[-1,0,2,0,2,0],"Am7":[-1,0,2,0,1,0],"Asus4":[-1,0,2,2,3,0],"Amaj7":[-1,0,2,1,2,0],
 "B7":[-1,2,1,2,0,2],"Bm":[-1,2,4,4,3,2]
};
const ESHAPE={"":[0,2,2,1,0,0],"m":[0,2,2,0,0,0],"7":[0,2,0,1,0,0],"m7":[0,2,0,0,0,0]};
const ASHAPE={"maj7":[-1,0,2,1,2,0],"sus4":[-1,0,2,2,3,0],"sus2":[-1,0,2,2,0,0],"":[-1,0,2,2,2,0],"m":[-1,0,2,2,1,0]};

function parseChord(c){
  const m=c.match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
  if(!m) return null;
  return {root:FLAT[m[1]]||m[1],suf:m[2]||"",bass:m[3]?(FLAT[m[3]]||m[3]):null};
}
function shiftNote(n,s){return NOTES[(NOTES.indexOf(n)+s+120)%12]}
function transposeChord(c,s){
  if(!s) return c;
  const p=parseChord(c); if(!p) return c;
  return shiftNote(p.root,s)+p.suf+(p.bass?"/"+shiftNote(p.bass,s):"");
}
function shape(c){
  const p=parseChord(c); if(!p) return null;
  const name=p.root+p.suf;
  if(OPEN[name]) return OPEN[name];
  let suf=p.suf;
  if(ESHAPE[suf]!==undefined){
    const f=(NOTES.indexOf(p.root)-4+12)%12||12;
    if(f<=9) return ESHAPE[suf].map(x=>x<0?-1:x+f);
  }
  if(ASHAPE[suf]!==undefined){
    const f=(NOTES.indexOf(p.root)-9+12)%12||12;
    return ASHAPE[suf].map(x=>x<0?-1:x+f);
  }
  // fallback to triad
  const base=suf.startsWith("m")&&!suf.startsWith("maj")?"m":"";
  if(base!==suf) return shape(p.root+base);
  return null;
}
function diagram(c,size=1){
  const fr=shape(c);
  const W=74*size,H=86*size,sx=12*size,sy=16*size,gw=50*size,gh=60*size,cs=gw/5,rs=gh/5;
  if(!fr) return `<svg width="${W}" height="${H}"><text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="currentColor">?</text></svg>`;
  const played=fr.filter(x=>x>0);
  const max=Math.max(...played,0),min=Math.min(...played);
  const base=max>5?min:1;
  let s=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="color:var(--ink)">`;
  if(base===1) s+=`<rect x="${sx}" y="${sy-2*size}" width="${gw}" height="${3*size}" fill="currentColor"/>`;
  else s+=`<text x="${sx-3*size}" y="${sy+rs*.7}" text-anchor="end" font-size="${9*size}" fill="var(--muted)" font-family="Inter">${base}</text>`;
  for(let i=0;i<6;i++) s+=`<line x1="${sx+i*cs}" y1="${sy}" x2="${sx+i*cs}" y2="${sy+gh}" stroke="currentColor" stroke-opacity=".55" stroke-width="${size}"/>`;
  for(let j=0;j<=5;j++) s+=`<line x1="${sx}" y1="${sy+j*rs}" x2="${sx+gw}" y2="${sy+j*rs}" stroke="currentColor" stroke-opacity=".35" stroke-width="${size}"/>`;
  // barre
  if(fr[0]===min && fr[5]===min && min>0 && played.filter(x=>x===min).length>=3){
    const y=sy+(min-base+.5)*rs;
    s+=`<rect x="${sx-3*size}" y="${y-4*size}" width="${gw+6*size}" height="${8*size}" rx="${4*size}" fill="var(--accent)"/>`;
  }
  fr.forEach((f,i)=>{
    const x=sx+i*cs;
    if(f<0) s+=`<text x="${x}" y="${sy-5*size}" text-anchor="middle" font-size="${9*size}" fill="var(--muted)" font-family="Inter">×</text>`;
    else if(f===0) s+=`<circle cx="${x}" cy="${sy-7*size}" r="${3*size}" fill="none" stroke="var(--muted)" stroke-width="${size}"/>`;
    else s+=`<circle cx="${x}" cy="${sy+(f-base+.5)*rs}" r="${4.2*size}" fill="var(--accent)"/>`;
  });
  return s+`</svg>`;
}
function chordCard(c,size=1){c=esc(c);return `<div class="cd" data-c="${c}">${diagram(c,size)}<b>${c}</b></div>`}


function renderLyrics(body,tr){
  const used=[];
  const add=c=>{if(!used.includes(c)) used.push(c)};
  const html=body.split("\n").map(line=>{
    if(line.startsWith("#")) return `<div class="sec">${esc(line.slice(1))}</div>`;
    if(!line.trim()) return `<div class="ln blank"></div>`;
    const stripped=line.replace(/\[[^\]]+\]/g,"").trim();
    if(!stripped){
      const cs=[...line.matchAll(/\[([^\]]+)\]/g)].map(m=>transposeChord(m[1],tr).replace(/[<>"'&]/g,""));
      cs.forEach(add);
      return `<div class="ln chordsonly">${cs.map(c=>`<span class="ch" data-c="${c}">${c}</span>`).join("")}</div>`;
    }
    const parts=line.split(/\[([^\]]+)\]/);
    let out="";
    // parts: text, chord, text, chord, text...
    for(let i=0;i<parts.length;i+=2){
      const chord=i===0?null:transposeChord(parts[i-1],tr).replace(/[<>"'&]/g,"");
      if(chord) add(chord);
      const words=parts[i].match(/\S+\s*|\s+/g)||[""];
      words.forEach((w,j)=>{
        const c=j===0?chord:null;
        let txt=w;
        if(c && txt.trim().length<c.length) txt=txt.padEnd(c.length+1," ");
        out+=`<span class="w"><span class="ch"${c?` data-c="${c}"`:""}>${c||""}</span><span>${esc(txt)||" "}</span></span>`;
      });
    }
    return `<div class="ln">${out}</div>`;
  }).join("");
  return {html,used};
}

