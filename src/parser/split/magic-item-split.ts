import { parseAsCategoryAndRarityAndAttunement } from "../identify/magic-item-identify";

export function splitTxtAsMagicItems(txt: string) {
  const lines = txt.split("\n");
  const splitItemSegments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;

    const rarityResult = parseAsCategoryAndRarityAndAttunement(l);
    if (rarityResult.category && rarityResult.rarity) {
      let itemStartLineIndex = i - 1;
      if (!lines[itemStartLineIndex]) {
        // 有时候会莫名其妙空一行
        lines.splice(itemStartLineIndex, 1);
        itemStartLineIndex -= 1;
      }
      if (!lines[itemStartLineIndex]) {
        // 万一莫名其妙空了两行呢？
        lines.splice(itemStartLineIndex, 1);
        itemStartLineIndex -= 1;
      }
      if (itemStartLineIndex <= 0) {
        continue;
      }
      const seg = lines.splice(0, itemStartLineIndex).join("\n");
      splitItemSegments.push(seg);
      i = 0;
    }
  }
  if (lines.length) splitItemSegments.push(lines.join("\n"));
  return splitItemSegments;
}
