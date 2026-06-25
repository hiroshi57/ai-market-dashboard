# -*- coding: utf-8 -*-
import re

with open('ai-market-dashboard.html', 'r', encoding='utf-8') as f:
    c = f.read()

# ============================================================
# 1. Font -> Meiryo
# ============================================================
c = c.replace(
    "--f-head: 'Helvetica Neue','Arial Black','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',-apple-system,sans-serif;",
    "--f-head: 'Meiryo UI','Meiryo','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;"
)
c = c.replace(
    "--f-body: 'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic','Meiryo',-apple-system,sans-serif;",
    "--f-body: 'Meiryo','Meiryo UI','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;"
)

# ============================================================
# 2. Topbar tabs fix: scrollTo -> scrollToSection
# ============================================================
c = c.replace(
    "onclick=\"scrollTo('sec-overview')\"",
    "onclick=\"scrollToSection('sec-overview',this)\""
)
c = c.replace(
    "onclick=\"scrollTo('sec-industries')\"",
    "onclick=\"scrollToSection('sec-industries',this)\""
)
c = c.replace(
    "onclick=\"scrollTo('sec-timefm')\"",
    "onclick=\"scrollToSection('sec-timefm',this)\""
)
c = c.replace(
    "onclick=\"scrollTo('sec-recommend')\"",
    "onclick=\"scrollToSection('sec-recommend',this)\""
)
c = c.replace(
    "onclick=\"scrollTo('sec-avoid')\"",
    "onclick=\"scrollToSection('sec-avoid',this)\""
)

# ============================================================
# 3. Important badge count 5->8
# ============================================================
c = c.replace(
    'data-filter="important" onclick="filterCards(\'important\',this)">\n      <span class="s-dot" style="background:var(--orange)"></span>\n      \U0001f536 早急参入（2028末）\n      <span class="s-count" style="background:var(--orange-lt);color:var(--orange)">5</span>',
    'data-filter="important" onclick="filterCards(\'important\',this)">\n      <span class="s-dot" style="background:var(--orange)"></span>\n      \U0001f536 早急参入（2028末）\n      <span class="s-count" style="background:var(--orange-lt);color:var(--orange)">8</span>'
)

with open('ai-market-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(c)

print("patch1 done")
print("font check:", "'Meiryo UI'" in c)
print("scrollToSection check:", "scrollToSection('sec-overview'" in c)
