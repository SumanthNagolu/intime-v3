#!/bin/bash

OUTPUT="INTIME-V3-COMPLETE-VISION-AND-TECH-STACK.md"

echo "# InTime v3 - Complete Vision, Architecture & Tech Stack" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "**Document Type:** Comprehensive Vision & Technology Documentation" >> "$OUTPUT"
echo "**Purpose:** Complete context for Google AI Studio project continuation" >> "$OUTPUT"
echo "**Created:** $(date +'%Y-%m-%d')" >> "$OUTPUT"
echo "**Version:** 3.0" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Table of Contents" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "1. [Project Overview](#project-overview)" >> "$OUTPUT"
echo "2. [Vision Documents (01-16)](#vision-documents)" >> "$OUTPUT"
echo "3. [Technology Architecture](#technology-architecture)" >> "$OUTPUT"
echo "4. [Event-Driven Integration](#event-driven-integration)" >> "$OUTPUT"
echo "5. [Design System](#design-system)" >> "$OUTPUT"
echo "6. [Tech Stack Summary](#tech-stack-summary)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add project context
echo "# Project Overview" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat CLAUDE.md >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add vision README
echo "# Vision Documents Overview" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat docs/vision/README.md >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add all vision documents (01-16)
for i in {01..16}; do
  FILE="docs/vision/${i}-*.md"
  if ls $FILE 1> /dev/null 2>&1; then
    echo "Adding: $FILE"
    cat $FILE >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "---" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

# Add technology architecture
echo "# Technology Architecture" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat docs/vision/10-TECHNOLOGY-ARCHITECTURE.md >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add event-driven integration
echo "# Event-Driven Integration" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat docs/architecture/EVENT-DRIVEN-INTEGRATION.md >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add design system
echo "# Design System" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat docs/design/INTIME-DESIGN-SYSTEM-V3.md >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "Document compilation complete: $OUTPUT"
