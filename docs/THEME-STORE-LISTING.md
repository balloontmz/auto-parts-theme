# Theme Store Listing 提交文案（复制即用）

> 提交入口：Shopify Partner 后台 → Apps and themes → Theme Store → Submit a theme
> 以下英文文案直接粘贴到对应表单字段。

---

## Theme name（主题名）

```
Auto Parts
```

## Tagline / Short description（一句话简介）

```
A conversion-focused theme for auto parts and accessory stores, with a built-in Year/Make/Model vehicle picker and fitment guarantees on every product page.
```

## Full description（完整描述）

```
Auto Parts is built for one of the toughest e-commerce verticals: car parts.

Shoppers won't buy a part unless they're sure it fits — so fitment is baked into
every step of the storefront:

- MY GARAGE PICKER — A persistent Year / Make / Model selector in the header and
  a prominent hero picker on the homepage. The chosen vehicle is remembered and
  shown on every collection and product page.
- FITMENT CONFIRMATION — Each product page shows a clear green "Fits your car"
  or red "Does not fit" message against the shopper's saved vehicle, plus a
  compatible-vehicles list. Universal-fit products are labelled automatically.
- CATALOG-SCALE FILTERING — Fitment data lives in product metafields and is
  filtered with Shopify's native storefront filtering, so catalogs with tens of
  thousands of SKUs stay fast.
- MEMBERS-FIRST CHECKING — An optional gate hides prices and checkout from
  guests, encouraging account creation for B2B and dealer workflows.
- DEALER & REFERRAL ATTRIBUTION — Dealers share referral links; orders are
  tagged with the dealer code automatically for rebate reporting.
- BUILT FOR LARGE CATALOGS — Brand logo strip, category mega menu, trust badges
  and a dark automotive hero section.

Under the hood it is based on Shopify's reference architecture (Online Store
2.0, JSON templates), ships compiled Tailwind CSS (no CDN), and passes
Theme Check with zero errors.
```

## Features / Highlights（勾选或填写亮点，按表单格式取用）

```
- Vehicle picker (Year / Make / Model) with remembered garage
- Fitment confirmation on every product page
- Metafield-driven fitment filtering at catalog scale
- Members-only checkout gate with optional guest price hiding
- Dealer referral attribution for order reporting
- Mega menu, brand logo strip, trust badges, dark automotive hero
```

## Category（分类）

```
Automotive & Cars
```

## Demo store（演示店）

```
URL:      https://auto-parts-pxpjvqd4.myshopify.com
Password: liehow        ← 提交前也可在后台关闭密码页，则密码留空
```

⚠️ 提交前把演示店里的测试数据检查一遍（商品名/图片已真实化），
并建议关掉密码页，审核员可直接进入。

## Support email（支持邮箱）

```
balloontmz@gmail.com        ← 建议换成品牌邮箱，如 support@你的域名
```

## Documentation URL

```
https://github.com/balloontmz/auto-parts-theme#readme
```

## Support URL

```
https://github.com/balloontmz/auto-parts-theme/issues
```

## Theme zip

```
dist/auto-parts-theme-1.0.0.zip
（在 F:/code/autoparts 下；重新构建：python tools/build-package.py）
```

---

## 提交步骤（Partner 后台）

1. 登录 https://partners.shopify.com（用建立开发店的同一账号）
2. 左侧 **Apps and themes → Theme store** → 首次进入需接受 Theme Store 条款
   并完善收款/联系信息
3. 点 **Submit a theme** → 上传 `dist/auto-parts-theme-1.0.0.zip`
4. 按上面文案填写 listing 各字段，上传截图（建议：首页、分类筛选页、
   商品页适配确认、选车弹窗、移动端首页）和演示视频（要求见官方文档）
5. 填演示店 URL + 密码、支持邮箱、文档/支持 URL
6. 提交 → 审核约 1–4 周；打回会附意见，修改后重新上传 zip 再次提交

## 提交前最后自查

- [ ] 演示店 Lighthouse 四项自测达标
- [ ] 演示店商品图片替换为自有版权图片（当前部分为网络图，仅演示用）
- [ ] 支持邮箱可正常收信
- [ ] GitHub 仓库公开可访问、README 渲染正常
