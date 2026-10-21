import { authenticateAdmin, createSessionToken, ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(username, password);

    if (!authResult.success) {
      return Response.json(
        { success: false, error: authResult.error || "Authentication failed." },
        { status: 401 }
      );
    }

    // Create session token with 2-hour expiration
    const token = createSessionToken(username);

    // Set HTTP-only cookie with 2-hour max-age (7200 seconds)
    const response = Response.json({ success: true, message: "Logged in successfully!" });
    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`
    );

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return Response.json(
      { success: false, error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}
