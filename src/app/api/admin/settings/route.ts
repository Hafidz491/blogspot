import { getSiteSettings, updateSiteSettings } from "@/lib/settings-service";

export async function GET() {
  const settings = await getSiteSettings();
  return Response.json({ success: true, settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await updateSiteSettings(body);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Pengaturan konten web berhasil disimpan!",
      settings: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Kesalahan server";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
