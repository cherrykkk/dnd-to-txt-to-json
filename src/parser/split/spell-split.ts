// 一般会有多个法术在同一个页面

export function splitSpellTxt(txt: string) {
  const txtBlocks: string[] = [];

  const lines = txt.split("\n").filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (i === 0) continue;
    if (l.includes("｜")) {
      txtBlocks.push(lines.splice(0, i).join("\n"));
      i = 0;
    }
  }
  txtBlocks.push(lines.join("\n"));
  // const txtBlocks = txt
  //   .split(/\n\n/)
  //   .filter(Boolean)
  //   .map((e) => e.trim());
  // for (let i = 0; i < txtBlocks.length; i++) {
  //   const tb = txtBlocks[i];
  //   if (!tb) continue;
  //   const firstLine = tb.split("\n")[0];
  //   if (!firstLine || !firstLine.includes("｜")) {
  //     txtBlocks[i - 1] += `\n` + txtBlocks[i];
  //     txtBlocks.splice(i, 1);
  //     i--;
  //   }
  // }
  return txtBlocks;
}

export function splitSpellTxtForCHM5E(txt: string) {
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
