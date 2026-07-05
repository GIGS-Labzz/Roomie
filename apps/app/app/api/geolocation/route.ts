import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Try to get client IP from standard proxy headers
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "";

  // Check Vercel location headers first (very fast, zero-latency in prod)
  const country = req.headers.get("x-vercel-ip-country");
  const region = req.headers.get("x-vercel-ip-country-region");
  const city = req.headers.get("x-vercel-ip-city");

  if (country || city) {
    return NextResponse.json({
      ip,
      country: country || null,
      region: region || null,
      city: city || null,
    });
  }

  // Fallback to freeipapi.com if we have a valid external IP and are not on Vercel
  if (ip && ip !== "::1" && ip !== "127.0.0.1") {
    try {
      const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ip,
          country: data.countryName || null,
          region: data.regionName || null,
          city: data.cityName || null,
        });
      }
    } catch (err) {
      console.error("Server-side IP geolocation lookup failed:", err);
    }
  }

  // Localhost/dev environment: geolocate outbound server IP for realistic local testing
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ip: data.ipAddress || ip || "127.0.0.1",
        country: data.countryName || "Localhost",
        region: data.regionName || "Localhost",
        city: data.cityName || "Localhost",
      });
    }
  } catch {
    // Ignore and proceed to static fallback
  }

  return NextResponse.json({
    ip: ip || "127.0.0.1",
    country: "Localhost",
    region: "Localhost",
    city: "Localhost",
  });
}
