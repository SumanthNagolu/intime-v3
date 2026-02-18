'use client'

import React from 'react'
import type { DataTableBlock } from '@/lib/academy/types'

interface DataTableCardProps {
  block: DataTableBlock
}

export function DataTableCard({ block }: DataTableCardProps) {
  return (
    <div id={`block-${block.id}`} style={{ marginBottom: 20 }}>
      {block.context && (
        <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.75, marginBottom: 12 }}>
          {block.context}
        </p>
      )}

      <div className="m-table-wrapper">
        <table className="m-table">
          <thead>
            <tr>
              {block.headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {block.caption && (
          <div className="m-table-caption">{block.caption}</div>
        )}
      </div>
    </div>
  )
}
