#!/bin/bash

# Bash 脚本：构建前端并复制到 C# 项目

echo "开始构建前端应用..."

# 构建前端
npm run build

if [ $? -ne 0 ]; then
    echo "前端构建失败！"
    exit 1
fi

echo "前端构建成功！"

# 检查 wwwroot 目录
WWWROOT_PATH="RDTrackingSystem/wwwroot"
if [ ! -d "$WWWROOT_PATH" ]; then
    mkdir -p "$WWWROOT_PATH"
    echo "创建 wwwroot 目录"
fi

# 清空 wwwroot 目录
echo "清空 wwwroot 目录..."
rm -rf "$WWWROOT_PATH"/*

# 复制 dist 目录内容到 wwwroot
echo "复制文件到 wwwroot..."
cp -r dist/* "$WWWROOT_PATH/"

echo "完成！文件已复制到 $WWWROOT_PATH"
