/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SystemStatus } from '@/features/auth/types'

import { SignUpForm } from '../sign-up-form'

const mocks = vi.hoisted(() => ({
  status: null as SystemStatus | null,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({ status: mocks.status }),
}))

vi.mock('@/features/auth/hooks/use-auth-redirect', () => ({
  useAuthRedirect: () => ({
    redirectToLogin: vi.fn(),
    handleLoginSuccess: vi.fn(),
  }),
}))

vi.mock('@/features/auth/hooks/use-email-verification', () => ({
  useEmailVerification: () => ({
    isSending: false,
    secondsLeft: 0,
    isActive: false,
    sendCode: vi.fn(),
  }),
}))

vi.mock('@/features/auth/hooks/use-turnstile', () => ({
  useTurnstile: () => ({
    isTurnstileEnabled: false,
    turnstileSiteKey: '',
    turnstileToken: '',
    setTurnstileToken: vi.fn(),
    validateTurnstile: () => true,
  }),
}))

vi.mock('@/features/auth/components/legal-consent', () => ({
  LegalConsent: () => null,
}))

vi.mock('@/features/auth/components/oauth-providers', () => ({
  OAuthProviders: ({ showDivider }: { showDivider?: boolean }) => (
    <div data-testid='oauth-providers' data-divider={String(showDivider)} />
  ),
}))

vi.mock('@/components/dialog', () => ({
  Dialog: () => null,
}))

describe('SignUpForm registration methods', () => {
  beforeEach(() => {
    mocks.status = {
      register_enabled: true,
      oauth_register_enabled: true,
      github_oauth: true,
    }
  })

  it('shows only OAuth entry points when password registration is disabled', () => {
    mocks.status = { ...mocks.status, password_register_enabled: false }

    render(<SignUpForm />)

    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Create account' })
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('oauth-providers')).toHaveAttribute(
      'data-divider',
      'false'
    )
  })

  it('keeps password fields and separates OAuth when password registration is enabled', () => {
    mocks.status = { ...mocks.status, password_register_enabled: true }

    render(<SignUpForm />)

    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('oauth-providers')).toHaveAttribute(
      'data-divider',
      'true'
    )
  })
})
