/* "What's in your stack?" (owner, 2026-11-16: "optimize traffic and people to me", "make it addicting").
   Paste cert numbers, watch a little stack of slab labels build, then one tap copies a ready message and opens the
   Discord invite. Nothing is sent anywhere: the numbers stay in the browser until the seller pastes them. */
(function () {
  var box = document.querySelector("[data-pricer]");
  if (!box) return;
  var area = box.querySelector("textarea"), list = box.querySelector(".stack"), count = box.querySelector(".stack-count");
  var send = document.querySelector("[data-send]"), note = document.querySelector(".pricer-note");
  var label = send.textContent, shown = [];
  box.hidden = false;

  // (part525a, 2026-11-17) Whole numbers only, never cut: 5 to 15 digits, the quote bot's own range
  // (nlchat._BARE_CERT_RE). CGC's certs are 13 digits now ("1401005496188"); the old 7-10 copied only the first 10,
  // a different cert. "06040981" and "6040981" are one slab, the way the bot counts them. A longer run is two certs
  // typed together: it stays out of the stack and the copy, and the note says to add a space.
  function certs() {
    var seen = {}, out = [];
    (area.value.match(/\d+/g) || []).forEach(function (n) {
      if (n.length < 5 || n.length > 15) return;
      var key = n.replace(/^0+/, "") || n;
      if (!seen[key]) { seen[key] = 1; out.push(n); }
    });
    return out.slice(0, 200);
  }
  function plural(n) { return n === 1 ? "1 slab" : n + " slabs"; }

  function draw() {
    var now = certs();
    // keep the tiles already there; new ones drop onto the stack
    list.textContent = "";
    now.forEach(function (n, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="c"></span>';
      li.querySelector(".c").textContent = n;
      if (shown.indexOf(n) < 0) li.className = "new";
      li.style.setProperty("--i", String(i % 12));
      list.appendChild(li);
    });
    shown = now;
    count.textContent = now.length ? plural(now.length) + " in your stack" : "No slabs yet";
    count.classList.toggle("has", now.length > 0);
    send.textContent = now.length ? "Copy " + plural(now.length) + " and open Discord" : label;
    note.textContent = /\d{16,}/.test(area.value)
      ? "One number is too long. Two certs together? Put a space between them." : "";
  }
  area.addEventListener("input", draw);

  send.addEventListener("click", function () {
    var now = certs();
    if (!now.length) return;                       // nothing typed: the plain Discord link
    var text = "Hi! Can I get a price on " + (now.length === 1 ? "this slab" : "these " + now.length + " slabs") +
               "?\n" + now.join("\n");
    send.target = "_blank";
    var done = function () { note.textContent = "Copied. Open a ticket and paste it in."; };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
      else { area.value = text; area.select(); document.execCommand("copy"); done(); }
    } catch (err) { /* the link still opens Discord */ }
  });
  draw();
})();
