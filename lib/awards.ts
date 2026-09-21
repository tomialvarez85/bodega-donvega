import type { Award } from "./schema";

// El premio más destacado: mayor puntaje y, a igual puntaje, el que tiene nombre de premio.
export function topAward(awards: Award[]): Award | null {
  return awards.reduce<Award | null>((best, award) => {
    if (!best) return award;
    if (award.points > best.points) return award;
    if (award.points === best.points && !best.award && award.award) return award;
    return best;
  }, null);
}
