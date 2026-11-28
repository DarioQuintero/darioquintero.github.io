// ─────────────────────────────────────────────────────────────
// SITE-WIDE SETTINGS
// Loaded on every page.
// ─────────────────────────────────────────────────────────────

const EMAIL = "dario.r.quintero@gmail.com";   // your email — used everywhere

// Every link with a  data-email  attribute becomes a link to EMAIL.
// Add  data-email="show"  to also show the address as the link's text.
//   <a data-email>Contact</a>              → "Contact", emails you
//   <a data-email="show"></a>              → "dario.r.quintero@gmail.com"
for (const link of document.querySelectorAll("[data-email]")) {
  link.href = `mailto:${EMAIL}`;
  if (link.dataset.email === "show") link.textContent = EMAIL;
}

// A button with  data-print  opens the print dialog (CV page: "Save as PDF").
for (const button of document.querySelectorAll("[data-print]")) {
  button.addEventListener("click", () => window.print());
}
