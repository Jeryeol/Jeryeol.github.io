/* Side menu that doubles as the page scrollbar.
   - Click an item: smooth-scroll to that section
   - Scroll the page: the glowing thumb follows, the current section lights up
   - Drag the thumb (or click the rail): scroll the page */
function initSideMenu() {
    const SECTIONS = [
        { label: "About Me",      find: () => document.getElementById("about"),    pos: 12 },
        { label: "Featured Work", find: () => document.getElementById("projects"), pos: 50 },
        // Works with the current id="Hire Me" and with a cleaner id="hire-me"
        { label: "Hire Me",       find: () => document.getElementById("hire-me") || document.getElementById("Hire Me"), pos: 88 }
    ];

    const menu = document.createElement("nav");
    menu.className = "side-menu";
    menu.setAttribute("aria-label", "Page sections");

    const rail = document.createElement("div");
    rail.className = "sm-rail";
    const thumb = document.createElement("div");
    thumb.className = "sm-thumb";
    rail.appendChild(thumb);
    menu.appendChild(rail);

    const items = SECTIONS.map((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sm-item";
        btn.style.top = s.pos + "%";
        btn.title = s.label;
        btn.innerHTML = '<span class="sm-label">' + s.label + '</span><span class="sm-dot"></span>';
        btn.addEventListener("click", () => {
            const el = s.find();
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        menu.appendChild(btn);
        return btn;
    });

    document.body.appendChild(menu);

    function maxScroll() {
        return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }

    function update() {
        const max = maxScroll();
        const y = window.scrollY;
        const frac = Math.min(1, Math.max(0, y / max));

        const travel = rail.clientHeight - thumb.offsetHeight;
        thumb.style.top = frac * travel + "px";

        // Active section = last one whose top has passed 40% of the viewport
        let active = -1;
        SECTIONS.forEach((s, i) => {
            const el = s.find();
            if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) active = i;
        });
        if (y >= max - 5) active = SECTIONS.length - 1;
        items.forEach((b, i) => b.classList.toggle("active", i === active));
    }

    // Dragging / clicking the rail
    function scrollToPointer(e) {
        const r = rail.getBoundingClientRect();
        const frac = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        window.scrollTo({ top: frac * maxScroll(), behavior: "auto" });
    }

    rail.addEventListener("pointerdown", (e) => {
        rail.setPointerCapture(e.pointerId);
        rail.classList.add("dragging");
        scrollToPointer(e);
    });
    rail.addEventListener("pointermove", (e) => {
        if (rail.classList.contains("dragging")) scrollToPointer(e);
    });
    const stopDrag = (e) => {
        rail.classList.remove("dragging");
        if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
    };
    rail.addEventListener("pointerup", stopDrag);
    rail.addEventListener("pointercancel", stopDrag);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
}

// Wait for <body> to exist, so this works even when the script is placed in <head>
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSideMenu);
} else {
    initSideMenu();
}
