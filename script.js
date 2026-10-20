const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

const hero = document.querySelector('.hero');
if (hero) {
  const photo = hero.querySelector('.hero-photo');
  const previous = hero.querySelector('.carousel-arrow.prev');
  const next = hero.querySelector('.carousel-arrow.next');
  const dots = [...hero.querySelectorAll('.dots i')];
  const assetBase = /\/(ca|en|de)\//.test(location.pathname) ? '../assets/' : 'assets/';
  const slides = ['hero.jpg', 'griferia.jpg', 'aire.jpg'];
  const locale = document.documentElement.lang.slice(0, 2);
  const descriptions = {
    es: ['Baño moderno con ducha y grifería', 'Lavabo con grifería de latón', 'Aire acondicionado en un salón moderno'],
    ca: ['Bany modern amb dutxa i aixetes', 'Lavabo amb aixeta de llautó', 'Aire condicionat en una sala d’estar moderna'],
    en: ['Modern bathroom with shower and taps', 'Bathroom sink with brass tap', 'Air conditioning in a modern living room'],
    de: ['Modernes Bad mit Dusche und Armaturen', 'Waschbecken mit Messingarmatur', 'Klimaanlage in einem modernen Wohnzimmer']
  }[locale] || ['Baño moderno con ducha y grifería', 'Lavabo con grifería de latón', 'Aire acondicionado en un salón moderno'];
  const slideCounter = {
    es: n => `Diapositiva ${n} de ${slides.length}`,
    ca: n => `Diapositiva ${n} de ${slides.length}`,
    en: n => `Slide ${n} of ${slides.length}`,
    de: n => `Folie ${n} von ${slides.length}`
  }[locale] || (n => `Diapositiva ${n} de ${slides.length}`);
  let activeSlide = 0;

  const showSlide = index => {
    activeSlide = (index + slides.length) % slides.length;
    photo.style.backgroundImage = `url("${assetBase}${slides[activeSlide]}")`;
    photo.setAttribute('aria-label', descriptions[activeSlide]);
    dots.forEach((dot, dotIndex) => dot.classList.toggle('selected', dotIndex === activeSlide));
    hero.querySelector('.dots').setAttribute('aria-label', slideCounter(activeSlide + 1));
  };

  previous?.addEventListener('click', () => showSlide(activeSlide - 1));
  next?.addEventListener('click', () => showSlide(activeSlide + 1));
  showSlide(0);
}

const formMessages = {
  es: { sending: 'Enviando tu mensaje…', success: 'Gracias. Hemos recibido tu mensaje.', error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbenos por email.' },
  ca: { sending: 'Enviant el missatge…', success: 'Gràcies. Hem rebut el teu missatge.', error: 'No s’ha pogut enviar el missatge. Torna-ho a provar o escriu-nos per correu electrònic.' },
  en: { sending: 'Sending your message…', success: 'Thank you. We have received your message.', error: 'Your message could not be sent. Please try again or email us.' },
  de: { sending: 'Nachricht wird gesendet…', success: 'Vielen Dank. Wir haben Ihre Nachricht erhalten.', error: 'Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E-Mail.' }
};

document.querySelectorAll('.contact-form').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const locale = formMessages[document.documentElement.lang] || formMessages.es;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('[type="submit"]');
    const payload = Object.fromEntries(new FormData(form).entries());
    payload._replyto = payload.email;
    status.textContent = locale.sending;
    submitButton.disabled = true;

    try {
      // Test recipient: change to info@nougrampo.es before launch.
      const endpoint = form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || String(result.success).toLowerCase() !== 'true') throw new Error('Form delivery failed');
      status.textContent = locale.success;
      form.reset();
    } catch (error) {
      status.textContent = locale.error;
    } finally {
      submitButton.disabled = false;
    }
  });
});
