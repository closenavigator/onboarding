'use client'

import { headers } from "next/headers";
import { validateToken, hasAccess, WhopAPI } from "@whop-apps/sdk";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Alert, Spinner } from "@whop/frosted-ui";

const MultiStepForm = dynamic(() => import('@/components/MultiStepForm'), { ssr: false });

export default function UserPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const [user, setUser] = useState<any>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { userId } = await validateToken({ headers });
        const access = await hasAccess({ to: params.experienceId, headers });

        if (!access) {
          throw new Error("You do not have access to view this page");
        }

        const userResponse = await WhopAPI.me({ headers }).GET("/me", {});

        if (userResponse.isErr) {
          throw new Error("Could not fetch user information");
        }

        setUser(userResponse.data);
        const onboardingStatus = await checkOnboardingStatus(userId);
        setHasCompletedOnboarding(onboardingStatus);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [params.experienceId]);

  if (isLoading) {
    return <Spinner size="large" />;
  }

  if (!user) {
    return <p>Error loading user data</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      {hasCompletedOnboarding ? (
        <p>Thank you for completing the onboarding process.</p>
      ) : (
        <ClientSideForm userId={user.id} experienceId={params.experienceId} />
      )}
    </div>
  );
}

function ClientSideForm({ userId, experienceId }) {
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
      await saveFormData(userId, formData);

      // Update the user's onboarding status
      await updateOnboardingStatus(userId, true);

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

  if (submitSuccess) {
    return (
      <Alert variant="success">
        Thank you for completing the onboarding process! Your information has been saved.
      </Alert>
    );
  }

  return (
    <>
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
    </>
  );
}

async function saveFormData(userId: string, formData: any) {
  // Implement logic to save form data to your database
  // This is a placeholder implementation
  console.log(`Saving form data for user ${userId}:`, formData);
  // You would typically use a database client or API call here
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

async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const response = await WhopAPI.app().GET("/app/users/{id}", {
      params: { path: { id: userId } },
    });

    if (response.isErr) {
      throw new Error(response.error.message);
    }

    const userData = response.data;
    return userData.metadata?.onboardingCompleted === true;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}
