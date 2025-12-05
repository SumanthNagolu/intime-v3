'use client'

import * as React from 'react'
import { Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Button } from './button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  presets?: string[]
  className?: string
  disabled?: boolean
  error?: string
  showInput?: boolean
}

const defaultPresets = [
  // Neutrals
  '#000000', '#171717', '#404040', '#737373', '#A3A3A3', '#E5E5E5', '#FFFFFF',
  // Brand colors
  '#B76E79', '#D4A574', '#C5A572', // Gold/Rose gold tones
  '#0D4C3B', '#1A5F4A', '#2D7A5F', // Greens
  '#1E40AF', '#3B82F6', '#60A5FA', // Blues
  '#7C3AED', '#8B5CF6', '#A78BFA', // Purples
  '#DC2626', '#EF4444', '#F87171', // Reds
  '#EA580C', '#F97316', '#FB923C', // Oranges
]

export function ColorPicker({
  value = '#000000',
  onChange,
  presets = defaultPresets,
  className,
  disabled = false,
  error,
  showInput = true,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isOpen, setIsOpen] = React.useState(false)
  const colorInputRef = React.useRef<HTMLInputElement>(null)

  // Sync inputValue with value prop
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
  }

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Only update parent if valid hex
    if (isValidHex(newValue)) {
      onChange?.(newValue)
    }
  }, [onChange])

  const handleInputBlur = React.useCallback(() => {
    // Reset to last valid value if invalid
    if (!isValidHex(inputValue)) {
      setInputValue(value)
    }
  }, [inputValue, value])

  const handlePresetClick = React.useCallback((color: string) => {
    setInputValue(color)
    onChange?.(color)
    setIsOpen(false)
  }, [onChange])

  const handleNativeColorChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  const openNativePicker = React.useCallback(() => {
    colorInputRef.current?.click()
  }, [])

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        {/* Color preview with popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                'h-11 w-11 rounded-sm border-2 border-charcoal-200 flex-shrink-0 transition-all duration-300',
                'hover:border-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              style={{ backgroundColor: isValidHex(value) ? value : '#000000' }}
              disabled={disabled}
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal-700">Select Color</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={openNativePicker}
                >
                  <Pipette className="h-4 w-4 mr-1" />
                  Pick
                </Button>
              </div>

              {/* Preset colors grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {presets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-sm border transition-all duration-200',
                      value === color
                        ? 'border-gold-500 ring-2 ring-gold-500/30'
                        : 'border-charcoal-200 hover:border-charcoal-400',
                      color === '#FFFFFF' && 'border-charcoal-300'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetClick(color)}
                    title={color}
                  />
                ))}
              </div>

              {/* Current color preview */}
              <div className="flex items-center gap-2 p-2 bg-charcoal-50 rounded">
                <div
                  className="h-8 w-8 rounded border border-charcoal-200"
                  style={{ backgroundColor: isValidHex(value) ? value : '#000000' }}
                />
                <span className="text-sm font-mono text-charcoal-700">{value}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Hex input */}
        {showInput && (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="#000000"
            className={cn(
              'font-mono uppercase',
              !isValidHex(inputValue) && inputValue !== '' && 'border-error-300'
            )}
            disabled={disabled}
          />
        )}

        {/* Hidden native color input */}
        <input
          ref={colorInputRef}
          type="color"
          value={isValidHex(value) ? value : '#000000'}
          onChange={handleNativeColorChange}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-error-600">{error}</p>
      )}

      {!isValidHex(inputValue) && inputValue !== '' && !error && (
        <p className="mt-2 text-sm text-error-600">Please enter a valid hex color (e.g., #000000)</p>
      )}
    </div>
  )
}
