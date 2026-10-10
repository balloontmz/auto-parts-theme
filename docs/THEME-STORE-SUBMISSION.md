# Shopify Theme Store 提交清单（Auto Parts v1.0.0）

## 提交前自查（已完成 ✅ / 待人工 ⬜）

- [x] `shopify theme check` 0 错误（5 条警告均为上游 Dawn 固有，非本主题代码）
- [x] theme_info 已品牌化：名称 Auto Parts、版本 1.0.0、作者 TMZL Studio
- [x] 默认文案中性化（无特定商家/库存/地区宣称）
- [x] settings_data 预设改名 Default，无 Dawn 残留
- [x] 无外部 CDN 脚本（Tailwind 为本地编译产物 assets/tailwind.css）
- [x] 默认语言文件 en.default.json 完整（新增 fitment 命名空间；其他语言回退英文为平台允许行为）
- [x] LICENSE.md 保留 Dawn MIT 声明并追加衍生部分版权
- [x] 演示店铺数据完整（18 个汽配商品、6 分类、适配数据、4 个内容页）
- [ ] **theme_documentation_url / theme_support_url 替换为真实地址**（当前是占位 GitHub 链接，提交前必须可访问）
- [ ] Partner 账号加入 Theme Store 计划（Theme Store → Join），签署相关条款
- [ ] 演示店铺关闭前台密码（或提交时填写密码）
- [ ] 演示店铺的 Lighthouse 自测：Performance / Accessibility / Best Practices / SEO 四项达标
  （Dawn 基线达标；本次新增均为延迟加载 JS 与本地 CSS，无渲染阻塞）
- [ ] 准备商店素材：主题截图（首页/分类/商品页/选车弹窗）、演示视频（Theme Store 要求）

## 打包

```bash
python tools/build-package.py
# 产出 dist/auto-parts-theme-1.0.0.zip（仅含主题标准目录 + LICENSE/README/release-notes）
```

## 提交流程

1. 登录 Shopify Partner 后台 → Apps and themes → **Theme Store** 标签 → Submit a theme
2. 上传 `dist/auto-parts-theme-1.0.0.zip`
3. 填写 listing 信息：名称、简介、分类（Automotive & Cars）、定价（一次性）、
   演示店 URL + 密码、支持邮箱、文档 URL
4. 提交后 Shopify 会在测试店安装并按 [Theme Store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)
   审查（代码、性能、无障碍、翻译完整性），周期约 1-4 周；打回则按意见修改重提

## 收入分成

主题商店收入 Shopify 抽成 15%，开发者得 85%（官方 revenue share 政策）。
