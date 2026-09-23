import { getPublicVehicle } from "@/lib/public-vehicles";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const vehicle = await getPublicVehicle((await params).slug);
  if (!vehicle) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 });
  return Response.json({ success: true, data: vehicle });
}
