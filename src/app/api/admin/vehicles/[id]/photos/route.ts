import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { Metadata } from "sharp";
import { MediaType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensionByType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({ where: { id }, select: { id: true } });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const vehicleId = (await params).id;
  const media = await prisma.media.findMany({ where: { vehicleId, type: MediaType.PHOTO }, orderBy: { sortOrder: "asc" }, select: { id: true, fileName: true, fileSize: true, mimeType: true, url: true, thumbnailUrl: true, title: true, sortOrder: true, isPublic: true } });
  return Response.json({ success: true, data: media });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const vehicleId = (await params).id;
  if (!(await getVehicle(vehicleId))) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Файл изображения обязателен" } }, { status: 422 });
  if (!allowedTypes.has(file.type)) return Response.json({ success: false, error: { code: "UNSUPPORTED_MEDIA", message: "Разрешены только JPG, PNG и WebP" } }, { status: 415 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Максимальный размер изображения — 10 МБ" } }, { status: 413 });
  const input = Buffer.from(await file.arrayBuffer());
  let image: Metadata;
  try { image = await sharp(input).metadata(); } catch { return Response.json({ success: false, error: { code: "INVALID_IMAGE", message: "Файл не является корректным изображением" } }, { status: 422 }); }
  if (!image.width || !image.height || image.width < 300 || image.height < 200) return Response.json({ success: false, error: { code: "IMAGE_TOO_SMALL", message: "Минимальный размер изображения — 300×200 пикселей" } }, { status: 422 });
  const extension = extensionByType[file.type as keyof typeof extensionByType]; const name = `${randomUUID()}.${extension}`; const directory = path.join(process.cwd(), "public", "uploads", "vehicles", vehicleId); await mkdir(directory, { recursive: true });
  const originalPath = path.join(directory, name); const thumbnailName = `${name.replace(/\.[^.]+$/, "")}_thumb.webp`; const thumbnailPath = path.join(directory, thumbnailName);
  await writeFile(originalPath, input); await sharp(input).resize(640, 480, { fit: "cover" }).webp({ quality: 82 }).toFile(thumbnailPath);
  const last = await prisma.media.findFirst({ where: { vehicleId, type: MediaType.PHOTO }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const sortOrder = Number(form.get("sortOrder") ?? (last?.sortOrder ?? -1) + 1); const title = String(form.get("title") ?? file.name).slice(0, 200);
  const media = await prisma.media.create({ data: { uploadedById: token.userId, vehicleId, fileName: file.name.slice(0, 255), fileSize: file.size, mimeType: file.type, url: `/uploads/vehicles/${vehicleId}/${name}`, thumbnailUrl: `/uploads/vehicles/${vehicleId}/${thumbnailName}`, type: MediaType.PHOTO, title, alt: title, sortOrder, isPublic: false }, select: { id: true, url: true, thumbnailUrl: true, title: true, sortOrder: true, isPublic: true } });
  return Response.json({ success: true, data: media }, { status: 201 });
}
