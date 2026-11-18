/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const */
// Landing page motion: hero agent demo loop, pinned story sections, scroll-linked effects.
// Imperative by design (GSAP timelines); everything is reverted in the returned cleanup.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function initLanding(root: HTMLElement, tr: (s: string) => string = s => s): () => void {
let lenis: any = null, tick: any = null;
let mm: gsap.MatchMedia | null = null;

root.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => root.querySelector('.mobile-menu')?.removeAttribute('open')));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s: string): any => root.querySelector(s), $$ = (s: string): any[] => [...root.querySelectorAll(s)];
const fmt = (v: any) => Math.round(v).toLocaleString('ru-RU').replace(/[  ,]/g,' ');

/* ---------- hero agent demo: 3 scenarios loop, voice once per loop, pause offscreen, user can pick ---------- */
const H = {txt:$('#hTxt'), num:$('#hNum'), was:$('#hWas'), feed:$('#hFeed'), bar:$('#hBar'), pick:$('#hPick'), mk:$('#hMk'),
  bm:$$('#hMk .bm'), undo:$('#undo'), ub:$('#undoBar')};
const BASE = 4200000; let cur = BASE, timers: any[] = [], i = 0, running = false, userMode = false, onScreen = true;
const at = (ms: any, f: any) => timers.push(setTimeout(f, ms));
const stop = () => { timers.forEach(clearTimeout); timers = []; running = false; };
function squares(d: any){ H.bm.forEach((g: any) => g.style.transform = `translate(${d}px,${d}px)`); }
function count(el: any, from: any, to: any, ms: any){ const s = performance.now(); (function f(t: any){ const p = Math.min(1,(t-s)/ms); el.textContent = fmt(from+(to-from)*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(f); })(s); }
const S = [
 {say:tr('ijara 3 mln, 5-sanada'), row:[tr('Ijara'),tr('5-dekabr'),'−3 000 000','#9A6700'], to:1200000, d:14, voice:false},
 {say:tr('bugun 1,2 mlnga sotdim'), row:[tr('Sotuv'),tr('bugun'),'+1 200 000','#1F7A4D'], to:2400000, d:8, voice:true},
 {say:tr('taʼminotchi 1,8 mln qaytardi'), row:[tr('Kirim'),tr('qaytarildi'),'+1 800 000','#1F7A4D'], to:BASE, d:0, voice:false}
];
function addRow(r: any){ const e = document.createElement('div'); e.className = 'frow new'; e.style.setProperty('--c', r[3]);
  e.innerHTML = `<span>${r[0]}<small>${r[1]}</small></span><b>${r[2]}</b>`; H.feed.prepend(e); while (H.feed.children.length > 3) H.feed.lastElementChild.remove(); }
function scene(s: any, after: any){
  stop(); running = true; H.pick.classList.remove('in'); H.bar.parentNode.classList.remove('picking'); H.bar.parentNode.scrollTop = 0; H.bar.classList.toggle('mic', s.voice);
  H.txt.className = 'car'; H.txt.textContent = ''; $('#hGo').textContent = s.voice ? '●' : '↑';
  let t = 500;
  if (s.voice){ H.txt.className = 'hint'; H.txt.textContent = tr('Tinglayapman…'); H.mk.classList.add('listen');
    t = 1900; at(t, () => { H.mk.classList.remove('listen'); H.txt.className = ''; H.txt.textContent = s.say; }); t += 500; }
  else { [...s.say].forEach((c: any, k: any) => at(t + k*60, () => H.txt.textContent += c)); t += s.say.length*60 + 350; }
  at(t, () => { H.txt.className = ''; addRow(s.row); H.was.textContent = tr('avval {x} edi').replace('{x}', fmt(cur));
    count(H.num, cur, s.to, 900); cur = s.to; squares(s.d);
    H.undo.classList.add('in'); gsap.fromTo(H.ub, {scaleX:1}, {scaleX:0, duration:3, ease:'none'}); });
  at(t + 3200, () => { H.undo.classList.remove('in'); H.txt.className = 'hint'; H.txt.textContent = tr('Consulga ayting…'); $('#hGo').textContent = '↑'; H.bar.classList.remove('mic'); });
  at(t + 4200, () => { running = false; after && after(); });
}
function loop(){ if (!onScreen || userMode) return; scene(S[i % 3], () => { i++; loop(); }); }
H.bar.addEventListener('click', () => { userMode = true; stop(); H.mk.classList.remove('listen'); H.txt.className = 'hint'; H.txt.textContent = tr('Iboralardan birini tanlang'); H.pick.classList.add('in'); H.bar.parentNode.classList.add('picking'); H.bar.parentNode.scrollTop = 0; });
H.pick.addEventListener('click', (e: any) => { const b = e.target.closest('button'); if (!b) return;
  scene(S[+b.dataset.k], () => { at(5000, () => { userMode = false; loop(); }); }); });
const io = new IntersectionObserver((es: any) => { es.forEach((e: any) => { onScreen = e.isIntersecting;
  if (!onScreen && !userMode){ stop(); H.mk.classList.remove('listen'); } else if (onScreen && !running && !userMode) setTimeout(loop, 300); }); }, {threshold:.2});
io.observe($('#scene'));
if (reduce) { H.txt.className = ''; H.txt.textContent = S[0].say; addRow(S[0].row); H.num.textContent = fmt(S[0].to); H.was.textContent = tr('avval {x} edi').replace('{x}', '4 200 000'); squares(14); cur = S[0].to; onScreen = false; }

if (reduce) return () => { stop(); io.disconnect(); };
const ctx = gsap.context(() => {

gsap.registerPlugin(ScrollTrigger);
lenis = new Lenis({lerp:.1});
lenis.on('scroll', ScrollTrigger.update);
tick = (t: number) => lenis.raf(t*1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
$$('a[href^="#"]').forEach((a: any) => a.addEventListener('click', (e: any) => { const t = $(a.getAttribute('href')); if (t){ e.preventDefault(); lenis.scrollTo(t, {offset:-64}); } }));

/* progress + nav */
gsap.to('.prog', {scaleX:1, ease:'none', scrollTrigger:{start:0, end:'max', scrub:.3}});
const navEl=$('.nav'); const navSet=(y: number)=>navEl.classList.toggle('solid', y>40); lenis.on('scroll', (e: any)=>navSet(e.scroll)); navSet(scrollY);

/* hero intro */
gsap.from('.h-in .ln>span', {yPercent:110, duration:1.1, ease:'expo.out', stagger:.09, delay:.15});
gsap.from('.h-fade', {y:18, opacity:0, duration:.9, ease:'power3.out', stagger:.1, delay:.55});
gsap.from('#scene .dev', {y:60, opacity:0, duration:1.3, ease:'expo.out', delay:.3});
gsap.from('#scene .fc', {scale:.8, opacity:0, duration:.8, ease:'back.out(1.8)', stagger:.12, delay:.9});
gsap.to('#scene .c-tax', {y:-60, ease:'none', scrollTrigger:{trigger:'.hero-s', start:'top top', end:'bottom top', scrub:true}});
gsap.to('#scene .c-cred', {y:-140, ease:'none', scrollTrigger:{trigger:'.hero-s', start:'top top', end:'bottom top', scrub:true}});
gsap.to('#scene', {y:-80, ease:'none', scrollTrigger:{trigger:'.hero-s', start:'top top', end:'bottom top', scrub:true}});
gsap.to('.h-in', {opacity:.25, y:-40, ease:'none', scrollTrigger:{trigger:'.hero-s', start:'top top', end:'bottom top', scrub:true}});

mm = gsap.matchMedia();
mm.add({ wide: '(min-width: 640px)', narrow: '(max-width: 639.98px)' }, ({ conditions }) => {
 const wide = conditions?.wide;
 /* steps: pinned, scrubbed story */
 const sts = $$('.st'), sN = $('#stN'), sNum = $('#sNum');
 const obj = {v:4200000};
 const stepsPin = wide ? '.steps-pin' : '.stage';
 const tl = gsap.timeline({scrollTrigger:{trigger:stepsPin, start:wide ? 'top top' : 'center center+=32', end:'+=150%', pin:true, pinSpacing:true, scrub:.45,
   onUpdate:(s: any) => { const k = Math.min(2, Math.floor(s.progress*3)); sts.forEach((e,j)=>e.classList.toggle('on', j===k)); sN.textContent = '0'+(k+1); }}});
 tl.from('#sBub > *', {x:-24, opacity:0, duration:.5, stagger:.18})
   .to({}, {duration:.4})
   .to('#sMk .bm', {x:-30, y:-30, duration:1, ease:'power2.inOut'}, 'two')
   .to(obj, {v:5400000, duration:1, ease:'power2.inOut', onUpdate:()=> sNum.textContent = fmt(obj.v)}, 'two')
   .to('#sBub', {opacity:.3, duration:.4}, 'two')
   .from('#sCh i', {scaleY:0, duration:.9, stagger:.012, ease:'power2.out'}, 'two')
   .from('#sCh span', {opacity:0, duration:.3}, 'two')
   .to({}, {duration:.3})
   .to('#sCh', {opacity:.35, duration:.4})
   .from('#sAdv', {y:60, opacity:0, duration:.7, ease:'power3.out'}, '<')
   .to({}, {duration:.4});

 /* features: pinned list synced to phone screens */
 const features = root.querySelectorAll('.fi');
 const bars = root.querySelectorAll('.fi .bar i');
 const slides = $('.phone-slides');
 const badgeLabel = $('#fxL'), badgeValue = $('#fxV');
 const badges = [[tr('Bank uchun hisobot'),'PDF'],[tr('Keyingi toʻlov'),tr('15-dekabr')],[tr('Tekshirildi'),tr('12 / 12 raqam ✓')],[tr('Oloyda arzonroq'),'−3%']];
 const hold = .65, slide = .55;
 let active = 0;
 const showFeature = (next: number) => {
   if (next === active) return;
   features[active].classList.remove('on');
   features[next].classList.add('on');
   [badgeLabel.textContent, badgeValue.textContent] = badges[next];
   active = next;
 };
 const phonePin = wide ? '.feat-pin' : '#imk .pw';
 const ft = gsap.timeline({scrollTrigger:{trigger:phonePin, start:wide ? 'top top' : 'center center+=32', end:'+=240%', pin:true, pinSpacing:true, scrub:.45}});
 bars.forEach((bar, index) => {
   ft.to(bar, {scaleX:1, duration:hold, ease:'none'});
   if (index < bars.length - 1) {
     ft.to(slides, {yPercent:-100 * (index + 1), duration:slide, ease:'sine.inOut'});
   }
 });
 ft.eventCallback('onUpdate', () => {
   // Switch labels when the new slide passes the middle of the phone.
   showFeature(Math.min(features.length - 1, Math.floor((ft.time() + slide / 2) / (hold + slide))));
 });
 return () => showFeature(0);
});

/* section headings */
$$('.sec h2').forEach((h: any) => gsap.from(h, {y:40, opacity:0, duration:.9, ease:'expo.out', scrollTrigger:{trigger:h, start:'top 85%'}}));

/* final wordmark rises letter by letter, scrubbed */
gsap.from('#word span', {yPercent:100, ease:'none', stagger:.08, scrollTrigger:{trigger:'#word', start:'top bottom', end:'bottom 95%', scrub:true}});
gsap.to('#word', {color:'#3A414A', ease:'none', scrollTrigger:{trigger:'#word', start:'top 90%', end:'bottom bottom', scrub:true}});

}, root);
return () => { stop(); io.disconnect(); mm && mm.revert(); ctx.revert(); if (tick) gsap.ticker.remove(tick); lenis && lenis.destroy(); };
}
