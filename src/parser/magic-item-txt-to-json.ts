import { parseAsCategoryAndRarityAndAttunement } from "./identify/magic-item-identify";

export function magicItemSegmentToJson(seg: string) {
  const lines = seg.split("\n");
  const title = lines.shift() ?? "";
  const { rarity, category, attunement } = parseAsCategoryAndRarityAndAttunement(
    lines.shift() ?? "",
  );
  const description = lines.join("\n");

  return { title, rarity, category, attunement, description };
}
