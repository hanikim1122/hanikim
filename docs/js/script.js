// 지금 주소가 '홈(/)' 인지 확인하는 헬퍼
const isHome = () => location.pathname === '/' || location.pathname === '/index.html';

/*************************************************
 * Sections to load (홈에서 불러올 섹션 조각들)
 *************************************************/
const sectionNames = [
  "home",
  "about",
  "illustration",
  "illustration-detail",
  "moreworks",
  "notebook-main",
  "notebook-mind",
  "notebook-swim",
  "notebook-knit",
  "notebook-story",
  "palette",
];

/*************************************************
 * 경로 헬퍼: 항상 절대경로로
 *************************************************/
const toAbs = (p) => (!p ? "" : (p.startsWith("/") ? p : `/${p.replace(/^\/+/, "")}`));

/*************************************************
 * 모든 섹션을 <main>에 로드 (항목별 에러는 건너뛰기)
 *************************************************/
function loadSections(callback) {
  const main = document.getElementById("main-container");

  Promise.all(
    sectionNames.map((name) =>
      fetch(`/sections/${name}.html`)
        .then((res) => (res.ok ? res.text() : Promise.reject(`404: ${name}`)))
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html.trim();
          const section = temp.querySelector("section");
          if (section) main.appendChild(section);
          else console.warn(`⚠️ <section> not found in ${name}.html`);
        })
        .catch((err) => console.warn(`skip ${name}:`, err))
    )
  ).then(() => {
    if (typeof callback === "function") callback();
  });
}

/*************************************************
 * Section show/hide
 *************************************************/
function showSection(id) {
  document.querySelectorAll("main section").forEach((sec) => (sec.style.display = "none"));
  document.querySelectorAll(".notebook-category").forEach((sec) => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = (id === "home" || id === "notebook-main") ? "flex" : "block";
    if (id === "illustration") requestAnimationFrame(layoutIllustrationGrid);
  }
}

/*************************************************
 * Notebook helpers
 *************************************************/
function showNotebookCategory(category) {
  const main = document.getElementById("notebook-main");
  if (main) main.style.display = "none";

  document.querySelectorAll(".notebook-category").forEach((sec) => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });

  const target = document.getElementById("notebook-" + category);
  if (target) {
    target.classList.remove("hidden");
    target.style.display = "block";
  }
}
function goBackToNotebookMain() {
  document.querySelectorAll(".notebook-category").forEach((sec) => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });
  showSection("notebook-main");
}
function togglePost(titleElement) {
  const content = titleElement?.nextElementSibling;
  if (content) content.classList.toggle("hidden");
}

/*************************************************
 * Artwork data (기본값) — alt/src로 자동 보완됨
 *************************************************/
const artworks = {
  1: { title: "Tropical Summer", image: "/images/illust_images/tropicalsummer.jpg", description: "무더운 여름날의 생동감을 담았습니다." },
  2: { title: "Travel",          image: "/images/illust_images/travel.jpg",           description: "여행의 따뜻한 풍경을 담았습니다." },
  3: { title: "Puppy",           image: "/images/illust_images/puppy.jpg",            description: "강아지와의 포근한 하루를 그렸습니다." },
  4: { title: "Magical Night",   image: "/images/illust_images/magicalnight.jpg",     description: "마법 같은 밤을 표현했습니다." },
  5: { title: "Adventure",       image: "/images/illust_images/advanture2.jpg",       description: "모험을 떠나는 순간을 담았습니다." },
  6: { title: "Cake",            image: "/images/illust_images/cake.jpg",             description: "달콤한 케이크의 기억을 그렸습니다." },
};

/*************************************************
 * Illustration: 인라인 디테일 패널 생성/토글
 *************************************************/
function ensureInlineDetailPanel() {
  const section = document.querySelector("#illustration .section-inner");
  if (!section) return null;

  let panel = document.getElementById("inline-detail");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "inline-detail";
  panel.className = "inline-detail hidden";
  panel.innerHTML = `
    <div class="illust-detail-wrap">
      <div class="illust-detail-left">
        <img id="inline-detail-image" alt="" />
      </div>
      <div class="illust-detail-right">
        <h2 id="inline-detail-title"></h2>
        <p class="detail-meta" id="inline-detail-date"></p>
        <div id="inline-detail-desc" class="detail-desc"></div>
        <div class="detail-nav">
          <a href="#" id="inline-back">Back to WORK</a>
          <div class="prev-next">
            <a href="#" id="inline-prev">prev</a>
            <span> / </span>
            <a href="#" id="inline-next">next</a>
          </div>
        </div>
      </div>
    </div>
  `;
  const gallery = document.querySelector("#illustration .gallery");
  section.insertBefore(panel, gallery || null);
  return panel;
}
function hideInlineDetail() {
  const panel = document.getElementById("inline-detail");
  if (panel) panel.classList.add("hidden");
}

/*************************************************
 * 디테일 표시 (DOM 순서 기준 prev/next)
 *************************************************/
function showInlineDetail(id) {
  const data = artworks[id];
  if (!data) return;

  showSection("illustration");

  const panel = ensureInlineDetailPanel();
  if (!panel) return;

  const $img  = panel.querySelector("#inline-detail-image");
  const $tit  = panel.querySelector("#inline-detail-title");
  const $date = panel.querySelector("#inline-detail-date");
  const $desc = panel.querySelector("#inline-detail-desc");

  if ($img)  { $img.src = toAbs(data.image); $img.alt = data.title || ""; }
  if ($tit)  $tit.textContent = data.title || "";
  if ($date) $date.textContent = data.date || "";

  const tpl = document.getElementById(`desc-${id}`);
  if (tpl) {
    $desc.innerHTML = tpl.innerHTML || (tpl.content && tpl.content.innerHTML) || "";
  } else {
    const a = document.querySelector(`#illustration .gallery a[href*="id=${id}"]`);
    const fromAttr = (a?.getAttribute("data-desc") || a?.querySelector("img")?.getAttribute("data-desc") || "").trim();
    $desc.textContent = fromAttr || data.description || "";
  }

  const list = getArtworkIdsInDomOrder();
  const idx = list.indexOf(Number(id));
  const prevId = idx > 0 ? list[idx - 1] : null;
  const nextId = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const $prev = panel.querySelector("#inline-prev");
  const $next = panel.querySelector("#inline-next");
  const $back = panel.querySelector("#inline-back");

  if ($prev) {
    if (prevId) {
      $prev.style.visibility = "visible";
      $prev.onclick = (e) => {
        e.preventDefault();
        history.pushState({ page: "detail", id: prevId }, "", `${location.pathname}#illustration?id=${prevId}`);
        showInlineDetail(prevId);
      };
    } else $prev.style.visibility = "hidden";
  }
  if ($next) {
    if (nextId) {
      $next.style.visibility = "visible";
      $next.onclick = (e) => {
        e.preventDefault();
        history.pushState({ page: "detail", id: nextId }, "", `${location.pathname}#illustration?id=${nextId}`);
        showInlineDetail(nextId);
      };
    } else $next.style.visibility = "hidden";
  }
  if ($back) {
    $back.onclick = (e) => {
      e.preventDefault();
      history.pushState({}, "", `${location.pathname}#illustration`);
      hideInlineDetail();
      const sectionTop = document.getElementById("illustration")?.offsetTop || 0;
      window.scrollTo({ top: sectionTop - 20, behavior: "instant" });
    };
  }

  panel.classList.remove("hidden");

  const y = panel.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y - 20, behavior: "instant" });
}

/*************************************************
 * Illustration: 초기화 (HTML 순서 유지 + 오버레이 + span 계산)
 *************************************************/
function initIllustrationGallery() {
  const wrap = document.querySelector("#illustration .gallery");
  if (!wrap) return;

  const anchors = Array.from(wrap.querySelectorAll("a"));
  if (!anchors.length) return;

  const getId = (a) => {
    const m = (a.getAttribute("href") || "").match(/id=(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

  anchors.forEach((a) => {
    const id  = getId(a);
    const img = a.querySelector("img");
    const altTitle = (img?.getAttribute("alt") || "").trim();

    const htmlTitle = (a.getAttribute("data-title") || altTitle || "").trim();
    const htmlDesc  = (a.getAttribute("data-desc")  || img?.getAttribute("data-desc") || "").trim();
    const htmlDate  = (a.getAttribute("data-date")  || "").trim();

    if (id) {
      if (!artworks[id]) artworks[id] = {};
      artworks[id].title = htmlTitle || artworks[id].title || `Artwork #${id}`;
      artworks[id].image = artworks[id].image || toAbs(img?.getAttribute("src") || "");
      if (htmlDesc) artworks[id].description = htmlDesc;
      if (htmlDate) artworks[id].date = htmlDate;
    }

    a.classList.add("illust-card","work-item");
    if (!a.querySelector(".overlay")) {
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerHTML = `<span class="title">${artworks[id]?.title || altTitle || ""}</span>`;
      a.appendChild(overlay);
    }

    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!id || !artworks[id]) return;
      history.pushState({ page: "detail", id }, "", `${location.pathname}#illustration?id=${id}`);
      showInlineDetail(id);
    });

    if (img) {
      if (img.complete) layoutIllustrationGrid();
      else img.addEventListener("load", layoutIllustrationGrid, { once: true });
    }
  });

  layoutIllustrationGrid();
  window.addEventListener("resize", layoutIllustrationGrid);
  window.addEventListener("orientationchange", layoutIllustrationGrid);
}

/*************************************************
 * Grid Masonry: 행 span 계산
 *************************************************/
function layoutIllustrationGrid() {
  const wrap = document.querySelector("#illustration .gallery");
  if (!wrap) return;

  const cs = getComputedStyle(wrap);
  const toPx = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  const rowH = toPx(cs.gridAutoRows) || 8;
  const illust = document.getElementById("illustration");
  const cssVarGap = illust ? toPx(getComputedStyle(illust).getPropertyValue("--illust-gap")) : 0;
  const gap = toPx(cs.rowGap) || toPx(cs.gap) || cssVarGap || 0;

  wrap.querySelectorAll("a").forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;

    const h = img.getBoundingClientRect().height || img.offsetHeight || 0;
    const span = rowH > 0 ? Math.max(1, Math.ceil((h + gap) / (rowH + gap))) : 1;

    card.style.setProperty("--span", span);
    card.style.gridRowEnd = "span " + span;
  });
}

/*************************************************
 * DOM 순서 기준 id 배열 (prev/next에 사용)
 *************************************************/
function getArtworkIdsInDomOrder() {
  const wrap = document.querySelector("#illustration .gallery");
  if (!wrap) return [];
  return Array.from(wrap.querySelectorAll("a"))
    .map((a) => {
      const m = (a.getAttribute("href") || "").match(/id=(\d+)/);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n) => Number.isInteger(n));
}

/*************************************************
 * Routing (hash + ?id) — 홈에서만 동작
 *************************************************/
function handleRouting() {
  if (!isHome()) return;

  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  const hash = (url.hash || "").replace("#", "");

  if (!hash && id) {
    history.replaceState({ page: "detail", id }, "", `${location.pathname}#illustration?id=${id}`);
  }

  const url2 = new URL(window.location.href);
  const id2 = url2.searchParams.get("id");
  const hash2 = (url2.hash || "").replace("#", "");

  if (hash2 === "illustration" && id2 && artworks[id2]) {
    showInlineDetail(id2);
    requestAnimationFrame(layoutIllustrationGrid);
    return;
  }

  if (hash2) {
    showSection(hash2);
    if (hash2 === "illustration") requestAnimationFrame(layoutIllustrationGrid);
    else hideInlineDetail();
    return;
  }

  showSection("home");
}

/*************************************************
 * 메뉴(로고) — 언제나 루트/#home 으로
 *************************************************/
function setupMenuLinks() {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = '/#home';
    });
  }
}

/*************************************************
 * moreworks: slide buttons + snap helpers
 *************************************************/
function setupSlideButtons() {
  document.querySelectorAll('.horizontal-gallery-wrapper').forEach((wrap) => {
    if (wrap.dataset.init === '1') return;
    wrap.dataset.init = '1';

    const gal = wrap.querySelector('.horizontal-gallery');
    if (!gal) return;

    const leftBtn  = wrap.querySelector('.slide-button.left');
    const rightBtn = wrap.querySelector('.slide-button.right');

    const getStep = () => {
      const item = gal.querySelector('.work-item');
      if (!item) return gal.clientWidth;
      const rect = item.getBoundingClientRect();
      const gap  = parseFloat(getComputedStyle(gal).gap) || 0;
      return Math.round(rect.width + gap);
    };

    rightBtn?.addEventListener('click', () => {
      gal.scrollBy({ left:  getStep(), behavior: 'smooth' });
    });
    leftBtn?.addEventListener('click', () => {
      gal.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    const updateFades = () => {
      const atStart = gal.scrollLeft <= 0;
      const atEnd   = Math.ceil(gal.scrollLeft + gal.clientWidth) >= gal.scrollWidth;
      wrap.classList.toggle('at-start', atStart);
      wrap.classList.toggle('at-end',   atEnd);
    };
    gal.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);
    updateFades();

    let isDown = false, startX = 0, startLeft = 0;
    gal.addEventListener('mousedown', (e) => {
      isDown = true; startX = e.pageX; startLeft = gal.scrollLeft;
      gal.classList.add('dragging');
    });
    window.addEventListener('mouseup', () => {
      isDown = false; gal.classList.remove('dragging');
    });
    gal.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      gal.scrollLeft = startLeft - (e.pageX - startX);
    });
  });
}

/*************************************************
 * Palette: 라이트박스 (이미지 클릭 → 다음만)
 *************************************************/
function setupPaletteLightbox() {
  let modal = document.getElementById('palette-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'palette-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-overlay" data-action="close"></div>
      <div class="modal-content"><img id="palette-modal-img" alt=""></div>
      <button class="modal-close" aria-label="닫기" data-action="close">×</button>
    `;
    document.body.appendChild(modal);
  }
  const modalImg   = modal.querySelector('#palette-modal-img');
  const closeNodes = modal.querySelectorAll('[data-action="close"]');

  let list = [];
  let idx  = 0;

  function collect() {
    list = Array.from(document.querySelectorAll('#palette .palette-grid img'))
                .map(img => img.getAttribute('src'));
  }
  function openAt(i) {
    if (!list.length) collect();
    idx = (i + list.length) % list.length;
    modalImg.src = list[idx];
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function next() { openAt(idx + 1); }

  document.addEventListener('click', function(e){
    const img = e.target.closest('#palette .palette-grid img');
    if (!img) return;

    const a = e.target.closest('a');
    if (a) e.preventDefault();

    collect();
    const i = list.indexOf(img.getAttribute('src'));
    openAt(i >= 0 ? i : 0);
  });

  closeNodes.forEach(el => el.addEventListener('click', closeModal));
  modalImg.addEventListener('click', next);
  document.addEventListener('keydown', function(e){
    if (modal.style.display !== 'flex') return;
    if (e.key === 'Escape') closeModal();
  });
}

/*************************************************
 * Boot — 홈에서만 SPA 구동
 *************************************************/
window.onload = () => {
  if (isHome()) {
    loadSections(() => {
      initIllustrationGallery();
      setupMenuLinks();
      setupSlideButtons();
      setupPaletteLightbox();
      handleRouting();
      requestAnimationFrame(layoutIllustrationGrid);
    });
  } else {
    // 일반 페이지(목록/글)에서는 로고만 정상 동작하게
    setupMenuLinks();
  }
};

// 홈 라우팅 이벤트 (홈이 아닐 땐 handleRouting이 바로 return)
window.addEventListener("hashchange", handleRouting);
window.addEventListener("popstate", handleRouting);

/*************************************************
 * 전역 링크 핸들러 — 해시(#)만 SPA로 처리
 * /notebook/ 같은 일반 링크는 기본 동작(페이지 이동)
 *************************************************/
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;

  const href = a.getAttribute('href') || '';

  if (href.startsWith('#') || href.startsWith('/#')) {
    e.preventDefault();

    const hash = href.startsWith('/#') ? href.slice(2) : href.slice(1);

    if (!isHome()) {
      window.location.href = '/#' + hash; // 홈으로 이동하면서 적용
      return;
    }

    history.pushState({}, "", `${location.pathname}#${hash}`);
    handleRouting();
  }
});
