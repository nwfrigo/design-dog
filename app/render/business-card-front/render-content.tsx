'use client'

import { BusinessCardFront } from '@/components/templates/BusinessCard'

interface BusinessCardFrontRenderProps {
  name: string
  title: string
  email: string
  phone: string
}

export function BusinessCardFrontRender({
  name,
  title,
  email,
  phone,
}: BusinessCardFrontRenderProps) {
  return (
    <BusinessCardFront
      name={name}
      title={title}
      email={email}
      phone={phone}
    />
  )
}
