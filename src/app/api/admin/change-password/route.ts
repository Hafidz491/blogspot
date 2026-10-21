import {
  getSessionPayload,
  updateAdminPassword,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

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
      return Response.json(
        { success: false, error: "Unauthorized. Please sign in to update your password." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { success: false, error: "All password fields are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const updateResult = await updateAdminPassword(
      session.username,
      currentPassword,
      newPassword
    );

    if (!updateResult.success) {
      return Response.json(
        { success: false, error: updateResult.error || "Failed to update password." },
        { status: 400 }
      );
    }

    // Renew session cookie with fresh 2-hour window
    const refreshedToken = createSessionToken(session.username);
    const response = Response.json({
      success: true,
      message: "Password updated successfully! Your account is now secured with your new credentials.",
    });

    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${refreshedToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`
    );

    return response;
  } catch (error) {
    console.error("Change password route error:", error);
    return Response.json(
      { success: false, error: "An unexpected server error occurred while updating password." },
      { status: 500 }
    );
  }
}
