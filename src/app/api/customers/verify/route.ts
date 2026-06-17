import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Phone parameter is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json({ status: "NEW" }, { status: 200 });
    }

    return NextResponse.json({
      status: customer.verificationStatus,
      customer: {
        name: customer.name,
        phone: customer.phone,
        totalBookings: customer.totalBookings
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/customers/verify error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, idDocumentType, idDocumentBase64 } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'phone'" }, { status: 400 });
    }
    if (!idDocumentBase64 || typeof idDocumentBase64 !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'idDocumentBase64'" }, { status: 400 });
    }

    // Check if customer exists
    let customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (customer) {
      // If customer exists, they might be REJECTED and are uploading again
      customer = await prisma.customer.update({
        where: { phone },
        data: {
          name: name || customer.name,
          email: email || customer.email,
          idDocumentType,
          idDocumentBase64,
          verificationStatus: "PENDING"
        }
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name: name || "Unknown",
          phone,
          email,
          idDocumentType,
          idDocumentBase64,
          verificationStatus: "PENDING"
        }
      });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/customers/verify error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
