(() => {
  "use strict";
  const PHONE = "+33605572482";
  const WHATSAPP = "https://wa.me/33605572482";
  const EMAIL = "contact@nexoratravaux.fr";
  const doc = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  doc.classList.add("js");
  if (!reduced) doc.classList.add("motion");
  else doc.classList.add("no-scroll-fx");

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  /* ---------- En-tête : menu mobile ---------- */
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const setMenu = (open) => {
    body.classList.toggle("nav-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };
  toggle?.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
  $$(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Apparition au défilement ---------- */
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---------- Compteurs ---------- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    const co = new IntersectionObserver((entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        const el = en.target;
        const end = +el.dataset.count;
        const t0 = performance.now();
        const tick = (t) => {
          const k = clamp((t - t0) / 1400);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0";
        requestAnimationFrame(tick);
      })
    , { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Scènes pilotées par le défilement (une seule boucle) ---------- */
  const hero = $("[data-hero]");
  const story = $("[data-story]");
  const method = $("[data-hscroll]");
  const tickers = $$("[data-ticker]");
  const footerWord = $(".footer-word");
  const progress = $(".scroll-progress");
  const wide = matchMedia("(min-width: 961px)");
  let lastY = scrollY;
  let methodTrack = method ? $(".method-track", method) : null;

  function sizeMethod() {
    if (!method || reduced) return;
    const on = wide.matches;
    doc.classList.toggle("hscroll", on);
    if (!on) {
      method.style.removeProperty("--h");
      methodTrack.style.removeProperty("--x");
      return;
    }
    const dist = Math.max(0, methodTrack.scrollWidth - innerWidth);
    method.style.setProperty("--h", `${innerHeight + dist}px`);
    method.dataset.dist = String(dist);
  }

  function sectionProgress(el) {
    const r = el.getBoundingClientRect();
    const span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span) : r.top < 0 ? 1 : 0;
  }

  function frame() {
    ticking = false;
    const y = scrollY;
    const max = doc.scrollHeight - innerHeight;
    progress?.style.setProperty("--sp", (max > 0 ? y / max : 0).toFixed(4));

    // En-tête : masqué en descendant, réapparaît en remontant
    header?.classList.toggle("scrolled", y > 10);
    if (!body.classList.contains("nav-open")) header?.classList.toggle("hide", y > 600 && y > lastY + 2);
    if (y < lastY - 2) header?.classList.remove("hide");
    body.classList.toggle("show-float", y > innerHeight * 0.7);
    lastY = y;

    if (reduced) return;

    if (hero) {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--hp", clamp(-r.top / r.height).toFixed(4));
    }
    if (story) {
      const p = sectionProgress(story);
      const k = clamp((p - 0.18) / 0.5);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      story.style.setProperty("--p", p.toFixed(4));
      story.style.setProperty("--k", e.toFixed(4));
      story.classList.toggle("done", e > 0.97);
    }
    if (method && doc.classList.contains("hscroll")) {
      const p = sectionProgress(method);
      methodTrack.style.setProperty("--x", (p * +(method.dataset.dist || 0)).toFixed(1));
      method.style.setProperty("--p", p.toFixed(4));
    }
    tickers.forEach((t) => {
      const track = t.firstElementChild;
      const third = track.scrollWidth / 3 || 1;
      t.style.setProperty("--tx", `${((y * 0.35) % third).toFixed(1)}px`);
    });
    if (footerWord) {
      const r = footerWord.getBoundingClientRect();
      footerWord.style.setProperty("--fw", clamp(1 - (r.top - innerHeight * 0.6) / (innerHeight * 0.5)).toFixed(3));
    }
  }
  let ticking = false;
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", () => {
    sizeMethod();
    request();
  });
  wide.addEventListener?.("change", () => {
    sizeMethod();
    request();
  });
  sizeMethod();
  frame();
  // Les polices peuvent changer la largeur de la piste horizontale
  document.fonts?.ready.then(() => {
    sizeMethod();
    request();
  });

  /* ---------- Effets au pointeur (souris uniquement) ---------- */
  if (finePointer && !reduced) {
    const glow = $(".cursor-glow");
    let gx = -999, gy = -999, cx = gx, cy = gy, glowOn = false;
    const loop = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow?.style.setProperty("--cx", `${cx.toFixed(1)}px`);
      glow?.style.setProperty("--cy", `${cy.toFixed(1)}px`);
      requestAnimationFrame(loop);
    };
    addEventListener("pointermove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
      if (!glowOn) {
        glowOn = true;
        cx = gx;
        cy = gy;
        body.classList.add("has-pointer");
        requestAnimationFrame(loop);
      }
    }, { passive: true });

    // Quadrillage du hero qui suit le pointeur
    $$(".hero, .page-hero-dark").forEach((h) =>
      h.addEventListener("pointermove", (e) => {
        const r = h.getBoundingClientRect();
        const bp = $(".hero-blueprint", h);
        bp?.style.setProperty("--mx", `${e.clientX - r.left}px`);
        bp?.style.setProperty("--my", `${e.clientY - r.top}px`);
      })
    );

    // Halo sur les cartes métiers
    $$(".metier-card").forEach((c) =>
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
      })
    );

    // Boutons « magnétiques »
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });

    // Téléphone qui s’incline légèrement
    const phone = $(".phone");
    phone?.parentElement.addEventListener("pointermove", (e) => {
      const r = phone.getBoundingClientRect();
      phone.style.setProperty("--tilt-x", clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1) * 8);
      phone.style.setProperty("--tilt-y", clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1) * 6);
    });
    phone?.parentElement.addEventListener("pointerleave", () => {
      phone.style.setProperty("--tilt-x", 0);
      phone.style.setProperty("--tilt-y", 0);
    });
  }

  /* ---------- Configurateur de projet (accueil) ---------- */
  const form = $("[data-quote-form]");
  const chip = (slug) => form?.querySelector(`input[data-metier="${slug}"]`);
  const addButtons = $$("[data-add]");
  const scenarioButtons = $$("[data-scenario]");
  const sumCount = $("[data-summary-count]");
  const sumPlural = $("[data-summary-plural]");
  const sumList = $("[data-summary-list]");
  let bar = null;
  let lastCount = -1;

  function refreshSelection() {
    const checked = form ? $$('input[name="metiers"]:checked', form) : [];
    const slugs = new Set(checked.map((i) => i.dataset.metier));
    addButtons.forEach((btn) => {
      const on = slugs.has(btn.dataset.add);
      btn.setAttribute("aria-pressed", String(on));
      btn.closest(".metier-card")?.classList.toggle("selected", on);
    });
    scenarioButtons.forEach((b) => {
      const list = b.dataset.scenario.split(",");
      b.setAttribute("aria-pressed", String(list.length === slugs.size && list.every((s) => slugs.has(s))));
    });
    const n = checked.length;
    if (sumCount) {
      sumCount.textContent = String(n);
      sumPlural.textContent = n > 1 ? "s" : "";
      if (n !== lastCount && lastCount !== -1 && !reduced) {
        sumCount.classList.remove("bump");
        void sumCount.offsetWidth;
        sumCount.classList.add("bump");
      }
      sumList.innerHTML = n
        ? checked.map((i) => `<li>${i.value}</li>`).join("")
        : '<li class="summary-empty">Aucun métier pour l’instant.</li>';
    }
    lastCount = n;
    if (!addButtons.length) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "project-bar";
      bar.setAttribute("role", "status");
      bar.innerHTML = '<span class="project-count"></span><a class="btn btn-whatsapp" href="#projet">Envoyer mon projet</a>';
      body.appendChild(bar);
    }
    bar.querySelector(".project-count").innerHTML = `<strong>${n}</strong> métier${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`;
    const cfg = $("#metiers");
    const cfgVisible = cfg && cfg.getBoundingClientRect().bottom > innerHeight * 0.5 && cfg.getBoundingClientRect().top < innerHeight * 0.5;
    const formVisible = form && form.getBoundingClientRect().top < innerHeight * 0.85;
    const show = n > 0 && !formVisible && !cfgVisible;
    bar.classList.toggle("visible", show);
    body.classList.toggle("project-on", show);
  }

  addButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const input = chip(btn.dataset.add);
      if (!input) return;
      input.checked = !input.checked;
      refreshSelection();
    })
  );
  scenarioButtons.forEach((b) =>
    b.addEventListener("click", () => {
      const list = b.dataset.scenario.split(",");
      const alreadyOn = b.getAttribute("aria-pressed") === "true";
      $$('input[name="metiers"]', form).forEach((i) => (i.checked = !alreadyOn && list.includes(i.dataset.metier)));
      refreshSelection();
    })
  );
  form?.addEventListener("change", refreshSelection);
  addEventListener("scroll", () => bar && refreshSelection(), { passive: true });

  // Page devis : pré-sélection via ?metier=plomberie
  const pre = new URLSearchParams(location.search).get("metier");
  if (pre && chip(pre)) chip(pre).checked = true;
  refreshSelection();

  /* ---------- Avant / après : onglets + curseur ---------- */
  $$("[data-transfo]").forEach((sec) => {
    const tabs = $$('[role="tab"]', sec);
    const panels = $$('[role="tabpanel"]', sec);
    // Petit balayage automatique pour montrer que l’image se compare
    const hint = (panel) => {
      const ba = panel && $(".ba", panel);
      if (!ba || reduced || ba.dataset.touched || ba.dataset.hinted) return;
      ba.dataset.hinted = "1";
      const range = $(".ba-range", ba);
      const t0 = performance.now();
      const step = (t) => {
        if (ba.dataset.touched) return;
        const k = clamp((t - t0) / 2600);
        const pos = k < 1 ? 50 + Math.sin(k * Math.PI * 2) * 32 * (1 - k * 0.3) : 50;
        ba.style.setProperty("--pos", `${pos}%`);
        range.value = String(Math.round(pos));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const select = (i) => {
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach((p, k) => p.toggleAttribute("data-hidden", k !== i));
      panels[i].querySelectorAll(".reveal").forEach((r) => r.classList.add("in"));
      hint(panels[i]);
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        const n = (i + d + tabs.length) % tabs.length;
        select(n);
        tabs[n].focus();
      });
    });
    $$(".ba", sec).forEach((ba) => {
      const range = $(".ba-range", ba);
      range.addEventListener("input", () => {
        ba.dataset.touched = "1";
        ba.style.setProperty("--pos", `${range.value}%`);
      });
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        setTimeout(() => hint(panels.find((p) => !p.hasAttribute("data-hidden"))), 500);
      }, { threshold: 0.5 });
      io.observe($(".ba", sec));
    }
  });

  /* ---------- Formulaire de parrainage ---------- */
  $$("[data-referral-form]").forEach((f) => {
    const err = $(".form-error", f);
    f.addEventListener("input", (e) => e.target.getAttribute("aria-invalid") === "true" && e.target.setAttribute("aria-invalid", "false"));
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const channel = e.submitter?.dataset.channel || "whatsapp";
      const v = (n) => String(f.elements[n].value || "").trim();
      const checks = [
        ["refName", !!v("refName"), "votre nom"],
        ["refPhone", v("refPhone").replace(/\D/g, "").length >= 9, "votre téléphone"],
        ["friendName", !!v("friendName"), "le nom de la personne recommandée"],
      ];
      checks.forEach(([n, ok]) => f.elements[n].setAttribute("aria-invalid", String(!ok)));
      const missing = checks.filter((c) => !c[1]).map((c) => c[2]);
      const consent = f.elements.consent.checked;
      f.elements.consent.setAttribute("aria-invalid", String(!consent));
      if (missing.length || !consent) {
        err.textContent = missing.length
          ? "Merci d’indiquer " + missing.join(", ") + "."
          : "Merci de confirmer que la personne est d’accord pour être contactée.";
        err.hidden = false;
        f.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      err.hidden = true;
      const lines = ["Bonjour Nexora Travaux, je souhaite vous recommander quelqu’un (parrainage)."];
      [
        ["Mon nom", v("refName")],
        ["Mon téléphone", v("refPhone")],
        ["Personne recommandée", v("friendName")],
        ["Son téléphone", v("friendPhone")],
        ["Code postal du chantier", v("cp")],
        ["Travaux", v("works")],
      ].forEach(([k, val]) => val && lines.push(`${k} : ${val}`));
      lines.push("La personne est d’accord pour être contactée.");
      const text = encodeURIComponent(lines.join("\n"));
      const urls = {
        whatsapp: `${WHATSAPP}?text=${text}`,
        sms: `sms:${PHONE}?&body=${text}`,
        email: `mailto:${EMAIL}?subject=${encodeURIComponent("Parrainage – " + v("friendName"))}&body=${text}`,
      };
      location.assign(urls[channel] || urls.whatsapp);
    });
  });

  /* ---------- Simulateur de commission (parrainage) ---------- */
  $$("[data-simu]").forEach((sim) => {
    const d = sim.dataset;
    const C = { forfait: +d.forfait, seuil: +d.seuil, taux: +d.taux, tauxPro: +d.tauxPro, apres: +d.apres, plafond: +d.plafond };
    const fmt = (n) => `${Math.round(n).toLocaleString("fr-FR")} €`;
    const gainOf = (m, rank) => (m < C.seuil ? C.forfait : Math.min(C.plafond, (m * (rank > C.apres ? C.tauxPro : C.taux)) / 100));
    const range = $('input[type="range"]', sim);
    const out = $("[data-simu-amount]", sim);
    const res = $("[data-simu-gain]", sim);
    const rule = $("[data-simu-rule]", sim);
    const total = $("[data-simu-total]", sim);
    const ranks = $$("[data-rank]", sim);
    let rank = 1;
    let last = "";
    const update = () => {
      const m = +range.value;
      const g = gainOf(m, rank);
      out.textContent = `${fmt(m)} HT`;
      const txt = fmt(g);
      if (txt !== last && last && !reduced) {
        res.classList.remove("bump");
        void res.offsetWidth;
        res.classList.add("bump");
      }
      res.textContent = last = txt;
      rule.textContent =
        m < C.seuil ? `À partir de 2 000 € HT` : g >= C.plafond ? `Plafond par chantier atteint` : `${rank > C.apres ? C.tauxPro : C.taux} % du montant HT`;
      // Cumul : 4 chantiers de ce montant recommandés
      const four = [1, 2, 3, 4].reduce((s, r) => s + gainOf(m, r), 0);
      total.innerHTML = `4 chantiers comme celui-ci = <strong>${fmt(four)}</strong> pour vous`;
    };
    range.addEventListener("input", update);
    ranks.forEach((b) =>
      b.addEventListener("click", () => {
        rank = +b.dataset.rank;
        ranks.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        update();
      })
    );
    update();
  });

  /* ---------- Test de zone par code postal ---------- */
  const DEPTS = { 75: "Paris", 77: "Seine-et-Marne", 78: "Yvelines", 91: "Essonne", 92: "Hauts-de-Seine", 93: "Seine-Saint-Denis", 94: "Val-de-Marne", 95: "Val-d’Oise" };
  $$("[data-zone-check]").forEach((zf) => {
    const input = $("input", zf);
    const out = $(".zone-result", zf);
    const radar = zf.closest("section")?.querySelector(".radar");
    input.addEventListener("input", () => (input.value = input.value.replace(/\D/g, "").slice(0, 5)));
    zf.addEventListener("submit", (e) => {
      e.preventDefault();
      const cp = input.value.trim();
      $$(".hit", radar || document).forEach((h) => h.classList.remove("hit"));
      out.className = "zone-result";
      if (!/^\d{5}$/.test(cp)) {
        out.textContent = "Indiquez un code postal à 5 chiffres.";
        out.classList.add("ko");
        return;
      }
      const d = cp.slice(0, 2);
      if (DEPTS[d]) {
        out.innerHTML = `✓ Bonne nouvelle : nous intervenons à ${cp} (${DEPTS[d]}). <a href="#projet" data-to-form>Demander mon devis</a>`;
        out.classList.add("ok");
        radar?.querySelector(`[data-dept="${d}"]`)?.classList.add("hit");
        // Préremplit le code postal du formulaire
        $$('input[name="postalCode"]').forEach((i) => !i.value && (i.value = cp));
      } else {
        out.innerHTML = `Ce secteur est hors de notre zone habituelle, mais <a href="${WHATSAPP}" rel="noopener">écrivez-nous</a> : on regarde ensemble.`;
        out.classList.add("ko");
      }
    });
  });

  /* ---------- Formulaire en 3 étapes + envoi WhatsApp / SMS / e-mail ---------- */
  const isValidCp = (cp) => /^\d{5}$/.test(cp);

  $$("[data-quote-form]").forEach((f) => {
    const steps = $$("[data-step]", f);
    const num = $("[data-step-num]", f);
    const barFill = $("[data-step-bar]", f);
    let current = 0;
    f.classList.add("is-stepped");

    const showError = (step, msg) => {
      const err = $(".form-error", step);
      if (!err) return;
      err.textContent = msg || "";
      err.hidden = !msg;
    };

    function go(index, { focus = true } = {}) {
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach((st, k) => (st.hidden = k !== current));
      if (num) num.textContent = String(current + 1);
      if (barFill) barFill.style.width = `${((current + 1) / steps.length) * 100}%`;
      if (!focus) return;
      const top = f.getBoundingClientRect().top;
      if (top < 80 || top > innerHeight * 0.6) f.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      const target = steps[current];
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    f.goStep = go;

    function validate(index) {
      const st = steps[index];
      if (st.dataset.step === "1" && !f.querySelector('input[name="metiers"]:checked')) {
        showError(st, "Choisissez au moins un type de travaux (ou « Autre »).");
        return false;
      }
      showError(st, "");
      return true;
    }

    $$("[data-next]", f).forEach((b) => b.addEventListener("click", () => validate(current) && go(current + 1)));
    $$("[data-prev]", f).forEach((b) => b.addEventListener("click", () => go(current - 1)));
    f.addEventListener("change", (e) => {
      if (e.target.name === "metiers") showError(steps[0], "");
    });
    f.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && current < steps.length - 1) {
        e.preventDefault();
        if (validate(current)) go(current + 1);
      }
    });

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const channel = e.submitter?.dataset.channel || "whatsapp";
      const data = new FormData(f);
      const name = String(data.get("name") || "").trim();
      const cp = String(data.get("postalCode") || "").trim();
      const project = String(data.get("project") || "").trim();
      const metiers = data.getAll("metiers");

      if (!validate(0)) return go(0);
      const last = steps[steps.length - 1];
      const mark = (field, bad) => field && field.setAttribute("aria-invalid", String(bad));
      mark(f.elements.name, !name);
      mark(f.elements.postalCode, !isValidCp(cp));
      const problems = [];
      if (!name) problems.push("votre nom");
      if (!isValidCp(cp)) problems.push("un code postal à 5 chiffres");
      if (problems.length) {
        showError(last, "Merci d’indiquer " + problems.join(" et ") + ".");
        f.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      showError(last, "");

      const lines = ["Bonjour Nexora Travaux, je souhaite vous parler de mon projet."];
      [["Nom", name], ["Code postal", cp], ["Travaux", metiers.join(", ")], ["Mon projet", project]].forEach(
        ([k, v]) => v && lines.push(`${k} : ${v}`)
      );
      const text = encodeURIComponent(lines.join("\n"));
      const subject = encodeURIComponent(`Demande de devis${metiers.length ? " – " + metiers.join(", ") : ""}`);
      const urls = {
        whatsapp: `${WHATSAPP}?text=${text}`,
        sms: `sms:${PHONE}?&body=${text}`,
        email: `mailto:${EMAIL}?subject=${subject}&body=${text}`,
      };
      location.assign(urls[channel] || urls.whatsapp);
    });

    f.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false");
    });

    go(0, { focus: false });
  });

  // Masque les barres flottantes tant qu’un formulaire est visible
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      body.classList.toggle("form-in-view", seen.size > 0);
    }, { threshold: 0.15 });
    $$("[data-quote-form], [data-referral-form]").forEach((f) => io.observe(f));
  }

  // Tous les boutons « devis » de la page mènent directement au formulaire,
  // à l’étape 2 si des métiers sont déjà choisis.
  const homeForm = $("#projet [data-quote-form]");
  if (homeForm) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest('.project-bar a, [data-to-form], a[href="#projet"]');
      if (!link) return;
      e.preventDefault();
      setMenu(false);
      // Bouton « Je veux ce projet » : présélectionne les métiers du projet
      if (link.dataset.project) {
        const list = link.dataset.project.split(',');
        $$('input[name="metiers"]', homeForm).forEach((i) => (i.checked = list.includes(i.dataset.metier)));
        refreshSelection();
      }
      const hasMetier = !!homeForm.querySelector('input[name="metiers"]:checked');
      $("#projet").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      homeForm.goStep(hasMetier ? 1 : 0, { focus: false });
    });
  }
})();
