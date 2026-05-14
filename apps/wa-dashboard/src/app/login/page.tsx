import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const nextPath = params?.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <main>
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
