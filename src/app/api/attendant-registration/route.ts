import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/attendant-registration - Fetch all registrations or filter by status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const registrations = await prisma.attendantRegistration.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/attendant-registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/attendant-registration - Submit a new registration form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Required fields validation
    const requiredFields = [
      "fullName",
      "dateOfBirth",
      "age",
      "mobileNumber",
      "email",
      "address",
      "city",
      "state",
      "pinCode",
      "emergencyContact",
      "selectedServices",
      "yearsOfExperience",
      "languagesKnown",
      "workingDays",
      "preferredTimeSlots",
      "preferredCities"
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: '${field}'` },
          { status: 400 }
        );
      }
    }

    // Check if mobile number already registered
    const existingRegistration = await prisma.attendantRegistration.findUnique({
      where: { mobileNumber: body.mobileNumber },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "An application with this mobile number already exists." },
        { status: 400 }
      );
    }

    // Parse yearsOfExperience and age to Int just in case
    const age = parseInt(body.age, 10);
    const yearsOfExperience = parseInt(body.yearsOfExperience, 10);

    const registration = await prisma.attendantRegistration.create({
      data: {
        fullName: body.fullName,
        profilePhotoBase64: body.profilePhotoBase64 || null,
        dateOfBirth: body.dateOfBirth,
        age: isNaN(age) ? 0 : age,
        mobileNumber: body.mobileNumber,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        emergencyContact: body.emergencyContact,
        selectedServices: Array.isArray(body.selectedServices) ? body.selectedServices : [],
        yearsOfExperience: isNaN(yearsOfExperience) ? 0 : yearsOfExperience,
        languagesKnown: Array.isArray(body.languagesKnown) ? body.languagesKnown : [],
        certifications: body.certifications || null,
        specialSkills: body.specialSkills || null,
        previousExperience: body.previousExperience || null,
        aadhaarBase64: body.aadhaarBase64 || null,
        drivingLicenseBase64: body.drivingLicenseBase64 || null,
        panCardBase64: body.panCardBase64 || null,
        professionalCertBase64: body.professionalCertBase64 || null,
        policeVerifBase64: body.policeVerifBase64 || null,
        workingDays: Array.isArray(body.workingDays) ? body.workingDays : [],
        preferredTimeSlots: Array.isArray(body.preferredTimeSlots) ? body.preferredTimeSlots : [],
        preferredCities: Array.isArray(body.preferredCities) ? body.preferredCities : [],
        status: "Pending Verification",
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        type: "REGISTRATION",
        message: `New attendant registration: ${body.fullName} (${body.city})`,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/attendant-registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
