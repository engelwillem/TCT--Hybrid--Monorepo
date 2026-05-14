import AuthShell from '@/Layouts/AuthShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function TwoFactorChallenge() {
    const form = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('two-factor.verify'));
    };

    return (
        <AuthShell title="Two-factor verification" topHref="/">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Two-factor authentication
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        Enter the 6-digit OTP from your authenticator app or use a recovery code.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <Input
                        value={form.data.code}
                        onChange={(e) => form.setData('code', e.target.value)}
                        placeholder="OTP / Recovery code"
                        className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                        autoFocus
                        required
                    />
                    <InputError message={form.errors.code} className="text-red-300" />

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className={
                            'h-12 w-full rounded-full px-6 ' +
                            'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 ' +
                            'shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_16px_48px_rgba(34,211,238,0.25)]'
                        }
                    >
                        <span className="font-semibold">
                            {form.processing ? 'Verifying...' : 'Verify'}
                        </span>
                    </Button>
                </form>
            </div>
        </AuthShell>
    );
}

