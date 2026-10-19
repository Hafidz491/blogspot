import { authenticateAdmin, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(username, password);

    if (!authResult.success) {
      return Response.json(
        { success: false, error: authResult.error || "Autentikasi gagal." },
        { status: 401 }
      );
    }

    // Create session token
    const token = createSessionToken(username);

    // Set HTTP-only cookie
    const response = Response.json({ success: true, message: "Login berhasil!" });
    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        7 * 24 * 60 * 60
      }`
    );

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server saat login." },
      { status: 500 }
    );
  }
}
