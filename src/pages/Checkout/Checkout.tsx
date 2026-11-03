import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import type { Event } from '@/types/event';
import type { Gender } from '@/types/event';
import { fetchEvent, registerParticipant, ApiError } from '@/lib/api';
import PageHeader from '@/components/PageHeader/PageHeader';
import FormField from '@/components/FormField/FormField';
import DOBPicker from '@/components/DOBPicker/DOBPicker';
import GenderRadio from '@/components/GenderRadio/GenderRadio';
import PhoneInput from '@/components/PhoneInput/PhoneInput';
import Icon from '@/components/Icon/Icon';
import s from './Checkout.module.css';

type Status = 'loading' | 'error' | 'notFound' | 'success';

type FormValues = {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  address: string;
  phone: string;
};

function load(
  id: string,
  setEvent: (e: Event) => void,
  setStatus: (s: Status) => void
) {
  fetchEvent(id)
    .then((ev) => {
      setEvent(ev);
      setStatus('success');
    })
    .catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        setStatus('notFound');
      } else {
        setStatus('error');
      }
    });
}

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const distanceId = searchParams.get('distance');

  const [status, setStatus] = useState<Status>(() => (id ? 'loading' : 'notFound'));
  const [event, setEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    defaultValues: {
      email: '', firstName: '', lastName: '', gender: '',
      dobDay: '', dobMonth: '', dobYear: '', address: '', phone: '',
    },
  });

  // Register DOB fields — values managed via setValue, not ref
  register('dobDay', { required: 'This field is required' });
  register('dobMonth', { required: 'This field is required' });
  register('dobYear', {
    required: 'This field is required',
    validate: (yearVal) => {
      const dayVal = getValues('dobDay');
      const monthVal = getValues('dobMonth');
      if (!dayVal || !monthVal || !yearVal) return true;
      const dob = new Date(+yearVal, +monthVal - 1, +dayVal);
      if (dob > new Date()) return 'Date of birth must be in the past';
      if (!event) return true;
      const evDate = new Date(event.date + 'T00:00:00');
      let age = evDate.getFullYear() - dob.getFullYear();
      if (evDate < new Date(evDate.getFullYear(), dob.getMonth(), dob.getDate())) age--;
      if (age < 16) return 'You must be at least 16 years old to register';
      return true;
    },
  });

  const dobDay   = useWatch({ control, name: 'dobDay' });
  const dobMonth = useWatch({ control, name: 'dobMonth' });
  const dobYear  = useWatch({ control, name: 'dobYear' });

  useEffect(() => {
    if (!id) return;
    load(id, setEvent, setStatus);
  }, [id]);

  const retry = () => {
    if (!id) return;
    setStatus('loading');
    load(id, setEvent, setStatus);
  };

  if (status === 'notFound') return <Navigate to="/not-found" replace />;

  if (status === 'loading') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Checkout" />
          <div className={s.errorState}><p>Loading…</p></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Checkout" />
          <div className={s.errorState} role="alert">
            <p>Couldn&apos;t load event.</p>
            <button className={s.retryBtn} onClick={retry}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Validate distance param
  const validDistanceId = distanceId && event.distances.some((d) => d.id === distanceId)
    ? distanceId
    : null;
  if (!validDistanceId) return <Navigate to={`/events/${id}/`} replace />;

  const distance = event.distances.find((d) => d.id === validDistanceId)!;

  const onSubmit = async (data: FormValues) => {
    setPageError(null);

    // Email de-dup at submit time
    const dup = event.participants.some(
      (p) => p.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (dup) {
      setPageError('You are already registered for this event.');
      return;
    }

    setSubmitting(true);
    const dob = `${data.dobYear}-${String(data.dobMonth).padStart(2, '0')}-${String(data.dobDay).padStart(2, '0')}`;

    const participant = {
      id: crypto.randomUUID(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender as Gender,
      dateOfBirth: dob,
      address: data.address.trim(),
      phone: data.phone.trim(),
      distanceId: validDistanceId,
      registeredAt: new Date().toISOString(),
    };

    try {
      await registerParticipant(event.id, participant);
      navigate(`/events/${event.id}/confirmation/${participant.id}/`);
    } catch {
      setPageError('Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const dobError = errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message;

  return (
    <div className={s.page}>
      <div className={s.container}>
        <PageHeader label="Checkout" />

        <div className={s.bar}>
          <h1 className={s.barName}>{event.name}</h1>
          <span className={s.barDist}>{distance.label}</span>
        </div>

        <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className={s.formSection}>Your Information</p>

          {pageError && (
            <div className="form__error-banner">
              <Icon.alert aria-hidden="true" />
              {pageError}
            </div>
          )}

          {/* Email */}
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Enter your email"
              {...register('email', {
                required: 'This field is required',
                pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email format' },
                validate: (v) =>
                  [...v.trim()].every((c) => c.charCodeAt(0) <= 127) ||
                  'Latin characters only (a–z)',
              })}
            />
          </FormField>

          {/* First + Last name */}
          <div className="field-row">
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message}>
              <input
                id="firstName"
                className="input"
                placeholder="John"
                {...register('firstName', {
                  required: 'This field is required',
                  pattern: { value: /^[a-zA-Z\s\-']+$/, message: 'Latin characters only (a–z)' },
                })}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message}>
              <input
                id="lastName"
                className="input"
                placeholder="Doe"
                {...register('lastName', {
                  required: 'This field is required',
                  pattern: { value: /^[a-zA-Z\s\-']+$/, message: 'Latin characters only (a–z)' },
                })}
              />
            </FormField>
          </div>

          {/* Gender */}
          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'This field is required' }}
              render={({ field }) => (
                <GenderRadio
                  value={field.value as Gender | ''}
                  onChange={(g) => field.onChange(g)}
                  invalid={Boolean(errors.gender)}
                  id="gender"
                />
              )}
            />
          </FormField>

          {/* Date of Birth */}
          <FormField label="Date of Birth" htmlFor="dobDay" error={dobError}>
            <DOBPicker
              day={dobDay || ''}
              month={dobMonth || ''}
              year={dobYear || ''}
              onChange={(part, value) => {
                const name = part === 'day' ? 'dobDay' : part === 'month' ? 'dobMonth' : 'dobYear';
                setValue(name, value, { shouldValidate: isSubmitted });
              }}
              invalid={Boolean(dobError)}
            />
          </FormField>

          {/* Address */}
          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <input
              id="address"
              className="input"
              placeholder="Street, City, Country"
              {...register('address', {
                required: 'This field is required',
                pattern: {
                  value: /^[a-zA-Z0-9\s\-',./]+$/,
                  message: 'Latin characters only (a–z)',
                },
              })}
            />
          </FormField>

          {/* Phone */}
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: 'This field is required',
                validate: (v) =>
                  /^\d{8,15}$/.test(v) || 'Invalid phone number (8–15 digits)',
              }}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  invalid={Boolean(errors.phone)}
                />
              )}
            />
          </FormField>

          <div className={s.formCta}>
            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={submitting}
            >
              {submitting ? (
                <><span className="spinner" /> Registering…</>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
