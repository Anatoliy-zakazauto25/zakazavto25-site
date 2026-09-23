import { getPublicVehicles } from "@/lib/public-vehicles";
import { parsePagination } from "@/lib/pagination";
import { internalApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, perPage } = parsePagination(searchParams);
  try { const vehicles = await getPublicVehicles({ country: searchParams.get("country") ?? undefined, make: searchParams.get("make") ?? undefined, model: searchParams.get("model") ?? undefined }); const data = vehicles.slice((page - 1) * perPage, page * perPage); return Response.json({ success: true, data, meta: { total: vehicles.length, page, perPage, totalPages: Math.ceil(vehicles.length / perPage) } }); } catch (error) { return internalApiError("public_vehicle_list_failed", error); }
}
