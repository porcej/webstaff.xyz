// Get all <meta> elements once
const metas = document.getElementsByTagName('meta');

// Check if the device is an iPhone
if (navigator.userAgent.includes('iPhone')) {
  // Update the viewport meta tag
  for (const meta of metas) {
    if (meta.name === "viewport") {
      meta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
    }
  }

  // Add gesturestart listener
  document.addEventListener("gesturestart", () => {
    for (const meta of metas) {
      if (meta.name === "viewport") {
        meta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
      }
    }
  });
}