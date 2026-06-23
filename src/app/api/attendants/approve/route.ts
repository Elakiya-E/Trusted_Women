import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const registration = await prisma.attendantRegistration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update registration status
    await prisma.attendantRegistration.update({
      where: { id },
      data: { status: "Approved" },
    });

    // Create Attendant
    const attendant = await prisma.attendant.create({
      data: {
        name: registration.fullName,
        role: "Attendant",
        experience: `${registration.yearsOfExperience} years`,
        languages: registration.languagesKnown,
        rating: 5.0, // Default rating
        certifications: registration.certifications ? [registration.certifications] : [],
        bgGradient: "from-blue-500 to-indigo-500", // Default gradient
        email: registration.email,
        address: registration.address,
        state: registration.state,
        pinCode: registration.pinCode,
        emergencyContact: registration.emergencyContact,
        profilePhotoBase64: registration.profilePhotoBase64,
        selectedServices: registration.selectedServices,
        aadhaarBase64: registration.aadhaarBase64,
        panBase64: registration.panCardBase64,
        dlBase64: registration.drivingLicenseBase64,
        policeVerifBase64: registration.policeVerifBase64,
        certificatesBase64: registration.professionalCertBase64,
        workingDays: registration.workingDays,
        workingHours: registration.preferredTimeSlots,
        preferredCities: registration.preferredCities,
        verificationStatus: "Approved",
      },
    });

    // Upsert AttendantAccount (Avoid duplicates)
    await prisma.attendantAccount.upsert({
      where: { email: registration.email },
      update: {
        attendantId: attendant.id,
        mobileNumber: registration.mobileNumber,
        passwordHash: registration.password,
        status: "AVAILABLE",
      },
      create: {
        attendantId: attendant.id,
        mobileNumber: registration.mobileNumber,
        email: registration.email,
        passwordHash: registration.password,
        status: "AVAILABLE",
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        type: "SYSTEM",
        message: "Your account has been approved. You can now log in to the Attendant Portal.",
        attendantId: attendant.id,
      }
    });

    return NextResponse.json({ message: "Approved successfully" });
  } catch (error: any) {
    console.error("Approve Attendant Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
