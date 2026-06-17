import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/bookings/[id] - Retrieve a specific booking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        attendant: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status or assign attendant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, attendantId, date, time } = body;

    const dataToUpdate: any = {};

    if (status !== undefined) {
      dataToUpdate.status = status;
    }
    if (attendantId !== undefined) {
      dataToUpdate.attendantId = attendantId || null;
    }
    if (date !== undefined) {
      dataToUpdate.date = date;
    }
    if (time !== undefined) {
      dataToUpdate.time = time;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
      include: {
        service: true,
        attendant: true,
      },
    });

    // Also trigger notifications when status changes or attendant is assigned
    if (status === "Assigned" || status === "ASSIGNED") {
      await prisma.notification.create({
        data: {
          type: "ASSIGNMENT",
          message: `You have been assigned to booking ${updatedBooking.id} for ${updatedBooking.name}.`,
          attendantId: updatedBooking.attendantId,
        },
      });
    }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
