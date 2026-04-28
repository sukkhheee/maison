"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Field, Switch, TextArea } from "@/components/ui/Field";
import {
  createService,
  updateService,
  type AdminServiceItem
} from "@/lib/api/admin-services";
import { ApiError } from "@/lib/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass an existing service to edit; omit to create. */
  service?: AdminServiceItem | null;
}

export function ServiceFormDialog({ open, onClose, onSaved, service }: Props) {
  const isEdit = !!service;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setName(service.name);
      setDescription(service.description ?? "");
      setPrice(String(service.price));
      setDuration(String(service.durationMinutes));
      setActive(service.active);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setDuration("60");
      setActive(true);
    }
    setError(null);
  }, [open, service]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const priceNum = Number(price);
      const durationNum = Number(duration);
      if (Number.isNaN(priceNum) || priceNum < 0) throw new Error("Үнэ буруу байна.");
      if (Number.isNaN(durationNum) || durationNum <= 0)
        throw new Error("Үргэлжлэх минут буруу байна.");

      if (service) {
        await updateService(service.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          durationMinutes: durationNum,
          active
        });
      } else {
        await createService({
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          durationMinutes: durationNum,
          active
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
      title={isEdit ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ"}
      description={
        isEdit
          ? "Үнэ, үргэлжлэх хугацаа, идэвхтэй эсэхийг шинэчилнэ."
          : "Захиалгын систем дотор зочин харах үйлчилгээ үүсгэнэ."
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="p-6 space-y-4">
        <Field
          label="Нэр"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Signature Cut & Style"
        />

        <TextArea
          label="Тайлбар"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Үйлчилгээний дэлгэрэнгүй тайлбар (заавал биш)"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Үнэ"
            required
            type="number"
            min={0}
            step={1000}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            suffix="₮"
            placeholder="95000"
          />
          <Field
            label="Үргэлжлэх"
            required
            type="number"
            min={1}
            step={5}
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            suffix="мин"
            placeholder="60"
          />
        </div>

        <div className="pt-2 border-t border-border">
          <Switch
            label="Идэвхтэй"
            description="Идэвхгүй болгосон үйлчилгээ зочид харж захиалах боломжгүй болно."
            checked={active}
            onChange={setActive}
          />
        </div>

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
