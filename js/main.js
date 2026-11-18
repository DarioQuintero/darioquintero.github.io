// Builds the grid of all works on works.html from the list in works.js.

const grid = document.getElementById("works-grid");

for (const work of works) {
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
