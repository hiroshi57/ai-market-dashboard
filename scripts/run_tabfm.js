/**
 * TabFM (google-research/tabfm) の手法を参考にした業界スコアのゼロショット予測。
 *
 * TabFM は in-context learning 方式の表形式データ基盤モデルで、学習データ
 * (X_train/y_train) を「文脈」としてモデルに読ませ、パラメータ更新なしで
 * テストサンプルを予測する。本スクリプトはその考え方を踏襲し、対象業界を
 * 除いた残り14業界を文脈として、特徴量空間での距離に基づく重み付き平均で
 * 各業界のスコアを Leave-One-Out 方式でゼロショット予測する
 * （カーネル重み付き回帰 = TabFM の in-context 予測の簡易近似）。
 *
 * 実行: node scripts/run_tabfm.js
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'markets.json');

const FEATURE_COLS = ['pen', 'market', 'workers', 'aiEng', 'aiEngDensity', 'usaPen', 'globalPen'];
const TARGET_COL = 'score';

function zscoreNormalize(rows, cols) {
  const stats = {};
  cols.forEach(function (c) {
    const vals = rows.map(function (r) { return r[c]; });
    const mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    const variance = vals.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / vals.length;
    const std = Math.sqrt(variance) || 1;
    stats[c] = { mean: mean, std: std };
  });
  return stats;
}

function distance(a, b, cols, stats) {
  let sum = 0;
  cols.forEach(function (c) {
    const za = (a[c] - stats[c].mean) / stats[c].std;
    const zb = (b[c] - stats[c].mean) / stats[c].std;
    sum += (za - zb) * (za - zb);
  });
  return Math.sqrt(sum);
}

function predictLeaveOneOut(industries) {
  const stats = zscoreNormalize(industries, FEATURE_COLS);
  return industries.map(function (target) {
    const others = industries.filter(function (ind) { return ind.id !== target.id; });
    const dists = others.map(function (o) { return { o: o, d: distance(target, o, FEATURE_COLS, stats) }; });
    // ガウスカーネルで重み付け（TabFMのattention的な近さ重視のin-context予測を模す）
    const bandwidth = 1.2;
    let wSum = 0;
    let wScoreSum = 0;
    dists.forEach(function (item) {
      const w = Math.exp(-(item.d * item.d) / (2 * bandwidth * bandwidth));
      wSum += w;
      wScoreSum += w * item.o[TARGET_COL];
    });
    const predScore = wScoreSum / wSum;
    const actual = target[TARGET_COL];
    return {
      id: target.id,
      predScore: Math.round(predScore * 10) / 10,
      actualScore: actual,
      diff: Math.round((predScore - actual) * 10) / 10,
    };
  });
}

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  const industries = data.industries;

  const results = predictLeaveOneOut(industries);
  const byId = {};
  results.forEach(function (r) { byId[r.id] = r; });

  industries.forEach(function (ind) {
    const r = byId[ind.id];
    ind.tabfm = {
      predScore: r.predScore,
      actualScore: r.actualScore,
      diff: r.diff,
      method: 'leave-one-out kernel-weighted in-context regression (TabFM approach)',
      features: FEATURE_COLS,
    };
    console.log(
      ind.id.padEnd(10),
      'actual=' + String(r.actualScore).padStart(5),
      ' tabfm_pred=' + String(r.predScore).padStart(6),
      ' diff=' + (r.diff >= 0 ? '+' : '') + r.diff
    );
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('\nWrote tabfm predictions for ' + results.length + ' industries to ' + DATA_PATH);
}

main();
