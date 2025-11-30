// 一般会有多个法术在同一个页面

export function splitSpellTxt(txt: string) {
  const txtBlocks = txt
    .split(/\n\n/)
    .filter(Boolean)
    .map((e) => e.trim());
  for (let i = 0; i < txtBlocks.length; i++) {
    const tb = txtBlocks[i];
    if (!tb) continue;
    const firstLine = tb.split("\n")[0];
    if (!firstLine || !firstLine.includes("｜")) {
      txtBlocks[i - 1] += `\n` + txtBlocks[i];
      txtBlocks.splice(i, 1);
      i--;
    }
  }
  return txtBlocks;
}
