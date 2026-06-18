import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/attendants/[id] - Fetch detailed attendant profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attendant = await prisma.attendant.findUnique({
      where: { id },
      include: {
        account: true,
        location: true,
        bookings: {
          include: {
            service: true
          }
        }
      }
    });

    if (!attendant) {
      return NextResponse.json({ error: "Attendant not found" }, { status: 404 });
    }

    return NextResponse.json(attendant, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/attendants/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/attendants/[id] - Update attendant profile data, documents, specialized services, and availability
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify if attendant exists
    const existing = await prisma.attendant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Attendant not found" }, { status: 404 });
    }

    // Prepare update data payload
    const updateData: any = {};

    // Basic Profile
    if (body.name !== undefined) updateData.name = body.name;
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.pinCode !== undefined) updateData.pinCode = body.pinCode;
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact;
    if (body.profilePhotoBase64 !== undefined) updateData.profilePhotoBase64 = body.profilePhotoBase64;
    
    // Services
    if (body.selectedServices !== undefined) updateData.selectedServices = body.selectedServices;

    // Documents and Statuses
    if (body.aadhaarBase64 !== undefined) {
      updateData.aadhaarBase64 = body.aadhaarBase64;
      updateData.aadhaarStatus = body.aadhaarBase64 ? "Uploaded" : "Pending";
    }
    if (body.aadhaarStatus !== undefined) updateData.aadhaarStatus = body.aadhaarStatus;

    if (body.panBase64 !== undefined) {
      updateData.panBase64 = body.panBase64;
      updateData.panStatus = body.panBase64 ? "Uploaded" : "Pending";
    }
    if (body.panStatus !== undefined) updateData.panStatus = body.panStatus;

    if (body.dlBase64 !== undefined) {
      updateData.dlBase64 = body.dlBase64;
      updateData.dlStatus = body.dlBase64 ? "Uploaded" : "Pending";
    }
    if (body.dlStatus !== undefined) updateData.dlStatus = body.dlStatus;

    if (body.certificatesBase64 !== undefined) {
      updateData.certificatesBase64 = body.certificatesBase64;
      updateData.certificatesStatus = body.certificatesBase64 ? "Uploaded" : "Pending";
    }
    if (body.certificatesStatus !== undefined) updateData.certificatesStatus = body.certificatesStatus;

    if (body.policeVerifBase64 !== undefined) {
      updateData.policeVerifBase64 = body.policeVerifBase64;
      updateData.policeVerifStatus = body.policeVerifBase64 ? "Uploaded" : "Pending";
    }
    if (body.policeVerifStatus !== undefined) updateData.policeVerifStatus = body.policeVerifStatus;

    // Scheduler
    if (body.workingDays !== undefined) updateData.workingDays = body.workingDays;
    if (body.workingHours !== undefined) updateData.workingHours = body.workingHours;
    if (body.preferredCities !== undefined) updateData.preferredCities = body.preferredCities;

    // Verification Status
    if (body.verificationStatus !== undefined) updateData.verificationStatus = body.verificationStatus;

    // Perform DB update
    const updated = await prisma.attendant.update({
      where: { id },
      data: updateData,
    });

    // If city is updated, update AttendantLocation as well
    if (body.city && body.city !== existing.role) { // Using role or location
      // Check if location exists
      const location = await prisma.attendantLocation.findUnique({
        where: { attendantId: id }
      });

      // Simple coordinates mapping
      const normalized = body.city.toLowerCase().trim();
      let lat = 13.0827;
      let lng = 80.2707;
      if (normalized.includes("bengaluru")) {
        lat = 12.9716; lng = 77.5946;
      } else if (normalized.includes("hyderabad")) {
        lat = 17.3850; lng = 78.4867;
      } else if (normalized.includes("coimbatore")) {
        lat = 11.0168; lng = 76.9558;
      } else if (normalized.includes("madurai")) {
        lat = 9.9252; lng = 78.1198;
      }

      if (location) {
        await prisma.attendantLocation.update({
          where: { attendantId: id },
          data: { city: body.city, latitude: lat, longitude: lng }
        });
      } else {
        await prisma.attendantLocation.create({
          data: { attendantId: id, city: body.city, latitude: lat, longitude: lng }
        });
      }
    }

    // Trigger Notification for profile/document changes if status changes
    if (body.verificationStatus && body.verificationStatus !== existing.verificationStatus) {
      await prisma.notification.create({
        data: {
          attendantId: id,
          type: "STATUS_CHANGE",
          message: `Verification Status changed to: ${body.verificationStatus}`
        }
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/attendants/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
