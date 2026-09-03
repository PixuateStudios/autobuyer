type IconName =
  | "car-sport-outline"
  | "cash-outline"
  | "speedometer-outline"
  | "location-outline"
  | "add-circle-outline";

export type PreferenceKind = "body" | "budget" | "mileage" | "location" | "custom";

export type BuyerPreference = {
  id: string;
  kind: PreferenceKind;
  label: string;
  bodyStyle?: string;
  minPrice?: number;
  maxPrice?: number;
  minMiles?: number;
  maxMiles?: number;
  city?: string;
  nearby?: boolean;
  customValue?: string;
};

export type VehicleInterest = {
  id: string;
  make: string;
  model: string;
  yearMin?: number;
  yearMax?: number;
  bodyStyle?: string;
  color?: string;
  tags: string[];
};

export type BuyerProfile = {
  name: string;
  status: string;
  location: string;
  bio: string;
  preferences: BuyerPreference[];
  interests: VehicleInterest[];
};

export const emptyProfile = (name = ""): BuyerProfile => ({
  name,
  status: "",
  location: "",
  bio: "",
  preferences: [],
  interests: [],
});

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const BODY_STYLES = [
  "SUV",
  "Crossover",
  "Sedan",
  "Truck",
  "Coupe",
  "Hatchback",
  "Wagon",
  "Van",
  "Convertible",
];

export const STATUS_OPTIONS = [
  "Serious Buyer",
  "Ready this month",
  "First-time buyer",
  "Just browsing",
];

export const INTEREST_TAG_SUGGESTIONS = [
  "Dealer Maintained",
  "Certified Pre-Owned",
  "AWD",
  "Low Mileage",
  "One Owner",
  "No Accidents",
];

export const PREFERENCE_KINDS: {
  kind: PreferenceKind;
  title: string;
  hint: string;
  icon: IconName;
  color: string;
}[] = [
  { kind: "body", title: "Body style", hint: "SUV, truck, sedan…", icon: "car-sport-outline", color: "#3B82F6" },
  { kind: "budget", title: "Price range", hint: "Min and max you're comfortable with", icon: "cash-outline", color: "#22C55E" },
  { kind: "mileage", title: "Mileage", hint: "How many miles is too many", icon: "speedometer-outline", color: "#A855F7" },
  { kind: "location", title: "Location", hint: "City or area you'll buy in", icon: "location-outline", color: "#EF4444" },
  { kind: "custom", title: "Something else", hint: "AWD, fuel type, seats…", icon: "add-circle-outline", color: "#F59E0B" },
];

export function preferenceMeta(kind: PreferenceKind) {
  return PREFERENCE_KINDS.find((item) => item.kind === kind) ?? PREFERENCE_KINDS[4];
}

function compactMoney(value: number) {
  if (value >= 1000) {
    const k = value / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `$${value}`;
}

function compactMiles(value: number) {
  if (value >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K mi`;
  }
  return `${value} mi`;
}

export function formatPreference(pref: BuyerPreference) {
  if (pref.kind === "body") {
    return pref.bodyStyle || pref.label;
  }
  if (pref.kind === "budget") {
    if (pref.minPrice != null && pref.maxPrice != null) {
      return `${compactMoney(pref.minPrice)} – ${compactMoney(pref.maxPrice)}`;
    }
    if (pref.maxPrice != null) return `Under ${compactMoney(pref.maxPrice)}`;
    if (pref.minPrice != null) return `${compactMoney(pref.minPrice)}+`;
  }
  if (pref.kind === "mileage") {
    if (pref.minMiles != null && pref.maxMiles != null) {
      return `${compactMiles(pref.minMiles)} – ${compactMiles(pref.maxMiles)}`;
    }
    if (pref.maxMiles != null) return `Under ${compactMiles(pref.maxMiles)}`;
    if (pref.minMiles != null) return `${compactMiles(pref.minMiles)}+`;
  }
  if (pref.kind === "location") {
    const city = pref.city?.trim();
    if (city && pref.nearby) return `${city} & Nearby`;
    return city || pref.label;
  }
  return pref.customValue?.trim() || pref.label;
}

export function interestTitle(interest: VehicleInterest) {
  return `${interest.make} ${interest.model}`.trim();
}

export function interestMeta(interest: VehicleInterest) {
  const years =
    interest.yearMin && interest.yearMax
      ? `${interest.yearMin}-${interest.yearMax}`
      : interest.yearMin
        ? `${interest.yearMin}+`
        : interest.yearMax
          ? `Up to ${interest.yearMax}`
          : null;
  return [years, interest.bodyStyle].filter(Boolean).join(" • ");
}

export const INTEREST_COLORS = [
  ["#3B82F6", "#1E40AF"],
  ["#14B8A6", "#0F766E"],
  ["#F59E0B", "#C2410C"],
  ["#A855F7", "#6D28D9"],
] as const;
