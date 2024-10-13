'use client'

import { useState } from 'react';
import { Alert, Spinner } from "@whop/frosted-ui";
import { WhopAPI } from "@whop-apps/sdk";
import OnboardingForm from '../../components/OnboardingForm';

interface ClientSideFormProps {
  user: any; // Replace 'any' with the correct type from WhopAPI
  hasCompletedOnboarding: boolean;
  experienceId: string;
}

export default function ClientSideForm({ user, hasCompletedOnboarding, experienceId }: ClientSideFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use WhopAPI to save onboarding data
      const response = await WhopAPI.app().POST("/app/users/{id}", {
        params: { path: { id: user.id } },
        body: { metadata: { ...data, onboardingCompleted: true } }
      });

      if (response.isErr) {
        throw new Error(response.error.message);
      }

      // Redirect or update UI as needed
      window.location.reload();
    } catch (error) {
      setError('Failed to save onboarding data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (hasCompletedOnboarding) {
    return <div>Welcome back, {user.name}! Your onboarding is complete.</div>;
  }

  return <OnboardingForm onSubmit={handleOnboardingSubmit} initialData={{ name: user.name, email: user.email }} />;
}
