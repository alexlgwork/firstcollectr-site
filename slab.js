/* The slab at the top of the page (owner, 2026-11-16: "the floating look funny"; "why is it angled"; "when u flip it
   it becomes cash"; then "i dont want a button i want to be able to swipe it ... just like the old floating one").
   It stands straight and still, face on. Swipe it (or drag it with the mouse) to spin it: it follows the finger, a
   flick keeps it turning, and when it slows it settles on the nearer side, the card or the cash. A tap turns it over;
   so do Enter, Space and the arrow keys. Vertical swipes still scroll the page. It does nothing while off screen. */
(function () {
  var stage = document.querySelector("[data-slab]");
  if (!stage) return;
  var slab = stage.querySelector(".slab3d");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var K = 70, C = 16.7;           // a stiff, fully damped spring: settling takes about half a second, no wobble
  var DEG_PER_PX = 0.55;          // how far it turns per pixel dragged
  var ry = 0, vy = 0, base = 0;   // the angle, its speed (degrees per second), and the side it settles on
  var mode = "rest";              // "rest": spring to base; "fling": coasting after a swipe
  var dragging = false, lastX = 0, lastT = 0, dragV = 0, moved = 0;
  var visible = true, prev = 0, running = false;

  function paint() {
    slab.style.setProperty("--ry", ry.toFixed(2) + "deg");
    slab.style.setProperty("--rx", "0deg");
    var a = ry * Math.PI / 180;
    slab.style.setProperty("--lit", (0.65 + 0.35 * Math.abs(Math.cos(a))).toFixed(3));   // a little darker side-on
    slab.style.setProperty("--edge", Math.abs(Math.sin(a)).toFixed(3));
  }

  function step(dt) {             // true once it is at rest on a side
    if (dragging) return false;
    if (mode === "fling") {
      ry += vy * dt;
      vy *= Math.exp(-2.6 * dt);
      if (Math.abs(vy) < 90) {    // slow enough: settle on the side it is turning towards
        base = Math.round((ry + vy * 0.25) / 180) * 180;
        mode = "rest";
      }
      return false;
    }
    vy += (K * (base - ry) - C * vy) * dt; ry += vy * dt;
    return Math.abs(base - ry) < 0.05 && Math.abs(vy) < 0.05;
  }

  function frame(t) {
    var dt = prev ? Math.min(0.04, (t - prev) / 1000) : 0;
    prev = t;
    var done = false;
    if (visible && !document.hidden) { done = step(dt); paint(); }
    if (done && !dragging) { running = false; prev = 0; ry = base; paint(); return; }
    requestAnimationFrame(frame);
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function turn(by) {
    if (mode === "fling") mode = "rest";
    base = Math.round(ry / 180) * 180 + by;
    wake();
  }

  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; stage.classList.add("dragging");
    lastX = e.clientX; lastT = e.timeStamp; dragV = 0; moved = 0; vy = 0;
    if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    wake();
  });
  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, ms = Math.max(8, e.timeStamp - lastT);
    moved += Math.abs(dx);
    ry += dx * DEG_PER_PX;
    dragV = dragV * 0.5 + (dx * DEG_PER_PX / ms * 1000) * 0.5;
    lastX = e.clientX; lastT = e.timeStamp;
    paint();
  });
  function release() {
    if (!dragging) return;
    dragging = false; stage.classList.remove("dragging");
    if (moved < 6) { turn(180); return; }            // a tap: turn it over
    vy = Math.max(-1400, Math.min(1400, dragV));
    mode = "fling";
    wake();
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("lostpointercapture", release);

  slab.addEventListener("keydown", function (e) {
    var by = (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") ? 180 : e.key === "ArrowLeft" ? -180 : 0;
    if (!by) return;
    e.preventDefault();
    turn(by);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) wake(); }).observe(stage);
  }
  if (still) K = 400, C = 40;      // Reduce Motion: it settles all but at once
  stage.classList.add("live");
  paint();
})();
