const adminEmail = "rijal.bebek68@gmail.com";

// ── Theme toggle (light / dark) ──
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// Restore saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    setTheme(current === "light" ? "dark" : "light");
  });
}

// ── Hero image: 4 clicks to toggle theme ──
const heroImg = document.getElementById("hero-img");
if (heroImg) {
  let clickCount = 0;
  heroImg.addEventListener("click", () => {
    clickCount++;
    if (clickCount >= 4) {
      clickCount = 0;
      heroImg.classList.remove("spin");
      void heroImg.offsetWidth;
      heroImg.classList.add("spin");
      setTimeout(() => {
        const current = root.getAttribute("data-theme");
        setTheme(current === "light" ? "dark" : "light");
      }, 300);
      heroImg.addEventListener("animationend", () => {
        heroImg.classList.remove("spin");
      }, { once: true });
    }
  });
}

const contactForm = document.getElementById("contact-form");
const yearElement = document.getElementById("year");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("nav-links");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// ── Scroll-triggered reveal animation ──
const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((el) => observer.observe(el));
}

// ── Active nav highlight on scroll ──
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("active"));
          const active = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  ["name", "email", "subject", "message"].forEach((id) => showError(id, ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    const status = document.getElementById("form-status");

    let hasError = false;

    if (!name) {
      showError("name", "Please enter your name.");
      hasError = true;
    }

    if (!email) {
      showError("email", "Please enter your email.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      showError("email", "Please enter a valid email address.");
      hasError = true;
    }

    if (!subject) {
      showError("subject", "Please add a subject.");
      hasError = true;
    }

    if (!message) {
      showError("message", "Please write a message.");
      hasError = true;
    }

    if (hasError) {
      if (status) {
        status.textContent = "Please fix the highlighted fields and try again.";
        status.style.color = "#ff4060";
      }
      return;
    }

    // Disable the submit button while sending
    const submitBtn = contactForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch("https://formsubmit.co/ajax/rijal.bebek68@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        _subject: `[Portfolio Contact] ${subject}`,
        message,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(() => {
        if (status) {
          status.textContent = "";
        }
        contactForm.reset();
        // Show success confirmation
        showMsg();
      })
      .catch(() => {
        if (status) {
          status.textContent = "Failed to send message. Please try again.";
          status.style.color = "#ff4060";
        }
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Email";
        }
      });
  });
}

// ── Success confirmation dialog ──
let msgTimer = null;
const msgDialog = document.getElementById("msg-confirm");

function hideMsg() {
  if (msgDialog) {
    msgDialog.classList.remove("show");
    msgDialog.hidden = true;
  }
  clearTimeout(msgTimer);
}

function showMsg() {
  if (!msgDialog) return;
  msgDialog.hidden = false;
  msgDialog.style.display = "";
  // Force reflow so the scale-in animation replays each time
  void msgDialog.offsetWidth;
  msgDialog.classList.add("show");
  clearTimeout(msgTimer);
  msgTimer = setTimeout(hideMsg, 3000);
}

const msgClose = document.getElementById("msg-confirm-close");
if (msgClose) {
  msgClose.addEventListener("click", hideMsg);
}

if (msgDialog) {
  msgDialog.addEventListener("click", (e) => {
    if (e.target === msgDialog) hideMsg();
  });
}

// ── Snake Game (Easter egg: click "Bibek" in footer) ──
(function () {
  const bibekEl = document.getElementById("footer-bibek");
  const overlay = document.getElementById("game-overlay");
  const canvas = document.getElementById("snake-canvas");
  const scoreEl = document.getElementById("game-score");
  const startBtn = document.getElementById("game-start");
  const closeBtn = document.getElementById("game-close");
  if (!bibekEl || !overlay || !canvas) return;

  const ctx = canvas.getContext("2d");
  const GRID = 20;
  const COLS = canvas.width / GRID;
  const ROWS = canvas.height / GRID;

  let snake, dir, nextDir, food, score, speed, gameLoop, running;
  let highScore = 0;
  const highScoreEl = document.getElementById("game-highscore");

  function init() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = 120;
    running = false;
    scoreEl.textContent = "0";
    placeFood();
    draw();
    startBtn.textContent = "Start Game";
    startBtn.style.display = "";
  }

  function placeFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function draw() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    ctx.fillStyle = isLight ? "#e8e8e8" : "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines subtly
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)";
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * GRID, 0); ctx.lineTo(i * GRID, canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * GRID); ctx.lineTo(canvas.width, i * GRID); ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ff4060";
    ctx.shadowColor = "#ff4060";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(food.x * GRID + GRID / 2, food.y * GRID + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const brightness = 1 - (i / snake.length) * 0.5;
      if (isLight) {
        ctx.fillStyle = `rgba(21, 112, 0, ${brightness})`;
      } else {
        ctx.fillStyle = `rgba(57, 255, 20, ${brightness})`;
      }
      ctx.shadowColor = isLight ? "#157000" : "#39ff14";
      ctx.shadowBlur = i === 0 ? 10 : 0;
      const r = i === 0 ? 6 : 4;
      ctx.beginPath();
      ctx.roundRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2, r);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision — wrap around
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      placeFood();
      if (speed > 60) speed -= 2;
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    clearInterval(gameLoop);
    running = false;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
    }
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff4060";
    ctx.font = "bold 28px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Manrope, sans-serif";
    ctx.fillText("Score: " + score + "  |  Best: " + highScore, canvas.width / 2, canvas.height / 2 + 20);
    startBtn.textContent = "Play Again";
    startBtn.style.display = "";
  }

  function startGame() {
    init();
    running = true;
    startBtn.style.display = "none";
    gameLoop = setInterval(tick, speed);
  }

  function setDir(x, y) {
    if (x === -dir.x && y === 0) return;
    if (y === -dir.y && x === 0) return;
    nextDir = { x, y };
  }

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    if (!running) return;
    switch (e.key) {
      case "ArrowUp":    case "w": case "W": e.preventDefault(); setDir(0, -1); break;
      case "ArrowDown":  case "s": case "S": e.preventDefault(); setDir(0, 1);  break;
      case "ArrowLeft":  case "a": case "A": e.preventDefault(); setDir(-1, 0); break;
      case "ArrowRight": case "d": case "D": e.preventDefault(); setDir(1, 0);  break;
    }
  });

  // D-pad buttons
  document.querySelectorAll(".dpad-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!running) return;
      const d = btn.getAttribute("data-dir");
      if (d === "up")    setDir(0, -1);
      if (d === "down")  setDir(0, 1);
      if (d === "left")  setDir(-1, 0);
      if (d === "right") setDir(1, 0);
    });
  });

  function openGame() {
    overlay.style.display = "flex";
    init();
  }

  function closeGame() {
    clearInterval(gameLoop);
    running = false;
    overlay.style.display = "none";
  }

  // Click "Bibek" in footer to open game
  bibekEl.addEventListener("click", openGame);

  startBtn.addEventListener("click", startGame);
  closeBtn.addEventListener("click", closeGame);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeGame();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display === "flex") closeGame();
  });
})();
