import type { JSX } from "preact";
import car1Url from "../../Pictures/Car1.png";
import car2Url from "../../Pictures/Car2.png";

interface CarProps {
  className?: string;
  style?: JSX.CSSProperties;
}

/**
 * Car 1 — Rival Car (RED) — uses exact PNG from Pictures/Car1.png
 * Displayed as PNG (not SVG) per requirement.
 * Filter tints the yellow supercar to red.
 */
export function RedSuperCar({ className = "", style = {} }: CarProps) {
  return (
    <img
      src={car1Url}
      alt="Car 1 - Rival"
      className={`car-png car-rival ${className}`}
      style={{ width: "100%", height: "100%", objectFit: "contain", ...style }}
      draggable={false}
    />
  );
}

/**
 * Car 2 — Player Car (GREEN) — uses exact PNG from Pictures/Car2.png
 * Displayed as PNG (not SVG) per requirement.
 * Filter tints the orange muscle car to green.
 */
export function GreenSuperCar({ className = "", style = {} }: CarProps) {
  return (
    <img
      src={car2Url}
      alt="Car 2 - Player"
      className={`car-png car-player ${className}`}
      style={{ width: "100%", height: "100%", objectFit: "contain", ...style }}
      draggable={false}
    />
  );
}

// Semantic aliases — Car 1 = Rival (Red), Car 2 = Player (Green)
export const RivalCar = RedSuperCar;
export const PlayerCar = GreenSuperCar;

// Back-compat: legacy import still renders PNG (Car2) tinted green
export function LightGreenMuscleCar(props: CarProps) {
  return GreenSuperCar(props);
}
