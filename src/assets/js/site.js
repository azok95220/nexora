(() => {
  "use strict";
  const PHONE = "+33605572482";
  const WHATSAPP = "https://wa.me/33605572482";
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
      bar.innerHTML = '<span class="project-count"></span><a class="btn btn-primary" href="#projet">Décrire mon projet</a>';
      document.body.appendChild(bar);
    }
    const n = checked.length;
    bar.querySelector(".project-count").innerHTML =
      `<strong>${n}</strong> métier${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`;
    const formVisible = form && form.getBoundingClientRect().top < window.innerHeight * 0.8;
    bar.classList.toggle("visible", n > 0 && !formVisible);
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

  /* ---------- Envoi : WhatsApp ou SMS ---------- */
  document.querySelectorAll("[data-quote-form]").forEach((f) => {
    const error = f.querySelector(".form-error");

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const channel = e.submitter?.dataset.channel || "whatsapp";
      const data = new FormData(f);
      const name = String(data.get("name") || "").trim();
      const cp = String(data.get("postalCode") || "").trim();
      const project = String(data.get("project") || "").trim();
      const metiers = data.getAll("metiers");

      const problems = [];
      const mark = (field, bad) => field && field.setAttribute("aria-invalid", String(bad));
      mark(f.elements.name, !name);
      mark(f.elements.postalCode, !/^\d{5}$/.test(cp));
      mark(f.elements.project, !project);
      if (!name) problems.push("votre nom");
      if (!/^\d{5}$/.test(cp)) problems.push("un code postal à 5 chiffres");
      if (!project) problems.push("une description de votre projet");
      if (problems.length) {
        error.textContent = "Merci d’indiquer " + problems.join(", ") + ".";
        error.hidden = false;
        f.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      error.hidden = true;

      const lines = ["Bonjour Nexora Travaux, je souhaite vous parler de mon projet."];
      [["Nom", name], ["Code postal", cp], ["Travaux", metiers.join(", ")], ["Mon projet", project]].forEach(
        ([k, v]) => v && lines.push(`${k} : ${v}`)
      );
      const text = encodeURIComponent(lines.join("\n"));
      window.location.assign(
        channel === "sms" ? `sms:${PHONE}?&body=${text}` : `${WHATSAPP}?text=${text}`
      );
    });

    f.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false");
    });
  });

})();
