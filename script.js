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
  if (!form || !submitBtn) return;

  // ── Toast helper ──────────────────────────────────────
  function showToast(msg, type = "success") {
    let toast = document.getElementById("form-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "form-toast";
      document.body.appendChild(toast);
    }
    toast.className = "form-toast " + type;
    toast.innerHTML =
      type === "success"
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg><span>${msg}</span>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>${msg}</span>`;
    toast.classList.add("show");
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove("show"), 4000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      shakeForm();
      form.reportValidity();
      return;
    }

    // Loading state
    const btnText = submitBtn.querySelector(".submit-text");
    const btnIcon = submitBtn.querySelector("svg");
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Sending…";
    if (btnIcon) btnIcon.style.display = "none";

    try {
      const data = new FormData(form);
      const action = form.getAttribute("action");
      await fetch(action, { method: "POST", body: data, mode: "no-cors" });
      showToast("Message sent! I'll get back to you soon", "success");
      form.reset();
    } catch (_) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = "Send Message";
      if (btnIcon) btnIcon.style.display = "";
    }
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

// ============ FEATURED EXPANDABLE ACCORDION (Mobile) ============
(function initAccordion() {
  const headers = document.querySelectorAll(".accordion-header");
  if (headers.length === 0) return;

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains("active");

      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item) otherItem.classList.remove("active");
      });

      if (isOpen) {
        item.classList.remove("active");
      } else {
        item.classList.add("active");
        setTimeout(() => {
          const y = item.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 300);
      }
    });
  });
})();

// PROJECT CAROUSEL (Desktop)
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
    timer = setInterval(next, 5000);
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

// TECH STACK ICONS

//HERO ROTATING ROLE
(function initHeroRotatingRole() {
  const el = document.getElementById("rotating-role");
  if (!el) return;

  const roles = [
    "Full Stack Developer",
    "DevOps Practitioner",
    "Open Source Contributor",
    "Exploring GenAI",
    "Java Enthusiast",
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % roles.length;
    el.textContent = roles[index];
  }, 1800);
})();
//RESUME MODAL
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
        mode: "no-cors",
      }).catch(() => {});
    });
})();
