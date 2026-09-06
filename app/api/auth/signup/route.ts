import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, farmers, farms, fields } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AUTH_COOKIE_NAME, getDefaultRedirectForRole } from "@/lib/auth/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      role = "FARMER",
      preferredLanguage = "hi",
      phone,
      state = "Jharkhand",
      district = "Ranchi",
      village = "Namkum",
      cropName = "Paddy (IR-64)",
      plotArea = 1.0,
      irrigationType = "Rainfed",
      soilType = "Loamy",
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and Email are required." } },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = (role || "FARMER").toUpperCase();

    // Check if user already exists in DB
    let existingUser = null;
    if (db) {
      try {
        const found = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
        if (found.length > 0) existingUser = found[0];
      } catch (e) {
        console.warn("DB select error on user lookup (proceeding with fallback if db offline):", e);
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_EXISTS", message: "An account with this email already exists." } },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const farmerId = `frm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const farmId = `farm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fieldId = `fld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (db) {
      try {
        // 1. Insert into users
        await db.insert(users).values({
          id: userId,
          email: cleanEmail,
          name,
          role: cleanRole,
          preferredLanguage,
        });

        // 2. If FARMER, insert into farmers, farms, and fields
        if (cleanRole === "FARMER") {
          await db.insert(farmers).values({
            id: farmerId,
            userId,
            name,
            phone: phone || null,
            state,
            district,
            village,
            preferredLanguage,
            experienceYears: 10,
          });

          await db.insert(farms).values({
            id: farmId,
            farmerId,
            name: `${name}'s Farm`,
            totalAreaAcres: Number(plotArea) || 1.0,
            latitude: 23.3441,
            longitude: 85.3096,
            irrigationType,
            soilType,
          });

          await db.insert(fields).values({
            id: fieldId,
            farmId,
            name: `Main Field (${cropName})`,
            areaAcres: Number(plotArea) || 1.0,
            boundaryGeoJson: {
              type: "Polygon",
              coordinates: [
                [
                  [85.3090, 23.3440],
                  [85.3105, 23.3440],
                  [85.3105, 23.3452],
                  [85.3090, 23.3452],
                  [85.3090, 23.3440],
                ],
              ],
            },
            soilMoisturePercent: 65,
          });
        }
      } catch (dbErr: any) {
        console.error("Failed to insert user records into database:", dbErr);
      }
    }

    const sessionUser = {
      id: userId,
      email: cleanEmail,
      name,
      role: cleanRole as "FARMER" | "EXPERT" | "GOVT" | "ADMIN",
    };

    const cookieValue = Buffer.from(
      JSON.stringify({ ...sessionUser, issuedAt: Date.now() })
    ).toString("base64");

    const redirectUrl = getDefaultRedirectForRole(sessionUser.role);

    const res = NextResponse.json({
      success: true,
      data: {
        user: sessionUser,
        redirectUrl,
      },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SIGNUP_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
