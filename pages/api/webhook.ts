import { NextApiRequest, NextApiResponse } from 'next';
import { makeWebhookHandler } from "@whop-apps/sdk";

const handleWebhook = makeWebhookHandler();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleWebhook(req, {
    membershipWentValid({ action, data }) {
      // Handle new user signup
      console.log('New membership:', data);
      // Implement logic to start onboarding process
    },
  });
}