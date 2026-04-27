# Docker開発環境設計

## 概要

CLAUDE.mdのルールに従い、開発環境はDockerで構築する。
Tauri開発にはシステムライブラリ（WebKit等）が必要なため、Docker環境の設計が重要。

## 開発環境の方針

### macOSでのTauri開発における注意点

TauriはネイティブWebView（macOSではWebKit/WKWebView）を使用するため、**GUIアプリのビルド・実行はホストマシン（macOS）上で行う必要がある**。

そのため、Docker環境は以下の用途に限定する：

| 用途 | Docker | ホスト(macOS) |
|------|--------|--------------|
| Node.js / pnpm 環境 | ✅ | — |
| Rust / Cargo 環境 | ✅ | — |
| フロントエンドのビルド | ✅ | — |
| Rustバックエンドのコンパイル | ✅ | — |
| Tauriアプリの起動・テスト | — | ✅ |
| lint / format / テスト | ✅ | — |

### 方式：ハイブリッド開発

1. **Docker** → フロントエンドビルド + Rustコンパイル + lint/test
2. **ホスト(macOS)** → `cargo tauri dev` でアプリ起動

## docker-compose.yml 設計

```yaml
services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - cargo_cache:/usr/local/cargo/registry
      - cargo_target:/app/src-tauri/target
    working_dir: /app
    ports:
      - "1420:1420"   # Vite dev server
      - "1421:1421"   # Vite HMR
    environment:
      - NODE_ENV=development
    command: pnpm dev  # フロントエンドdev server起動

volumes:
  node_modules:
  cargo_cache:
  cargo_target:
```

## Dockerfile.dev 設計

```dockerfile
FROM rust:1.82-bookworm

# Node.js インストール
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# pnpm インストール
RUN corepack enable && corepack prepare pnpm@latest --activate

# Tauri v2 依存ライブラリ（Linux用ビルドに必要）
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
```

## 開発フローのまとめ

```
1. docker compose up -d     → フロントエンドdev server起動
2. ホストで cargo tauri dev  → Tauriアプリ起動（フロントはDockerのdev serverに接続）
```

※ フロントエンドの変更はHMRで即反映、Rust側の変更はcargo tauriが自動リコンパイル
