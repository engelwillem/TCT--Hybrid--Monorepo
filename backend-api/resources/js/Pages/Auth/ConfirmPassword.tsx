import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthShell from '@/Layouts/AuthShell';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthShell title="Confirm password" topHref="/">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Confirm password
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        This is a secure action. Please confirm your password.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-white/80">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoFocus
                            className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-cyan-300/40"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2 text-red-300" />
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
                        <span className="font-semibold">Confirm</span>
                    </Button>
                </form>
            </div>
        </AuthShell>
    );
}
