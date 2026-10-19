async function testAuth() {
  console.log("--- 1. Testing Unauthenticated Access to Admin ---");
  const unauthRes = await fetch("http://localhost:3000/admin/posts", {
    redirect: "manual",
  });
  console.log(`Access /admin/posts status: ${unauthRes.status}`);
  console.log(`Redirect Location: ${unauthRes.headers.get("location")}`);

  console.log("\n--- 2. Testing Invalid Login ---");
  const failLoginRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "wronguser", password: "wrongpassword" }),
  });
  console.log(`Fail Login Status: ${failLoginRes.status}`);
  const failData = await failLoginRes.json();
  console.log("Fail Login Response:", failData);

  console.log("\n--- 3. Testing Valid Login (adminblog / blogadmin) ---");
  const loginRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "adminblog", password: "blogadmin" }),
  });
  console.log(`Valid Login Status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log("Valid Login Response:", loginData);
  const cookieHeader = loginRes.headers.get("set-cookie");
  console.log("Received Session Cookie:", cookieHeader ? "YES (Cookie received)" : "NO");

  if (cookieHeader) {
    const rawCookie = cookieHeader.split(";")[0];
    console.log("\n--- 4. Accessing /admin/posts with Valid Session Cookie ---");
    const authAccessRes = await fetch("http://localhost:3000/admin/posts", {
      headers: { Cookie: rawCookie },
      redirect: "manual",
    });
    console.log(`Authenticated Access /admin/posts status: ${authAccessRes.status}`);
    const pageHtml = await authAccessRes.text();
    console.log(`Contains 'Manajemen Artikel Blog': ${pageHtml.includes("Manajemen Artikel Blog")}`);
    console.log(`Contains 'adminblog': ${pageHtml.includes("adminblog")}`);
  }

  console.log("\n--- 5. Verifying Public /blogs Page ---");
  const blogsRes = await fetch("http://localhost:3000/blogs");
  const blogsHtml = await blogsRes.text();
  console.log(`Public /blogs status: ${blogsRes.status}`);
  console.log(`Does NOT have 'Admin Dashboard' in Navbar: ${!blogsHtml.includes("Admin Dashboard")}`);
  console.log(`Does NOT have 'Portal Admin' in Footer: ${!blogsHtml.includes("Portal Admin")}`);
  console.log(`Displays Clean Empty State: ${blogsHtml.includes("Belum Ada Artikel yang Diterbitkan")}`);
  console.log(`Modern Outfit Font Included: ${blogsHtml.includes("--font-heading")}`);
}

testAuth();
