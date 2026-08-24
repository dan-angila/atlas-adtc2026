#!/usr/bin/env bash
# Download the GGUF weights BRIX Atlas runs on, into `model/`.
#
# Contract (ADTC 2026 submission template):
#   - idempotent: safe to re-run, skips files already present
#   - no credentials: every URL is a public Hugging Face resolve endpoint
#   - the generation model lands exactly at `_runtime.model_path` in metadata.json
#
# Two models are fetched because Atlas is a RAG system, not a bare chat
# wrapper: generation and retrieval-embedding are separate GGUF files and
# the app cannot answer offline without both. The ADTC profiler measures
# only the generation model (the one metadata.json points at).

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_DIR="$HERE/model"

# Generation model — profiled by adtc-profiler. Official Qwen release.
GENERATION_FILE="$MODEL_DIR/Qwen3-4B-Q4_K_M.gguf"
GENERATION_URL="https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf"
GENERATION_SIZE=2497280256

# Embedding model — required for Atlas's hybrid retrieval. Official nomic-ai
# release. Note the upstream filename separates the version with a dot; we
# save it with a dash to match the path Atlas's runtime looks for.
EMBEDDING_FILE="$MODEL_DIR/nomic-embed-text-v1.5-Q8_0.gguf"
EMBEDDING_URL="https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q8_0.gguf"
EMBEDDING_SIZE=146146432

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -L --fail --progress-bar -o "$1.partial" "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget --show-progress -O "$1.partial" "$2"; }
else
  echo "error: neither curl nor wget is available" >&2
  exit 1
fi

file_size() { stat -c %s "$1" 2>/dev/null || stat -f %z "$1"; }

# A truncated download is worse than no download: it fails later, inside the
# profiler, with a confusing GGUF parse error. Verify the byte count and
# refuse to keep a short file.
download() {
  local dest="$1" url="$2" expected="$3" label="$4"

  if [[ -f "$dest" ]]; then
    local actual
    actual="$(file_size "$dest")"
    if [[ "$actual" == "$expected" ]]; then
      echo "✓ $label already present ($dest) — skipping"
      return 0
    fi
    echo "! $label present but is $actual bytes, expected $expected — re-downloading"
    rm -f "$dest"
  fi

  echo "→ downloading $label ($(( expected / 1024 / 1024 )) MB)"
  echo "  $url"
  fetch "$dest" "$url"

  local got
  got="$(file_size "$dest.partial")"
  if [[ "$got" != "$expected" ]]; then
    rm -f "$dest.partial"
    echo "error: $label downloaded $got bytes, expected $expected — aborting" >&2
    exit 1
  fi

  mv "$dest.partial" "$dest"
  echo "✓ $label -> $dest"
}

mkdir -p "$MODEL_DIR"
download "$GENERATION_FILE" "$GENERATION_URL" "$GENERATION_SIZE" "Qwen3-4B Q4_K_M (generation)"
download "$EMBEDDING_FILE"  "$EMBEDDING_URL"  "$EMBEDDING_SIZE"  "nomic-embed-text-v1.5 Q8_0 (embedding)"

echo
echo "All weights present in $MODEL_DIR"
