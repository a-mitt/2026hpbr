// 禁則処理：行の先頭に来てはいけない文字は前の行の終わりにぶら下げ、行末に来てはいけない文字は次の行へ送る
const NO_LINE_START = "、。，．,.！？!?）」』】〕〉》〗)]ー…・：；ぁぃぅぇぉっゃゅょァィゥェォッャュョ々";
const NO_LINE_END = "（「『【〔〈《〖([";

export function applyKinsoku(lines) {
  const result = lines.map((line) => line);
  for (let i = 1; i < result.length; i += 1) {
    while (result[i].length > 0 && NO_LINE_START.includes(result[i][0])) {
      result[i - 1] += result[i][0];
      result[i] = result[i].slice(1);
    }
    // 「）」だけの行のように空になった行は、なくす
    if (result[i].length === 0) {
      result.splice(i, 1);
      i -= 1;
      continue;
    }
    while (result[i - 1].length > 1 && NO_LINE_END.includes(result[i - 1].slice(-1))) {
      result[i] = result[i - 1].slice(-1) + result[i];
      result[i - 1] = result[i - 1].slice(0, -1);
    }
  }
  return result;
}
