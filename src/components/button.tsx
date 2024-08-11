import { ComponentProps, ReactNode } from 'react'
import { tv, VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'rounded-lg px-5 font-medium flex items-center justify-center gap-2',

  variants: {
    variant: {
      primary: 'bg-lime-300 text-lime-950 hover:bg-lime-400',
      secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
      destructive: 'bg-red-600 text-zinc-100 hover:bg-red-700',
      disabled: 'hidden',
    },

    size: {
      default: 'py-2',
      full: 'w-full h-11',
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
})

interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
}

export function Button({ children, variant, size, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
