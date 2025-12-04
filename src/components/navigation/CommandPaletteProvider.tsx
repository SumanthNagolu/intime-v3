"use client"

import * as React from "react"
import { CommandPalette } from "./CommandPalette"

/**
 * Provider component that renders the CommandPalette and handles
 * the global Cmd+K keyboard shortcut. Include this in the root layout.
 */
export function CommandPaletteProvider() {
  const [open, setOpen] = React.useState(false)

  return <CommandPalette open={open} onOpenChange={setOpen} />
}
