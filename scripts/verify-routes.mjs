async function verify() {
  const routes = [
    { url: "http://localhost:3000/", name: "Home redirect" },
    { url: "http://localhost:3000/blogs", name: "Public Blogs Listing" },
    { url: "http://localhost:3000/blogs/how-to-write-a-sponsor-blog-letter", name: "Blog Detail Page" },
    { url: "http://localhost:3000/admin/posts", name: "Admin Posts Management" },
    { url: "http://localhost:3000/admin/posts/create", name: "Admin Create Post" }
  ];

  console.log("Checking Next.js routes...");
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      const text = await res.text();
      console.log(`[${res.status}] ${r.name} (${r.url}) - Length: ${text.length} bytes`);
      if (r.url.includes("/blogs") && !r.url.includes("letter")) {
        console.log(`  -> Contains "Blog's": ${text.includes("Blog's")}`);
        console.log(`  -> Contains Newsletter Card text: ${text.includes("Be the")}`);
      }
      if (r.url.includes("create")) {
        console.log(`  -> Contains "New Post": ${text.includes("New Post")}`);
      }
    } catch (e) {
      console.error(`Error fetching ${r.name}:`, e.message);
    }
  }
}

verify();
