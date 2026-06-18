import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/attendants - Fetch all attendants
export async function GET() {
  try {
    const attendants = await prisma.attendant.findMany({
      include: {
        location: true,
        account: true,
        bookings: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(attendants, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/attendants error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}


// POST /api/attendants - Add a new verified attendant profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, experience, languages, rating, certifications, bgGradient } = body;

    // Validations
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'name'" }, { status: 400 });
    }
    if (!role || typeof role !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'role'" }, { status: 400 });
    }
    if (!experience || typeof experience !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'experience'" }, { status: 400 });
    }
    if (!languages || !Array.isArray(languages) || languages.some(l => typeof l !== "string")) {
      return NextResponse.json({ error: "Invalid or missing 'languages' (array of strings expected)" }, { status: 400 });
    }
    if (rating === undefined || typeof rating !== "number") {
      return NextResponse.json({ error: "Invalid or missing 'rating'" }, { status: 400 });
    }
    if (!certifications || !Array.isArray(certifications) || certifications.some(c => typeof c !== "string")) {
      return NextResponse.json({ error: "Invalid or missing 'certifications' (array of strings expected)" }, { status: 400 });
    }
    if (!bgGradient || typeof bgGradient !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'bgGradient'" }, { status: 400 });
    }

    const newAttendant = await prisma.attendant.create({
      data: {
        name,
        role,
        experience,
        languages,
        rating,
        certifications,
        bgGradient,
      },
    });

    return NextResponse.json(newAttendant, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/attendants error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
