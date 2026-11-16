/* The slab at the top of the page (owner, 2026-11-16: "the floating look funny"; then "why is it angled" and "when u
   flip it it becomes cash"). It stands straight, face on, and turns over cleanly to show the back (the cash) when
   tapped, when Enter or Space is pressed on it, or when its button is pressed. No lean, no spinning on its own. It
   does nothing while off screen. */
(function () {
  var stage = document.querySelector("[data-slab]");
  if (!stage) return;
  var slab = stage.querySelector(".slab3d"), button = stage.querySelector(".flip");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var REST_Y = 0, REST_X = 0;     // straight, face on (owner: "why is it angled")
  var K = 70, C = 16.7;           // a stiff, fully damped spring: a turn takes about half a second, no wobble
  var side = 0;                   // 0 = front, 1 = back
  var ry = REST_Y, rx = REST_X, vy = 0, vx = 0;
  var visible = true, prev = 0, settled = false;

  function paint() {
    slab.style.setProperty("--ry", ry.toFixed(2) + "deg");
    slab.style.setProperty("--rx", rx.toFixed(2) + "deg");
    var a = ry * Math.PI / 180;
    slab.style.setProperty("--lit", (0.65 + 0.35 * Math.abs(Math.cos(a))).toFixed(3));   // a little darker side-on
    slab.style.setProperty("--edge", Math.abs(Math.sin(a)).toFixed(3));
  }

  function step(dt) {
    var ty = REST_Y + side * 180, tx = REST_X;
    vy += (K * (ty - ry) - C * vy) * dt; ry += vy * dt;
    vx += (K * (tx - rx) - C * vx) * dt; rx += vx * dt;
    return Math.abs(ty - ry) < 0.05 && Math.abs(vy) < 0.05 && Math.abs(tx - rx) < 0.05 && Math.abs(vx) < 0.05;
  }

  function frame(t) {
    var dt = prev ? Math.min(0.04, (t - prev) / 1000) : 0;
    prev = t;
    if (visible && !document.hidden) {
      settled = step(dt);
      paint();
    }
    if (!settled) requestAnimationFrame(frame);
    else prev = 0;                 // stop the loop until something moves it again
  }
  function wake() { if (settled) { settled = false; requestAnimationFrame(frame); } }

  function turn() {
    side = 1 - side;
    button.textContent = side ? (button.dataset.back || "See the front") : (button.dataset.to || "See the back");
    button.setAttribute("aria-pressed", side ? "true" : "false");
    wake();
  }

  slab.addEventListener("click", turn);
  button.addEventListener("click", turn);
  slab.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) wake(); }).observe(stage);
  }
  if (still) K = 400, C = 40;      // Reduce Motion: the turn is all but instant
  stage.classList.add("live");
  paint();
  requestAnimationFrame(frame);
})();
