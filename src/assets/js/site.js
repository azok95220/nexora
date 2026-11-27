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
          const k = clamp((t - t0) / 800);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0";
        requestAnimationFrame(tick);
      })
    , { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Scènes pilotées par le défilement (une seule boucle, sans relecture de la mise en page) ---------- */
  const hero = $("[data-hero]");
  const progress = $(".scroll-progress");
  let lastY = scrollY;
  let L = {}; // positions mises en cache, recalculées seulement au redimensionnement

  function measure() {
    L = {
      max: doc.scrollHeight - innerHeight,
      vh: innerHeight,
      heroH: hero ? hero.offsetHeight : 0,
    };
  }

  let lastHp = -1, lastSp = -1;
  function frame() {
    ticking = false;
    const y = scrollY;
    const sp = L.max > 0 ? Math.round((y / L.max) * 500) / 500 : 0;
    if (sp !== lastSp) progress?.style.setProperty("--sp", (lastSp = sp));

    // En-tête : masqué en descendant, réapparaît en remontant
    header?.classList.toggle("scrolled", y > 10);
    if (!body.classList.contains("nav-open")) header?.classList.toggle("hide", y > 600 && y > lastY + 2);
    if (y < lastY - 2) header?.classList.remove("hide");
    body.classList.toggle("show-float", y > L.vh * 0.7);
    lastY = y;

    if (reduced) return;
    if (hero && y < L.heroH + 50) {
      const hp = Math.round(clamp(y / L.heroH) * 200) / 200;
      if (hp !== lastHp) hero.style.setProperty("--hp", (lastHp = hp));
    }
  }
  let ticking = false;
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  const remeasure = () => {
    measure();
    request();
  };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", remeasure, { passive: true });
  addEventListener("load", remeasure);
  document.fonts?.ready.then(remeasure);
  measure();
  frame();

  /* ---------- Effets au pointeur (souris uniquement) ---------- */
  if (finePointer && !reduced) {
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
    updateBar();
  }

  // Affiche la barre « projet » seulement hors du configurateur et du formulaire
  const cfgSection = $("#metiers");
  function updateBar() {
    if (!bar) return;
    const n = lastCount > 0 ? lastCount : 0;
    const c = cfgSection?.getBoundingClientRect();
    const cfgVisible = c && c.bottom > innerHeight * 0.5 && c.top < innerHeight * 0.5;
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
  let barTick = false;
  addEventListener("scroll", () => {
    if (!bar || barTick) return;
    barTick = true;
    requestAnimationFrame(() => {
      barTick = false;
      updateBar();
    });
  }, { passive: true });

  // Page devis : pré-sélection via ?metier=plomberie
  const pre = new URLSearchParams(location.search).get("metier");
  if (pre && chip(pre)) chip(pre).checked = true;
  refreshSelection();

  /* ---------- Avant / après : onglets + curseur, défilement automatique ---------- */
  $$("[data-transfo]").forEach((sec) => {
    const tabs = $$('[role="tab"]', sec);
    const panels = $$('[role="tabpanel"]', sec);
    let active = 0;
    let auto = !reduced; // tourne tout seul jusqu’à la première interaction
    let inView = false;
    let timer = 0;
    let raf = 0;

    const show = (i) => {
      active = i;
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach((p, k) => p.toggleAttribute("data-hidden", k !== i));
      panels[i].querySelectorAll(".reveal").forEach((r) => r.classList.add("in"));
    };

    // Balayage du curseur : montre l’avant puis l’après
    const sweep = (panel, done) => {
      const ba = $(".ba", panel);
      const range = $(".ba-range", ba);
      const t0 = performance.now();
      const step = (t) => {
        if (!auto) return;
        const k = clamp((t - t0) / 2000);
        const pos = 50 + Math.sin(k * Math.PI * 2) * 36;
        ba.style.setProperty("--pos", `${pos.toFixed(1)}%`);
        range.value = String(Math.round(pos));
        if (k < 1) raf = requestAnimationFrame(step);
        else done?.();
      };
      raf = requestAnimationFrame(step);
    };

    const cycle = () => {
      if (!auto || !inView) return;
      sweep(panels[active], () => {
        timer = setTimeout(() => {
          if (!auto || !inView) return;
          show((active + 1) % panels.length);
          cycle();
        }, 800);
      });
    };
    const stopAuto = () => {
      auto = false;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => {
        stopAuto();
        show(i);
      });
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        stopAuto();
        const n = (i + d + tabs.length) % tabs.length;
        show(n);
        tabs[n].focus();
      });
    });
    $$(".ba", sec).forEach((ba) => {
      const range = $(".ba-range", ba);
      range.addEventListener("pointerdown", stopAuto, { passive: true });
      range.addEventListener("input", () => {
        stopAuto();
        ba.style.setProperty("--pos", `${range.value}%`);
      });
    });

    if ("IntersectionObserver" in window && auto) {
      new IntersectionObserver((en) => {
        const was = inView;
        inView = en[0].isIntersecting;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        if (inView && !was) timer = setTimeout(cycle, 300);
      }, { threshold: 0.25 }).observe(sec);
    }
  });

  /* ---------- Scène des artisans : se joue toute seule à l’écran, sans bloquer le défilement ---------- */
  $$("[data-story]").forEach((st) => {
    if (reduced) return;
    const play = () => {
      st.classList.remove("play", "done");
      void st.offsetWidth;
      st.classList.add("play");
    };
    st.addEventListener("animationend", (e) => e.animationName === "storyK" && st.classList.add("done"));
    $("[data-story-replay]", st)?.addEventListener("click", play);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        play();
      }, { threshold: 0.4 });
      io.observe($(".story-stage", st));
    } else play();
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
      presets.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.preset === m)));
    };
    // Projets types : règlent le curseur d'un clic
    const presets = $$("[data-preset]", sim);
    presets.forEach((b) =>
      b.addEventListener("click", () => {
        range.value = b.dataset.preset;
        update();
      })
    );
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

  // « Recommander quelqu’un » : remonte au formulaire de parrainage et place le curseur
  $$("[data-ref-focus]").forEach((a) =>
    a.addEventListener("click", (e) => {
      const field = $("#ref-name");
      if (!field) return;
      e.preventDefault();
      field.closest(".form-card")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      setTimeout(() => field.focus({ preventScroll: true }), reduced ? 0 : 450);
    })
  );

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
      // Rappel des travaux choisis en haut de la dernière étape
      const recap = $("[data-selection]", f);
      if (recap) {
        const chosen = $$('input[name="metiers"]:checked', f).map((i) => i.value);
        recap.textContent = chosen.length ? `Travaux : ${chosen.join(", ")}` : "";
        recap.hidden = !chosen.length;
      }
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
    // Projets types : un bouton coche les métiers correspondants
    const picks = $$("[data-pick]", f);
    const boxes = $$('input[name="metiers"]', f);
    const syncPicks = () => {
      const on = new Set(boxes.filter((i) => i.checked).map((i) => i.dataset.metier));
      picks.forEach((b) => {
        const list = b.dataset.pick.split(",");
        b.setAttribute("aria-pressed", String(list.length === on.size && list.every((s) => on.has(s))));
      });
    };
    f.syncPicks = syncPicks;
    picks.forEach((b) =>
      b.addEventListener("click", () => {
        const list = b.dataset.pick.split(",");
        const wasOn = b.getAttribute("aria-pressed") === "true";
        boxes.forEach((i) => (i.checked = !wasOn && list.includes(i.dataset.metier)));
        f.dispatchEvent(new Event("change", { bubbles: true }));
      })
    );
    f.addEventListener("change", (e) => {
      if (e.target === f || e.target.name === "metiers") {
        showError(steps[0], "");
        syncPicks();
      }
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

  /* ---------- Panneau de devis : s’ouvre par-dessus la page depuis tous les boutons « devis » ---------- */
  const sheet = $("#quote-sheet");
  const sheetForm = sheet && $("[data-quote-form]", sheet);
  const onDevisPage = location.pathname.startsWith("/devis");
  if (sheet && sheetForm && typeof sheet.showModal === "function") {
    const sheetBoxes = $$('input[name="metiers"]', sheetForm);
    const closeSheet = () => {
      if (!sheet.open) return;
      sheet.classList.add("closing");
      setTimeout(() => {
        sheet.classList.remove("closing");
        sheet.close();
      }, reduced ? 0 : 220);
    };
    sheet.addEventListener("close", () => doc.classList.remove("sheet-open"));
    sheet.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeSheet();
    });
    // Clic sur le fond assombri = fermer
    sheet.addEventListener("click", (e) => e.target === sheet && closeSheet());
    $$("[data-sheet-close]", sheet).forEach((b) => b.addEventListener("click", closeSheet));

    function openSheet(preset) {
      setMenu(false);
      if (preset) sheetBoxes.forEach((i) => (i.checked = preset.includes(i.dataset.metier)));
      sheetForm.syncPicks?.();
      const has = sheetBoxes.some((i) => i.checked);
      // Métiers déjà choisis : on passe directement aux coordonnées
      sheetForm.goStep(preset && has ? 1 : 0, { focus: false });
      if (!sheet.open) sheet.showModal();
      doc.classList.add("sheet-open");
      $(".sheet-body", sheet).scrollTop = 0;
    }

    document.addEventListener("click", (e) => {
      const link = e.target.closest('.project-bar a, [data-to-form], a[href="#projet"], a[href^="/devis/"]');
      if (!link || sheet.contains(link)) return;
      // Sur la page devis, le formulaire est déjà à l’écran
      if (onDevisPage && !link.matches("[data-to-form]")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      let preset = null;
      const href = link.getAttribute("href") || "";
      const one = href.includes("?metier=") ? new URLSearchParams(href.split("?")[1]).get("metier") : null;
      if (link.dataset.project) preset = link.dataset.project.split(",");
      else if (one) preset = [one];
      else if (form && form !== sheetForm) {
        // Reprend ce qui a été choisi dans le configurateur de la page
        const chosen = $$('input[name="metiers"]:checked', form).map((i) => i.dataset.metier);
        if (chosen.length) preset = chosen;
      }
      openSheet(preset);
    });
  }
})();
