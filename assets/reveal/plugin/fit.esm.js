/*
 * Shrinks a slide's font size until its content fits the slide height, so a
 * text-heavy slide doesn't spill below the bottom edge. Headings, code and
 * .small blocks are sized in em, so they shrink along with the body text.
 * Cover/divider slides (data-background-color) use a full-height flex layout
 * and are left alone.
 */
const MIN_SIZE = 0.6;
const STEP = 0.04;

export default () => ({
  id: 'fit',
  init(deck) {
    const fit = (section) => {
      if (!section || section.hasAttribute('data-background-color')) return;
      const max = deck.getConfig().height;
      section.style.fontSize = '';
      let size = 1;
      while (section.scrollHeight > max && size > MIN_SIZE) {
        size -= STEP;
        section.style.fontSize = `${size}em`;
      }
    };

    // Images change the slide height when they finish loading.
    const fitWhenLoaded = (section) => {
      if (!section) return;
      fit(section);
      section.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', () => fit(section), { once: true });
      });
    };

    deck.on('ready', (e) => fitWhenLoaded(e.currentSlide));
    deck.on('slidechanged', (e) => fitWhenLoaded(e.currentSlide));
  },
});
