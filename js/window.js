// Makes the terminal feel like a real window: drag it by the title bar, and
// the three stoplight buttons close (red → reboot), minimize (yellow), and
// maximize (green). Uses Pointer Events so mouse + touch work the same.
(function () {
    var term = document.querySelector(".term");
    var bar = term && term.querySelector(".bar");
    if (!term || !bar) return;

    // ---- Drag the window by its title bar (clamped to the viewport) ----
    var offsetX = 0,
        offsetY = 0,
        startX = 0,
        startY = 0,
        baseLeft = 0,
        baseTop = 0,
        termW = 0,
        termH = 0,
        lastX = 0,
        lastY = 0,
        dragging = false,
        moved = false;
    var MARGIN = 4; // keep at least this many px on-screen on every side

    function setOffset(x, y) {
        term.style.setProperty("--tx", x + "px");
        term.style.setProperty("--ty", y + "px");
    }

    function clamp(value, lo, hi) {
        return lo > hi ? value : Math.max(lo, Math.min(hi, value));
    }

    bar.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // Don't drag from the controls, or when the window is maximized.
        if (e.target.closest(".dot") || e.target.closest(".theme-toggle")) return;
        if (term.classList.contains("maximized")) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        // Untransformed position, so we can clamp against the viewport.
        var rect = term.getBoundingClientRect();
        baseLeft = rect.left - offsetX;
        baseTop = rect.top - offsetY;
        termW = rect.width;
        termH = rect.height;
        lastX = offsetX;
        lastY = offsetY;
        try {
            bar.setPointerCapture(e.pointerId);
        } catch (err) {}
        term.classList.add("dragging");
    });

    bar.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        var vw = document.documentElement.clientWidth;
        var vh = document.documentElement.clientHeight;
        lastX = clamp(offsetX + dx, MARGIN - baseLeft, vw - MARGIN - termW - baseLeft);
        lastY = clamp(offsetY + dy, MARGIN - baseTop, vh - MARGIN - termH - baseTop);
        setOffset(lastX, lastY);
    });

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        term.classList.remove("dragging");
        offsetX = lastX;
        offsetY = lastY;
        // A click (no real movement) on a minimized window restores it.
        if (!moved && term.classList.contains("minimized")) {
            term.classList.remove("minimized");
        }
    }
    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);

    // ---- Stoplight buttons ----
    function onClick(selector, fn) {
        var el = bar.querySelector(selector);
        if (!el) return;
        el.addEventListener("click", function (e) {
            e.stopPropagation();
            fn();
        });
    }

    // Green — toggle maximized
    onClick(".dot.g", function () {
        term.classList.remove("minimized");
        term.classList.toggle("maximized");
    });

    // Yellow — toggle minimized (collapse to the title bar)
    onClick(".dot.y", function () {
        term.classList.remove("maximized");
        term.classList.toggle("minimized");
    });

    // Red — "close": shrink/fade away, then reboot with the typing animation
    onClick(".dot.r", function () {
        if (term.classList.contains("closing")) return;
        term.classList.add("closing");
        setTimeout(function () {
            term.classList.remove("maximized", "minimized");
            offsetX = 0;
            offsetY = 0;
            setOffset(0, 0);
            if (typeof window.__rebootTerminal === "function") {
                window.__rebootTerminal();
            }
            term.classList.remove("closing");
        }, 450);
    });
})();
