self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("petshop-cache").then((cache) => cache.addAll(["/index.html"]))
    );
  });
  
  