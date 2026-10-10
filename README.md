# 汽配商城 Shopify 主题（Auto Parts Theme）

基于 Shopify 官方 **Dawn 16.0.0** 二次开发的交付级主题，面向澳洲汽车配件 C 端 + 小 B 经销商场景。
参照 sonicautoparts.com.au 的"按车型选购"体验实现：**车型适配库（Year / Make / Model 选车器）+ 关键字搜索 + 注册会员下单 + 经销商归因返点**。

- 店铺（开发者店）：https://auto-parts-pxpjvqd4.myshopify.com （前台密码：`liehow`）
- 技术栈：Liquid（OS 2.0 JSON 模板）+ **Tailwind CSS v4（本地编译，非 CDN）** + 原生 JS
- 设计语言：墨黑 `#0E1116` + 电力蓝 `#2563EB` + 纸灰 `#F6F7F8`，Inter 字体，药丸按钮，大圆角卡片（参考 jch / kete / xdtb 设计基准）

## Tailwind 构建链（重要）

```bash
npm install          # 首次
npm run build:css    # 修改样式后重新构建 → assets/tailwind.css
npm run watch:css    # 开发时监听
```

- 样式源文件：`tailwind/tailwind.input.css`（design tokens + 组件覆盖都在这里）
- 产物：`assets/tailwind.css`（已压缩，被 `layout/theme.liquid` 全局加载）
- 扫描范围：Tailwind v4 自动扫描项目内所有文件中的 class；`.liquid` 里写的工具类都会被编译
- `.shopifyignore` 已排除 `tailwind/`、`node_modules/`、`tools/` 等构建文件——**Shopify 主题不允许 assets 下有子目录**，构建源绝不能放进 `assets/`
- 只引入了 Tailwind 的 theme + utilities 层（无 preflight reset），不会破坏 Dawn 原有样式；Dawn 的 base.css 是无 layer 的普通 CSS，所以组件覆盖写在输入文件的无 layer 区块，按源顺序压过 Dawn

---

## 一、功能清单

| 功能 | 实现方式 | 状态 |
| --- | --- | --- |
| 车型选车器（年/厂牌/车型） | 头部按钮 + 首页 Hero + 弹窗，数据来自 `assets/fitment-data.json`，记忆在浏览器（My Garage） | ✅ |
| 按车型筛选商品 | 商品 metafield（`custom.fitment_*`）+ Shopify 原生 storefront 过滤，2W SKU 走 Shopify 服务端索引，前端不卡 | ✅ |
| 产品页"是否适配我的车" | 对比选中车辆与商品 metafield，绿色适配 / 红色不适配 / 灰色未提供数据；附"适配车型"折叠列表 | ✅ |
| 关键字搜索 | Dawn 原生搜索（标题/正文/SKU 均可命中），搜索结果页同样显示车型上下文 | ✅ |
| 注册会员才能下单 | 主题设置开关：游客看到"登录/注册"按钮替代加购与结账（商品页、购物车页、抽屉购物车全覆盖）；可选对游客隐藏价格 | ✅ |
| 经销商归因（返点依据） | 经销商分享 `?ref=CODE` 链接（90 天记忆）+ 购物车页"经销商码"输入框，写入**订单属性**（属性名可在主题设置改），后台按订单属性筛选/导出即可算返点 | ✅ |
| 首页模块 | 选车 Hero、广告横幅（image-banner）、热销/新品（featured-collection，后台勾选"推荐"）、品牌墙（brand-logos，编辑器加块） | ✅ |
| 产品页行业信息 | SKU（编号）、品牌（vendor）、适配区、规格参数与安装说明折叠块（可绑定 metafield） | ✅ |
| 邮件通知（下单/发货） | Shopify 原生订单与发货通知邮件，后台 Settings → Notifications 自定义 | ✅（原生） |
| 多支付（信用卡/PayPal/银行转账） | Shopify Checkout 原生：激活 PayPal、手动"银行转账"付款方式 | ✅（原生） |
| 聊天窗口 | 免费官方应用 **Shopify Inbox**（App Store 安装即出聊天气泡） | 📌 装 App |

## 二、目录结构（本次新增/修改）

```
tailwind/
  tailwind.input.css         Tailwind v4 样式源（tokens + 组件覆盖，npm run build:css 编译）
assets/
  tailwind.css               构建产物（全局加载，勿手改）
  fitment.js                 选车器 + 适配校验 + 经销商码引擎（无依赖）
  fitment-data.json          车型库数据（现在是澳洲常见车型样例，导入客户数据后替换）
sections/
  vehicle-hero.liquid        新增：首页选车 Hero（墨黑渐变 + 玻璃选车面板 + 信任徽章块）
  brand-logos.liquid         新增：品牌墙（灰度 logo，悬浮变色）
snippets/
  fitment-picker.liquid      弹窗选车器 + JS 配置注入（layout 挂载点；底部抽屉式移动端）
  fitment-button.liquid      "My Garage" 触发按钮（头部等处复用）
  fitment-product.liquid     产品页适配校验 + 适配车型 chips
  fitment-status.liquid      集合页/搜索页"当前车辆"提示条
config/settings_schema.json  新增 "Auto parts（汽配扩展）" 设置面板
config/settings_data.json    设计预设：Inter 字体、1600 页宽、圆角卡片、品牌色 schemes、mega menu
templates/index.json         首页默认区块：选车 Hero（含徽章） → 广告横幅 → 热销
templates/product.json       产品页默认区块：价格 → 适配 → 加购 → 规格/安装折叠块
templates/sections/*.json    公告栏文案、mega menu、页脚墨黑配色
.shopifyignore               排除构建文件（Shopify 不允许 assets 子目录）
sections/  main-product / main-cart-footer / main-search /
           main-collection-product-grid / header / cart-drawer 等已改
tools/
  sample-fitment-products.csv  商品 + 适配数据 CSV 模板（含 4 条示例）
```

## 三、连接店铺本地开发

```bash
cd F:/code/autoparts
shopify theme dev --store auto-parts-pxpjvqd4
```

首次运行会弹出浏览器登录 Shopify 账号（建店的 Partner 账号），登录一次即可。
`theme dev` 是热更新预览（临时主题），确认无误后正式推送：

```bash
shopify theme push --store auto-parts-pxpjvqd4 --theme "Auto Parts"   # 或 --unpublished 新建主题
```

质检：`shopify theme check`（当前 0 错误，10 条均为 Dawn 上游自带警告）。

## 四、店铺后台一次性配置（交付时按顺序做）

1. **创建 metafield 定义**（Settings → Custom data → Products → Add definition，4 条）：

   | Name | Namespace and key | Type |
   | --- | --- | --- |
   | Fitment make | `custom.fitment_make` | Single line text → **List of values** |
   | Fitment model | `custom.fitment_model` | Single line text → List of values |
   | Fitment year | `custom.fitment_year` | Single line text → List of values（填 4 位年份） |
   | Fitment detail | `custom.fitment_json` | **JSON**（`[{"make":"Toyota","model":"Hilux","year_from":2005,"year_to":2015}]`） |

   前三条勾选 **Storefronts** 可访问；产品页适配校验、适配列表都靠它们。

2. **配置筛选器**：App Store 安装免费官方应用 **Search & Discovery** → Filters → Add filter，把 `fitment_make` / `fitment_model` / `fitment_year` 三个 metafield 加为商品筛选。这样 `/collections/all?filter.p.m.custom.fitment_make=Toyota&...` 即生效，选车器"Find parts"就是跳这个地址。
3. **改导航**：Online Store → Navigation → 主菜单建好分类（Brake system / Engine / Suspension…，对应需求"分类管理"），Header 菜单类型可设为 **mega menu**。
4. **客户账户**：Settings → Customer accounts 保持默认（新版账户）即可；主题的"注册才能下单"与账户版本无关。
5. **支付**：Settings → Payments 激活 PayPal、信用卡（Stripe/Shopify Payments 按澳洲主体申请）；Manual payment method 添加 **Bank deposit（银行转账）**。
6. **邮件通知**：Settings → Notifications 逐条按需改模板（下单确认 / 发货 Out for delivery）。
7. **聊天**：App Store 装 **Shopify Inbox**。
8. **库存/采购预警**（客户后续决定）：Shopify 原生库存是"下单即扣"；如需"发货才扣 + 采购预警"，可装官方免费应用 **Stocky**（采购单/预警），或按报价另做外部库管系统对接 Admin API。

## 五、车型适配数据导入（2W SKU）

- **批量（一次性，我们做）**：客户把适配数据（Excel/CSV：SKU、品牌、车型、年款起止）发来后，转成 `tools/sample-fitment-products.csv` 的列格式，用 Shopify 后台 Products → Import 导入；metafield 三列用 `;` 分隔多个值，JSON 列整体一个单元格。同时由该数据生成新的 `assets/fitment-data.json`（选车器的年/厂牌/车型树）随主题更新。
- **后续单条（客户自己）**：后台编辑商品时，在下方的 Fitment make/model/year 字段直接添加（对应沟通记录"出了新款车加进去"）；新车型在 `fitment-data.json` 里加一行并 `shopify theme push`，或先用 Shopify 的批量编辑器补。
- **适配校验逻辑**：产品页用 metafield 三列表精确比对（厂牌+车型+年份都在列表内才算适配）；集合页筛选交给 Shopify 索引，2W SKU 无压力。

## 六、经销商返点（订单归类）使用说明

1. 给每个经销商分配一个码（如 `DEALER-JOHN`），经销商把 `https://你的店/?ref=DEALER-JOHN` 发给自己的客户。
2. 客户点链接进店，码在浏览器保存 90 天；只要该客户下单，订单属性里自动带 **Dealer / Referral code: DEALER-JOHN**（客户也可在购物车页手动填/改）。
3. 后台 Orders 按订单属性筛选，或导出订单 Excel 后透视归类，即为返点依据。
4. 限制说明：属性是"下单时快照"，同一客户 90 天内未再走链接而直接复购时，可在购物车页手动补码；如需更严格的"客户永久绑定经销商"，需要 Shopify Flow/Admin API 做客户 metafield（二期可加）。

## 七、已知限制（对应报价单标红项）

| 标红需求 | 结论与替代 |
| --- | --- |
| 发货成功才扣库存 | Shopify 原生为下单即扣；"发货才扣"需 Stocky 或外部库管，主题层无法改变 |
| 采购预警/采购单 | 原生没有；Stocky（免费）可做采购单与低库存提醒 |
| 后台批量导入适配性（长期） | 原生后台不支持任意批量改 metafield；一次性导入我们做，日常单条添加客户可自行操作，另有 CSV 导入兜底 |
| 库管系统读 Shopify/eBay/亚马逊订单 | 独立项目，走 Admin/Order API 定制（已另报价） |

**平台限制（重要，实测确认）**：Shopify 店面筛选**同时组合 3 个及以上 metafield 筛选会返回 0 结果**（任意两个组合都精确正确；Dawn 原生 UI 下第三个筛选还会被静默忽略）。因此主题选车器跳转只携带 `fitment_make + fitment_model` 两个筛选，**年份精度由产品页的绿/红适配校验把关**（`fitment_year` 仍作为独立筛选项保留，单独或双条件使用正常）。此为平台行为，客户若反馈"选车后列表里出现年份不符的配件"，属于刻意设计——产品页会明确标注适配与否。

## 八、主题编辑器常用入口

- 首页选车 Hero：定制 → 首页 → **Vehicle hero**（可设背景图、限定集合）
- 品牌墙：定制 → 首页 → **Brand logos** → 添加 Brand 块（传 logo 图 + 链接到品牌集合）
- 产品页适配块：定制 → 默认商品 → **Vehicle fitment**（标题文案、是否显示适配车型列表）
- 游客门控/经销商设置：定制 → 主题设置 → **Auto parts（汽配扩展）**

## 九、上线前自测清单

- [ ] `shopify theme dev` 打开首页 → 选车 → Find parts 跳到 /collections/all 且带筛选参数、筛选器生效
- [ ] 产品页：选中适配车辆显示绿色 "Fits your …"；换不适配车辆显示红色 + "Shop parts that fit"
- [ ] 未登录：商品页无加购按钮（显示登录/注册），购物车页结账按钮为"Log in to check out"
- [ ] 注册新客户登录后：加购 → 结账正常
- [ ] `?ref=TESTCODE` 进店下单 → 后台订单详情可见属性 Dealer / Referral code = TESTCODE
- [ ] 关键字搜索 SKU 能命中；搜索页/集合页出现 "Shopping for: …" 提示条
