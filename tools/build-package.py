#!/usr/bin/env python3
"""打包 Theme Store 提交包：仅含主题标准结构 + LICENSE/README/release-notes。
用法: python tools/build-package.py  → dist/auto-parts-theme-1.0.0.zip
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = '1.0.0'
OUT_DIR = os.path.join(ROOT, 'dist')

INCLUDE_DIRS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
INCLUDE_FILES = ['LICENSE.md', 'README.md']  # release-notes.md 不打进 zip（Theme Store 要求首发未发布主题不含它）
EXCLUDE_EXT = {'.md'}  # assets 下的 md 不打进包里？保留，排除的是构建产物说明

os.makedirs(OUT_DIR, exist_ok=True)
out_path = os.path.join(OUT_DIR, f'auto-parts-theme-{VERSION}.zip')
if os.path.exists(out_path):
    os.remove(out_path)

count = 0
with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for d in INCLUDE_DIRS:
        base = os.path.join(ROOT, d)
        for dirpath, _, files in os.walk(base):
            for f in files:
                full = os.path.join(dirpath, f)
                rel = os.path.relpath(full, ROOT)
                # 排除构建/临时文件
                if f.endswith(('.tmp.', '.log')) or 'fitment.js.tmp' in f:
                    continue
                z.write(full, rel.replace(os.sep, '/'))
                count += 1
    for f in INCLUDE_FILES:
        full = os.path.join(ROOT, f)
        if os.path.exists(full):
            z.write(full, f)
            count += 1

size_kb = os.path.getsize(out_path) // 1024
print(f'打包完成: {out_path} ({count} 个文件, {size_kb} KB)')
