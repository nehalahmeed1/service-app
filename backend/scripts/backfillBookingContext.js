const mongoose = require("mongoose");
const Booking = require("../models/Booking");

function toSafeInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function parseFromAddress(address = "") {
  const raw = String(address || "");
  const marker = "\n\n--- Booking Notes ---\n";
  const idx = raw.indexOf(marker);
  if (idx < 0) return null;

  const cleanAddress = raw.slice(0, idx).trim();
  const notesBlock = raw.slice(idx + marker.length).trim();
  const lines = notesBlock.split("\n").map((line) => line.trim()).filter(Boolean);
  const noteMap = new Map();
  lines.forEach((line) => {
    const splitAt = line.indexOf(":");
    if (splitAt < 0) return;
    const key = line.slice(0, splitAt).trim().toLowerCase();
    const value = line.slice(splitAt + 1).trim();
    if (key) noteMap.set(key, value);
  });

  const modeRaw = (noteMap.get("booking mode") || "").toUpperCase();
  const businessLevel =
    modeRaw === "ENTERPRISE"
      ? "ENTERPRISE"
      : modeRaw === "SMALL TEAM" || modeRaw === "SMALL_TEAM"
      ? "SMALL_TEAM"
      : "INDIVIDUAL";

  return {
    cleanAddress: cleanAddress || raw,
    bookingContext: {
      businessLevel,
      landmark: noteMap.get("landmark") || "",
      specialInstructions: noteMap.get("instructions") || "",
      smallTeam: {
        teamName: noteMap.get("team name") || "",
        coordinator: noteMap.get("team coordinator") || "",
        requestsPerMonth: toSafeInt(noteMap.get("req/month")),
        preferredWindow: noteMap.get("preferred window") || "",
      },
      enterprise: {
        companyName: noteMap.get("company") || "",
        facilityType: noteMap.get("facility type") || "",
        facilityCount: toSafeInt(noteMap.get("facility count")),
        coordinator: noteMap.get("coordinator") || "",
        poNumber: noteMap.get("po number") || "",
        complianceChecklistRequired:
          (noteMap.get("compliance checklist required") || "").toLowerCase() === "yes",
      },
    },
  };
}

async function run() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  try {
    const rows = await Booking.find({}).select("_id address bookingContext");
    let updated = 0;

    for (const row of rows) {
      const parsed = parseFromAddress(row.address || "");
      if (!parsed) continue;

      row.address = parsed.cleanAddress;
      row.bookingContext = {
        businessLevel: parsed.bookingContext.businessLevel || row.bookingContext?.businessLevel || "INDIVIDUAL",
        landmark: parsed.bookingContext.landmark || row.bookingContext?.landmark || "",
        specialInstructions:
          parsed.bookingContext.specialInstructions || row.bookingContext?.specialInstructions || "",
        smallTeam: {
          teamName: parsed.bookingContext.smallTeam.teamName || row.bookingContext?.smallTeam?.teamName || "",
          coordinator:
            parsed.bookingContext.smallTeam.coordinator || row.bookingContext?.smallTeam?.coordinator || "",
          requestsPerMonth:
            parsed.bookingContext.smallTeam.requestsPerMonth ||
            row.bookingContext?.smallTeam?.requestsPerMonth ||
            0,
          preferredWindow:
            parsed.bookingContext.smallTeam.preferredWindow ||
            row.bookingContext?.smallTeam?.preferredWindow ||
            "",
        },
        enterprise: {
          companyName:
            parsed.bookingContext.enterprise.companyName || row.bookingContext?.enterprise?.companyName || "",
          facilityType:
            parsed.bookingContext.enterprise.facilityType || row.bookingContext?.enterprise?.facilityType || "",
          facilityCount:
            parsed.bookingContext.enterprise.facilityCount || row.bookingContext?.enterprise?.facilityCount || 0,
          coordinator:
            parsed.bookingContext.enterprise.coordinator || row.bookingContext?.enterprise?.coordinator || "",
          poNumber: parsed.bookingContext.enterprise.poNumber || row.bookingContext?.enterprise?.poNumber || "",
          complianceChecklistRequired:
            parsed.bookingContext.enterprise.complianceChecklistRequired ||
            row.bookingContext?.enterprise?.complianceChecklistRequired ||
            false,
        },
      };

      await row.save();
      updated += 1;
    }

    console.log(`Backfill complete. Updated ${updated} booking(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});

