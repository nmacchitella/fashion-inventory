import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const styles = await prisma.style.findMany({
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });
    return NextResponse.json(styles);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const style = await prisma.style.create({
      data: {
        piece: json.piece,
        name: json.name,
        season: json.season,
        phase: json.phase,
        photos: json.photos || [],
        notes: json.notes,
      },
      include: {
        materials: true,
      },
    });
    return NextResponse.json(style);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
