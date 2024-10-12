'use client'

import { useState, useEffect } from 'react';
import { Alert, Spinner } from "@whop/frosted-ui";
import dynamic from 'next/dynamic';
import { WhopAPI } from "@whop-apps/sdk";

const MultiStepForm = dynamic(() => import('@/components/MultiStepForm'), { ssr: false });

export default function ClientSideForm({ user, hasCompletedOnboarding, experienceId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [localFormData, setLocalFormData] = useState<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('onboardingFormData');
    if (savedData) {
      setLocalFormData(JSON.parse(savedData));
    }
  }, []);

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Optimistic UI update
    setSubmitSuccess(true);

    try {
      // Save form data to the database
      await saveFormData(user.id, formData);

      // Update the user's onboarding status
      await updateOnboardingStatus(user.id, true);

      // Clear local storage
      localStorage.removeItem('onboardingFormData');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('An error occurred while submitting the form. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasCompletedOnboarding) {
    return <p>Thank you for completing the onboarding process.</p>;
  }

  if (submitSuccess) {
    return (
      <Alert variant="success">
        Thank you for completing the onboarding process! Your information has been saved.
      </Alert>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      {submitError && (
        <Alert variant="error">
          {submitError}
        </Alert>
      )}
      {isSubmitting ? (
        <div className="flex justify-center items-center">
          <Spinner size="large" />
          <p className="ml-2">Submitting your information...</p>
        </div>
      ) : (
        <MultiStepForm onSubmit={handleFormSubmit} initialData={localFormData} />
      )}
    </div>
  );
}

async function saveFormData(userId: string, formData: any) {
  // Implement logic to save form data to your database
  console.log(`Saving form data for user ${userId}:`, formData);
}

async function updateOnboardingStatus(userId: string, status: boolean) {
  try {
    const response = await WhopAPI.app().POST("/app/users/{id}/metadata", {
      params: { path: { id: userId } },
      body: { metadata: { onboardingCompleted: status } },
    });

    if (response.isErr) {
      throw new Error(response.error.message);
    }

    console.log(`Updated onboarding status for user ${userId} to ${status}`);
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
}
