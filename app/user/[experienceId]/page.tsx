'use client'

import { headers } from "next/headers";
import { validateToken, hasAccess, WhopAPI } from "@whop-apps/sdk";
import ClientSideForm from './ClientSideForm';

export default async function UserPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const { userId } = await validateToken({ headers });
  const access = await hasAccess({ to: params.experienceId, headers });

  if (!access) {
    return <div>You do not have access to view this page</div>;
  }

  const userResponse = await WhopAPI.me({ headers }).GET("/me", {});

  if (userResponse.isErr) {
    return <div>Could not fetch user information</div>;
  }

  const user = userResponse.data;
  const onboardingStatus = await checkOnboardingStatus(userId);

  return <ClientSideForm user={user} hasCompletedOnboarding={onboardingStatus} experienceId={params.experienceId} />;
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
