import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verificationStatus } = body;

    if (!verificationStatus) {
      return NextResponse.json({ error: "Missing verificationStatus" }, { status: 400 });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        verificationStatus,
        verificationDate: verificationStatus === "VERIFIED" ? new Date() : null,
      },
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/admin/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
