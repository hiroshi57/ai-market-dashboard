/**
 * Zen Paywall - フレームワーク非依存の共通課金ゲート（軽量版）
 *
 * どのZenアプリ（React/Vite/静的HTML/Vue...）にも import 1行 or <script> 1行で
 * 組み込める買い切り課金ゲート。サーバー不要。
 *
 * 仕組み:
 *   1. 無料利用回数を localStorage でカウント（端末ローカル）
 *   2. 上限に達したら Pro 購入を促す（Stripe Payment Link へ誘導）
 *   3. 購入後、success URL の ?zen_pro=1&slug=xxx を検知して Pro 解放
 *      （厳密な検証はサーバー版で。軽量版は「購入導線」と「上限ゲート」を提供）
 *
 * 使い方:
 *   import { ZenPaywall } from './zen-paywall.js';
 *   const gate = new ZenPaywall({
 *     slug: 'personazen',
 *     freeLimit: 3,
 *     paymentLink: 'https://buy.stripe.com/xxxxx',
 *     appTitle: 'PersonaZen',
 *   });
 *   if (gate.isPro()) { // フル機能 }
 *   else if (gate.canUse()) { gate.recordUse(); }
 *   else { gate.showPaywall({ proPrice: '480円', proFeatures: ['詳細データ','エクスポート'] }); }
 */

const STORE_KEY = 'zen-paywall-v1';

class ZenPaywall {
  constructor({ slug, freeLimit = 3, paymentLink = '', appTitle = '' }) {
    this.slug = slug;
    this.freeLimit = freeLimit;
    this.paymentLink = paymentLink;
    this.appTitle = appTitle || slug;
    this._checkProFromUrl();
  }

  _load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  _save(all) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  }
  _state() {
    const all = this._load();
    return all[this.slug] || { used: 0, pro: false, purchasedAt: null };
  }
  _set(state) {
    const all = this._load();
    all[this.slug] = state;
    this._save(all);
  }

  // 購入完了の検知（Stripe success URL の ?zen_pro=1&slug=xxx）
  _checkProFromUrl() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('zen_pro') === '1' && params.get('slug') === this.slug) {
      this.unlockPro();
      params.delete('zen_pro'); params.delete('slug');
      const clean = window.location.pathname + (params.toString() ? '?' + params : '');
      window.history.replaceState({}, '', clean);
    }
  }

  /** Pro購入済みか */
  isPro() { return this._state().pro === true; }

  /** まだ無料で使えるか（Pro含む） */
  canUse() {
    if (this.isPro()) return true;
    return this._state().used < this.freeLimit;
  }

  /** 残り無料回数 */
  remaining() {
    if (this.isPro()) return Infinity;
    return Math.max(0, this.freeLimit - this._state().used);
  }

  /** 無料利用を1回消費 */
  recordUse() {
    if (this.isPro()) return;
    const s = this._state();
    s.used += 1;
    this._set(s);
  }

  /** Proを解放（購入完了 or 復元時） */
  unlockPro() {
    const s = this._state();
    s.pro = true;
    s.purchasedAt = new Date().toISOString();
    this._set(s);
  }

  /** Stripe決済ページへ誘導 */
  startCheckout() {
    if (!this.paymentLink) {
      console.warn('[ZenPaywall] paymentLink が未設定です');
      return;
    }
    const ret = encodeURIComponent(
      window.location.origin + window.location.pathname + `?zen_pro=1&slug=${this.slug}`,
    );
    const url = this.paymentLink + (this.paymentLink.includes('?') ? '&' : '?')
      + `client_reference_id=${this.slug}&redirect=${ret}`;
    window.location.href = url;
  }

  /**
   * 課金されやすいペイウォールを表示（実証済みパターン。誇大表示は避けること）
   * @param opts.proPrice       価格（例 '¥980'）
   * @param opts.originalPrice  ローンチ後通常価格（実際に値上げ予定がある場合のみ・省略可）
   * @param opts.proFeatures    Pro機能リスト（チェックマーク比較）
   * @param opts.teaser         チラ見せHTML（Proで見られる結果の一部・ぼかし表示）
   * @param opts.userCount      ソーシャルプルーフ（例 1240 → 「1,240人が利用中」）
   */
  showPaywall(opts = {}) {
    if (typeof document === 'undefined') return;
    const { proPrice = '', originalPrice = '', proFeatures = [], teaser = '', userCount = 0 } = opts;
    const existing = document.getElementById('zen-paywall-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'zen-paywall-modal';
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,sans-serif;padding:16px';

    // ① 価値のチラ見せ（Proの結果をぼかし表示 → 損失回避を喚起）
    const teaserBlock = teaser
      ? `<div style="position:relative;margin:0 0 14px;border-radius:10px;overflow:hidden">`
        + `<div style="filter:blur(5px);opacity:.7;font-size:.8rem;color:#334155;text-align:left;padding:12px;background:#f8fafc;pointer-events:none">${teaser}</div>`
        + `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(transparent,rgba(255,255,255,.4))"><span style="background:#111;color:#fff;font-size:.72rem;padding:4px 10px;border-radius:99px">🔒 続きはProで</span></div>`
        + `</div>`
      : '';

    // ② 機能比較（無料✗ / Pro✓ のチェックマーク対比）
    const feats = proFeatures.length
      ? `<div style="text-align:left;margin:0 0 16px">`
        + proFeatures.map(f => `<div style="display:flex;align-items:center;gap:8px;font-size:.83rem;color:#334155;padding:4px 0"><span style="color:#22c55e;font-weight:700">✓</span>${f}</div>`).join('')
        + `</div>`
      : '';

    // ③ アンカリング価格（元値に取り消し線 → 今だけ割安に見せる）
    const priceBlock = originalPrice
      ? `<div style="margin:0 0 4px"><span style="color:#94a3b8;text-decoration:line-through;font-size:.9rem">${originalPrice}</span> <span style="color:#7c3aed;font-weight:800;font-size:1.5rem">${proPrice}</span></div>`
        + `<div style="font-size:.72rem;color:#ef4444;font-weight:700;margin-bottom:12px">⏳ 今だけの価格・買い切り（サブスクなし）</div>`
      : `<div style="color:#7c3aed;font-weight:800;font-size:1.4rem;margin-bottom:12px">${proPrice}<span style="font-size:.72rem;color:#64748b;font-weight:600"> 買い切り</span></div>`;

    // ④ ソーシャルプルーフ（利用者数）
    const social = userCount > 0
      ? `<div style="font-size:.74rem;color:#64748b;margin-bottom:10px">⭐ すでに ${Number(userCount).toLocaleString()} 人が利用中</div>`
      : '';

    overlay.innerHTML =
      `<div style="background:#fff;border-radius:18px;padding:26px 22px;max-width:360px;width:100%;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.35)">`
      + `<div style="font-size:2rem;margin-bottom:6px">💎</div>`
      + `<h2 style="margin:0 0 4px;font-size:1.25rem;color:#111;font-weight:800">${this.appTitle} Pro</h2>`
      + `<p style="margin:0 0 14px;font-size:.82rem;color:#64748b">無料分を使い切りました。Proで全部解放👇</p>`
      + teaserBlock
      + feats
      + social
      + priceBlock
      + `<button id="zen-paywall-buy" style="width:100%;padding:13px;border:none;border-radius:11px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:800;font-size:.98rem;cursor:pointer;box-shadow:0 6px 18px rgba(124,58,237,.35)">${proPrice} でProにする</button>`
      + `<button id="zen-paywall-close" style="width:100%;padding:9px;margin-top:6px;border:none;background:none;color:#94a3b8;font-size:.8rem;cursor:pointer">あとで</button>`
      + `<div style="font-size:.68rem;color:#cbd5e1;margin-top:8px">一度購入すればずっと使えます・返金は規約に準拠</div>`
      + `</div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#zen-paywall-buy').onclick = () => this.startCheckout();
    overlay.querySelector('#zen-paywall-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  }
}

// 静的HTML向け: <script src="zen-paywall.js"></script> でグローバル公開
if (typeof window !== 'undefined') {
  window.ZenPaywall = ZenPaywall;
}
