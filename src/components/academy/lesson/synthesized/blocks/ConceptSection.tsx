'use client'

import React from 'react'
import type { ConceptBlock } from '@/lib/academy/types'
import { FigureViewer } from '../FigureViewer'
import { CalloutBox } from '../CalloutBox'

interface ConceptSectionProps {
  block: ConceptBlock
  chapterSlug: string
  lessonNumber: number
}

/** Render markdown-like text: **bold**, bullet lists, paragraphs */
function RenderNarrative({ text }: { text: string }) {
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <>
      {paragraphs.map((para, i) => {
        // Check if it's a bullet list
        const lines = para.split('\n')
        const isList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || l.trim() === '')

        if (isList) {
          const items = lines
            .map(l => l.trim())
            .filter(l => l.startsWith('- ') || l.startsWith('* '))
            .map(l => l.slice(2))

          return (
            <ul key={i} className="m-narrative-list">
              {items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: boldify(item) }} />
              ))}
            </ul>
          )
        }

        return (
          <p
            key={i}
            className="m-block-text"
            dangerouslySetInnerHTML={{ __html: boldify(para) }}
          />
        )
      })}
    </>
  )
}

/** Convert **text** to <strong>text</strong> */
function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function ConceptSection({ block, chapterSlug, lessonNumber }: ConceptSectionProps) {
  return (
    <div className="m-content-block m-animate" id={`block-${block.id}`}>
      <h2 className="m-block-heading">{block.heading}</h2>

      {/* Rich narrative */}
      <RenderNarrative text={block.narrative} />

      {/* Key points */}
      {block.keyPoints.length > 0 && (
        <div className="m-key-points">
          {block.keyPoints.map((point, i) => (
            <div key={i} className="m-key-point">
              <span className="m-key-point-bullet" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}

      {/* Figures */}
      {block.figures.map((fig, i) => (
        <FigureViewer
          key={i}
          figure={fig}
          chapterSlug={chapterSlug}
          lessonNumber={lessonNumber}
        />
      ))}

      {/* Tables */}
      {block.tables?.map((table, i) => (
        <div key={i} className="m-table-wrapper">
          {table.caption && (
            <div className="m-table-caption">{table.caption}</div>
          )}
          <table className="m-table">
            <thead>
              <tr>
                {table.headers.map((h, j) => (
                  <th key={j}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Callouts */}
      {block.callouts?.map((callout, i) => (
        <CalloutBox key={i} callout={callout} />
      ))}

      {/* Code examples */}
      {block.codeExamples?.map((example, i) => (
        <div key={i} className="m-code-block">
          <div className="m-code-header">
            <span className="m-code-lang">{example.language}</span>
            <span className="m-code-title">{example.title}</span>
          </div>
          <pre className="m-code-pre">
            <code>{example.code}</code>
          </pre>
          {example.explanation && (
            <p className="m-code-explanation">{example.explanation}</p>
          )}
        </div>
      ))}
    </div>
  )
}
