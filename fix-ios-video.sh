#!/bin/bash

# iOS-Compatible Video Encoding Script
# This script re-encodes videos with settings that work reliably on iOS Safari

echo "🎬 iOS Video Encoding Fix Script"
echo "=================================="
echo ""
echo "This script will re-encode venturesmain.mp4 with iOS-compatible settings."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed!"
    echo ""
    echo "Install it with:"
    echo "  brew install ffmpeg"
    echo ""
    exit 1
fi

INPUT="venturesmain.mp4"
OUTPUT="venturesmain-ios.mp4"
BACKUP="venturesmain-original-backup.mp4"

# Check if input exists
if [ ! -f "$INPUT" ]; then
    echo "❌ Error: $INPUT not found!"
    exit 1
fi

echo "📋 Current video info:"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,bit_rate -of default=noprint_wrappers=1 "$INPUT"
echo ""

# Create backup
echo "💾 Creating backup: $BACKUP"
cp "$INPUT" "$BACKUP"

echo "🔄 Re-encoding with iOS-compatible settings..."
echo "   This may take a minute..."
echo ""

# iOS-compatible encoding settings:
# - H.264 baseline profile (most compatible)
# - AAC audio (even if silent, iOS likes having an audio track)
# - Movflags faststart (puts metadata at start for streaming)
# - Proper pixel format (yuv420p)
# - Reasonable bitrate
ffmpeg -i "$INPUT" \
    -c:v libx264 \
    -profile:v baseline \
    -level 3.0 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -preset medium \
    -crf 23 \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:a aac \
    -b:a 128k \
    -ac 2 \
    -ar 44100 \
    -y \
    "$OUTPUT"

# Check if encoding was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Encoding successful!"
    echo ""
    echo "📊 New file info:"
    ls -lh "$OUTPUT"
    echo ""
    
    read -p "Replace original venturesmain.mp4 with the iOS-compatible version? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv "$OUTPUT" "$INPUT"
        echo "✅ Replaced! Original backed up as: $BACKUP"
        echo ""
        echo "🚀 Now test on your iPhone:"
        echo "   1. Commit and push changes"
        echo "   2. Deploy to production"
        echo "   3. Test on actual iPhone"
        echo ""
        echo "📱 Check browser console for debug logs"
    else
        echo "⏸️  Keeping both files. When ready, manually replace:"
        echo "   mv $OUTPUT $INPUT"
    fi
else
    echo "❌ Encoding failed!"
    exit 1
fi

