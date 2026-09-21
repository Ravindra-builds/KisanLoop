export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { AUTH_COOKIE_NAME, AuthUser } from "@/lib/auth/constants";
import { db } from "@/lib/db";
import { users, farmers, farms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    let email = "";
    let clerkId = "";
    let defaultName = "";
    let avatar = "";

    // 1. Check Clerk
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
        clerkId = clerkUser.id;
        avatar = (clerkUser.publicMetadata?.avatar as string) || clerkUser.imageUrl || "";
        defaultName =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          email.split("@")[0] ||
          "";
      }
    } catch {}

    // 2. Check Cookie fallback
    if (!email) {
      const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (sessionCookie) {
        try {
          const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
          email = decoded.email || "";
          defaultName = decoded.name || "";
          clerkId = decoded.id || "";
          if (decoded.avatar) avatar = decoded.avatar;
        } catch {}
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 3. Query Neon DB
    let dbUser: any = null;
    let farmerRec: any = null;
    let farmRec: any = null;

    if (db) {
      try {
        const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (found.length > 0) {
          dbUser = found[0];
          const fList = await db.select().from(farmers).where(eq(farmers.userId, dbUser.id)).limit(1);
          if (fList.length > 0) {
            farmerRec = fList[0];
            const farmList = await db.select().from(farms).where(eq(farms.farmerId, farmerRec.id)).limit(1);
            if (farmList.length > 0) farmRec = farmList[0];
          }
        }
      } catch (err) {
        console.warn("DB profile lookup error:", err);
      }
    }

    const isComplete = Boolean(
      dbUser &&
      dbUser.name &&
      dbUser.name !== "Farmer" &&
      (dbUser.role !== "FARMER" || (farmerRec && farmerRec.phone))
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: dbUser?.id || clerkId,
          email,
          name: dbUser?.name || defaultName,
          role: dbUser?.role || "FARMER",
          preferredLanguage: dbUser?.preferredLanguage || "en",
          avatar: avatar || undefined,
        },
        farmer: farmerRec || {
          name: defaultName,
          phone: "",
          state: "Jharkhand",
          district: "Ranchi",
          village: "Namkum",
        },
        farm: farmRec || {
          name: `${defaultName || "Namkum"}'s Farm`,
          totalAreaAcres: 1.5,
          irrigationType: "Rainfed",
          soilType: "Loamy",
        },
        isProfileComplete: isComplete,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role = "FARMER",
      name,
      phone = "",
      state = "Jharkhand",
      district = "Ranchi",
      village = "Namkum",
      farmName,
      acres = 1.5,
      irrigationType = "Rainfed",
      soilType = "Loamy",
      designation = "",
      department = "",
      avatar = "",
    } = body;

    let email = "";
    let clerkId = "";

    // 1. Identify User
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
        clerkId = clerkUser.id;
      }
    } catch {}

    if (!email) {
      const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (sessionCookie) {
        try {
          const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
          email = decoded.email || "";
          clerkId = decoded.id || "";
        } catch {}
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cleanName = name?.trim() || email.split("@")[0] || "Farmer";
    const cleanRole: "FARMER" | "EXPERT" | "GOVT" | "ADMIN" =
      ["FARMER", "EXPERT", "GOVT", "ADMIN"].includes(role.toUpperCase())
        ? (role.toUpperCase() as any)
        : "FARMER";

    let targetUserId = `usr_${(clerkId || email).replace(/[^a-zA-Z0-9]/g, "")}`;
    let targetFarmerId = `frm_${Date.now()}`;
    let targetFarmId = `farm_${Date.now()}`;

    // 2. Persist to Neon DB
    if (db) {
      try {
        // Upsert User
        const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUsers.length > 0) {
          targetUserId = existingUsers[0].id;
          await db
            .update(users)
            .set({
              name: cleanName,
              role: cleanRole,
            })
            .where(eq(users.id, targetUserId));
        } else {
          await db.insert(users).values({
            id: targetUserId,
            email,
            name: cleanName,
            role: cleanRole,
            preferredLanguage: "en",
          });
        }

        // Upsert Farmer & Farm if role is FARMER
        if (cleanRole === "FARMER") {
          const existingFarmers = await db
            .select()
            .from(farmers)
            .where(eq(farmers.userId, targetUserId))
            .limit(1);

          if (existingFarmers.length > 0) {
            targetFarmerId = existingFarmers[0].id;
            await db
              .update(farmers)
              .set({
                name: cleanName,
                phone: phone || existingFarmers[0].phone,
                state,
                district,
                village,
              })
              .where(eq(farmers.id, targetFarmerId));
          } else {
            await db.insert(farmers).values({
              id: targetFarmerId,
              userId: targetUserId,
              name: cleanName,
              phone,
              state,
              district,
              village,
              preferredLanguage: "en",
            });
          }

          const existingFarms = await db
            .select()
            .from(farms)
            .where(eq(farms.farmerId, targetFarmerId))
            .limit(1);

          const finalFarmName = farmName || `${cleanName}'s Farm`;
          const parsedAcres = Number(acres) || 1.5;

          if (existingFarms.length > 0) {
            targetFarmId = existingFarms[0].id;
            await db
              .update(farms)
              .set({
                name: finalFarmName,
                totalAreaAcres: parsedAcres,
                irrigationType,
                soilType,
              })
              .where(eq(farms.id, targetFarmId));
          } else {
            await db.insert(farms).values({
              id: targetFarmId,
              farmerId: targetFarmerId,
              name: finalFarmName,
              totalAreaAcres: parsedAcres,
              latitude: 23.3441,
              longitude: 85.3096,
              irrigationType,
              soilType,
            });
          }
        }
      } catch (dbErr: any) {
        console.warn("DB profile save error:", dbErr.message);
      }
    }

    // 3. Update Clerk user metadata if clerkId present
    if (clerkId) {
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(clerkId, {
          publicMetadata: {
            role: cleanRole,
            designation,
            department,
            avatar,
          },
        });
      } catch (clerkErr) {
        console.warn("Could not update Clerk metadata:", clerkErr);
      }
    }

    // 4. Construct updated session cookie & response
    const updatedUser: AuthUser = {
      id: clerkId || targetUserId,
      name: cleanName,
      email,
      role: cleanRole,
      preferredLanguage: "en",
      district: `${district}, ${state}`,
      farmId: cleanRole === "FARMER" ? targetFarmId : undefined,
      avatar: avatar || undefined,
    };

    const res = NextResponse.json({
      success: true,
      message: "Profile and role updated successfully",
      data: {
        user: updatedUser,
        farmer: {
          id: targetFarmerId,
          name: cleanName,
          phone,
          state,
          district,
          village,
        },
        farm: {
          id: targetFarmId,
          name: farmName || `${cleanName}'s Farm`,
          totalAreaAcres: Number(acres) || 1.5,
          irrigationType,
          soilType,
        },
      },
    });

    // Refresh custom session cookie
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: Buffer.from(JSON.stringify(updatedUser)).toString("base64"),
      path: "/",
      maxAge: 86400 * 30, // 30 days
      httpOnly: false,
      sameSite: "lax",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
