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
        // When the window is larger than the viewport on an axis the bounds
        // invert (lo > hi); clamp to [min, max] so it can pan but never slides
        // fully off-screen.
        var min = Math.min(lo, hi);
        var max = Math.max(lo, hi);
        return Math.max(min, Math.min(max, value));
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

    // ---- FLIP: animate a geometry change that CSS can't transition ----
    // Switching .term to position:fixed/inset:8px (maximize) or back to the
    // centered flexbox box (restore) is not animatable by the declared
    // transform/max-width transition, so the window snaps. FLIP records the
    // box First, applies the mutation, measures it Last, Inverts the delta as
    // an instant transform, then Plays by clearing the transform so the
    // stylesheet's 0.3s transition carries it to its natural state.
    function flip(mutate) {
        var first = term.getBoundingClientRect();
        mutate();
        var last = term.getBoundingClientRect(); // forces sync layout
        // Anchor the top-left corner — the terminal's content sits at the
        // top-left, so growing the right and bottom edges out from there reads
        // most naturally.
        var dx = first.left - last.left;
        var dy = first.top - last.top;
        var sx = last.width === 0 ? 1 : first.width / last.width;
        var sy = last.height === 0 ? 1 : first.height / last.height;
        // Invert: jump back to where it visually was, with no transition.
        term.style.transition = "none";
        term.style.transformOrigin = "top left";
        term.style.transform =
            "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")";
        void term.offsetWidth; // force reflow so the invert sticks
        // Play: hand control back to the stylesheet transition + CSS state.
        requestAnimationFrame(function () {
            term.style.transition = "";
            term.style.transform = "";
        });
        // Once the transform settles, drop the custom origin so the
        // center-origin .closing scale isn't affected later.
        term.addEventListener("transitionend", function onEnd(e) {
            if (e.propertyName !== "transform") return;
            term.style.transformOrigin = "";
            term.removeEventListener("transitionend", onEnd);
        });
    }

    // Green — toggle maximized
    onClick(".dot.g", function () {
        term.classList.remove("minimized");
        flip(function () {
            // Drop any drag offset so maximize is clean and restore returns to
            // center instead of snapping back to a previously-dragged corner.
            offsetX = 0;
            offsetY = 0;
            setOffset(0, 0);
            term.classList.toggle("maximized");
        });
    });

    // ---- Dock icon: a Terminal.app-style tile shown while minimized ----
    var dock = document.getElementById("dock");

    function minimize() {
        term.classList.remove("maximized");
        // Reset any drag offset so the window animates straight down on
        // minimize and reappears centered on restore.
        offsetX = 0;
        offsetY = 0;
        setOffset(0, 0);
        term.classList.add("minimized");
        if (dock) dock.classList.add("show");
    }

    function restore() {
        term.classList.remove("minimized");
        if (dock) dock.classList.remove("show");
    }

    if (dock) {
        dock.addEventListener("click", function (e) {
            e.stopPropagation();
            restore();
        });
    }

    // Yellow — minimize the whole window to the dock (toggle)
    onClick(".dot.y", function () {
        if (term.classList.contains("minimized")) {
            restore();
        } else {
            minimize();
        }
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
