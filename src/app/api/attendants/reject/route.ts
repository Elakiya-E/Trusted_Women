import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, reason } = await req.json();

    const registration = await prisma.attendantRegistration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update registration status
    await prisma.attendantRegistration.update({
      where: { id },
      data: { 
        status: "Rejected",
        rejectionReason: reason || "Did not meet requirements"
      },
    });

    return NextResponse.json({ message: "Rejected successfully" });
  } catch (error: any) {
    console.error("Reject Attendant Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
