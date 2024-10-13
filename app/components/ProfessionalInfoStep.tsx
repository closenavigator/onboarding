import { Input, Label, RadioGroup } from "@whop/frosted-ui"

interface ProfessionalInfoStepProps {
  register: any;
  errors: any;
}

export default function ProfessionalInfoStep({ register, errors }: ProfessionalInfoStepProps) {
  return (
    <div>
      <Label htmlFor="role">Role</Label>
      <RadioGroup>
        {["Developer", "Designer", "Manager", "Other"].map((role) => (
          <RadioGroup.Item key={role} value={role} {...register("professionalInfo.role")}>
            {role}
          </RadioGroup.Item>
        ))}
      </RadioGroup>
      {errors?.role && <span>{errors.role.message}</span>}

      <Label htmlFor="experience">Years of Experience</Label>
      <Input id="experience" type="number" {...register("professionalInfo.experience", { valueAsNumber: true })} />
      {errors?.experience && <span>{errors.experience.message}</span>}
    </div>
  )
}
