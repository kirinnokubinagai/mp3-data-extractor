# Media Extractor - Chrome Web Store Package Script (Windows PowerShell)
# このスクリプトは、Chrome Web Store用のZIPパッケージを作成します

$ErrorActionPreference = "Stop"

Write-Host "=== Media Extractor Package Script ===" -ForegroundColor Green
Write-Host ""

# manifest.jsonからバージョンを取得
if (-not (Test-Path "manifest.json")) {
    Write-Host "Error: manifest.json not found" -ForegroundColor Red
    Write-Host "このスクリプトはプロジェクトルートで実行してください"
    exit 1
}

$manifestContent = Get-Content "manifest.json" -Raw | ConvertFrom-Json
$version = $manifestContent.version
$packageName = "media-extractor-v$version.zip"

Write-Host "Version: " -NoNewline
Write-Host $version -ForegroundColor Green
Write-Host "Package name: " -NoNewline
Write-Host $packageName -ForegroundColor Green
Write-Host ""

# ビルド前チェック
Write-Host "[1/6] Pre-build checks..." -ForegroundColor Yellow

# Node.jsがインストールされているか確認
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion"
} catch {
    Write-Host "Error: Node.js not found" -ForegroundColor Red
    Write-Host "Node.jsをインストールしてください: https://nodejs.org/"
    exit 1
}

# npm がインストールされているか確認
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: $npmVersion"
} catch {
    Write-Host "Error: npm not found" -ForegroundColor Red
    exit 1
}

# Lint チェック
Write-Host "[2/6] Running linter..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✓ Lint passed" -ForegroundColor Green
} catch {
    Write-Host "Error: Lint failed" -ForegroundColor Red
    Write-Host "npm run lint:fix でエラーを修正してください"
    exit 1
}

# テスト実行
Write-Host "[3/6] Running tests..." -ForegroundColor Yellow
try {
    npm test
    Write-Host "✓ Tests passed" -ForegroundColor Green
} catch {
    Write-Host "Error: Tests failed" -ForegroundColor Red
    Write-Host "テストを修正してください"
    exit 1
}

# セキュリティ監査
Write-Host "[4/6] Running security audit..." -ForegroundColor Yellow
try {
    npm audit --audit-level=high
    Write-Host "✓ No high/critical vulnerabilities" -ForegroundColor Green
} catch {
    Write-Host "Warning: Vulnerabilities found" -ForegroundColor Yellow
    Write-Host "npm audit fix で修正を試みてください"
    # 警告のみで続行
}

# アイコンファイル確認
Write-Host "[5/6] Checking icon files..." -ForegroundColor Yellow
$icons = @(
    "icons/icon-16.png",
    "icons/icon-32.png",
    "icons/icon-48.png",
    "icons/icon-128.png"
)

$allIconsExist = $true
foreach ($icon in $icons) {
    if (-not (Test-Path $icon)) {
        Write-Host "Error: $icon not found" -ForegroundColor Red
        $allIconsExist = $false
    }
}

if (-not $allIconsExist) {
    Write-Host "アイコンが不足しています" -ForegroundColor Red
    Write-Host "icons/generate-icons.sh を実行してアイコンを生成してください"
    exit 1
}

Write-Host "✓ All icon files exist" -ForegroundColor Green

# ZIPファイル作成
Write-Host "[6/6] Creating ZIP package..." -ForegroundColor Yellow

# 既存のZIPファイルを削除
if (Test-Path $packageName) {
    Write-Host "Removing existing package: $packageName"
    Remove-Item $packageName
}

# パッケージに含めるファイルとディレクトリ
$filesToInclude = @(
    "manifest.json",
    "popup.html",
    "popup.js",
    "popup.css",
    "background.js",
    "content.js",
    "lib",
    "icons/icon-16.png",
    "icons/icon-32.png",
    "icons/icon-48.png",
    "icons/icon-128.png"
)

# 一時ディレクトリ作成
$tempDir = "temp-package"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# ファイルをコピー
foreach ($file in $filesToInclude) {
    if (Test-Path $file) {
        $destPath = Join-Path $tempDir $file
        $destDir = Split-Path $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        if ((Get-Item $file) -is [System.IO.DirectoryInfo]) {
            # ディレクトリの場合
            Copy-Item -Path $file -Destination $destPath -Recurse -Force
        } else {
            # ファイルの場合
            Copy-Item -Path $file -Destination $destPath -Force
        }
    }
}

# ZIPファイル作成
Compress-Archive -Path "$tempDir\*" -DestinationPath $packageName -Force

# 一時ディレクトリ削除
Remove-Item -Recurse -Force $tempDir

if (Test-Path $packageName) {
    Write-Host "✓ Package created successfully" -ForegroundColor Green
} else {
    Write-Host "Error: Failed to create package" -ForegroundColor Red
    exit 1
}

# パッケージサイズを確認
$fileSize = (Get-Item $packageName).Length
$fileSizeMB = [Math]::Round($fileSize / 1MB, 2)

Write-Host ""
Write-Host "=== Package Info ===" -ForegroundColor Green
Write-Host "File: " -NoNewline
Write-Host $packageName -ForegroundColor Green
Write-Host "Size: " -NoNewline
Write-Host "$fileSizeMB MB" -ForegroundColor Green

# 5MBを超えている場合は警告
if ($fileSize -gt 5MB) {
    Write-Host "Warning: Package size exceeds 5MB (recommended limit)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. ローカルでテスト:"
Write-Host "   - mkdir test-extension"
Write-Host "   - Expand-Archive -Path $packageName -DestinationPath test-extension"
Write-Host "   - chrome://extensions/ で読み込み"
Write-Host ""
Write-Host "2. Chrome Web Storeにアップロード:"
Write-Host "   - https://chrome.google.com/webstore/devconsole/"
Write-Host "   - $packageName をアップロード"
Write-Host ""
Write-Host "パッケージ作成完了！" -ForegroundColor Green
