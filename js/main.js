// Builds the grid of works on works.html from the list in works.js, with a
// row of tag buttons above it. One tag is shown at a time (no "All").
//
// The chosen tag is kept in the address, e.g. works.html?tag=code, so a
// filtered view can be linked to or bookmarked.

const grid = document.getElementById("works-grid");
const filter = document.getElementById("tag-filter");

// Every tag used by any work, alphabetically.
const allTags = [...new Set(works.flatMap((w) => w.tags || []))].sort();

function showWorks(tag) {
  const shown = tag ? works.filter((w) => (w.tags || []).includes(tag)) : works;

  grid.innerHTML = "";
  for (const work of shown) {
    const item = document.createElement("li");

    // The thumbnail: the image if there is one, otherwise a grey box.
    const picture = work.thumbnail
      ? `<img src="${work.thumbnail}" alt="${work.title}">`
      : `<div class="placeholder"></div>`;

    // "Title · Year", or just "Title" if there's no year.
    const caption = work.year ? `${work.title} · ${work.year}` : work.title;

    item.innerHTML = `
      <a href="work.html?id=${work.id}">
        <div class="thumb">${picture}</div>
        <p class="caption">${caption}</p>
      </a>
    `;
    grid.appendChild(item);
  }

  // Mark the chosen button.
  for (const button of filter.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.tag === (tag || "")));
  }
}

// One button per tag. There's no "All": each category is viewed on its own.
filter.innerHTML = allTags
  .map((t) => `<button type="button" data-tag="${t}">${t}</button>`)
  .join("");

filter.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const tag = button.dataset.tag;
  // Update the address without reloading (so Back still works sensibly).
  const url = new URL(location.href);
  url.searchParams.set("tag", tag);
  history.replaceState(null, "", url);
  showWorks(tag);
});

// Start with the tag from the address, if it's a real one; otherwise the
// first tag (alphabetically).
const startTag = new URLSearchParams(location.search).get("tag");
showWorks(allTags.includes(startTag) ? startTag : allTags[0]);
