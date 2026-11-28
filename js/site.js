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


// {
//   function mapRange(value, inMin, inMax, outMin, outMax) {
//     return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
//   }

//   const numPoints = 8000;
//   const points = []
  
//   x = 0
//   y = 0
//   for(let i = 0; i < numPoints; i++){
//     points.push({x: x, y: y})
//     x += mapRange(Math.random(), 0, 1, -0.1, 1)
//     y += mapRange(Math.random(), 0, 1, -0.1, 0.1)
//   }

//   function resize(ctx, canvas){
//     const rect = canvas.getBoundingClientRect();
//     const dpr = window.devicePixelRatio || 1;
    
//     canvas.width = Math.round(rect.width * dpr);
//     canvas.height = Math.round(rect.height * dpr);
    
//     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
//     drawHeaderline(ctx, rect.width, rect.height);
//   }

//   function drawHeaderline(ctx, width, height)
//   {
//     ctx.fillStyle = "#ffffff";
//     ctx.fillRect(0,0,width,height);
    
//     ctx.strokeStyle = "blue"
//     ctx.beginPath();
    
//     ctx.fillStyle = "#606060";
//     for(i = 0; i < points.length; i++)
//     {
//       let x = points[i].x
//       let y = points[i].y + height * 0.95
      
//       if (y > height) {
//         y = height - (y - height);
//       }
//       if (y < 0) {
//         y = - y;
//       }
      
//         ctx.fillRect(x, y, 1, Math.random())
//     }
//   }
//   // Add custom line beneath all headers.
//   for (const header of document.querySelectorAll(".site-header")) {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
    
//     canvas.classList.add("site-header-line");
//     canvas.setAttribute("aria-hidden", "true");
    
//     new ResizeObserver(() => resize(ctx, canvas)).observe(canvas);
//     header.appendChild(canvas);

//   }
// }