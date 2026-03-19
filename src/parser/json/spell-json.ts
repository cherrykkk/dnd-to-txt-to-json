const levelMap: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const classes = ["牧师", "德鲁伊", "法师", "游侠", "术士", "魔契师", "吟游诗人", "圣武士"];
const classSpellListMap: Record<string, string[]> = {};

export function spellTxtToJson(txt: string) {
  const e = txt;
  try {
    const lines = e.split("\n");
    const fetchNextLine = () => lines.shift() ?? "";

    const firstLine = fetchNextLine();
    const firstLineSplit = firstLine.split(/｜/);
    const name = firstLineSplit.shift();
    const rawName = firstLineSplit.join(" ");

    const secondLine = fetchNextLine();
    classes.forEach((e) => {
      if (secondLine.includes(e)) {
        classSpellListMap[e] = classSpellListMap[e] || [];
        classSpellListMap[e].push(rawName);
      }
    });

    // 塑能 戏法 or 二环 防护
    const [a = "", b] = secondLine.split(/ |（/);
    let school, level;
    if (b === "戏法") {
      level = 0;
      school = a;
    } else {
      school = b;
      const levelChZn = a[0];
      if (levelChZn && levelChZn in levelMap) {
        level = levelMap[levelChZn];
      }
    }
    /**
     * 寒冰赋权｜Investiture of Ice
     * 六环 变化系（德鲁伊、术士、魔契师、法师）
     */
    if (school === "变化系") school = "变化";

    const castingTime = fetchNextLine().replace("施法时间：", "");
    const range = fetchNextLine().replace("施法距离：", "");
    const components = fetchNextLine().replace("法术成分：", "");
    const duration = fetchNextLine().replace("持续时间：", "");

    /**
     * 2014版本：一环 预言（仪式；吟游诗人、牧师、德鲁伊、圣武士、游侠、术士、法师、奇械师）
     *          施法时间：1 动作
     * 2024版本：一环 预言（吟游诗人、牧师、德鲁伊、圣武士、游侠、术士、魔契师、法师、奇械师）
     *          施法时间：动作或仪式
     */
    const ritual = secondLine.includes("仪式") || castingTime.includes("仪式");

    return {
      name,
      rawName,
      school,
      level,
      castingTime,
      range,
      components,
      duration,
      description: lines.join("\n"),
      ritual,
    };
  } catch (error) {
    console.log(e, error);
    throw new Error(e);
  }
}
