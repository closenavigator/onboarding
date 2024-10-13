import { Checkbox, Label } from "@whop/frosted-ui"

interface PreferencesStepProps {
  register: any;
  errors: any;
}

export default function PreferencesStep({ register, errors }: PreferencesStepProps) {
  return (
    <div>
      <Label>Interests</Label>
      {["Web Development", "Mobile Development", "UI/UX Design", "Data Science"].map((interest) => (
        <Checkbox key={interest} {...register("preferences.interests")} value={interest}>
          {interest}
        </Checkbox>
      ))}
      {errors?.interests && <span>{errors.interests.message}</span>}

      <Checkbox {...register("preferences.newsletter")}>
        Subscribe to newsletter
      </Checkbox>
    </div>
  )
}
