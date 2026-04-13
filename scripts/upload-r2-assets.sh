#!/usr/bin/env bash
# Upload static assets to Cloudflare R2 bucket: bytorchlight-prod-images
# Run from the project root: bash scripts/upload-r2-assets.sh

set -e

BUCKET="bytorchlight-prod-images"

echo "Uploading adventure maps to R2 ($BUCKET)..."

for file in public/adventures/shots-in-the-dark-1/*.webp; do
  key="adventures/shots-in-the-dark-1/$(basename "$file")"
  echo "  → $key"
  wrangler r2 object put "$BUCKET/$key" \
    --file "$file" \
    --content-type "image/webp" \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
done

echo ""
echo "Done. Images are live at https://images.bytorchlight.com/adventures/shots-in-the-dark-1/"
