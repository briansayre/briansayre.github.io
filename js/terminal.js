// Boot/typing animation for the terminal. Drives the existing DOM
// (.cmd / .prompt / .out / .ls / .contact) so the HTML stays the source of
// truth. Gated on the `js-boot` class (set by an inline head script when JS is
// on); if that class is absent we do nothing and the page shows in full.
(function () {
    var root = document.documentElement;
    if (!root.classList.contains("js-boot")) return;

    var body = document.querySelector(".term .body");
    if (!body) {
        root.classList.remove("js-boot");
        return;
    }

    // Build the boot sequence: each command line paired with its output block.
    var steps = [];
    var cmds = Array.prototype.slice.call(body.querySelectorAll(".cmd"));
    cmds.forEach(function (cmd) {
        var prompt = cmd.querySelector(".prompt");
        var text = prompt ? prompt.textContent.trim() : "";
        var output = cmd.nextElementSibling;
        if (output && output.classList.contains("cmd")) output = null;
        if (prompt) prompt.textContent = ""; // clear (still hidden via .js-boot)
        steps.push({ cmd: cmd, prompt: prompt, text: text, output: output });
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

    function reveal(el) {
        if (el) el.classList.add("is-shown");
    }

    async function run() {
        for (var i = 0; i < steps.length; i++) {
            var s = steps[i];
            reveal(s.cmd); // fade the prompt line in
            if (s.text) {
                s.cmd.classList.add("typing");
                await wait(120);
                await typeInto(s.prompt, s.text);
                await wait(240);
                s.cmd.classList.remove("typing");
            }
            if (s.output) {
                reveal(s.output);
                await wait(380);
            }
        }
        root.classList.remove("js-boot"); // settle into the normal state
    }

    run();
})();
