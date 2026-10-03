// Product slider: native scroll-snap + prev/next buttons + dots (works without JS too)
(function () {
  var slider = document.querySelector('[data-slider]');
  if (!slider) return;
  var track = slider.querySelector('[data-track]');
  var cards = Array.prototype.slice.call(track.children);
  var prev = slider.querySelector('[data-prev]');
  var next = slider.querySelector('[data-next]');
  var dots = slider.querySelector('[data-dots]');

  function step() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return cards[0].getBoundingClientRect().width + gap;
  }
  function current() {
    return Math.min(cards.length - 1, Math.round(track.scrollLeft / step()));
  }
  function goTo(i) {
    track.scrollTo({ left: i * step(), behavior: 'smooth' });
  }

  cards.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Go to product ' + (i + 1));
    b.addEventListener('click', function () { goTo(i); });
    dots.appendChild(b);
  });

  function update() {
    var i = current();
    Array.prototype.forEach.call(dots.children, function (d, j) {
      d.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  prev.addEventListener('click', function () { goTo(Math.max(0, current() - 1)); });
  next.addEventListener('click', function () { goTo(Math.min(cards.length - 1, current() + 1)); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
  });
  window.addEventListener('resize', update);
  update();

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Upcoming booths: hide events whose last day has passed
(function () {
  var list = document.querySelector('[data-booths]');
  if (!list) return;
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var visible = 0;
  Array.prototype.forEach.call(list.children, function (li) {
    var parts = (li.getAttribute('data-end') || '').split('-');
    if (parts.length !== 3) { visible++; return; }
    var end = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    if (end < today) { li.hidden = true; } else { visible++; }
  });
  if (!visible) {
    list.hidden = true;
    var empty = document.querySelector('[data-booths-empty]');
    if (empty) empty.hidden = false;
  }
})();

// Honest review video: load the Facebook player only when the visitor clicks play
(function () {
  var box = document.querySelector('[data-video-embed]');
  if (!box) return;
  var btn = box.querySelector('[data-play]');
  btn.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.facebook.com/plugins/video.php?href=' +
      encodeURIComponent(box.getAttribute('data-src')) + '&show_text=false&autoplay=true';
    iframe.title = "Honest review of Fundy's gourmet cheese spread";
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.setAttribute('scrolling', 'no');
    box.replaceChild(iframe, btn);
  });
})();
