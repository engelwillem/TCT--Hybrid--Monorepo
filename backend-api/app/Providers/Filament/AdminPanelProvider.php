<?php

namespace App\Providers\Filament;

use App\Http\Middleware\SecurityHeaders;
use App\Support\AppSettings;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admintalk')
            ->favicon(fn () => AppSettings::get('site.favicon_url', '/favicon.svg'))
            ->login(\App\Filament\Auth\Pages\Login::class)
            ->passwordReset(
                \App\Filament\Auth\Pages\PasswordReset\RequestPasswordReset::class,
                \App\Filament\Auth\Pages\PasswordReset\ResetPassword::class,
            )
            ->renderHook(
                PanelsRenderHook::HEAD_START,
                fn (): string => '<style>
                    .fi-simple-layout {
                        background: radial-gradient(circle at top left, #e0f2fe 0%, #f0f9ff 40%, #ffffff 100%) !important;
                    }
                    .fi-simple-main {
                        background: transparent !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .fi-simple-main-container {
                        border-radius: 2.5rem !important;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        backdrop-filter: blur(12px);
                        background: rgba(255, 255, 255, 0.9) !important;
                        padding: 2.5rem !important;
                    }
                    /* Custom Branding for TCT Login */
                    .fi-simple-header {
                        margin-bottom: 2rem !important;
                    }
                    .fi-logo {
                        font-size: 2.5rem !important;
                        font-weight: 900 !important;
                        letter-spacing: -0.05em !important;
                        background: linear-gradient(135deg, #0891b2 0%, #0369a1 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
                    }
                    /* Override Remember Me label if it is hardcoded in Blade */
                    label[for="data.remember"] span {
                        font-size: 0.875rem !important;
                    }
                    /* Premium Sign In Button */
                    .fi-btn[type="submit"] {
                        background: linear-gradient(to right, #0891b2, #0284c7) !important;
                        border-radius: 1rem !important;
                        font-weight: 700 !important;
                        padding-top: 0.75rem !important;
                        padding-bottom: 0.75rem !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2) !important;
                    }
                    .fi-btn[type="submit"]:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3) !important;
                        filter: brightness(1.1) !important;
                    }
                    .fi-simple-header-heading {
                        font-weight: 800 !important;
                        letter-spacing: -0.025em !important;
                        background: linear-gradient(to bottom right, #0891b2, #0369a1);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .fi-simple-header-subheading {
                        font-weight: 500 !important;
                        color: #64748b !important;
                    }
                    .tct-auth-links-row {
                        margin-top: 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        gap: 1rem;
                    }
                    .tct-auth-link {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #0369a1;
                        transition: all 0.2s;
                    }
                    .tct-auth-link:hover {
                        color: #0891b2;
                        text-decoration: underline;
                    }
                </style>',
            )
            ->multiFactorAuthentication(
                [
                    AppAuthentication::make()->recoverable(),
                ],
                isRequired: false,
            )
            ->renderHook(
                PanelsRenderHook::AUTH_LOGIN_FORM_AFTER,
                fn (): string => view('filament.auth.login-links')->render(),
            )
            ->renderHook(
                PanelsRenderHook::SIDEBAR_FOOTER,
                fn (): string => view('filament.panel.main-app-sidebar-links')->render(),
            )
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn (): string => view('filament.panel.main-app-bottom-nav')->render(),
            )
            ->colors([
                'primary' => Color::Cyan,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                SecurityHeaders::class,
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
