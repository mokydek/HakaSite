import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, PageHeader, Select, Textarea } from '../../ui'
import { FormError } from '../components/FormError'
import { COUNTRIES } from '../data/countries'
import { updateProfile } from '../../backend/queries/auth'
import { useAuth } from '../../backend/auth/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

interface FieldErrors {
  fullName?: string
  country?: string
}

export default function Onboarding() {
  usePageTitle('Onboarding')
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [country, setCountry] = useState(profile?.country ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // A complete profile does not need onboarding.
  useEffect(() => {
    if (profile?.full_name && profile.country) {
      navigate('/hackathon', { replace: true })
    }
  }, [profile, navigate])

  function validate(): boolean {
    const next: FieldErrors = {}
    if (fullName.trim().length === 0) next.fullName = 'Enter your full name'
    if (country.trim().length === 0) next.country = 'Select your country'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!user) {
      setFormError('Your session expired. Sign in again.')
      return
    }
    if (!validate()) return
    setSubmitting(true)
    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        country: country.trim(),
        bio: bio.trim() ? bio.trim() : null,
      })
      await refreshProfile()
      navigate('/hackathon', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save your profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Complete your profile"
        description="Tell us who you are before you join the hackathon."
      />
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Input
          label="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={fieldErrors.fullName}
        />
        <Select
          label="Country"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          error={fieldErrors.country}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Textarea
          label="Short bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Optional. A sentence about you."
          rows={3}
        />
        {formError ? <FormError message={formError} /> : null}
        <div>
          <Button type="submit" loading={submitting}>
            Save and continue
          </Button>
        </div>
      </form>
    </div>
  )
}
