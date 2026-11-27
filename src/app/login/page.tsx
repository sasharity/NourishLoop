'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setMessage('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: captchaToken || undefined,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setMessage('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Log in to your account</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-green-700 underline">
            Forgot password?
          </Link>
        </div>

        <TurnstileWidget onToken={setCaptchaToken} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>

        <p role="status">{message}</p>
      </form>

      <p className="mt-4 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-green-700 underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
