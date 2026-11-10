// Veri katmanı: Supabase varsa onu, yoksa localStorage'ı kullanır.
(function(){
  const C = window.AKORLA_CONFIG || {};
  const useSB = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  const sb = useSB ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
  const LS = "akorla_db";

  const clone = o => JSON.parse(JSON.stringify(o));
  function readLocal(){
    try{ const v = localStorage.getItem(LS); if(v) return JSON.parse(v); }catch(e){}
    return { artists: clone(DEFAULT_ARTISTS), songs: clone(DEFAULT_SONGS) };
  }
  function writeLocal(d){
    try{ localStorage.setItem(LS, JSON.stringify(d)); }catch(e){ throw new Error("Tarayıcı depolaması kullanılamıyor"); }
  }
  const chk = r => { if(r.error) throw new Error(r.error.message); return r.data; };

  window.DB = {
    mode: useSB ? "supabase" : "local",

    async load(){
      if(!useSB) return readLocal();
      const [a, s] = await Promise.all([
        sb.from("artists").select("*").order("name"),
        sb.from("songs").select("*")
      ]);
      return { artists: chk(a), songs: chk(s) };
    },

    async saveSong(song, oldId){
      if(!useSB){
        const d = readLocal();
        const prev = d.songs.find(x => x.id === (oldId || song.id));
        d.songs = d.songs.filter(x => x.id !== (oldId || song.id));
        d.songs.push({ views: prev ? prev.views : 0, ...song }); writeLocal(d); return;
      }
      if(oldId && oldId !== song.id){
        // adres değişti: görüntülenmeyi koruyarak taşı
        const old = chk(await sb.from("songs").select("views").eq("id", oldId).maybeSingle());
        chk(await sb.from("songs").upsert({ ...song, views: old ? old.views : 0 }));
        chk(await sb.from("songs").delete().eq("id", oldId));
      } else chk(await sb.from("songs").upsert(song));
    },
    async deleteSong(id){
      if(!useSB){ const d = readLocal(); d.songs = d.songs.filter(x => x.id !== id); writeLocal(d); return; }
      chk(await sb.from("songs").delete().eq("id", id));
    },

    async saveArtist(a, oldId){
      if(!useSB){
        const d = readLocal();
        d.artists = d.artists.filter(x => x.id !== (oldId || a.id));
        d.artists.push(a);
        if(oldId && oldId !== a.id) d.songs.forEach(s => { if(s.artist === oldId) s.artist = a.id; });
        writeLocal(d); return;
      }
      chk(await sb.from("artists").upsert(a));
      if(oldId && oldId !== a.id){
        chk(await sb.from("songs").update({ artist: a.id }).eq("artist", oldId));
        chk(await sb.from("artists").delete().eq("id", oldId));
      }
    },
    async deleteArtist(id){
      if(!useSB){ const d = readLocal(); d.artists = d.artists.filter(x => x.id !== id); writeLocal(d); return; }
      chk(await sb.from("artists").delete().eq("id", id));
    },

    async importAll(d){
      if(!useSB){ writeLocal(d); return; }
      if(d.artists.length) chk(await sb.from("artists").upsert(d.artists));
      if(d.songs.length) chk(await sb.from("songs").upsert(d.songs));
    },
    // --- Görüntülenme ---
    async incrementView(id){
      if(!useSB){ const d = readLocal(); const s = d.songs.find(x => x.id === id); if(s){ s.views = (+s.views || 0) + 1; writeLocal(d); } return; }
      chk(await sb.rpc("increment_view", { song_id: id }));
    },

    // --- Mesajlar (iletişim / telif / hata / öneri) ---
    async sendMessage(m){
      if(!useSB){
        let l = []; try{ l = JSON.parse(localStorage.getItem("akorla_msgs") || "[]"); }catch(e){}
        l.push({ ...m, id: Date.now(), is_read: false, created_at: new Date().toISOString() });
        try{ localStorage.setItem("akorla_msgs", JSON.stringify(l)); }catch(e){} return;
      }
      chk(await sb.from("messages").insert(m));
    },
    async listMessages(){
      if(!useSB){ try{ return JSON.parse(localStorage.getItem("akorla_msgs") || "[]").reverse(); }catch(e){ return []; } }
      return chk(await sb.from("messages").select("*").order("created_at", { ascending: false }));
    },
    async setRead(id, v){
      if(!useSB){ const l = (await this.listMessages()).reverse(); l.forEach(m => { if(m.id === id) m.is_read = v; }); localStorage.setItem("akorla_msgs", JSON.stringify(l)); return; }
      chk(await sb.from("messages").update({ is_read: v }).eq("id", id));
    },
    async deleteMessage(id){
      if(!useSB){ const l = (await this.listMessages()).reverse().filter(m => m.id !== id); localStorage.setItem("akorla_msgs", JSON.stringify(l)); return; }
      chk(await sb.from("messages").delete().eq("id", id));
    },

    resetLocal(){ try{ localStorage.removeItem(LS); }catch(e){} },

    // --- Giriş ---
    async login(email, pass){
      if(!useSB){
        if(pass !== C.ADMIN_PASSWORD) throw new Error("Şifre yanlış");
        try{ sessionStorage.setItem("akorla_admin", "1"); }catch(e){}
        return;
      }
      chk(await sb.auth.signInWithPassword({ email, password: pass }));
    },
    async isLogged(){
      if(!useSB){ try{ return sessionStorage.getItem("akorla_admin") === "1"; }catch(e){ return false; } }
      const { data } = await sb.auth.getSession();
      return !!data.session;
    },
    async logout(){
      if(!useSB){ try{ sessionStorage.removeItem("akorla_admin"); }catch(e){} return; }
      await sb.auth.signOut();
    }
  };
})();
