import InputError from '@/Components/InputError';
import AuthShell from '@/Layouts/AuthShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthShell
            title="Register"
            topHref="/"
        >
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Create your account
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        Let's grow together!
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="text-sm font-medium text-white/80"
                        >
                            Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2 text-red-300" />
                    </div>

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
                            onChange={(e) => setData('email', e.target.value)}
                            required
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
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2 text-red-300" />
                    </div>

                    <div>
                        <label
                            htmlFor="password_confirmation"
                            className="text-sm font-medium text-white/80"
                        >
                            Confirm password
                        </label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2 text-red-300"
                        />
                    </div>

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
                        <span className="font-semibold">Register</span>
                    </Button>

                    <div className="text-center text-sm">
                        <Link
                            href={route('login')}
                            prefetch="hover"
                            cacheFor="1m"
                            className="text-white/65 underline-offset-4 hover:text-white hover:underline"
                        >
                            Sudah punya akun? - Login
                        </Link>
                    </div>
                </form>
            </div>
        </AuthShell>
    );
}
