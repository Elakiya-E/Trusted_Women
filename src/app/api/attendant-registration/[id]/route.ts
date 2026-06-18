import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to get coordinates for Indian cities
function getCityCoords(city: string) {
  const normalized = city.toLowerCase().trim();
  if (normalized.includes("chennai")) {
    return { lat: 13.0827, lng: 80.2707 };
  } else if (normalized.includes("bengaluru") || normalized.includes("bangalore")) {
    return { lat: 12.9716, lng: 77.5946 };
  } else if (normalized.includes("hyderabad")) {
    return { lat: 17.3850, lng: 78.4867 };
  } else if (normalized.includes("coimbatore")) {
    return { lat: 11.0168, lng: 76.9558 };
  }
  return { lat: 13.0827, lng: 80.2707 }; // Default Chennai
}

// GET /api/attendant-registration/[id] - Fetch single registration
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registration = await prisma.attendantRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json(registration, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/attendant-registration/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/attendant-registration/[id] - Update registration status (Approve/Reject/etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason, adminNotes } = body;

    if (!status) {
      return NextResponse.json({ error: "Status field is required" }, { status: 400 });
    }

    // Fetch existing registration
    const registration = await prisma.attendantRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // If it's already approved, don't allow re-approving
    if (registration.status === "Approved" && status === "Approved") {
      return NextResponse.json({ error: "Registration is already approved" }, { status: 400 });
    }

    // Perform database updates in a transaction if status is Approved
    let result;
    if (status === "Approved") {
      // Choose a gradient from a set of beautiful design-harmonious options
      const gradients = [
        "from-purple-500 to-indigo-500",
        "from-pink-500 to-rose-500",
        "from-teal-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-violet-600 to-indigo-600"
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      // Construct role, certifications list
      const role = registration.selectedServices.length > 0
        ? registration.selectedServices.join(", ")
        : "General Attendant";

      let certificationsArray: string[] = ["Verified Partner"];
      if (registration.certifications) {
        const parsed = registration.certifications.split(",").map(c => c.trim()).filter(Boolean);
        if (parsed.length > 0) {
          certificationsArray = parsed;
        }
      }

      const coords = getCityCoords(registration.city);

      result = await prisma.$transaction(async (tx) => {
        // 1. Update registration status
        const updatedReg = await tx.attendantRegistration.update({
          where: { id },
          data: {
            status,
            adminNotes: adminNotes || registration.adminNotes,
          },
        });

        // 2. Create Attendant profile
        const newAttendant = await tx.attendant.create({
          data: {
            name: registration.fullName,
            role,
            experience: `${registration.yearsOfExperience} Years`,
            languages: registration.languagesKnown,
            rating: 5.0, // New attendants start with 5.0 rating
            certifications: certificationsArray,
            bgGradient: randomGradient,
          },
        });

        // 3. Create Attendant Account for login
        await tx.attendantAccount.create({
          data: {
            attendantId: newAttendant.id,
            mobileNumber: registration.mobileNumber,
            passwordHash: "pbkdf2_sha256$260000$default_salt$dummy_hash", // Placeholder hash
            status: "AVAILABLE",
          },
        });

        // 4. Create Attendant Location
        await tx.attendantLocation.create({
          data: {
            attendantId: newAttendant.id,
            city: registration.city,
            latitude: coords.lat,
            longitude: coords.lng,
          },
        });

        // 5. Create Notification
        await tx.notification.create({
          data: {
            type: "REGISTRATION",
            message: `${registration.fullName} has been approved as an attendant`,
          },
        });

        return updatedReg;
      });
    } else {
      // For non-approval status updates (e.g. Rejected, Under Review, Request Changes)
      result = await prisma.attendantRegistration.update({
        where: { id },
        data: {
          status,
          rejectionReason: rejectionReason || null,
          adminNotes: adminNotes || null,
        },
      });

      // Create Notification for non-approval changes
      let notifMessage = `${registration.fullName}'s registration status changed to ${status}`;
      if (status === "Rejected") {
        notifMessage = `${registration.fullName}'s registration was rejected. Reason: ${rejectionReason || "None provided"}`;
      } else if (status === "Request Changes") {
        notifMessage = `Changes requested for ${registration.fullName}'s registration: ${rejectionReason || "Please verify documents"}`;
      }

      await prisma.notification.create({
        data: {
          type: "REGISTRATION",
          message: notifMessage,
        },
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/attendant-registration/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
