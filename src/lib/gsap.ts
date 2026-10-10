import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // DEBUG temporário
  (window as unknown as { __st: typeof ScrollTrigger }).__st = ScrollTrigger;
}

export { gsap, ScrollTrigger };
