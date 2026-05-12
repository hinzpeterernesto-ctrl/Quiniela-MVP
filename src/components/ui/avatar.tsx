'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn, getInitials } from '@/lib/utils'

// ─── AVATAR ───────────────────────────────────────────────────────────────────

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { size?: 'xs' | 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClass = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }[size]
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn('relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-border', sizeClass, className)}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-secondary font-medium text-foreground', className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Smart avatar with auto-fallback
interface SmartAvatarProps {
  src?: string | null
  displayName: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

function SmartAvatar({ src, displayName, size = 'md', className }: SmartAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={displayName} />}
      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  )
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton rounded-md', className)} {...props} />
}

// ─── TOOLTIP ──────────────────────────────────────────────────────────────────

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Avatar, AvatarImage, AvatarFallback, SmartAvatar, Skeleton, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
