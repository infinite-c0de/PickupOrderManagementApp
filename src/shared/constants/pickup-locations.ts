import type { PickupLocation } from "../types/pickup-order";

export const PICKUP_LOCATIONS: readonly PickupLocation[] = [
  "Doorman",
  "Front Desk",
  "Front Door",
  "Back Door",
  "Garage",
  "Side Entrance",
  "Other",
] as const;
