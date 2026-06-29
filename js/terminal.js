// Boot/typing animation for the terminal. Drives the existing DOM
// (.cmd / .prompt / .out / .ls / .contact) so the HTML stays the source of
// truth. The `js-boot` class (set by an inline head script when JS is on) hides
// the content before first paint; if JS is off the page shows in full.
// Exposes window.__rebootTerminal so the red "close" button can replay it.
(function () {
    var root = document.documentElement;
    var body = document.querySelector(".term .body");
    if (!body) {
        root.classList.remove("js-boot");
        return;
    }

    // Capture each command line, its text, and its output block once.
    var steps = [];
    Array.prototype.slice.call(body.querySelectorAll(".cmd")).forEach(function (cmd) {
        var prompt = cmd.querySelector(".prompt");
        var output = cmd.nextElementSibling;
        if (output && output.classList.contains("cmd")) output = null;
        steps.push({
            cmd: cmd,
            prompt: prompt,
            text: prompt ? prompt.textContent.trim() : "",
            output: output,
        });
    });

    // Generation token: each boot() bumps it so any still-running prior boot
    // (its setTimeout/await chain) sees a stale id and bails — no two typing
    // loops ever run at once, even if the user spams the red "close" button.
    var bootId = 0;

    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function typeInto(prompt, text, myId) {
        return new Promise(function (resolve) {
            var i = 0;
            (function tick() {
                if (myId !== bootId || i >= text.length) {
                    resolve();
                    return;
                }
                prompt.textContent += text.charAt(i);
                i += 1;
                setTimeout(tick, 38 + Math.random() * 34);
            })();
        });
    }

    async function run(myId) {
        for (var i = 0; i < steps.length; i++) {
            if (myId !== bootId) return; // superseded by a newer boot()
            var s = steps[i];
            s.cmd.classList.add("is-shown");
            if (s.text) {
                s.cmd.classList.add("typing");
                await wait(120);
                await typeInto(s.prompt, s.text, myId);
                if (myId !== bootId) return;
                await wait(240);
                s.cmd.classList.remove("typing");
            }
            if (s.output) {
                s.output.classList.add("is-shown");
                await wait(380);
            }
        }
        if (myId !== bootId) return;
        root.classList.remove("js-boot"); // settle into the normal state
    }

    // Re-hide everything, clear the typed text, then play the sequence again.
    function boot() {
        var myId = ++bootId; // invalidate any in-flight run()
        root.classList.add("js-boot");
        steps.forEach(function (s) {
            s.cmd.classList.remove("is-shown", "typing");
            if (s.output) s.output.classList.remove("is-shown");
            if (s.prompt) s.prompt.textContent = "";
        });
        run(myId);
    }

    window.__rebootTerminal = boot;
    boot();
})();
