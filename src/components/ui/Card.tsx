import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  as?: 'article' | 'section' | 'div'
}

export function Card({
  children,
  className = '',
  as: Element = 'div',
  ...props
}: CardProps) {
  return (
    <Element
      className={`rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-28px_rgba(30,41,59,0.45)] ${className}`}
      {...props}
    >
      {children}
    </Element>
  )
}
