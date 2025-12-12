const normalRarity = [
  "普通",
  "非普通",
  "珍稀",
  "极珍稀",
  "神器",
  "传说",
  "多种稀有度",
  "多种珍稀度", // 艾恩石
  "普通或非普通", // 幻织
]; // 艾恩石被特殊写成了多种珍稀度
const categories = ["护甲", "药水", "戒指", "权杖", "卷轴", "法杖", "魔杖", "武器", "奇物"];
const ggrSpecialRarity = ["稀有度依符镇兵种类而不同"];
const rarities = normalRarity.concat(ggrSpecialRarity);

//奇物，神器
//奇物， 珍稀（需同调）#不规范写法，多了一个空格
//奇物，神器（需同调）
//奇物，普通（需魔契师同调）
//卷轴，多种稀有度
//武器（任意弹药或近战武器），非普通
//武器（长柄刀、巨剑、长剑、刺剑、弯刀或短剑），非普通（需同调）
//护甲（中甲或重甲，兽皮甲除外），非普通
//奇物，普通或非普通
export function parseAsCategoryAndRarityAndAttunement(line: string) {
  const [categoryAnd = "", rarityAndAttunement = ""] = line.split(/[,，](?![^（(]*[）)])/);
  const category = categoryAnd.split(/[（）,， ]/).filter(Boolean)[0];
  const rarity = rarityAndAttunement.split(/[（）,， ]/).filter(Boolean)[0];
  // 先分割再完全匹配，避免一句话中偶然出现这两种词
  if (categories.includes(category) && rarities.includes(rarity)) {
    // 存在不标准格式如同“奇物， 珍稀（需同调）” 一样在逗号后多了个空格，故加一个 trim
    const attunement = rarityAndAttunement.trim().replace(rarity, "");

    return {
      category: categoryAnd,
      rarity: rarity
        .replace("多种珍稀度", "多种稀有度")
        .replace("稀有度依符镇兵种类而不同", "多种稀有度"),
      attunement,
    };
  } else {
    return { category: "", rarity: "", attunement: "" };
  }
}

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
