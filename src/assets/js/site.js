(() => {
  "use strict";
  const PHONE = "+33605572482";
  const WHATSAPP = "https://wa.me/33605572482";
  const EMAIL = "contact@nexoratravaux.fr";
  const doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- En-tête : menu mobile + ombre au défilement ---------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const setMenu = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };
  toggle?.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  document.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Sélection des métiers (accueil) ---------- */
  const form = document.querySelector("[data-quote-form]");
  const chip = (slug) => form?.querySelector(`input[data-metier="${slug}"]`);
  const addButtons = document.querySelectorAll("[data-add]");
  let bar = null;

  function refreshSelection() {
    const checked = form ? [...form.querySelectorAll('input[name="metiers"]:checked')] : [];
    addButtons.forEach((btn) => {
      const on = !!chip(btn.dataset.add)?.checked;
      btn.setAttribute("aria-pressed", String(on));
      btn.closest(".metier-card")?.classList.toggle("selected", on);
    });
    if (!addButtons.length) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "project-bar";
      bar.setAttribute("role", "status");
      bar.innerHTML = '<span class="project-count"></span><a class="btn btn-primary" href="#home-form">Décrire mon projet</a>';
      document.body.appendChild(bar);
    }
    const n = checked.length;
    bar.querySelector(".project-count").innerHTML =
      `<strong>${n}</strong> métier${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`;
    const formVisible = form && form.getBoundingClientRect().top < window.innerHeight * 0.8;
    const show = n > 0 && !formVisible;
    bar.classList.toggle("visible", show);
    document.body.classList.toggle("project-on", show);
  }

  addButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const input = chip(btn.dataset.add);
      if (!input) return;
      input.checked = !input.checked;
      refreshSelection();
    })
  );
  form?.addEventListener("change", refreshSelection);
  window.addEventListener("scroll", () => bar && refreshSelection(), { passive: true });

  // Page devis : pré-sélection via ?metier=plomberie
  const pre = new URLSearchParams(location.search).get("metier");
  if (pre && chip(pre)) chip(pre).checked = true;
  refreshSelection();

  /* ---------- Parrainage : mémorise le code ?ref=… pendant 90 jours ---------- */
  const REF_KEY = "nexora_ref";
  const cleanCode = (v) => String(v || "").trim().slice(0, 40).replace(/[^\p{L}\p{N} _.-]/gu, "");
  let refCode = "";
  try {
    const fromUrl = cleanCode(new URLSearchParams(location.search).get("ref"));
    if (fromUrl) localStorage.setItem(REF_KEY, JSON.stringify({ code: fromUrl, t: Date.now() }));
    const saved = JSON.parse(localStorage.getItem(REF_KEY) || "null");
    if (saved && Date.now() - saved.t < 90 * 864e5) refCode = saved.code;
  } catch (e) {
    refCode = cleanCode(new URLSearchParams(location.search).get("ref"));
  }
  if (refCode) document.querySelectorAll("[data-ref-input]").forEach((i) => (i.value = refCode));

  /* ---------- Formulaire en 3 étapes + envoi WhatsApp / SMS ---------- */
  const isValidCp = (cp) => /^\d{5}$/.test(cp);

  document.querySelectorAll("[data-quote-form]").forEach((f) => {
    const steps = [...f.querySelectorAll("[data-step]")];
    const num = f.querySelector("[data-step-num]");
    const barFill = f.querySelector("[data-step-bar]");
    let current = 0;
    f.classList.add("is-stepped");

    const showError = (step, msg) => {
      const err = step.querySelector(".form-error");
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
      // Garde le haut du formulaire visible, sans faire remonter toute la page
      const top = f.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) {
        f.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

    f.querySelectorAll("[data-next]").forEach((b) =>
      b.addEventListener("click", () => validate(current) && go(current + 1))
    );
    f.querySelectorAll("[data-prev]").forEach((b) => b.addEventListener("click", () => go(current - 1)));
    f.addEventListener("change", (e) => {
      if (e.target.name === "metiers") showError(steps[0], "");
    });
    // « Entrée » dans un champ texte d’une étape intermédiaire = étape suivante
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
      const ref = cleanCode(data.get("ref"));

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
      [["Nom", name], ["Code postal", cp], ["Travaux", metiers.join(", ")], ["Mon projet", project], ["Recommandé par", ref]].forEach(
        ([k, v]) => v && lines.push(`${k} : ${v}`)
      );
      const text = encodeURIComponent(lines.join("\n"));
      const subject = encodeURIComponent(`Demande de devis${metiers.length ? " – " + metiers.join(", ") : ""}`);
      const urls = {
        whatsapp: `${WHATSAPP}?text=${text}`,
        sms: `sms:${PHONE}?&body=${text}`,
        email: `mailto:${EMAIL}?subject=${subject}&body=${text}`,
      };
      window.location.assign(urls[channel] || urls.whatsapp);
    });

    f.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false");
    });

    go(0, { focus: false });
  });

  /* ---------- Simulateur de gains ---------- */
  const euro = (n) => n.toLocaleString("fr-FR") + "\u00a0€";
  document.querySelectorAll("[data-sim]").forEach((sim) => {
    const range = sim.querySelector("[data-sim-range]");
    const bonus = sim.querySelector("[data-sim-bonus]");
    const amount = sim.querySelector("[data-sim-amount]");
    const gain = sim.querySelector("[data-sim-gain]");
    const { rate, bonus: bRate, min, max } = sim.dataset;
    const update = () => {
      const v = Number(range.value);
      const r = bonus.checked ? Number(bRate) : Number(rate);
      const g = Math.min(Number(max), Math.max(Number(min), Math.round((v * r) / 100)));
      amount.textContent = euro(v);
      gain.textContent = euro(g);
      range.style.setProperty("--p", `${((v - range.min) / (range.max - range.min)) * 100}%`);
    };
    range.addEventListener("input", update);
    bonus.addEventListener("change", update);
    update();
  });

  /* ---------- Création du lien de parrainage ---------- */
  document.querySelectorAll("[data-ref-gen]").forEach((box) => {
    const nameInput = box.querySelector("#ref-name");
    const out = box.querySelector("[data-ref-out]");
    const err = box.querySelector(".form-error");
    const linkInput = box.querySelector("[data-ref-link]");
    const show = (code, prenom) => {
      const link = `${location.origin}/?ref=${encodeURIComponent(code)}`;
      box.querySelector("[data-ref-code]").textContent = code;
      linkInput.value = link;
      box.querySelector("[data-ref-activate]").href =
        `${WHATSAPP}?text=${encodeURIComponent(`Bonjour Mickaël, je souhaite devenir apporteur Nexora.\nPrénom : ${prenom}\nMon code : ${code}`)}`;
      box.querySelector("[data-ref-share]").href =
        `https://wa.me/?text=${encodeURIComponent(`Tu as un projet de travaux ? Je te recommande Nexora Travaux : un seul contact, devis gratuit, ils s’occupent de tout. ${link}`)}`;
      out.hidden = false;
    };
    try {
      const mine = JSON.parse(localStorage.getItem("nexora_my_ref") || "null");
      if (mine) { nameInput.value = mine.prenom; show(mine.code, mine.prenom); }
    } catch (e) {}
    box.querySelector("[data-ref-create]").addEventListener("click", () => {
      const prenom = nameInput.value.trim();
      if (!prenom) { err.textContent = "Indiquez votre prénom."; err.hidden = false; nameInput.focus(); return; }
      err.hidden = true;
      const base = prenom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "AMI";
      const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let suffix = "";
      const rnd = new Uint32Array(4);
      (window.crypto || window.msCrypto).getRandomValues(rnd);
      rnd.forEach((n) => (suffix += alphabet[n % alphabet.length]));
      const code = `${base}-${suffix}`;
      try { localStorage.setItem("nexora_my_ref", JSON.stringify({ code, prenom })); } catch (e) {}
      show(code, prenom);
    });
    box.querySelector("[data-ref-copy]").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(linkInput.value); } catch (er) { linkInput.select(); document.execCommand && document.execCommand("copy"); }
      const old = btn.innerHTML;
      btn.textContent = "Copié !";
      setTimeout(() => (btn.innerHTML = old), 1600);
    });
  });

  // Masque la barre d’appel mobile tant qu’un formulaire est visible
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      document.body.classList.toggle("form-in-view", seen.size > 0);
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-quote-form]").forEach((f) => io.observe(f));
  }

  // Accueil : les métiers ajoutés depuis les cartes mènent directement à l’étape 2,
  // et tous les boutons « devis » de la page amènent directement au formulaire.
  const homeForm = document.querySelector("#projet [data-quote-form]");
  if (homeForm) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest('.project-bar a, [data-to-form], a[href="#home-form"]');
      if (!link) return;
      e.preventDefault();
      const hasMetier = !!homeForm.querySelector('input[name="metiers"]:checked');
      homeForm.scrollIntoView({ behavior: "smooth", block: "start" });
      homeForm.goStep(hasMetier ? 1 : 0, { focus: false });
    });
  }
})();
