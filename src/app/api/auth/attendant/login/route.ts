import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Check AttendantRegistration record
    const registration = await prisma.attendantRegistration.findFirst({
      where: { email: email }
    });

    if (!registration) {
      return NextResponse.json({ 
        error: "Account not found. Please register first." 
      }, { status: 401 });
    }

    // 2. Validate Password
    if (registration.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // 3. Check status
    if (registration.status === "Pending Approval" || registration.status === "Pending Verification") {
      return NextResponse.json({ 
        error: "Your registration is under review by the admin." 
      }, { status: 401 });
    }

    if (registration.status === "Rejected") {
      return NextResponse.json({ 
        error: "Your registration has been rejected. Please contact the administrator." 
      }, { status: 401 });
    }

    if (registration.status !== "Approved") {
      return NextResponse.json({ 
        error: `Your registration status is: ${registration.status}. Please wait for admin approval.` 
      }, { status: 401 });
    }

    // 4. Retrieve Approved AttendantAccount
    const account = await prisma.attendantAccount.findUnique({
      where: { email: email },
      include: { attendant: true },
    });

    if (!account || !account.attendant) {
      return NextResponse.json({ 
        error: "Approved account details not found. Please contact the administrator." 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      message: "Login successful", 
      attendant: {
        id: account.attendant.id,
        name: account.attendant.name,
        role: account.attendant.role,
        mobile: account.mobileNumber,
        status: account.status,
        email: account.email
      }
    });
  } catch (error: any) {
    console.error("Attendant Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
