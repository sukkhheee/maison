"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const ease = [0.22, 1, 0.36, 1];

export function LoginPageClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { user, ready } = useAuth();

  // If we're already signed in, jump to "Миний захиалгууд".
  useEffect(() => {
    if (ready && user) router.replace("/bookings");
  }, [ready, user, router]);

  return (
    <div className="bg-bone min-h-[100svh] grid place-items-center px-4 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="max-w-md w-full text-center"
      >
        <div className="mx-auto h-14 w-14 rounded-full bg-gold-gradient grid place-items-center text-ink shadow-gold">
          <Sparkles size={20} />
        </div>

        <h1 className="mt-6 font-serif text-4xl tracking-luxury-tight">
          Тавтай <span className="italic gold-text">морил.</span>
        </h1>
        <p className="mt-3 text-ink/60 leading-relaxed">
          Захиалгаа хадгалж, цаг авсан түүхээ нэг дороос харахын тулд нэвтэрнэ
          үү.
        </p>

        <div className="gold-divider my-8" />

        <div className="flex flex-col items-center gap-4">
          <GoogleSignInButton locale={locale} onSuccess={() => router.replace("/bookings")} />
        </div>

        <p className="mt-10 text-xs text-ink/45 leading-relaxed">
          Нэвтэрснээр та манай үйлчилгээний нөхцөл болон нууцлалын бодлогыг
          хүлээн зөвшөөрнө. Танай Google профайлын нэр, имэйл, зургийг л авна —
          контактуудыг ашиглахгүй.
        </p>
      </motion.div>
    </div>
  );
}
