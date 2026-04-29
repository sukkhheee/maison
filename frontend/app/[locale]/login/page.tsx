import { LoginPageClient } from "./LoginPageClient";

export default function LoginPage({
  params
}: {
  params: { locale: string };
}) {
  return <LoginPageClient locale={params.locale} />;
}
