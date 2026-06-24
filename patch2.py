# -*- coding: utf-8 -*-

with open('ai-market-dashboard.html', 'r', encoding='utf-8') as f:
    c = f.read()

# ============================================================
# 4. Sidebar reorganization
# ============================================================
OLD_SIDEBAR = '''<nav class="sidebar">
  <div class="s-group">
    <span class="s-label">参入推奨</span>
    <a class="s-link on" data-filter="all" onclick="filterCards('all',this)">
      <span class="s-dot" style="background:var(--primary)"></span>
      全業界
      <span class="s-count" style="background:var(--primary-lt);color:var(--primary)">15</span>
    </a>
    <a class="s-link" data-filter="critical" onclick="filterCards('critical',this)">
      <span class="s-dot" style="background:var(--red)"></span>
      ⚡ 緊急参入（2027末）
      <span class="s-count" style="background:var(--red-lt);color:var(--red)">3</span>
    </a>
    <a class="s-link" data-filter="important" onclick="filterCards('important',this)">
      <span class="s-dot" style="background:var(--orange)"></span>
      🔶 早急参入（2028末）
      <span class="s-count" style="background:var(--orange-lt);color:var(--orange)">5</span>
    </a>
    <a class="s-link" data-filter="normal" onclick="filterCards('normal',this)">
      <span class="s-dot" style="background:var(--primary)"></span>
      📌 余裕あり（2029以降）
      <span class="s-count" style="background:var(--primary-lt);color:var(--primary)">4</span>
    </a>
  </div>
  <div class="s-divider"></div>
  <div class="s-group">
    <span class="s-label">産業大分類（e-Stat）</span>
    <a class="s-link" href="#kaigo"><span class="s-dot" style="background:#059669"></span>P: 医療、福祉</a>
    <a class="s-link" href="#kensetsu"><span class="s-dot" style="background:#2563EB"></span>D: 建設業</a>
    <a class="s-link" href="#houritu"><span class="s-dot" style="background:#7C3AED"></span>L: 学術研究・専門</a>
    <a class="s-link" href="#gyousei"><span class="s-dot" style="background:#06B6D4"></span>S: 公務</a>
    <a class="s-link" href="#clinic"><span class="s-dot" style="background:#EC4899"></span>P: 医療（診療所）</a>
    <a class="s-link" href="#nogyou"><span class="s-dot" style="background:#D97706"></span>A: 農業、林業</a>
    <a class="s-link" href="#suisan"><span class="s-dot" style="background:#6366F1"></span>B: 漁業</a>
    <a class="s-link" href="#ringyou"><span class="s-dot" style="background:#10B981"></span>A: 林業</a>
    <a class="s-link" href="#chusho"><span class="s-dot" style="background:#F59E0B"></span>R: その他サービス</a>
    <a class="s-link" href="#shukyou"><span class="s-dot" style="background:#94A3B8"></span>N: 生活関連サービス</a>
    <a class="s-link" href="#craft"><span class="s-dot" style="background:#F97316"></span>E: 製造業（伝統）</a>
    <a class="s-link" href="#npo"><span class="s-dot" style="background:#22D3EE"></span>O: 教育・学習支援</a>
    <a class="s-link" href="#fudosan"><span class="s-dot" style="background:#0EA5E9"></span>K: 不動産業</a>
    <a class="s-link" href="#hotel"><span class="s-dot" style="background:#F59E0B"></span>M: 宿泊・飲食サービス</a>
    <a class="s-link" href="#nokyo"><span class="s-dot" style="background:#22C55E"></span>Q: 農協・生協</a>
  </div>
  <div class="s-divider"></div>
  <div class="s-group">
    <span class="s-label">分析ツール</span>
    <a class="s-link" href="#sec-charts">📊 浸透率チャート</a>
    <a class="s-link" href="#sec-matrix">🎯 機会マトリクス</a>
    <a class="s-link" href="#sec-timefm">📈 TimesFM予測</a>
    <a class="s-link" href="#sec-roi">💴 ROI試算</a>
  </div>
  <div class="s-divider"></div>
  <div class="s-group">
    <span class="s-label">回避市場</span>
    <a class="s-link" href="#sec-avoid" style="color:var(--red)">
      <span class="s-dot" style="background:var(--red)"></span>
      🚫 参入非推奨
      <span class="s-count" style="background:var(--red-lt);color:var(--red)">7</span>
    </a>
  </div>
</nav>'''

NEW_SIDEBAR = '''<nav class="sidebar">
  <div class="s-group">
    <span class="s-label">分析ツール</span>
    <a class="s-link" href="#sec-charts">📊 浸透率チャート</a>
    <a class="s-link" href="#sec-matrix">🎯 機会マトリクス</a>
    <a class="s-link" href="#sec-timefm">📈 TimesFM予測</a>
    <a class="s-link" href="#sec-recommend">🏆 推奨TOP3</a>
    <a class="s-link" href="#sec-roi">💴 ROI試算</a>
    <a class="s-link" href="#sec-avoid" style="color:var(--red)">🚫 回避市場</a>
  </div>
  <div class="s-divider"></div>
  <div class="s-group">
    <span class="s-label">業界フィルター</span>
    <a class="s-link on" data-filter="all" onclick="filterCards('all',this)">
      <span class="s-dot" style="background:var(--primary)"></span>
      全業界
      <span class="s-count" style="background:var(--primary-lt);color:var(--primary)">15</span>
    </a>
    <a class="s-link" data-filter="critical" onclick="filterCards('critical',this)">
      <span class="s-dot" style="background:var(--red)"></span>
      ⚡ 緊急（2027末）
      <span class="s-count" style="background:var(--red-lt);color:var(--red)">3</span>
    </a>
    <a class="s-link" data-filter="important" onclick="filterCards('important',this)">
      <span class="s-dot" style="background:var(--orange)"></span>
      🔶 早急（2028末）
      <span class="s-count" style="background:var(--orange-lt);color:var(--orange)">8</span>
    </a>
    <a class="s-link" data-filter="normal" onclick="filterCards('normal',this)">
      <span class="s-dot" style="background:var(--primary)"></span>
      📌 余裕あり（2029以降）
      <span class="s-count" style="background:var(--primary-lt);color:var(--primary)">4</span>
    </a>
  </div>
  <div class="s-divider"></div>
  <div class="s-group">
    <span class="s-label">回避推奨</span>
    <a class="s-link" href="#sec-avoid" style="color:var(--red)">
      <span class="s-dot" style="background:var(--red)"></span>
      🚨 参入危険ゾーン
      <span class="s-count" style="background:var(--red-lt);color:var(--red)">7</span>
    </a>
  </div>
</nav>'''

if OLD_SIDEBAR in c:
    c = c.replace(OLD_SIDEBAR, NEW_SIDEBAR)
    print("sidebar OK")
else:
    print("ERROR: sidebar not found, checking partial...")
    print("has nav sidebar:", '<nav class="sidebar">' in c)
    print("has 産業大分類:", '産業大分類' in c)

with open('ai-market-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(c)
