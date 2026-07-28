import type { Event } from "@/types/event";

/* Cheapest distance price for an event (SPEC §3.3). */
export const minPrice = (ev: Event): number =>
  Math.min(...ev.distances.map((d) => d.price));
