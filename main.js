const slides = [...document.querySelectorAll('.slide')];
const dots = document.querySelector('#dots');
let current = 0;

if (slides.length && dots) {
  slides.forEach((_, i) => {
    const button = document.createElement('button');
    button.className = 'dot' + (i === 0 ? ' active' : '');
    button.setAttribute('aria-label', `Aller au message ${i + 1}`);
    button.onclick = () => show(i);
    dots.append(button);
  });
}

function show(i) {
  if (!slides.length || !dots || !dots.children.length) return;
  slides[current].classList.remove('active');
  dots.children[current].classList.remove('active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots.children[current].classList.add('active');
}

const prevButton = document.querySelector('#prev');
const nextButton = document.querySelector('#next');
if (prevButton) prevButton.onclick = () => show(current - 1);
if (nextButton) nextButton.onclick = () => show(current + 1);

let auto = null;
if (slides.length) {
  auto = setInterval(() => show(current + 1), 6000);
}

const messageStage = document.querySelector('.message-stage');
if (messageStage && auto) {
  messageStage.addEventListener('mouseenter', () => clearInterval(auto));
}

const days = ['Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const slots = ['Matinée', 'Après-midi', 'Nuit'];
const calendar = document.querySelector('#calendar');

if (calendar) {
  days.forEach((day) => {
    const el = document.createElement('div');
    el.className = 'day';
    el.innerHTML =
      `<h3>${day}</h3>` +
      slots
        .map(
          (slot) =>
            `<label class="slot"><input type="checkbox" name="availability" value="${day} - ${slot}"><span>${slot}</span></label>`
        )
        .join('');
    calendar.append(el);
  });
}

const availabilityForm = document.querySelector('#availability-form');
if (availabilityForm) {
  availabilityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = [...document.querySelectorAll('input[name="availability"]:checked')];
    if (!selected.length) {
      alert('Choisis au moins un créneau pour continuer.');
      return;
    }
    event.currentTarget.hidden = true;
    const success = document.querySelector('#success');
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    localStorage.setItem(
      'rvphvAvailability',
      JSON.stringify({
        slots: selected.map((input) => input.value),
        message: event.currentTarget.message.value,
        savedAt: new Date().toISOString(),
      })
    );
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0, transform: 'translateY(35px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
          );
        }
      }),
    { threshold: 0.15 }
  );

  document
    .querySelectorAll('.section-label,.coquette-letter,.scrap-grid,.availability-heading')
    .forEach((el) => observer.observe(el));
}

const hero = document.querySelector('#hero');
if (hero) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow hidden';
  hero.appendChild(cursor);

  let inside = false;
  hero.addEventListener('pointermove', (event) => {
    inside = true;
    cursor.classList.remove('hidden');
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
  });
  hero.addEventListener('pointerenter', () => {
    inside = true;
  });
  hero.addEventListener('pointerleave', () => {
    inside = false;
    cursor.classList.add('hidden');
  });
  hero.addEventListener('scroll', () => {
    if (!inside) cursor.classList.add('hidden');
  });

  const portraitScene = hero.querySelector('.hero-portrait-scene');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (portraitScene && !reducedMotion) {
    let ticking = false;

    const updateHeroDepth = () => {
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const normalized = Math.max(-1, Math.min(1, (vh * 0.55 - rect.top) / (vh * 1.1)));
      const shift = Math.max(-24, Math.min(30, normalized * 28));
      const tiltX = Math.max(-8, Math.min(8, normalized * 7));
      const tiltY = Math.max(-6, Math.min(6, normalized * -5));
      hero.style.setProperty('--hero-depth-shift', `${shift}px`);
      hero.style.setProperty('--hero-tilt-x', `${tiltX}deg`);
      hero.style.setProperty('--hero-tilt-y', `${tiltY}deg`);
      ticking = false;
    };

    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeroDepth);
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();
  }
}
