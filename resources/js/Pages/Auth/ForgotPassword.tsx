import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthShell from '@/Layouts/AuthShell';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthShell title="Forgot password" topHref="/">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Reset your password
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        Enter your email and we’ll send you a reset link.
                    </p>
                </div>

                {status ? (
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                        {status}
                    </div>
                ) : null}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-white/80">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoFocus
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2 text-red-300" />
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
                        <span className="font-semibold">Send reset link</span>
                    </Button>
                </form>
            </div>
        </AuthShell>
    );
}
