document.addEventListener('DOMContentLoaded', function () {
  var legacy = document.querySelector('main > section:has(.reach-grid)');
  if (!legacy) return;
  var section = document.createElement('section');
  section.className = 'section-padding partner-journey-section';
  section.style.background = 'var(--bg-warm-alt)';
  section.innerHTML = '<div class="container"><div class="partner-heading fade-in-up"><span class="section-kicker">Our marketing engine</span><h2 class="section-title-large">From <em class="gold-italic">reach</em> to real-world impact.</h2><p>Sponsors meet the community at every step — from the first impression to the memories people carry home.</p></div><div class="partner-journey fade-in-up" role="tablist" aria-label="Partner campaign journey"><button class="partner-journey-step active" type="button" role="tab" aria-selected="true" data-partner-journey="0"><span>01</span><strong>Discover</strong><small>Instagram</small></button><button class="partner-journey-step" type="button" role="tab" aria-selected="false" data-partner-journey="1"><span>02</span><strong>Engage</strong><small>City-specific Community Partners</small></button><button class="partner-journey-step" type="button" role="tab" aria-selected="false" data-partner-journey="2"><span>03</span><strong>Amplify</strong><small>Influencers + Paid Digital</small></button><button class="partner-journey-step" type="button" role="tab" aria-selected="false" data-partner-journey="3"><span>04</span><strong>Attend</strong><small>WhatsApp + On-ground</small></button><button class="partner-journey-step" type="button" role="tab" aria-selected="false" data-partner-journey="4"><span>05</span><strong>Remember</strong><small>Word of Mouth</small></button></div><div class="partner-journey-detail" aria-live="polite"><article class="partner-journey-panel active"><span class="section-kicker">01 · Discover</span><h3>Make the first impression count.</h3><p>Reels, campaigns and interactive updates put your brand in front of a culturally engaged audience before the event begins.</p></article><article class="partner-journey-panel"><span class="section-kicker">02 · Engage</span><h3>Meet the communities that move culture.</h3><p>City-specific Community Partners create trusted, local pathways into the Malayali diaspora — Mumbai Mallus is one such community.</p></article><article class="partner-journey-panel"><span class="section-kicker">03 · Amplify</span><h3>Turn attention into momentum.</h3><p>Collaborative creators and targeted digital campaigns extend your story beyond the event feed and into the right circles.</p></article><article class="partner-journey-panel"><span class="section-kicker">04 · Attend</span><h3>Show up where the energy is.</h3><p>WhatsApp announcements and physical on-ground touchpoints bring your brand into the live experience, not just the campaign.</p></article><article class="partner-journey-panel"><span class="section-kicker">05 · Remember</span><h3>Leave a feeling behind.</h3><p>Word of mouth keeps the association alive after the night ends — through shared stories, photos and recommendations.</p></article></div></div>';
  legacy.replaceWith(section);
  document.querySelectorAll('main li, main option').forEach(function (node) {
    node.textContent = node.textContent.replace(/Mumbai Mallus/g, 'City-specific Community Partners');
  });
  document.querySelectorAll('.inquiry-note .section-kicker').forEach(function (node) { node.remove(); });
  var metrics = document.querySelectorAll('.partner-metric');
  if (metrics[0]) { metrics[0].querySelector('strong').textContent = '1.5M+'; metrics[0].querySelector('span').textContent = 'Cumulative views during active event windows'; }
  if (metrics[1]) { metrics[1].querySelector('strong').textContent = '616K'; metrics[1].querySelector('span').textContent = 'Cumulative viewers during active event windows'; }
  if (metrics[2]) { metrics[2].querySelector('strong').textContent = '700%+'; metrics[2].querySelector('span').textContent = 'Follower growth in active windows'; }
  if (metrics[3]) { metrics[3].querySelector('span').textContent = 'All shows'; }
  var marketingPartner = document.querySelector('.tier-card:nth-child(3)');
  if (marketingPartner) {
    marketingPartner.querySelector('.tier-label').textContent = 'Community Partner · Mumbai';
    marketingPartner.querySelector('h4').textContent = 'A trusted local connection.';
    marketingPartner.querySelector('li').textContent = 'Mumbai Mallus community partnership — no competing brands';
  }
  document.querySelectorAll('a[href*="instagram.com"]').forEach(function (link) {
    if (link.closest('.inquiry-note')) { link.href = 'https://www.instagram.com/aarpooculture'; link.textContent = '@aarpooculture'; }
  });
  var steps = section.querySelectorAll('[data-partner-journey]');
  var panels = section.querySelectorAll('.partner-journey-panel');
  steps.forEach(function (step, index) {
    step.addEventListener('click', function () {
      steps.forEach(function (item, itemIndex) { item.classList.toggle('active', itemIndex === index); item.setAttribute('aria-selected', String(itemIndex === index)); });
      panels.forEach(function (panel, panelIndex) { panel.classList.toggle('active', panelIndex === index); });
    });
  });
});
