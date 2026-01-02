'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type CheckboxProps = {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>

export function Checkbox({ checked = false, onCheckedChange, className, ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            className={cn(
                'h-4 w-4 rounded border border-input text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer',
                className
            )}
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...props}
        />
    )
}
