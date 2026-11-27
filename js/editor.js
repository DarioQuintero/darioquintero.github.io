// ─────────────────────────────────────────────────────────────
// PAGE EDITOR
// Edit a work's page while looking at it. Only switches on when the site
// is opened through  python tools/edit.py  — never on the live site.
//
//   Left:  the page's text, in Markdown (live preview underneath)
//   Right: the list of images/videos (live preview underneath), plus the
//          files in this work's folder — click one to add it
// Save with the Save button or Ctrl+S.
// ─────────────────────────────────────────────────────────────

(function () {
  if (!work) return;
  if (!["localhost", "127.0.0.1"].includes(location.hostname)) return;
  fetch("/__edit/ping").then((r) => { if (r.ok) setUp(); }).catch(() => {});

  function setUp() {
    let saved = { text: page ? page.text : "", media: page ? page.media : "" };
    let editing = false;

    // ── Toolbar (bottom right) ──
    const bar = document.createElement("div");
    bar.className = "editor-bar";
    bar.innerHTML = `
      <span class="editor-status"></span>
      <button type="button" data-act="edit">Edit page</button>
      <button type="button" data-act="save" hidden>Save</button>
      <button type="button" data-act="done" hidden>Done</button>`;
    document.body.appendChild(bar);
    const status = bar.querySelector(".editor-status");
    const btn = (act) => bar.querySelector(`[data-act="${act}"]`);

    // ── Editing panels (built when editing starts) ──
    let textBox, mediaBox;

    function current() {
      return { text: textBox ? textBox.value : saved.text, media: mediaBox ? mediaBox.value : saved.media };
    }
    function unsaved() {
      const c = current();
      return editing && (c.text !== saved.text || c.media !== saved.media);
    }
    function showStatus(msg) {
      status.textContent = msg || (unsaved() ? "Unsaved changes" : "");
    }
    function grow(box) {                       // textareas grow to fit their text
      box.style.height = "auto";
      box.style.height = box.scrollHeight + 2 + "px";
    }
    function preview() {
      const c = current();
      renderWorkPage(c.text, c.media);
      showStatus();
    }

    function startEditing() {
      editing = true;
      btn("edit").hidden = true;
      btn("save").hidden = btn("done").hidden = false;

      // Left: Markdown text box above the (live) text.
      const body = document.getElementById("work-body");
      const textPanel = document.createElement("div");
      textPanel.className = "editor-panel";
      textPanel.innerHTML = `
        <label class="editor-label">Text <span>**bold** · *italic* · ## Heading · [link](https://…) · - list</span></label>
        <textarea class="editor-text" spellcheck="true"></textarea>
        <div class="editor-label">Preview</div>`;
      body.before(textPanel);
      textBox = textPanel.querySelector("textarea");
      textBox.value = saved.text;

      // Right: media list above the (live) images, plus this folder's files.
      const mediaPanel = document.createElement("div");
      mediaPanel.className = "editor-panel editor-media";
      mediaPanel.innerHTML = `
        <label class="editor-label">Images &amp; videos <span>one per line · <code>a.webp | b.webp</code> side by side · <code>"caption"</code> · <code>loop</code> · YouTube links · file names are from this work's folder</span></label>
        <textarea class="editor-text editor-mono" spellcheck="false"></textarea>
        <div class="editor-files"><span class="editor-label">Files in this work's folder — click to add (Shift+click: add beside the last one)</span><div class="editor-chips">Loading…</div></div>`;
      const items = document.createElement("div");
      items.id = "work-media-items";
      items.className = "editor-media-items";
      media.replaceChildren(mediaPanel, items);
      mediaBox = mediaPanel.querySelector("textarea");
      mediaBox.value = saved.media;

      for (const box of [textBox, mediaBox]) {
        box.addEventListener("input", () => { grow(box); preview(); });
        grow(box);
      }
      preview();
      loadFiles(mediaPanel.querySelector(".editor-chips"));
      textBox.focus();
    }

    function stopEditing() {
      editing = false;
      textBox.closest(".editor-panel").remove();
      textBox = mediaBox = null;
      media.replaceChildren();
      renderWorkPage(saved.text, saved.media);
      btn("edit").hidden = false;
      btn("save").hidden = btn("done").hidden = true;
      showStatus("");
    }

    async function save() {
      const c = current();
      showStatus("Saving…");
      try {
        const r = await fetch("/__edit/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: work.id, ...c }),
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || "save failed");
        saved = c;
        showStatus("Saved ✓");
        setTimeout(() => showStatus(), 1500);
      } catch (e) {
        showStatus("Couldn't save: " + e.message);
      }
    }

    // The files in works/<id>/, as buttons that add themselves to the list.
    async function loadFiles(holder) {
      try {
        const r = await fetch(`/__edit/files?id=${encodeURIComponent(work.id)}`);
        const { folder, files } = await r.json();
        if (!files.length) {
          holder.textContent = `No files yet — put images in ${folder}`;
          return;
        }
        holder.innerHTML = files
          .map((f) => `<button type="button" class="editor-chip" data-src="${f.replace(folder, "")}">${f.replace(folder, "")}</button>`)
          .join("");
        holder.addEventListener("click", (e) => {
          const chip = e.target.closest(".editor-chip");
          if (!chip) return;
          const v = mediaBox.value.replace(/\s+$/, "");
          mediaBox.value = e.shiftKey && v ? `${v} | ${chip.dataset.src}\n` : `${v ? v + "\n" : ""}${chip.dataset.src}\n`;
          grow(mediaBox);
          preview();
        });
      } catch (e) {
        holder.textContent = "Couldn't list the folder.";
      }
    }

    bar.addEventListener("click", (e) => {
      const act = e.target.dataset.act;
      if (act === "edit") startEditing();
      if (act === "save") save();
      if (act === "done") {
        if (unsaved() && !confirm("You have unsaved changes. Leave editing and discard them?")) return;
        stopEditing();
      }
    });

    // Ctrl+S / Cmd+S saves while editing.
    document.addEventListener("keydown", (e) => {
      if (editing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    });

    // Warn before leaving the page with unsaved changes.
    window.addEventListener("beforeunload", (e) => {
      if (unsaved()) { e.preventDefault(); e.returnValue = ""; }
    });
  }
})();
