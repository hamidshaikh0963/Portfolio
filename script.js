/* ========================= */
/* SAFE STORAGE */
/* ========================= */

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        /* storage blocked - ignore */
    }
}


/* ========================= */
/* THEME TOGGLE */
/* ========================= */

(function initTheme() {

    const icon = document.getElementById("theme-icon");
    const toggle = document.getElementById("theme-toggle");

    function syncIcon() {
        if (!icon) return;
        const isLight = document.body.classList.contains("light-mode");
        icon.classList.toggle("fa-sun", isLight);
        icon.classList.toggle("fa-moon", !isLight);
    }

    syncIcon();

    if (!toggle) return;

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        writeStorage("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
        syncIcon();
    });

})();


/* ========================= */
/* INTRO */
/* ========================= */

(function initIntro() {

    const intro = document.getElementById("intro");

    if (!intro) return;

    const root = document.documentElement;
    let finished = false;
    let timer;

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        document.removeEventListener("keydown", finish);
        root.classList.remove("intro-wait", "intro-active");
        intro.classList.add("intro-exit");
        setTimeout(() => intro.remove(), 1000);
    }

    function start() {
        if (finished || timer) return;
        root.classList.remove("intro-wait");
        timer = setTimeout(finish, 3400);
    }

    // wait for the signature font (max 1s) so letters don't swap mid-animation
    const fontReady = document.fonts && document.fonts.load
        ? document.fonts.load("160px 'Great Vibes'")
        : Promise.resolve();

    Promise.race([fontReady, new Promise(r => setTimeout(r, 1000))]).then(start, start);

    intro.addEventListener("click", finish);
    document.addEventListener("keydown", finish);

})();


/* ========================= */
/* NAVBAR */
/* ========================= */

(function initNavbar() {

    const nav = document.querySelector(".navbar");
    const toggle = document.getElementById("menu-toggle");

    if (!nav) return;

    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!toggle) return;

    function setOpen(open) {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", e => { if (!nav.contains(e.target)) setOpen(false); });

})();


/* ========================= */
/* TYPING ROLE */
/* ========================= */

(function initTyping() {

    const el = document.getElementById("typing");

    if (!el) return;

    const words = JSON.parse(el.dataset.words || "[]");

    if (!words.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    function tick() {

        const word = words[wordIndex];

        charIndex += deleting ? -1 : 1;
        el.textContent = word.slice(0, charIndex);

        let delay = deleting ? 45 : 85;

        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 350;
        }

        setTimeout(tick, delay);

    }

    const introDelay = document.getElementById("intro") ? 3600 : 0;
    setTimeout(tick, 2200 + introDelay);

})();


/* ========================= */
/* TIMELINE PROGRESS */
/* ========================= */

(function initTimeline() {

    const timeline = document.querySelector(".timeline");
    const progress = document.querySelector(".timeline-progress");

    if (!timeline || !progress) return;

    const items = timeline.querySelectorAll(".timeline-item");

    function update() {
        const rect = timeline.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        const percent = Math.min(Math.max((mid - rect.top) / rect.height, 0), 1) * 100;
        progress.style.height = percent + "%";
        items.forEach(item => item.classList.toggle("active", item.getBoundingClientRect().top < mid));
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

})();


/* ========================= */
/* SCROLL REVEAL */
/* ========================= */

(function initReveal() {

    if (!("IntersectionObserver" in window)) return;

    const selectors = [
        ".page-header", ".tech-section > *", ".project-card", ".info-card", ".photo-card",
        ".timeline-item", ".contact-main", ".contact-row", ".section-cta",
        ".footer-cta", ".footer-quote", ".footer-grid > *"
    ];

    const items = document.querySelectorAll(selectors.join(","));

    items.forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.className === el.className);
        el.style.setProperty("--delay", Math.min(Math.max(siblings.indexOf(el), 0), 6) * 0.08 + "s");
        el.classList.add("reveal");
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(el => observer.observe(el));

})();


/* ========================= */
/* PROJECT CARD SPOTLIGHT */
/* ========================= */

document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - rect.left + "px");
        card.style.setProperty("--my", e.clientY - rect.top + "px");
    });
});


/* ========================= */
/* FOOTER YEAR */
/* ========================= */

document.querySelectorAll(".year").forEach(el => (el.textContent = new Date().getFullYear()));
