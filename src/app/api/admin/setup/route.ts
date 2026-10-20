import { hasAdminAccount, createFirstAdmin, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const exists = await hasAdminAccount();
  return Response.json({ hasAdmin: exists });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    const result = await createFirstAdmin(username, password, email);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Auto-login newly created admin with session cookie
    const token = createSessionToken(username);
    const response = Response.json({
      success: true,
      message: "Administrator account created successfully!",
    });

    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        7 * 24 * 60 * 60
      }`
    );

    return response;
  } catch (error) {
    console.error("Setup error:", error);
    return Response.json(
      { success: false, error: "An unexpected server error occurred during setup." },
      { status: 500 }
    );
  }
}
