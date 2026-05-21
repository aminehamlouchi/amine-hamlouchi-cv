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
