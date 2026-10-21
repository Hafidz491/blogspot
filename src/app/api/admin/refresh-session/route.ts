import { getSessionPayload, createSessionToken, ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const token = cookies[ADMIN_COOKIE_NAME];
    const session = getSessionPayload(token);

    if (!session) {
      const response = Response.json(
        { success: false, expired: true, error: "Session expired or invalid" },
        { status: 401 }
      );
      response.headers.set(
        "Set-Cookie",
        `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      );
      return response;
    }

    // Issue refreshed token with new 2-hour window
    const refreshedToken = createSessionToken(session.username);
    const response = Response.json({
      success: true,
      message: "Session refreshed successfully",
      expiresInSeconds: SESSION_DURATION_SECONDS,
    });

    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${refreshedToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`
    );

    return response;
  } catch (error) {
    console.error("Session refresh error:", error);
    return Response.json(
      { success: false, error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
