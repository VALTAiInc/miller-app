import { storage } from "./storage";

export async function seedDatabase() {
  try {
    const existingEntries = await storage.getAllJobLogEntries();
    if (existingEntries.length > 0) return;

    await storage.createJobLogEntry({
      title: "Miller Continuum Accu-Pulse setup",
      notes: "Adjusted arc control for cleaner toe on 1/4\" steel. Excellent puddle control with 0.035 wire at 350 ipm, 22V. 75/25 Ar/CO2 at 25 CFH.",
    });

    await storage.createJobLogEntry({
      title: "Versa-Pulse on 16ga sheet metal",
      notes: "Low heat setting worked perfectly for 16ga lap joint. Minimal warpage, fast travel speed. Used 0.030 wire at 280 ipm, 18.5V.",
    });

    await storage.createJobLogEntry({
      title: "RMD root pass on 6\" schedule 40 pipe",
      notes: "RMD mode for open root, 3/32\" gap. Wire feed at 220 ipm gave smooth transfer. Followed with Accu-Pulse fill and cap passes.",
    });

    console.log("Seeded job log entries");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
