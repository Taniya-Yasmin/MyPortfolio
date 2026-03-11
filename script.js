/* ============================================
   PORTFOLIO — SCRIPT.JS
   Particles | Scroll Reveal | Parallax
   Filter Tabs | Nav | Form
   ============================================ */

"use strict";

// ============ PARTICLES ============
(function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let W,
    H,
    particles = [];
  const COUNT = 90;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.1 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15 - 0.03;
      this.alpha = Math.random() * 0.35 + 0.05;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.012;
      if (this.x < -4 || this.x > W + 4 || this.y < -4 || this.y > H + 4)
        this.reset();
    }
    draw() {
      const a = this.alpha * (0.75 + 0.25 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 230, ${a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Draw connection lines between nearby particles
  function drawConnections() {
    const DIST = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - d / DIST) * 0.04;
          ctx.strokeStyle = `rgba(180,200,230,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(tick);
  }
  tick();
})();

// ============ SCROLL REVEAL ============
(function initScrollReveal() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  els.forEach((el) => {
    if (el.style.getPropertyValue("--reveal-delay")) return;
    const group =
      el.closest(
        ".hero-inner, .section, .stack-grid, .cert-img-grid, .achievements-grid, .contact-grid",
      ) || el.parentElement;
    if (!group) return;
    const siblings = Array.from(group.children).filter(
      (node) => node.classList && node.classList.contains("reveal"),
    );
    const idx = siblings.indexOf(el);
    if (idx > 0) {
      el.style.setProperty("--reveal-delay", `${Math.min(idx * 70, 420)}ms`);
    }
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -12% 0px" },
  );

  els.forEach((el) => observer.observe(el));
})();

// ============ NAV SCROLL ============
(function initNav() {
  const header = document.getElementById("nav-header");
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      updateActiveNav();
    },
    { passive: true },
  );

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  function updateActiveNav() {
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    links.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + current,
      );
    });
  }
})();

// ============ PARALLAX HERO ORB ============
(function initParallax() {
  const orb = document.getElementById("hero-orb");
  if (!orb) return;
  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;
      const offset = scrollY * 0.12;
      orb.style.transform = `translateY(${offset}px)`;
    },
    { passive: true },
  );
})();

// ============ PROJECT FILTER ============
(function initFilter() {
  const btns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      cards.forEach((card) => {
        const cats = card.getAttribute("data-category") || "";
        const show = filter === "all" || cats.includes(filter);
        card.style.opacity = "0";
        card.style.transform = "translateY(12px)";
        if (show) {
          card.classList.remove("hidden");
          setTimeout(() => {
            card.style.transition = "opacity 0.35s ease, transform 0.35s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 30);
        } else {
          setTimeout(() => card.classList.add("hidden"), 300);
        }
      });
    });
  });
})();

// ============ CONTACT FORM ============
(function initForm() {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit");
  const nextInput = document.getElementById("contact-next");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      shakeForm();
      form.reportValidity();
      e.preventDefault();
      return;
    }

    if (nextInput) {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      nextInput.value = `${baseUrl}#contact`;
    }

    // Sending state while browser submits the form.
    submitBtn.classList.add("submitted");
    submitBtn.querySelector(".submit-text").textContent = "Sending...";
    submitBtn.disabled = true;
    const icon = submitBtn.querySelector("svg");
    if (icon) icon.style.display = "none";
  });

  function shakeForm() {
    form.style.animation = "shake 0.4s ease";
    setTimeout(() => (form.style.animation = ""), 400);
  }
})();

// ============ CURSOR GLOW (subtle) ============
(function initCursorGlow() {
  let mx = 0,
    my = 0;
  const glow = document.createElement("div");
  glow.style.cssText = `
    position:fixed; width:320px; height:320px; border-radius:50%;
    background: radial-gradient(circle, rgba(200,210,230,0.03) 0%, transparent 70%);
    pointer-events:none; z-index:0; transition: transform 0.1s ease;
    transform: translate(-50%, -50%); top:0; left:0;
  `;
  document.body.appendChild(glow);

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      glow.style.left = mx + "px";
      glow.style.top = my + "px";
    },
    { passive: true },
  );
})();

// ============ SHAKE KEYFRAMES (inject) ============
(function injectKeyframes() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono&display=swap');
  `;
  document.head.appendChild(style);
})();

// ============ SECTION REVEAL STAGGER ============
(function initStaggerReveal() {
  const gridReveal = document.querySelectorAll(
    ".stack-category.reveal, .project-card",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll(
            ".stack-item, .proj-card-title",
          );
          items.forEach((item, idx) => {
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "translateX(0)";
            }, idx * 60);
          });
        }
      });
    },
    { threshold: 0.2 },
  );

  gridReveal.forEach((el) => observer.observe(el));
})();

// ============ THEME TOGGLE ============
(function initTheme() {
  const btn = document.getElementById("theme-toggle");
  const root = document.documentElement;
  // Restore saved preference
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);

  btn &&
    btn.addEventListener("click", () => {
      const isLight = root.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
})();

// ============ PROJECT CAROUSEL ============
(function initCarousel() {
  const track = document.getElementById("carousel-track");
  const prevBtn = document.getElementById("car-prev");
  const nextBtn = document.getElementById("car-next");
  const dots = document.querySelectorAll(".car-dot");
  if (!track) return;

  const total = track.children.length;
  let current = 0;
  let timer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  function startAuto() {
    timer = setInterval(next, 4000);
  }
  function stopAuto() {
    clearInterval(timer);
  }

  nextBtn &&
    nextBtn.addEventListener("click", () => {
      stopAuto();
      next();
      startAuto();
    });
  prevBtn &&
    prevBtn.addEventListener("click", () => {
      stopAuto();
      prev();
      startAuto();
    });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAuto();
      goTo(parseInt(dot.dataset.idx));
      startAuto();
    });
  });

  // Pause on hover
  const carousel = document.getElementById("proj-carousel");
  carousel && carousel.addEventListener("mouseenter", stopAuto);
  carousel && carousel.addEventListener("mouseleave", startAuto);

  startAuto();
})();

// ============ EXPERIENCE EXPAND TOGGLE ============
(function initExpToggle() {
  document.querySelectorAll(".exp-toggle").forEach((btn) => {
    const card = btn.closest(".exp-card");
    const details = card && card.querySelector(".exp-details");
    if (!details) return;
    // All open by default — toggling collapses
    btn.addEventListener("click", () => {
      const open = btn.classList.contains("open");
      if (open) {
        details.style.maxHeight = "0";
        details.style.overflow = "hidden";
        details.style.opacity = "0";
      } else {
        details.style.maxHeight = details.scrollHeight + "px";
        details.style.overflow = "visible";
        details.style.opacity = "1";
      }
      btn.classList.toggle("open");
    });
    // Set initial expanded state
    details.style.maxHeight = "none";
    details.style.overflow = "visible";
    details.style.opacity = "1";
    details.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
  });
})();

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const btn = document.getElementById("nav-hamburger");
  if (!menu || !btn) return;
  menu.classList.remove("open");
  btn.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

(function initHamburger() {
  const btn = document.getElementById("nav-hamburger");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.contains("open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      menu.classList.add("open");
      btn.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // prevent bg scroll
    }
  });

  // Close when any mobile link is clicked
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // Close on scroll (user scrolls while menu somehow shows)
  window.addEventListener(
    "scroll",
    () => {
      if (menu.classList.contains("open")) closeMobileMenu();
    },
    { passive: true },
  );

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  // Update mobile active link to mirror desktop nav
  const sections = document.querySelectorAll("section[id]");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");
  window.addEventListener(
    "scroll",
    () => {
      let cur = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 140) cur = s.id;
      });
      mobileLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + cur),
      );
    },
    { passive: true },
  );
})();

// ============ TECH STACK ICONS ============
(function initTechStackIcons() {
  const iconMap = {
    JavaScript: "https://cdn.simpleicons.org/javascript/F7DF1E",
    Python: "https://cdn.simpleicons.org/python/3776AB",
    "C++": "https://cdn.simpleicons.org/cplusplus/00599C",
    Java: "https://cdn.simpleicons.org/openjdk/ED8B00",
    C: "https://cdn.simpleicons.org/c/00599C",
    HTML: "https://cdn.simpleicons.org/html5/E34F26",
    CSS: "https://cdn.simpleicons.org/css/1572B6",
    "Node.js": "https://cdn.simpleicons.org/nodedotjs/339933",
    "Express.js": "https://cdn.simpleicons.org/express/FFFFFF",
    JWT: "https://cdn.simpleicons.org/jsonwebtokens/FFFFFF",
    "Client Server Architecture": "https://cdn.simpleicons.org/nginx/009639",
    "RESTful APIs": "https://cdn.simpleicons.org/openapiinitiative/6BA539",
    "API Development": "https://cdn.simpleicons.org/postman/FF6C37",
    Authentication: "https://cdn.simpleicons.org/auth0/EB5424",
    MongoDB: "https://cdn.simpleicons.org/mongodb/47A248",
    MySQL: "https://cdn.simpleicons.org/mysql/4479A1",
    "Database Design": "https://cdn.simpleicons.org/postgresql/4169E1",
    "CRUD Operations": "https://cdn.simpleicons.org/hasura/1EB4D4",
    Docker: "https://cdn.simpleicons.org/docker/2496ED",
    Git: "https://cdn.simpleicons.org/git/F05032",
    GitHub: "https://cdn.simpleicons.org/github/FFFFFF",
    Nginx: "https://cdn.simpleicons.org/nginx/009639",
    Postman: "https://cdn.simpleicons.org/postman/FF6C37",
    Linux: "https://cdn.simpleicons.org/linux/FCC624",
    Bootstrap: "https://cdn.simpleicons.org/bootstrap/7952B3",
    "AWS (EC2, S3, IAM)": "https://cdn.simpleicons.org/amazonaws/FF9900",
    Jenkins: "https://cdn.simpleicons.org/jenkins/D24939",
    "Git, GitHub, Linux": "https://cdn.simpleicons.org/github/FFFFFF",
    "Data Structures and Algorithms":
      "https://cdn.simpleicons.org/leetcode/FFA116",
    "Operating Systems": "https://cdn.simpleicons.org/linux/FCC624",
    DBMS: "https://cdn.simpleicons.org/sqlite/003B57",
    "Computer Networks": "https://cdn.simpleicons.org/cisco/1BA0D7",
    NumPy: "https://cdn.simpleicons.org/numpy/013243",
    Pandas: "https://cdn.simpleicons.org/pandas/150458",
    "Scikit-learn": "https://cdn.simpleicons.org/scikitlearn/F7931E",
    TensorFlow: "https://cdn.simpleicons.org/tensorflow/FF6F00",
    PyTorch: "https://cdn.simpleicons.org/pytorch/EE4C2C",
  };
  const fallbackIcon = "https://cdn.simpleicons.org/devbox/7E57C2";

  document.querySelectorAll("#stack .stack-item").forEach((item) => {
    const nameEl = item.querySelector(".si-name");
    const marker = item.querySelector(".si-dot");
    if (!nameEl || !marker || item.querySelector(".si-icon")) return;

    const name = nameEl.textContent.trim();
    const icon = document.createElement("img");
    icon.className = "si-icon";
    icon.src = iconMap[name] || fallbackIcon;
    icon.alt = name + " icon";
    icon.loading = "lazy";
    icon.decoding = "async";
    icon.onerror = () => {
      icon.src = fallbackIcon;
    };

    marker.replaceWith(icon);
  });
})();

// ============ HERO ROTATING ROLE ============
(function initHeroRotatingRole() {
  const el = document.getElementById("rotating-role");
  if (!el) return;

  const roles = [
    "MERN Stack Developer",
    "DevOps Practitioner",
    "Open Source Contributor",
    "AI/ML Explorer",
    "Tech Enthusiast",
    "Problem Solver",
    "Programmer",
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % roles.length;
    el.textContent = roles[index];
  }, 1800);
})();

// ============ RESUME MODAL ============
(function initResumeModal() {
  const openBtn = document.getElementById("btn-resume");
  const modal = document.getElementById("resume-modal");
  const closeBtn = document.getElementById("resume-modal-close");
  const downloadBtn = document.getElementById("download-resume");

  if (!openBtn || !modal) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // Close on backdrop click (outside the card)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // Send email notification using FormSubmit
  downloadBtn &&
    downloadBtn.addEventListener("click", () => {
      const now = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      const formData = new FormData();
      formData.append("name", "Portfolio System");
      formData.append("email", "taniyayasmin65@gmail.com");
      formData.append("_subject", "New Resume Download");
      formData.append(
        "message",
        "Someone downloaded your resume from your portfolio!\nTime: " + now,
      );
      formData.append("_captcha", "false");

      fetch("https://formsubmit.co/taniyayasmin65@gmail.com", {
        method: "POST",
        body: formData,
        mode: "no-cors", // Prevent CORS errors, silent submit
      }).catch(() => {}); // silent fail — never block the download
    });
})();
