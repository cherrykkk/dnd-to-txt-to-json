const rarity = ["普通", "非普通", "珍稀", "极珍稀", "传说", "多种稀有度", "多种珍稀度"]; // 艾恩石被特殊写成了多种珍稀度
const categories = ["护甲", "药水", "戒指", "权杖", "卷轴", "法杖", "魔杖", "武器", "奇物"];

export function splitTxtAsMagicItems(txt: string) {
  const lines = txt.split("\n");
  const splitItemSegments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (rarity.some((e) => l.includes(e)) && categories.some((e) => l.includes(e))) {
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
