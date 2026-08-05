const DELIVERY = {
  formEndpoint: "",
  recipientEmail: "your-email@example.com",
  smsNumber: "+15026931063"
};

const accessScreen = document.getElementById("accessScreen");
const accessForm = document.getElementById("accessForm");
const accessCode = document.getElementById("accessCode");
const gateError = document.getElementById("gateError");
const siteShell = document.getElementById("siteShell");
const introDialog = document.getElementById("introDialog");
const closeIntro = document.getElementById("closeIntro");
const contactDialog = document.getElementById("contactDialog");
const contactForm = document.getElementById("contactForm");
const closeContact = document.getElementById("closeContact");
const contactStatus = document.getElementById("contactStatus");
const summaryTabs = document.querySelectorAll("[data-summary-tab]");
const summaryPanels = document.querySelectorAll("[data-summary-panel]");

function isValidAccessCode(value) {
  const trimmed = value.trim();
  const number = Number(trimmed);
  return trimmed !== "" && Number.isFinite(number) && Number.isInteger(number) && number % 3 === 0;
}

function unlockSite() {
  document.title = "Amine Hamlouchi | Marriage CV";
  document.body.classList.remove("is-locked");
  accessScreen.hidden = true;
  siteShell.hidden = false;
  siteShell.removeAttribute("aria-hidden");
  startReveals();

  window.requestAnimationFrame(() => {
    if (typeof introDialog.showModal === "function") {
      introDialog.showModal();
    } else {
      introDialog.setAttribute("open", "");
    }
  });
}

function showGateError(message) {
  gateError.textContent = message;
  accessForm.classList.remove("shake");
  void accessForm.offsetWidth;
  accessForm.classList.add("shake");
  accessCode.select();
}

function openContactDialog() {
  contactStatus.textContent = "";
  if (typeof contactDialog.showModal === "function") {
    contactDialog.showModal();
  } else {
    contactDialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function canUseConfiguredEmail() {
  return DELIVERY.recipientEmail && !DELIVERY.recipientEmail.includes("your-email");
}

function canTryHostedForm() {
  const localHosts = ["localhost", "127.0.0.1", "::1", ""];
  return window.location.protocol.startsWith("http") && !localHosts.includes(window.location.hostname);
}

function buildMessage(data) {
  return [
    "Marriage CV contact note",
    "",
    `Name: ${data.name}`,
    `Contact info: ${data.contact_info}`,
    "",
    "Message:",
    data.message
  ].join("\n");
}

function fallbackDelivery(data) {
  const subject = encodeURIComponent(`Marriage CV response from ${data.name}`);
  const body = encodeURIComponent(buildMessage(data));

  if (canUseConfiguredEmail()) {
    window.location.href = `mailto:${DELIVERY.recipientEmail}?subject=${subject}&body=${body}`;
    contactStatus.textContent = "Your email app should open with the note ready to send.";
    return;
  }

  window.location.href = `sms:${DELIVERY.smsNumber}?&body=${body}`;
  contactStatus.textContent = "Your message app should open with the note ready to send.";
}

async function submitToEndpoint(formData) {
  if (DELIVERY.formEndpoint) {
    const response = await fetch(DELIVERY.formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) {
      throw new Error("Endpoint rejected the message.");
    }

    return;
  }

  if (!canTryHostedForm()) {
    throw new Error("No hosted form endpoint available.");
  }

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString()
  });

  if (!response.ok) {
    throw new Error("Hosted form submit failed.");
  }
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isValidAccessCode(accessCode.value)) {
    gateError.textContent = "";
    unlockSite();
    return;
  }

  showGateError("That access number is not valid.");
});

document.querySelectorAll("[data-open-contact]").forEach((button) => {
  button.addEventListener("click", openContactDialog);
});

summaryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeKey = tab.dataset.summaryTab;

    summaryTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    summaryPanels.forEach((panel) => {
      const isActive = panel.dataset.summaryPanel === activeKey;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  });
});

/* ---------- in-page document viewer ---------- */
const docDialog = document.getElementById("docDialog");
const docOpeners = document.querySelectorAll("[data-open-doc]");
const closeDoc = document.getElementById("closeDoc");

if (docDialog && docOpeners.length) {
  const openDocDialog = (event) => {
    event.preventDefault();
    docDialog.querySelectorAll("[data-doc-page]").forEach((img) => {
      if (!img.src) img.src = img.dataset.src;
    });
    if (typeof docDialog.showModal === "function") {
      docDialog.showModal();
    } else {
      docDialog.setAttribute("open", "");
    }
  };

  docOpeners.forEach((el) => el.addEventListener("click", openDocDialog));
  if (closeDoc) closeDoc.addEventListener("click", () => closeDialog(docDialog));

  docDialog.addEventListener("click", (event) => {
    const bounds = docDialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) closeDialog(docDialog);
  });
}

closeIntro.addEventListener("click", () => closeDialog(introDialog));
closeContact.addEventListener("click", () => closeDialog(contactDialog));

contactDialog.addEventListener("click", (event) => {
  const dialogBounds = contactDialog.getBoundingClientRect();
  const clickedBackdrop =
    event.clientX < dialogBounds.left ||
    event.clientX > dialogBounds.right ||
    event.clientY < dialogBounds.top ||
    event.clientY > dialogBounds.bottom;

  if (clickedBackdrop) {
    closeDialog(contactDialog);
  }
});

/* ---------- riad motion: reveals + hero name letters ---------- */
const motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

/* ---------- rotating ayaat, ahadith & wisdom on marriage ---------- */
const QUOTES = [
  {
    kind: "Qur'an",
    ar: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    en: "“And He placed between you affection and mercy.”",
    src: "Ar-Rum 30:21"
  },
  {
    kind: "Qur'an",
    ar: "هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ",
    en: "“They are a garment for you, and you are a garment for them.”",
    src: "Al-Baqarah 2:187"
  },
  {
    kind: "Qur'an",
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    en: "“Our Lord, grant us from our spouses and offspring the comfort of our eyes.”",
    src: "Al-Furqan 25:74"
  },
  {
    kind: "Hadith",
    ar: "النِّكَاحُ مِنْ سُنَّتِي",
    en: "“Marriage is part of my Sunnah.”",
    src: "Ibn Majah 1846"
  },
  {
    kind: "Hadith",
    ar: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ",
    en: "“The best of you are those who are best to their families.”",
    src: "At-Tirmidhi 3895"
  },
  {
    kind: "Hadith",
    ar: "لَمْ نَرَ لِلْمُتَحَابَّيْنِ مِثْلَ النِّكَاحِ",
    en: "“We have not seen anything like marriage for two who love one another.”",
    src: "Ibn Majah 1847"
  },
  {
    kind: "Hadith",
    ar: "الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ",
    en: "“The world is provision, and the best provision of this world is a righteous wife.”",
    src: "Muslim 1467"
  },
  {
    kind: "Hadith",
    ar: "فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ",
    en: "“Marry the one with deen, may your hands be rubbed with dust.”",
    src: "Al-Bukhari 5090"
  },
  {
    kind: "Hadith",
    ar: "لَمْ يَسْتَفِدِ الْمُؤْمِنُ بَعْدَ تَقْوَى اللَّهِ خَيْرًا لَهُ مِنْ زَوْجَةٍ صَالِحَةٍ",
    en: "“After taqwa of Allah, the believer gains nothing better than a righteous wife.”",
    src: "Ibn Majah 1857"
  }
];

const quoteRails = document.querySelectorAll("[data-quote-rail]");
if (quoteRails.length) {
  const railState = [];

  quoteRails.forEach((rail, railIndex) => {
    const offset = Number(rail.dataset.offset || railIndex);
    const inner = document.createElement("div");
    inner.className = "quote-inner";
    rail.appendChild(inner);
    railState.push({ inner, index: (offset * 3) % QUOTES.length });
  });

  const renderQuote = (state) => {
    const q = QUOTES[state.index % QUOTES.length];
    state.inner.innerHTML = `
      <p class="quote-kind">${q.kind}</p>
      <p class="quote-ar" lang="ar" dir="rtl">${q.ar}</p>
      <p class="quote-en">${q.en}</p>
      <p class="quote-src">${q.src}</p>
    `;
  };

  railState.forEach(renderQuote);

  const prefersMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (prefersMotion) {
    setInterval(() => {
      if (document.hidden) return;
      railState.forEach((state, i) => {
        // stagger the two rails slightly so they never blink in sync
        setTimeout(() => {
          state.inner.classList.add("is-out");
          setTimeout(() => {
            state.index += 1;
            renderQuote(state);
            state.inner.classList.remove("is-out");
          }, 720);
        }, i * 900);
      });
    }, 11000);
  }
}

const nameEl = document.querySelector("[data-name-reveal]");
if (nameEl && motionOK) {
  const text = nameEl.textContent;
  nameEl.setAttribute("aria-label", text);
  let letterIndex = 0;
  nameEl.innerHTML = text
    .split(" ")
    .map((word) => {
      const letters = word
        .split("")
        .map((ch) => `<span class="name-letter" aria-hidden="true" style="--i:${letterIndex++}">${ch}</span>`)
        .join("");
      return `<span class="name-word">${letters}</span>`;
    })
    .join(" ");
}

function startReveals() {
  if (nameEl) {
    requestAnimationFrame(() => nameEl.classList.add("name-in"));
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !motionOK) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  if (formData.get("bot-field")) {
    return;
  }

  contactStatus.textContent = "Preparing your note...";

  const data = {
    name: String(formData.get("name") || "").trim(),
    contact_info: String(formData.get("contact_info") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };

  try {
    await submitToEndpoint(formData);
    contactStatus.textContent = "Thank you. Your note has been submitted.";
    contactForm.reset();
  } catch (error) {
    fallbackDelivery(data);
  }
});
