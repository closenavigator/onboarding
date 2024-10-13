import { Input, Label } from "@whop/frosted-ui"

interface PersonalInfoStepProps {
  register: any;
  errors: any;
}

export default function PersonalInfoStep({ register, errors }: PersonalInfoStepProps) {
  return (
    <div>
      <Label htmlFor="name">Name</Label>
      <Input id="name" {...register("personalInfo.name")} />
      {errors?.name && <span>{errors.name.message}</span>}

      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" {...register("personalInfo.email")} />
      {errors?.email && <span>{errors.email.message}</span>}
    </div>
  )
}
