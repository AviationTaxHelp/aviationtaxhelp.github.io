/* Aviation Tax Help — okienko czatu i przycisk Wsparcie (kreator, panel, strona).
   Konfiguracja przed załadowaniem: window.ATH = {czat: "/api/czat", wsparcie: "/api/wsparcie",
   jezyk: "en" | () => "en", krok: "" | () => "", email: "", kontekst: ""}.
   Kreator i panel wysyłają do lokalnego bota (on dokleja wersję, licencję i oczyszczone logi);
   strona wysyła prosto na serwer. Zrzuty ekranu: wklej (Cmd+V) albo 📎 — pomniejszane przed wysłaniem. */
(function () {
  "use strict";
  if (window.__athCzat) return;
  window.__athCzat = true;
  var C = window.ATH || {};
  var val = function (v) { return typeof v === "function" ? v() : v; };
  var en = function () { return String(val(C.jezyk) || "en").slice(0, 2) !== "pl"; };
  var T = function (pl, eng) { return en() ? eng : pl; };
  var rozmowa = "";
  try { rozmowa = sessionStorage.getItem("ath_rozmowa") || ""; } catch (e) {}
  if (!rozmowa) {
    rozmowa = "r" + Math.random().toString(36).slice(2, 12);
    try { sessionStorage.setItem("ath_rozmowa", rozmowa); } catch (e) {}
  }
  var historia = [], obrazy = [], pierwsza = true, zajety = false, trybPismo = false;
  // Sesja czatu (serwer wydaje ją po pierwszym sprawdzeniu „nie jestem robotem”) — każda kolejna wiadomość ją dołącza.
  var sesja = "";
  try { sesja = sessionStorage.getItem("ath_sesja") || ""; } catch (e) {}
  function ustawSesje(z) { sesja = z || ""; try { sessionStorage.setItem("ath_sesja", sesja); } catch (e) {} }
  // Strona publiczna: widżet Cloudflare Turnstile w okienku (kreator i panel idą przez bota — tam go nie ma).
  var tsTok = "", tsId = null;
  function tsPrzygotuj() {
    if (!val(C.turnstile) || sesja || tsId !== null) return;
    var miejsce = box.querySelector(".ath-ts");
    var rysuj = function () {
      if (tsId !== null || !window.turnstile) return;
      miejsce.hidden = false;
      try {
        tsId = window.turnstile.render(miejsce, { sitekey: val(C.turnstile), size: "flexible",
          callback: function (t) { tsTok = t; }, "expired-callback": function () { tsTok = ""; }, "error-callback": function () { tsTok = ""; } });
      } catch (e) { tsId = null; }
    };
    if (window.turnstile) { rysuj(); return; }
    var proby = 0, czekaj = setInterval(function () {      // strona mogła już ładować skrypt Turnstile — chwilę czekamy
      if (window.turnstile) { clearInterval(czekaj); rysuj(); return; }
      if (++proby === 15 && !document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
        var sc = document.createElement("script");
        sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true;
        document.head.appendChild(sc);
      }
      if (proby > 100) clearInterval(czekaj);
    }, 200);
  }
  function tsZuzyty() { tsTok = ""; if (tsId !== null && window.turnstile) { try { window.turnstile.reset(tsId); } catch (e) {} } }

  var css = document.createElement("style");
  css.textContent =
    ".ath-btn{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:9999;" +
    "background:linear-gradient(160deg,#17304d,#0f1a2a);color:#fff;border:0;border-radius:999px;padding:12px 18px;font:600 15px 'IBM Plex Sans',system-ui,-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px -6px rgba(15,26,42,.55);transition:transform .15s,box-shadow .15s}" +
    ".ath-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px -8px rgba(15,26,42,.6)}" +
    // telefon: gdy wpisujesz coś w formularzu strony (NIP, e-mail, profil), przycisk chowa się, żeby nie zasłaniał pola (audyt 13.11)
    ".ath-btn.ath-schowaj{opacity:0;pointer-events:none;transform:translateY(12px)}" +
    ".ath-box{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(76px,calc(env(safe-area-inset-bottom,0px) + 76px));z-index:9999;" +
    "width:min(400px,calc(100vw - 32px));height:min(560px,calc(100vh - 110px));background:#fff;color:#0f1a2a;border:1px solid #e2e7ee;" +
    "border-radius:16px;box-shadow:0 2px 6px rgba(15,26,42,.08),0 24px 60px -24px rgba(15,26,42,.45);display:flex;flex-direction:column;font:14px/1.45 'IBM Plex Sans',system-ui,-apple-system,sans-serif;overflow:hidden;animation:ath-wej .25s cubic-bezier(.2,.7,.2,1)}" +
    ".ath-ts{padding:6px 12px 0}" +
    "@keyframes ath-wej{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}" +
    ".ath-box[hidden]{display:none}.ath-hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #e6eaf0;background:linear-gradient(180deg,#f6f8fb,#fff)}" +
    ".ath-hd b{flex:1;min-width:0;display:flex;align-items:center;gap:8px;letter-spacing:-.01em;white-space:nowrap}.ath-hd b span{overflow:hidden;text-overflow:ellipsis}@media (max-width:480px){.ath-hd button.ath-sup{font-size:0;padding:6px 8px}.ath-hd button.ath-sup::before{content:'🛟';font-size:15px}}.ath-hd b svg{flex:none;width:24px;height:24px}" +
    ".ath-hd button{border:1px solid #d8dee6;background:#f3f5f8;border-radius:8px;padding:5px 9px;cursor:pointer;font:inherit;font-size:13px;white-space:nowrap;flex:none;transition:transform .12s,box-shadow .15s}.ath-hd button:hover{transform:translateY(-1px);box-shadow:0 4px 10px -6px rgba(15,26,42,.35)}" +
    ".ath-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".ath-m{max-width:88%;padding:8px 11px;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere}" +
    ".ath-u{align-self:flex-end;background:linear-gradient(160deg,#17304d,#0f1a2a);color:#fff}.ath-a{align-self:flex-start;background:#f0f3f7}" +
    ".ath-lot{display:inline-block;width:2.6em;height:1em;position:relative;vertical-align:-.1em;margin-right:.3em;overflow:hidden;border-bottom:1px dashed rgba(91,103,120,.5)}" +
    ".ath-lot::before{content:'✈︎';position:absolute;left:0;top:-.15em;line-height:1;animation:ath-lot 1.1s linear infinite}@keyframes ath-lot{from{left:-1em}to{left:2.8em}}" +
    ".ath-sys{align-self:center;color:#5b6878;font-size:12.5px;text-align:center}.ath-m img{max-width:120px;border-radius:6px;display:block;margin-top:4px}" +
    ".ath-ft{border-top:1px solid #e6eaf0;padding:8px;display:flex;gap:6px;align-items:flex-end}" +
    ".ath-ft textarea{flex:1;resize:none;min-height:38px;max-height:120px;border:1px solid #cfd6df;border-radius:8px;padding:8px;font:inherit}" +
    ".ath-ft button{border:0;border-radius:8px;padding:9px 12px;cursor:pointer;font:600 14px inherit}" +
    ".ath-send{background:linear-gradient(180deg,#d98a10,#c77700);color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.12)}.ath-att{background:#f3f5f8}.ath-thumbs{display:flex;gap:4px;padding:0 8px}" +
    ".ath-note{font-size:11.5px;color:#5b6878;text-align:center;padding:0 8px 6px}.ath-pismo.on,.ath-sup.on{background:#c77700;color:#fff;border-color:#c77700}" +
    ".ath-thumbs img{height:40px;border-radius:4px}.ath-form{padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".ath-form input,.ath-form textarea{border:1px solid #cfd6df;border-radius:8px;padding:8px;font:inherit}" +
    ".ath-form button{background:#c77700;color:#fff;border:0;border-radius:8px;padding:10px;font:600 14px inherit;cursor:pointer}" +
    ".ath-form button.ath-wroc{background:transparent;color:inherit;border:1px solid #cfd6df}" +
    ".ath-tryb{display:flex;align-items:center;gap:8px;margin:0 8px 6px;padding:6px 10px;border-radius:8px;background:#fdf1e3;color:#7a4a00;font-size:13px}" +
    ".ath-tryb[hidden]{display:none}.ath-tryb span{flex:1}.ath-tryb button{border:1px solid #e3c79c;background:#fff;border-radius:6px;padding:3px 8px;cursor:pointer;font:inherit}" +
    "@media (prefers-color-scheme:dark){.ath-box{background:#121b2b;color:#e8eef6;border-color:#243248}.ath-a{background:#1b2740}.ath-hd{background:linear-gradient(180deg,#162133,#121b2b)}.ath-u{background:linear-gradient(160deg,#dfe8f3,#f3f7fb);color:#0b1220}" +
    ".ath-hd,.ath-ft{border-color:#2a3442}.ath-hd button,.ath-att{background:#202a37;color:#e4e9ef;border-color:#2a3442}" +
    ".ath-ft textarea,.ath-form input,.ath-form textarea{background:#0f141b;color:#e4e9ef;border-color:#2a3442}.ath-sys{color:#93a1b2}}" +
    // 24.11 (Jacek: „Zapytaj asystenta otwiera całą stronę — zrób direct”): z aplikacji (#czat / #zglos) sam czat na cały ekran,
    // bez strony pod spodem i bez ✕ (zamyka się „Gotowe” w aplikacji)
    "html.ath-pelny body>*:not(.ath-box){display:none!important}html.ath-pelny,html.ath-pelny body{overflow:hidden;height:100%}" +
    "html.ath-pelny .ath-box{inset:0;right:0;bottom:0;width:100vw;height:100vh;height:100dvh;border:0;border-radius:0;box-shadow:none;animation:none;" +
    "padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html.ath-pelny .ath-x{display:none}" +
    "html.ath-pelny .ath-msgs{font-size:16px}html.ath-pelny .ath-ft textarea,html.ath-pelny .ath-form input,html.ath-pelny .ath-form textarea{font-size:16px}";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.className = "ath-btn"; btn.type = "button";
  btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "ath-okno");
  var box = document.createElement("div");
  box.className = "ath-box"; box.hidden = true; box.id = "ath-okno";
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "false");     // okno obok strony, nie blokuje jej (audyt 13.11)
  box.innerHTML =
    '<div class="ath-hd"><b><svg viewBox="0 0 30 30" aria-hidden="true"><rect x="1" y="1" width="28" height="28" rx="7" fill="#0f1a2a"/><path d="M6 19.5 L12.5 19.5 L15 9 L17.5 19.5 L24 19.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="15" cy="9" r="2.3" fill="#4fd1e8"/></svg><span></span></b><button type="button" class="ath-pismo"></button><button type="button" class="ath-sup"></button><button type="button" class="ath-x" aria-label="Close">✕</button></div>' +
    '<div class="ath-msgs" aria-live="polite"></div><div class="ath-thumbs"></div>' +
    '<div class="ath-tryb" hidden><span></span><button type="button"></button></div><div class="ath-ts" hidden></div>' +
    '<div class="ath-ft"><button type="button" class="ath-att" title="Screenshot">📎</button>' +
    '<input type="file" accept="image/*" multiple hidden><textarea rows="1"></textarea><button type="button" class="ath-send"></button></div>' +
    '<div class="ath-note"></div>';
  document.body.appendChild(btn);
  document.body.appendChild(box);
  var $ = function (s) { return box.querySelector(s); };
  var msgs = $(".ath-msgs"), ta = $("textarea"), plik = $("input[type=file]"), thumbs = $(".ath-thumbs");

  function etykiety() {
    btn.textContent = T("💬 Pomoc", "💬 Help");
    $(".ath-hd b span").textContent = T("Pomoc", "Help"); $(".ath-hd b").title = T("Asystent Aviation Tax Help", "Aviation Tax Help assistant");
    $(".ath-sup").textContent = T("🛟 Wsparcie", "🛟 Support");
    $(".ath-pismo").textContent = "📄"; $(".ath-pismo").title = T("Pismo z urzędu — pomogę je zrozumieć", "Tax letter — I will help you read it"); $(".ath-pismo").setAttribute("aria-label", T("Pismo z urzędu", "Tax letter"));
    $(".ath-note").textContent = T("Asystent AI · informacje ogólne, nie porada podatkowa · sprawdzaj przed użyciem",
                                   "AI assistant · general information, not tax advice · check before use");
    $(".ath-send").textContent = T("Wyślij", "Send");
    box.setAttribute("aria-label", T("Pomoc — asystent AI", "Help — AI assistant"));
    $(".ath-x").setAttribute("aria-label", T("Zamknij", "Close"));
    $(".ath-att").setAttribute("aria-label", T("Dodaj zrzut ekranu", "Attach a screenshot")); $(".ath-att").title = T("Zrzut ekranu", "Screenshot");
    ta.setAttribute("aria-label", T("Twoja wiadomość", "Your message"));
    ta.placeholder = T("Napisz, w czym utknąłeś. Możesz wkleić zrzut ekranu (Cmd+V).",
                       "Tell me where you are stuck. You can paste a screenshot (Cmd+V).");
  }
  etykiety();
  window.ATH_odswiez = etykiety;                 // strona zmieniła język (kreator EN/PL) → etykiety przycisku i okna od razu

  function dodaj(kto, tekst, img) {
    var d = document.createElement("div");
    d.className = "ath-m " + (kto === "u" ? "ath-u" : kto === "a" ? "ath-a" : "ath-sys");
    if (kto === "a") {                                   // odpowiedzi Claude: **pogrubienie** i `kod`, reszta jako tekst
      d.innerHTML = String(tekst).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; })
        .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>").replace(/`([^`\n]+)`/g, "<code>$1</code>");
    } else {
      d.textContent = tekst;
    }
    (img || []).forEach(function (o) { var i = new Image(); i.src = "data:" + o.typ + ";base64," + o.dane; d.appendChild(i); });
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function otworz() {
    box.hidden = !box.hidden;
    btn.setAttribute("aria-expanded", String(!box.hidden));
    etykiety();
    if (!box.hidden && !msgs.childElementCount) {
      dodaj("a", T("Cześć! Jestem asystentem AI (model Claude) — odpowiadam automatycznie i mogę się mylić. Pomogę Ci krok po kroku z instalacją i codzienną pracą bota. Napisz pytanie albo wklej zrzut ekranu.\nNie wpisuj tu haseł, tokenów ani danych osobowych — rozmowę przetwarza Anthropic (USA), szczegóły w polityce prywatności (aviationtaxhelp.pl/regulamin.html).",
                   "Hi! I'm an AI assistant (Claude) — I answer automatically and can make mistakes. I can walk you through installing and using the bot, step by step. Ask a question or paste a screenshot.\nPlease don't type passwords, tokens or personal data here — messages are processed by Anthropic (USA); see the privacy policy (aviationtaxhelp.pl/regulamin.html)."));
    }
    if (!box.hidden) { tsPrzygotuj(); ta.focus(); }
  }
  btn.addEventListener("click", otworz);
  function zamknij() { box.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  $(".ath-x").addEventListener("click", zamknij);
  // Esc zamyka okno czatu i oddaje fokus przyciskowi „Pomoc” (audyt 13.11)
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && !box.hidden) { zamknij(); try { btn.focus(); } catch (x) {} }
  });
  // telefon: pole formularza strony w fokusie → przycisk „Pomoc” na chwilę znika (nie zasłania NIP-u ani „Profilu”)
  var waski = window.matchMedia ? window.matchMedia("(max-width: 820px)") : null;
  document.addEventListener("focusin", function (e) {
    var el = e.target;
    if (!waski || !waski.matches || !el || box.contains(el)) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) btn.classList.add("ath-schowaj");
  });
  document.addEventListener("focusout", function () { btn.classList.remove("ath-schowaj"); });
  function zamknijFormularz() {                          // formularz zgłoszenia → z powrotem zwykły czat
    var f = msgs.querySelector(".ath-form");
    if (f) f.remove();
    $(".ath-sup").classList.remove("on");
  }
  function ustawPismo(wl) {
    trybPismo = wl;
    $(".ath-pismo").classList.toggle("on", trybPismo);
    var pas = $(".ath-tryb");
    pas.hidden = !trybPismo;
    pas.querySelector("span").textContent = T("📄 Tryb: pismo z urzędu", "📄 Mode: tax letter");
    pas.querySelector("button").textContent = T("↩︎ Wróć do czatu", "↩︎ Back to chat");
  }
  $(".ath-tryb button").addEventListener("click", function () { ustawPismo(false); dodaj("sys", T("Zwykły czat.", "Regular chat.")); ta.focus(); });
  $(".ath-pismo").addEventListener("click", function () {
    zamknijFormularz();
    ustawPismo(!trybPismo);
    if (trybPismo) dodaj("sys", T("Wklej zdjęcie albo tekst pisma (zasłoń PESEL i numery kont — nie są potrzebne). Podam podstawowe informacje: rodzaj pisma, termin, dokumenty z programu, linki do oficjalnych źródeł i jak złożyć pismo. Oceną sprawy zajmie się doradca podatkowy. Potrwa to do minuty.",
                                  "Paste a photo or the text of the letter (cover your PESEL and account numbers — not needed). I'll give the basics: type of letter, deadline, documents from the program, links to official sources and how to file a reply. A tax adviser handles the assessment of your case. It takes up to a minute."));
    ta.focus();
  });

  function zmniejsz(file) {
    return new Promise(function (ok, zle) {
      var r = new FileReader();
      r.onerror = zle;
      r.onload = function () {
        var img = new Image();
        img.onerror = zle;
        img.onload = function () {
          var s = Math.min(1, 1568 / Math.max(img.width, img.height));
          var c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          ok({ typ: "image/jpeg", dane: c.toDataURL("image/jpeg", 0.85).split(",")[1] });
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }
  function dodajObrazy(files) {
    [].slice.call(files || []).filter(function (f) { return /^image\//.test(f.type); }).slice(0, 3 - obrazy.length).forEach(function (f) {
      zmniejsz(f).then(function (o) {
        obrazy.push(o);
        var i = new Image(); i.src = "data:image/jpeg;base64," + o.dane; thumbs.appendChild(i);
      }).catch(function () {});
    });
  }
  $(".ath-att").addEventListener("click", function () { plik.click(); });
  plik.addEventListener("change", function () { dodajObrazy(plik.files); plik.value = ""; });
  ta.addEventListener("paste", function (e) {
    var it = (e.clipboardData || {}).files;
    if (it && it.length) { dodajObrazy(it); e.preventDefault(); }
  });
  ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); wyslij(); } });
  $(".ath-send").addEventListener("click", wyslij);

  function post(url, dane) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dane) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
  }

  function wyslij() {
    var tekst = ta.value.trim();
    if (zajety || (!tekst && !obrazy.length)) return;
    zajety = true;
    var w = { rola: "uzytkownik", tekst: tekst, obrazy: obrazy.slice() };
    dodaj("u", tekst || T("(zrzut ekranu)", "(screenshot)"), w.obrazy);
    historia.push(w);
    ta.value = ""; obrazy = []; thumbs.innerHTML = "";
    var pismo = trybPismo;
    ustawPismo(false);
    var czeka = dodaj("sys", pismo ? T("Czytam pismo i szukam oficjalnych źródeł… (do minuty)", "Reading the letter and looking up official sources… (up to a minute)")
                                   : T("Asystent pisze…", "The assistant is typing…"));
    czeka.insertAdjacentHTML("afterbegin", '<span class="ath-lot" aria-hidden="true"></span>');
    var dane = { rozmowa: rozmowa, pierwsza: pierwsza, jezyk: String(val(C.jezyk) || "en"), krok: val(C.krok) || "",
                 kontekst: val(C.kontekst) || "", wiadomosci: historia.slice(-12) };
    if (sesja) dane.sesja = sesja;
    else if (tsTok) { dane.turnstile = tsTok; tsZuzyty(); }
    if (pismo) dane.tryb = "pismo";
    else if (val(C.przewodnik)) { dane.tryb = "start"; dane.kod_przewodnika = val(C.przewodnik); }
    post(C.czat || "/api/czat", dane).then(function (r) {
      czeka.remove();
      pierwsza = false;
      if (r.sesja) { ustawSesje(r.sesja); var m = box.querySelector(".ath-ts"); if (m) m.hidden = true; }
      if (r.turnstile) { ustawSesje(""); tsId === null ? tsPrzygotuj() : (box.querySelector(".ath-ts").hidden = false); historia.pop(); }
      if (r.ok) {
        historia.push({ rola: "asystent", tekst: r.odpowiedz });
        historia.forEach(function (h) { if (h.rola === "uzytkownik" && h !== w) h.obrazy = []; });  // starsze zrzuty nie jadą drugi raz
        dodaj("a", r.odpowiedz);
      } else {
        dodaj("sys", r.msg || T("Nie udało się połączyć. Spróbuj za chwilę albo kliknij „Wsparcie”.",
                                "Could not connect. Try again shortly or click \"Support\"."));
      }
    }).catch(function () {
      czeka.remove();
      dodaj("sys", T("Brak połączenia z internetem?", "No internet connection?"));
    }).then(function () { zajety = false; });
  }

  // rodzaj: "" (pytanie / problem), "blad" albo "pomysl" — Program Ulepszeń (19.11): nagroda za potwierdzony błąd / wdrożony pomysł
  function formularz(rodzaj) {
    if (msgs.querySelector(".ath-form")) { zamknijFormularz(); if (rodzaj === undefined) return; }   // drugi klik — wróć do czatu
    ustawPismo(false);
    $(".ath-sup").classList.add("on");
    var f = document.createElement("form");
    f.className = "ath-form";
    f.innerHTML =
      "<div>" + T("Zgłoszenie trafi do wsparcia razem z historią tej rozmowy i oczyszczonymi logami (bez haseł i kwot). Odpowiedź przyjdzie mailem.",
                  "Your request goes to support with this chat and cleaned logs (no passwords or amounts). The answer arrives by e-mail.") + "</div>" +
      '<input type="email" required id="ath-email" autocomplete="email" placeholder="' + T("E-mail do odpowiedzi", "E-mail for the reply") + '">' +
      '<small style="display:block;margin:-4px 0 4px;color:#667">' + T("Podaj adres, na który chcesz dostać odpowiedź — dowolny, nie musi to być adres z ustawień.",
                                                                     "Enter the address where you want the reply — any address, it doesn't have to be the one from your settings.") + "</small>" +
      '<div class="ath-rodz" style="display:flex;flex-wrap:wrap;gap:4px 12px;margin:2px 0 6px;font-size:13px">' +
        [["", T("Pytanie / problem", "Question / problem")], ["blad", T("🐞 Błąd", "🐞 Bug")], ["pomysl", T("💡 Pomysł na zmianę", "💡 Idea for a change")]].map(function (o) {
          return '<label style="display:flex;gap:4px;align-items:center"><input type="radio" name="ath-rodzaj" value="' + o[0] + '"' + ((rodzaj || "") === o[0] ? " checked" : "") + ">" + o[1] + "</label>";
        }).join("") + "</div>" +
      '<small class="ath-ulp" style="display:block;margin:-2px 0 6px;color:#667"' + (rodzaj ? "" : " hidden") + ">" +
        T("Program Ulepszeń: za potwierdzony i naprawiony błąd albo wdrożony pomysł dostaniesz mailem jednorazowy kod rabatowy na licencję (regulamin § 7c).",
          "Improvement Programme: a confirmed and fixed bug or an implemented idea earns a single-use licence discount code by e-mail (terms § 7c).") + "</small>" +
      '<textarea required rows="4" id="ath-opis" placeholder="' + T("Co się stało? Co klikałeś?", "What happened? What did you click?") + '"></textarea>' +
      '<button type="submit">' + T("Wyślij zgłoszenie", "Send request") + "</button>" +
      '<button type="button" class="ath-wroc">' + T("↩︎ Anuluj — wróć do czatu", "↩︎ Cancel — back to chat") + "</button>";
    msgs.appendChild(f);
    msgs.scrollTop = msgs.scrollHeight;
    f.querySelector(".ath-wroc").addEventListener("click", function () { zamknijFormularz(); ta.focus(); });
    var opis = f.querySelector("#ath-opis");
    function podpowiedz() {
      var r = (f.querySelector('input[name="ath-rodzaj"]:checked') || {}).value || "";
      f.querySelector(".ath-ulp").hidden = !r;
      opis.placeholder = r === "pomysl" ? T("Co byś zmienił i dlaczego? Jak to by Ci pomogło?", "What would you change and why? How would it help you?")
        : r === "blad" ? T("Co nie działa? Co klikałeś i czego się spodziewałeś?", "What doesn't work? What did you click and what did you expect?")
        : T("Co się stało? Co klikałeś?", "What happened? What did you click?");
    }
    f.querySelectorAll('input[name="ath-rodzaj"]').forEach(function (x) { x.addEventListener("change", podpowiedz); });
    podpowiedz();
    var em = f.querySelector("#ath-email");
    try { em.value = localStorage.getItem("ath-email") || val(C.email) || ""; } catch (e) { em.value = val(C.email) || ""; }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var b = f.querySelector("button"); b.disabled = true;
      var rozm = historia.map(function (h) { return (h.rola === "asystent" ? "A: " : "U: ") + h.tekst; }).join("\n");
      try { localStorage.setItem("ath-email", em.value.trim()); } catch (e) {}
      var zg = { email: em.value.trim(), opis: f.querySelector("#ath-opis").value.trim(),
        jezyk: String(val(C.jezyk) || "en"), krok: val(C.krok) || "", rozmowa: rozm, rozmowa_id: rozmowa,
        rodzaj: (f.querySelector('input[name="ath-rodzaj"]:checked') || {}).value || "" };
      if (sesja) zg.sesja = sesja; else if (tsTok) { zg.turnstile = tsTok; tsZuzyty(); }
      post(C.wsparcie || "/api/wsparcie", zg).then(function (r) {
        if (r.turnstile) { b.disabled = false; tsPrzygotuj(); var m = box.querySelector(".ath-ts"); if (m) m.hidden = false; dodaj("sys", r.msg); return; }
        zamknijFormularz();
        dodaj("sys", r.msg || (r.ok ? "OK" : T("Nie udało się wysłać.", "Could not send.")));
        if (r.wstepna) dodaj("a", r.wstepna);
      }).catch(function () { b.disabled = false; dodaj("sys", T("Brak połączenia.", "No connection.")); });
    });
  }
  $(".ath-sup").addEventListener("click", function () { formularz(); });
  // Przyciski „🐞 Zgłoś błąd” / „💡 Zasugeruj zmianę” w panelu: otwierają czat od razu na formularzu z wybranym rodzajem.
  window.ATH_zglos = function (rodzaj) {
    if (box.hidden) otworz();
    formularz(rodzaj === "pomysl" ? "pomysl" : "blad");
  };

  // Otwarcie z innego miejsca strony: powitanie (przewodnik „Zakładam firmę”) albo tekst w polu (QRH: „QRH 2.7 (…): ”).
  window.ATH_otworz = function (powitanie, tekst) {
    if (box.hidden) otworz();
    if (powitanie && !msgs.querySelector(".ath-start")) { var d = dodaj("a", powitanie); d.classList.add("ath-start"); }
    if (tekst) {
      ta.value = String(tekst); ta.focus();
      try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
    }
  };
  // 23.11: aplikacja na iPhone'a otwiera stronę z „#czat” albo „#zglos” — okienko od razu otwarte
  if (location.hash === "#czat" || location.hash === "#zglos") document.documentElement.classList.add("ath-pelny");
  if (location.hash === "#czat") window.ATH_otworz();
  if (location.hash === "#zglos") window.ATH_zglos("blad");
})();
