import InputError from '@/Components/InputError';
import AuthShell from '@/Layouts/AuthShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthShell
            title="Log in"
            topHref="/"
        >
            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Welcome back
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        Good to see you again!
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-white/80"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2 text-red-300" />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-white/80"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2 text-red-300" />
                    </div>

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            name="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-300 focus:ring-cyan-300/40"
                        />
                        Remember me
                    </label>

                    <Button
                        type="submit"
                        disabled={processing}
                        className={
                            'h-12 w-full rounded-full px-6 ' +
                            'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 ' +
                            'shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_16px_48px_rgba(34,211,238,0.25)] ' +
                            'transition-all hover:shadow-[0_0_0_1px_rgba(34,211,238,0.30),0_22px_60px_rgba(34,211,238,0.30)] active:scale-[0.98]'
                        }
                    >
                        <span className="font-semibold">Log in</span>
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                        <Link
                            href={route('register')}
                            prefetch="hover"
                            cacheFor="1m"
                            className="text-white/65 underline-offset-4 hover:text-white hover:underline"
                        >
                            Buat akun
                        </Link>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                prefetch="hover"
                                cacheFor="1m"
                                className="text-white/65 underline-offset-4 hover:text-white hover:underline"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </AuthShell>
    );
}
