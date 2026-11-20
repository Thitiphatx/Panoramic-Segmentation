import * as React from "react"
import type { IButtonProps } from './interface'
import { buttonVariants } from './button-variants'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

const Button: React.FC<IButtonProps> = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
