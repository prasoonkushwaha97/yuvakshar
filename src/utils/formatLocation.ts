import { Profile } from "@/store/types";

/**
 * Formats city, state, and country into a clean, localized string.
 *
 * Rules:
 * - Only City: "भोपाल"
 * - City + State: "भोपाल, मध्य प्रदेश"
 * - State + Country: "मध्य प्रदेश, भारत"
 * - All exist: "भोपाल, मध्य प्रदेश, भारत"
 * - None exist: returns null (completely hidden, no placeholder text).
 */
export function formatProfileLocation(user?: Partial<Profile> | any): string | null {
  if (!user) return null;

  const city = typeof user.city === "string" ? user.city.trim() : "";
  const state = typeof user.state === "string" ? user.state.trim() : "";
  const country = typeof user.country === "string" ? user.country.trim() : "";

  const parts = [city, state, country].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  // Fallback to single legacy location property if present
  if (typeof user.location === "string" && user.location.trim()) {
    return user.location.trim();
  }

  return null;
}
