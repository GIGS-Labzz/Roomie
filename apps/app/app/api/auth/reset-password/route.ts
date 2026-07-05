import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@repo/db/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, newPassword } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    // Clean username (match settings logic)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    const supabase = await createServiceClient();

    // Query profile by username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (profileError) {
      console.error("Database query error checking username:", profileError);
      return NextResponse.json({ error: "Database error checking username." }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Username not found." }, { status: 404 });
    }

    if (action === "check-username") {
      return NextResponse.json({ exists: true });
    }

    if (action === "reset") {
      if (!newPassword) {
        return NextResponse.json({ error: "New password is required." }, { status: 400 });
      }

      // Strict validation checking:
      // - must contain special character
      // - must contain a number
      // - not less than 8 characters
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
      }

      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasNumber) {
        return NextResponse.json({ error: "Password must contain at least one number." }, { status: 400 });
      }

      if (!hasSpecial) {
        return NextResponse.json({ error: "Password must contain at least one special character." }, { status: 400 });
      }

      // Update password using admin client and save metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        (profile as any).id,
        {
          password: newPassword,
          user_metadata: { has_password: true }
        }
      );

      if (updateError) {
        console.error("Admin update password failed:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Reset password handler error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
