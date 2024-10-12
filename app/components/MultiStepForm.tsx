'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Input, Label, TextArea, RadioGroup, Checkbox } from "@whop/frosted-ui"
import ReactGA from 'react-ga'
import dynamic from 'next/dynamic'
import { useIntl } from 'react-intl'

// Initialize GA
ReactGA.initialize('YOUR-GA-TRACKING-ID');

// Define the schema for each step
const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

const professionalInfoSchema = z.object({
  role: z.enum(["Developer", "Designer", "Manager", "Other"]),
  experience: z.number().min(0, "Experience must be a positive number"),
})

const preferencesSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  newsletter: z.boolean(),
})

// Combine all schemas
const formSchema = z.object({
  personalInfo: personalInfoSchema,
  professionalInfo: professionalInfoSchema,
  preferences: preferencesSchema,
})

type FormData = z.infer<typeof formSchema>

const steps = ['Personal Info', 'Professional Info', 'Preferences']

interface MultiStepFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

export default function MultiStepForm({ onSubmit, initialData = {} }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<FormData>>(initialData)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  })

  useEffect(() => {
    // Load partial form data from local storage
    const savedData = localStorage.getItem('onboardingFormData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setFormData(parsedData)
      Object.entries(parsedData).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }
  }, [setValue])

  useEffect(() => {
    // Save partial form data to local storage
    localStorage.setItem('onboardingFormData', JSON.stringify(formData))
  }, [formData])

  const handleStepSubmit: SubmitHandler<FormData> = (data) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setFormData({ ...formData, ...data })
      // Track step completion
      trackStepCompletion(currentStep)
    } else {
      setFormData({ ...formData, ...data })
      onSubmit(data)
      // Track form completion
      trackFormCompletion()
    }
  }

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 0))
    // Track step navigation
    trackStepNavigation(currentStep, 'previous')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep register={register} errors={errors.personalInfo} />
      case 1:
        return <ProfessionalInfoStep register={register} errors={errors.professionalInfo} />
      case 2:
        return <PreferencesStep register={register} errors={errors.preferences} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <form onSubmit={handleSubmit(handleStepSubmit)} aria-label="Onboarding form">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4" id={`step-${currentStep + 1}-heading`}>{steps[currentStep]}</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-between p-6 bg-secondary/5">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrev} aria-label="Go to previous step">
                Previous
              </Button>
            )}
            <Button type="submit" className="ml-auto" aria-label={currentStep === steps.length - 1 ? 'Submit form' : 'Go to next step'}>
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const PersonalInfoStep = dynamic(() => import('./PersonalInfoStep'));
const ProfessionalInfoStep = dynamic(() => import('./ProfessionalInfoStep'));
const PreferencesStep = dynamic(() => import('./PreferencesStep'));

// Analytics functions
function trackStepCompletion(step: number) {
  ReactGA.event({
    category: 'Onboarding',
    action: 'Step Completed',
    label: `Step ${step + 1}`,
  });
}

function trackFormCompletion() {
  ReactGA.event({
    category: 'Onboarding',
    action: 'Form Completed',
  });
}

function trackStepNavigation(fromStep: number, direction: 'previous' | 'next') {
  ReactGA.event({
    category: 'Onboarding',
    action: 'Step Navigation',
    label: `${direction} from step ${fromStep + 1}`,
  });
}
