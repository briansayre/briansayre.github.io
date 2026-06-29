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

    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function typeInto(prompt, text) {
        return new Promise(function (resolve) {
            var i = 0;
            (function tick() {
                if (i >= text.length) {
                    resolve();
                    return;
                }
                prompt.textContent += text.charAt(i);
                i += 1;
                setTimeout(tick, 38 + Math.random() * 34);
            })();
        });
    }

    async function run() {
        for (var i = 0; i < steps.length; i++) {
            var s = steps[i];
            s.cmd.classList.add("is-shown");
            if (s.text) {
                s.cmd.classList.add("typing");
                await wait(120);
                await typeInto(s.prompt, s.text);
                await wait(240);
                s.cmd.classList.remove("typing");
            }
            if (s.output) {
                s.output.classList.add("is-shown");
                await wait(380);
            }
        }
        root.classList.remove("js-boot"); // settle into the normal state
    }

    // Re-hide everything, clear the typed text, then play the sequence again.
    function boot() {
        root.classList.add("js-boot");
        steps.forEach(function (s) {
            s.cmd.classList.remove("is-shown", "typing");
            if (s.output) s.output.classList.remove("is-shown");
            if (s.prompt) s.prompt.textContent = "";
        });
        run();
    }

    window.__rebootTerminal = boot;
    boot();
})();
