const sectionNames = [
  'home',
  'about',
  'illustration',
  'illustration-detail',
  'moreworks',
  'notebook-main',
  'notebook-mind',
  'palette'
];

// 🔧 모든 섹션을 동적으로 불러오기
function loadSections(callback) {
  const main = document.getElementById('main-container');
  Promise.all(
    sectionNames.map(name =>
      fetch(`sections/${name}.html`)
        .then(res => res.ok ? res.text() : Promise.reject(`404: ${name}`))
        .then(html => {
          const temp = document.createElement('div');
          temp.innerHTML = html.trim();
          const section = temp.querySelector('section');
          if (section) {
            main.appendChild(section);
          } else {
            console.warn(`⚠️ <section> not found in ${name}.html`);
          }
        })
    )
  ).then(callback).catch(err => console.error('Load error:', err));
}

// ✅ 섹션 전환 함수
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
  document.querySelectorAll(".notebook-category").forEach(sec => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = (id === "home" || id === "notebook-main") ? "flex" : "block";
  }
}

// ✅ 노트북 카테고리 열기
function showNotebookCategory(category) {
  document.getElementById("notebook-main").style.display = "none";
  document.querySelectorAll(".notebook-category").forEach(sec => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });

  const target = document.getElementById("notebook-" + category);
  if (target) {
    target.classList.remove("hidden");
    target.style.display = "block";
  }
}

// ✅ 노트북 뒤로가기
function goBackToNotebookMain() {
  document.querySelectorAll(".notebook-category").forEach(sec => {
    sec.classList.add("hidden");
    sec.style.display = "none";
  });
  showSection("notebook-main");
}

// ✅ 게시글 열고 닫기
function togglePost(titleElement) {
  const content = titleElement.nextElementSibling;
  content.classList.toggle("hidden");
}

// ✅ 일러스트 상세 데이터
const artworks = {
  1: { title: "Tropical Summer", image: "images/illust_images/tropicalsummer.jpg", description: "무더운 여름날의 생동감을 담았습니다." },
  2: { title: "Travel", image: "images/illust_images/travel.jpg", description: "여행의 따뜻한 풍경을 담았습니다." },
  3: { title: "Puppy", image: "images/illust_images/puppy.jpg", description: "강아지와의 포근한 하루를 그렸습니다." },
  4: { title: "Magical Night", image: "images/illust_images/magicalnight.jpg", description: "마법 같은 밤을 표현했습니다." },
  5: { title: "Adventure", image: "images/illust_images/advanture2.jpg", description: "모험을 떠나는 순간을 담았습니다." },
  6: { title: "Cake", image: "images/illust_images/cake.jpg", description: "달콤한 케이크의 기억을 그렸습니다." }
};

// ✅ 일러스트 상세 페이지 표시
function showArtworkDetail(id) {
  const work = artworks[id];
  if (work) {
    document.getElementById("detail-title").textContent = work.title;
    document.getElementById("detail-image").src = work.image;
    document.getElementById("detail-image").alt = work.title;
    document.getElementById("detail-description").textContent = work.description;
    showSection("illustration-detail");
  }
}

function goBackToGallery() {
  history.back();
}

// ✅ 초기 라우팅
function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const hash = window.location.hash.replace("#", "");

  if (hash) {
    showSection(hash);
  } else if (id && artworks[id]) {
    showArtworkDetail(id);
  } else {
    showSection("home");
  }
}

// ✅ 갤러리 링크 이벤트 연결
function setupGalleryLinks() {
  const links = document.querySelectorAll("#illustration .gallery a");
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const id = new URL(link.href, window.location.origin).searchParams.get("id");
      if (artworks[id]) {
        history.pushState({ page: 'detail', id }, '', `?id=${id}`);
        showArtworkDetail(id);
      }
    });
  });
}

// ✅ 메뉴 링크 해시 라우팅
function setupMenuLinks() {
  document.querySelectorAll("nav a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        const sectionId = href.slice(1);
        history.pushState({}, '', `#${sectionId}`);
        handleRouting();
      }
    });
  });

  document.querySelector(".logo").addEventListener("click", () => {
    history.pushState({}, '', `#home`);
    handleRouting();
  });
}

// ✅ moreworks 슬라이드 버튼 연결
function setupSlideButtons() {
  const slideAmount = 240; // 이미지 하나 폭 기준

  // 첫 번째 갤러리
  const container1 = document.querySelector(".horizontal-gallery");
  const rightBtn1 = document.querySelector(".slide-button.right");
  const leftBtn1 = document.querySelector(".slide-button.left");

  rightBtn1?.addEventListener("click", () => {
    container1.scrollLeft += slideAmount;
  });

  leftBtn1?.addEventListener("click", () => {
    container1.scrollLeft -= slideAmount;
  });

  // 두 번째 갤러리
  const container2 = document.querySelector(".second-gallery");
  const rightBtn2 = document.querySelector(".slide-button.right.second");
  const leftBtn2 = document.querySelector(".slide-button.left.second");

  rightBtn2?.addEventListener("click", () => {
    container2.scrollLeft += slideAmount;
  });

  leftBtn2?.addEventListener("click", () => {
    container2.scrollLeft -= slideAmount;
  });
}


// ✅ 초기 실행
window.onload = () => {
  loadSections(() => {
    setTimeout(() => {
      setupGalleryLinks();
      setupMenuLinks();
      handleRouting();
      setupSlideButtons(); // ✅ 슬라이드 버튼 연결은 반드시 여기에!
    }, 0);
  });
};

window.addEventListener("hashchange", handleRouting);
window.addEventListener("popstate", handleRouting);
