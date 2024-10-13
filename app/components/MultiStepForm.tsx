'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'

// Initialize GA (comment out if not using)
// ReactGA.initialize('YOUR-GA-TRACKING-ID');

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
    const savedData = localStorage.getItem('onboardingFormData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as Partial<FormData>
        setFormData(parsedData)
        Object.entries(parsedData).forEach(([key, value]) => {
          setValue(key as keyof FormData, value as any)
        })
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="h-1 bg-blue-500">
          <motion.div
            className="h-full bg-blue-700"
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
          <div className="flex justify-between p-6 bg-gray-50">
            {currentStep > 0 && (
              <button type="button" onClick={handlePrev} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
                Previous
              </button>
            )}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded ml-auto">
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PersonalInfoStep = dynamic(() => import('./PersonalInfoStep'));
const ProfessionalInfoStep = dynamic(() => import('./ProfessionalInfoStep'));
const PreferencesStep = dynamic(() => import('./PreferencesStep'));

// Analytics functions
function trackStepCompletion(step: number) {
  // Implement step completion tracking
  console.log(`Step ${step + 1} completed`)
}

function trackFormCompletion() {
  // Implement form completion tracking
  console.log('Form completed')
}

function trackStepNavigation(fromStep: number, direction: 'previous' | 'next') {
  // Implement step navigation tracking
  console.log(`Navigated ${direction} from step ${fromStep + 1}`)
}

function isValidFormData(data: unknown): data is Partial<FormData> {
  if (typeof data !== 'object' || data === null) return false
  const validKeys = ['personalInfo', 'professionalInfo', 'preferences']
  return Object.keys(data).every(key => validKeys.includes(key))
}
