import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const registration = await prisma.attendantRegistration.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        profilePhotoBase64: data.profilePhotoBase64 || null,
        dateOfBirth: data.dateOfBirth,
        age: parseInt(data.age) || 0,
        mobileNumber: data.mobileNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        emergencyContact: data.emergencyContact,
        
        selectedServices: data.selectedServices || [],
        
        yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
        languagesKnown: data.languagesKnown || [],
        
        aadhaarBase64: data.aadhaarBase64 || null,
        drivingLicenseBase64: data.drivingLicenseBase64 || null,
        panCardBase64: data.panCardBase64 || null,
        professionalCertBase64: data.professionalCertBase64 || null,
        policeVerifBase64: data.policeVerifBase64 || null,
        
        workingDays: data.workingDays || [],
        preferredTimeSlots: data.preferredTimeSlots || [],
        preferredCities: data.preferredCities || [],
        
        status: "Pending Approval",
        approvalStatus: "Pending Approval",
        accountStatus: "Inactive",
      },
    });

    return NextResponse.json(
      { message: "Registration successful", registration },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Attendant Registration Error:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('mobileNumber')) {
      return NextResponse.json(
        { message: "This mobile number is already registered. Please try logging in or wait for approval." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
