import React from 'react';

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        try {
            // Keep a visible trace in console for faster debugging in production.
            // eslint-disable-next-line no-console
            console.error('AppErrorBoundary:', error, info);
        } catch {
            // ignore
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-screen items-center justify-center bg-background px-6">
                    <section className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                        <p className="text-sm font-semibold text-muted-foreground">Terjadi gangguan tampilan</p>
                        <h1 className="mt-2 text-xl font-semibold tracking-tight">Aplikasi perlu dimuat ulang</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Kami mendeteksi error runtime di browser. Silakan refresh halaman.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white"
                        >
                            Muat Ulang
                        </button>
                    </section>
                </main>
            );
        }

        return this.props.children;
    }
}
