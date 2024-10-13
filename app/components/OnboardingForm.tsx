'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Label } from "@whop/frosted-ui"

// This schema should be customizable per app
const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  // Add more fields as needed
})

type OnboardingData = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => void
  initialData?: Partial<OnboardingData>
}

export default function OnboardingForm({ onSubmit, initialData = {} }: OnboardingFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: initialData,
  })

  const handleFormSubmit: SubmitHandler<OnboardingData> = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>

      {/* Add more fields as needed */}

      <Button type="submit">Submit</Button>
    </form>
  )
}
