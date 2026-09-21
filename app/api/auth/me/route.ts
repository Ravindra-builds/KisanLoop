export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { AUTH_COOKIE_NAME, TEST_USERS, AuthUser } from "@/lib/auth/constants";
import { db } from "@/lib/db";
import { users, farmers, farms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE !== "false";

  // 1. Check Clerk Authenticated User
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
      let displayName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        email.split("@")[0] ||
        "Farmer";
      const metadataRole = (clerkUser.publicMetadata?.role as string) || "FARMER";

      let dbRole: "FARMER" | "EXPERT" | "GOVT" | "ADMIN" = (metadataRole.toUpperCase() as any) || "FARMER";
      let farmId = "farm_ravi_01";
      let farmerData: any = null;
      let farmData: any = null;
      let isProfileComplete = false;

      if (db && email) {
        try {
          const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (found.length > 0) {
            dbRole = (found[0].role as any) || "FARMER";
            if (found[0].name && found[0].name !== "Farmer") {
              displayName = found[0].name;
            }

            const farmerRec = await db.select().from(farmers).where(eq(farmers.userId, found[0].id)).limit(1);
            if (farmerRec.length > 0) {
              farmerData = farmerRec[0];
              if (farmerRec[0].name) displayName = farmerRec[0].name;

              const farmRec = await db.select().from(farms).where(eq(farms.farmerId, farmerRec[0].id)).limit(1);
              if (farmRec.length > 0) {
                farmData = farmRec[0];
                farmId = farmRec[0].id;
              }
            }

            isProfileComplete = Boolean(
              found[0].name &&
              found[0].name !== "Farmer" &&
              (dbRole !== "FARMER" || (farmerData && farmerData.phone))
            );
          } else {
            // Auto-provision Clerk user in DB
            const newUserId = `usr_${clerkUser.id.replace(/[^a-zA-Z0-9]/g, "")}`;
            const newFarmerId = `frm_${Date.now()}`;
            const newFarmId = `farm_${Date.now()}`;

            await db.insert(users).values({
              id: newUserId,
              email,
              name: displayName,
              role: dbRole,
              preferredLanguage: "en",
            });

            if (dbRole === "FARMER") {
              await db.insert(farmers).values({
                id: newFarmerId,
                userId: newUserId,
                name: displayName,
                state: "Jharkhand",
                district: "Ranchi",
                village: "Namkum",
                preferredLanguage: "en",
              });

              await db.insert(farms).values({
                id: newFarmId,
                farmerId: newFarmerId,
                name: `${displayName}'s Farm`,
                totalAreaAcres: 1.5,
                latitude: 23.3441,
                longitude: 85.3096,
                irrigationType: "Rainfed",
                soilType: "Loamy",
              });
              farmId = newFarmId;
            }
            isProfileComplete = false;
          }
        } catch (dbErr) {
          console.warn("Error syncing Clerk user to database:", dbErr);
        }
      }

      const activeUser: AuthUser = {
        id: clerkUser.id,
        name: displayName,
        email,
        role: dbRole,
        preferredLanguage: "en",
        district: farmerData ? `${farmerData.district}, ${farmerData.state}` : "Ranchi, Jharkhand",
        farmId,
      };

      return NextResponse.json({
        success: true,
        data: {
          user: activeUser,
          farmer: farmerData,
          farm: farmData,
          isProfileComplete,
          isDemoMode,
        },
      });
    }
  } catch {
    // Clerk not configured or session unverified, continue to cookie
  }

  // 2. Check Session Cookie fallback
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      return NextResponse.json({
        success: true,
        data: {
          user: decoded as AuthUser,
          isDemoMode,
        },
      });
    } catch {
      // Fallback
    }
  }

  // 3. Demo Mode Default
  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      data: {
        user: TEST_USERS[0],
        isDemoMode,
      },
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Not logged in" },
      data: { isDemoMode },
    },
    { status: 401 }
  );
}

