"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ImageOff } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Field, Switch, TextArea } from "@/components/ui/Field";
import {
  createStaff,
  updateStaff,
  type AdminStaffDetail
} from "@/lib/api/admin-staff";
import { ApiError } from "@/lib/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  staff?: AdminStaffDetail | null;
}

export function StaffFormDialog({ open, onClose, onSaved, staff }: Props) {
  const isEdit = !!staff;

  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (staff) {
      setDisplayName(staff.displayName);
      setTitle(staff.title ?? "");
      setBio(staff.bio ?? "");
      setAvatarUrl(staff.avatarUrl ?? "");
      setEmail(staff.userEmail ?? "");
      setPhone(staff.userPhone ?? "");
      setActive(staff.active);
    } else {
      setDisplayName("");
      setTitle("");
      setBio("");
      setAvatarUrl("");
      setEmail("");
      setPhone("");
      setActive(true);
    }
    setError(null);
  }, [open, staff]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (staff) {
        await updateStaff(staff.id, {
          displayName: displayName.trim(),
          title: title.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          phone: phone.trim() || undefined,
          active
        });
      } else {
        await createStaff({
          displayName: displayName.trim(),
          title: title.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
      else setError("Алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? "Ажилтан засах" : "Шинэ ажилтан"}
      description={
        isEdit
          ? "Профайл болон төлвийг шинэчилнэ."
          : "Шинэ мастер бүртгэх. Имэйл нь login account-той холбогдоно."
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Харагдах нэр"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Анужин"
          />
          <Field
            label="Албан тушаал"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Stylist"
          />
        </div>

        <TextArea
          label="Танилцуулга"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Туршлага, мэргэшсэн чиглэл (заавал биш)"
        />

        <AvatarField value={avatarUrl} onChange={setAvatarUrl} />

        <div className="border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-luxury-wide text-fg-muted font-semibold mb-3">
            Login аккаунт
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Имэйл"
              required={!isEdit}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEdit}
              hint={isEdit ? "Имэйл өөрчлөх боломжгүй" : undefined}
              placeholder="anu@maison.mn"
            />
            <Field
              label="Утас"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+976 9900 0000"
            />
          </div>
        </div>

        {isEdit && (
          <div className="pt-2 border-t border-border">
            <Switch
              label="Идэвхтэй"
              description="Идэвхгүй болгосон ажилтан зочид сонгох боломжгүй болно."
              checked={active}
              onChange={setActive}
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Болих
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Хадгалах" : "Үүсгэх"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * URL field with a live preview thumbnail. Reflects load failures back to the
 * user immediately — saves them from pasting a Facebook page URL or a broken
 * link and only finding out when the staff card breaks.
 */
function AvatarField({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [errored, setErrored] = useState(false);
  const trimmed = value.trim();
  const looksLikeUrl = /^https?:\/\//i.test(trimmed);

  return (
    <div>
      <Field
        label="Аватар URL"
        value={value}
        onChange={(e) => {
          setErrored(false);
          onChange(e.target.value);
        }}
        placeholder="https://images.unsplash.com/photo-…?w=200"
        hint="Зургийн шууд URL (ихэвчлэн .jpg, .png, .webp-ээр төгсдөг). Facebook эсвэл Instagram дэлгэцийн линк ажиллахгүй — эхлээд тэр хостингт upload хийнэ үү."
      />

      {trimmed && (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-md border border-border bg-surface-2/50">
          {looksLikeUrl && !errored ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmed}
              alt="Avatar preview"
              onError={() => setErrored(true)}
              className="h-12 w-12 rounded-full object-cover bg-surface"
            />
          ) : (
            <span className="h-12 w-12 rounded-full grid place-items-center bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ImageOff size={16} />
            </span>
          )}
          <div className="text-xs">
            {errored ? (
              <p className="text-rose-600 dark:text-rose-400">
                Зураг ачаалагдсангүй. URL-ыг шалгана уу.
              </p>
            ) : looksLikeUrl ? (
              <p className="text-fg-muted">Урьдчилсан харагдац — staff card-д ингэж харагдана.</p>
            ) : (
              <p className="text-rose-600 dark:text-rose-400">
                URL нь http(s)://-ээр эхлэх ёстой.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
