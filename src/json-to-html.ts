import { MonsterCard } from "card-types";

// 将 MonsterCard JSON 生成与示例相同结构的 HTML 片段
export function monsterJsonToHtml(card: MonsterCard): string {
  const { ENG_name, title, subLine, abilities } = card;
  const {
    AC: ac = "",
    先攻: init = "",
    HP: hp = "",
    速度: speed = "",
    装备: equip = "",
    感官: senses = "",
    语言: languages = "",
    CR: cr = "",
  } = card.simpleInfo;

  const abilityRow1 = [
    abilityCells(abilities.str, "c1", "c2"),
    abilityCells(abilities.dex, "c1", "c2"),
    abilityCells(abilities.con, "c1", "c2"),
  ].join("<td></td>");
  const abilityRow2 = [
    abilityCells(abilities.int, "c3", "c4"),
    abilityCells(abilities.wis, "c3", "c4"),
    abilityCells(abilities.cha, "c3", "c4"),
  ].join("<td></td>");

  const traitsHtml = (card.traits ?? [])
    .map((t) => `<strong>${escapeHtml(t.name)}</strong>${escapeHtml(t.text)}<br>`)
    .join("\n");

  const actionsHtml = (card.actions ?? [])
    .map((a) => {
      const text = inlineEmphasis(escapeHtml(a.text));
      return `<strong>${escapeHtml(a.name)}</strong>${text}`;
    })
    .join("<br>\n");

  return `<div class="stat-block">
<h5 id="${escapeAttr(ENG_name)}">${escapeHtml(title)}</h5>
<div class="sub-line">${escapeHtml(subLine)}</div>
<table><tbody><tr><td><strong>AC </strong>${escapeHtml(ac)}</td><td width="40%"><strong>先攻 </strong>${escapeHtml(init)}</td></tr>
<tr><td colspan="2"><strong>HP </strong>${escapeHtml(hp)}</td></tr>
<tr><td colspan="2"><strong>速度 </strong>${escapeHtml(speed)}</td></tr></tbody></table>
<table class="stat-abilities"><tbody><tr><th></th><th></th><th>调整</th><th>豁免</th><td style="WIDTH: 5px"></td><th></th><th></th><th>调整</th><th>豁免</th><td style="WIDTH: 5px"></td><th></th><th></th><th>调整</th><th>豁免</th></tr>
<tr>${abilityRow1}</tr>
<tr>${abilityRow2}</tr>
</tbody></table>
<table>
<tbody><tr><td><strong>装备 </strong>${escapeHtml(equip ?? "")}</td></tr>
<tr><td><strong>感官 </strong>${escapeHtml(senses ?? "")}</td></tr>
<tr><td><strong>语言 </strong>${escapeHtml(languages ?? "")}</td></tr>
<tr><td><strong>CR </strong>${escapeHtml(cr ?? "")}</td></tr>
</tbody></table>
<p>
</p>
<h6>特质Traits</h6>
<p>
${traitsHtml}
</p>
<h6>动作Actions</h6>
<p>
${actionsHtml}
</p>
</div>`;
}

function abilityCells(
  g: MonsterCard["abilities"]["str"],
  c1: "c1" | "c3",
  c2: "c2" | "c4",
): string {
  return `<td class="${c1}"><strong>${g.name}</strong></td><td class="${c1}">${g.score}</td><td class="${c2}">${g.mod}</td><td class="${c2}">${g.save}</td>`;
}

function inlineEmphasis(s: string) {
  return s
    .replace(/近战攻击检定：/g, "<em>近战攻击检定：</em>")
    .replace(/命中：/g, "<em>命中：</em>");
}

function escapeHtml(s: string): string {
  console.log(s, s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
