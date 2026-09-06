const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src");

const files = [
  { name: "PurposeTravel1990.jsx", multiplier: 365 },
  { name: "PurposeTravel1995.jsx", multiplier: 365 },
  { name: "PurposeTravel2000.jsx", multiplier: 365 },
  // 2005, 2010 目的別: 平日245日 + 休日120日 (平日比率約0.67、休日比率約0.33) -> 約203.75倍
  { name: "PurposeTravel2005.jsx", multiplier: 204 },
  { name: "PurposeTravel2010.jsx", multiplier: 204 },

  { name: "TransportationTravel1990.jsx", multiplier: 365 },
  { name: "TransportationTravel1995.jsx", multiplier: 365 },
  { name: "TransportationTravel2000.jsx", multiplier: 365 },
  { name: "TransportationTravel2005.jsx", multiplier: 365 },
  { name: "TransportationTravel2010.jsx", multiplier: 365 },
];

console.log("=== 年間推計データへの一括置換開始 ===");

for (const f of files) {
  const filePath = path.join(srcDir, f.name);
  if (!fs.existsSync(filePath)) {
    console.warn(`ファイルが見つかりません: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  let count = 0;
  const newContent = content.replace(/"people":\s*(\d+)/g, (match, p1) => {
    count++;
    const val = parseInt(p1, 10);
    // 元の日次データ（1,000,000未満）を年間値へ換算
    if (val < 1000000) {
      const newVal = Math.round(val * f.multiplier);
      return `"people": ${newVal}`;
    }
    return match;
  });

  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`更新完了: ${f.name} (${count} 件のデータを年間推計値へ換算)`);
}

console.log("=== 全データファイルの年間推計データへの入れ替えが完了しました ===");
