'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SectionConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailSectionsProps<T> {
  sections: SectionConfig[]
  currentSection: string
  entity?: T
  entityId: string
}

export function DetailSections<T>({
  sections,
  currentSection,
  entity,
  entityId: _entityId,
}: DetailSectionsProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSectionClick = (sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sectionId === sections[0]?.id) {
      params.delete('section')
    } else {
      params.set('section', sectionId)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="border-b border-charcoal-200 px-6">
      <div className="flex gap-1">
        {sections.map((section) => {
          const isActive = currentSection === section.id
          const Icon = section.icon
          const count = section.getCount?.(entity)

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                isActive
                  ? 'text-charcoal-900 border-gold-500'
                  : 'text-charcoal-500 border-transparent hover:text-charcoal-700 hover:border-charcoal-200'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {section.label}
              {section.showCount && count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                    section.alertOnCount && count > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
