import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pending = await prisma.attendantRegistration.findMany({
      where: { status: "Pending Approval" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pending);
  } catch (error: any) {
    console.error("Pending Attendants Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
