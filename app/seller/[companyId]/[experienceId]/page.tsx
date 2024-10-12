import { headers } from "next/headers";
import { validateToken, hasAccess, authorizedUserOn, WhopAPI } from "@whop-apps/sdk";

export default async function SellerPage({
  params,
}: {
  params: { companyId: string; experienceId: string };
}) {
  const { userId } = await validateToken({ headers });
  
  const access = await hasAccess({
    to: authorizedUserOn(params.companyId),
    headers,
  });

  if (!access) {
    return <h1>You do not have access to view this company</h1>;
  }

  const companyInformation = await WhopAPI.app().GET("/app/companies/{id}", {
    params: { path: { id: params.companyId } },
  });

  if (companyInformation.isErr) {
    console.log(companyInformation.error.message);
    return <p>Could not fetch company information</p>;
  }

  const { title } = companyInformation.data;

  return (
    <div>
      <h1>Onboarding Configuration for {title}</h1>
      {/* Add form configuration UI here */}
    </div>
  );
}