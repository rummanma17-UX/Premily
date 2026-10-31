"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Armchair, BedDouble, Flower2, Frame, Lamp, LayoutGrid,
  Pencil, Shapes, Sofa, Trees, Utensils,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/types";

const iconOptions = [
  { value: "Sofa", label: "Sofa", Icon: Sofa },
  { value: "Lamp", label: "Lamp", Icon: Lamp },
  { value: "Flower2", label: "Decor / Flower", Icon: Flower2 },
  { value: "Utensils", label: "Kitchen", Icon: Utensils },
  { value: "BedDouble", label: "Bedding", Icon: BedDouble },
  { value: "Trees", label: "Outdoor", Icon: Trees },
  { value: "LayoutGrid", label: "Rugs / Grid", Icon: LayoutGrid },
  { value: "Frame", label: "Wall Art", Icon: Frame },
  { value: "Armchair", label: "Living", Icon: Armchair },
  { value: "Shapes", label: "General", Icon: Shapes },
] as const;

type IconName = (typeof iconOptions)[number]["value"];
type CategoryForm = { name: string; slug: string; icon: IconName };

function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>({ name: "", slug: "", icon: "Shapes" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await apiFetch<Category[]>("/api/categories"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const resetForm = () => {
    setForm({ name: "", slug: "", icon: "Shapes" });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload = { name: form.name.trim(), slug: slugify(form.slug || form.name), icon: form.icon };

    try {
      if (editingId) {
        await apiFetch<Category>(`/api/categories/${editingId}`, {
          method: "PATCH", body: JSON.stringify(payload),
        });
        setNotice("Category updated.");
      } else {
        await apiFetch<Category>("/api/categories", {
          method: "POST", body: JSON.stringify(payload),
        });
        setNotice("Category created.");
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      icon: (iconOptions.some((option) => option.value === category.icon)
        ? category.icon : "Shapes") as IconName,
    });
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="space-y-5">
      <div className="premily-card space-y-3 rounded-2xl border border-border-gold bg-white p-5 sm:p-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-dark">Marketplace Categories</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Categories are stored in PostgreSQL and power homepage navigation. Every category requires an icon.
          </p>
        </div>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}

        <form onSubmit={handleSubmit} className="grid gap-3 pt-1 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-dark">
            Category name *
            <input required maxLength={80} value={form.name}
              onChange={(event) => setForm((current) => ({
                ...current, name: event.target.value,
                slug: editingId ? current.slug : slugify(event.target.value),
              }))}
              placeholder="e.g. Furniture"
              className="w-full rounded-xl border border-border-gold bg-cream/40 px-3 py-2.5 font-normal outline-none focus:border-deep" />
          </label>
          <label className="space-y-1 text-xs font-semibold text-dark">
            URL slug *
            <input required value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="e.g. furniture" pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="w-full rounded-xl border border-border-gold bg-cream/40 px-3 py-2.5 font-normal outline-none focus:border-deep" />
          </label>
          <label className="space-y-1 text-xs font-semibold text-dark sm:col-span-2">
            Category icon * <span className="font-normal text-muted">Choose a Lucide icon</span>
            <select required value={form.icon}
              onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value as IconName }))}
              className="w-full cursor-pointer rounded-xl border border-border-gold bg-cream/40 px-3 py-2.5 font-normal outline-none focus:border-deep">
              {iconOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button disabled={saving} type="submit" className="gbtn rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-50">
              {saving ? "Saving…" : editingId ? "Save category" : "Add category"}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-border-gold px-5 py-2.5 text-xs font-semibold text-dark">Cancel edit</button>}
          </div>
        </form>
      </div>

      <div className="premily-card overflow-hidden rounded-2xl border border-border-gold bg-white">
        <div className="flex items-center justify-between border-b border-border-gold/40 px-5 py-4">
          <h3 className="font-bold text-dark">Saved categories</h3>
          <span className="text-xs text-muted">{categories.length} total</span>
        </div>
        {loading ? <p className="p-5 text-xs text-muted">Loading categories…</p>
          : categories.length === 0 ? <p className="p-5 text-xs text-muted">No categories found. Add the first one above.</p>
          : <ul className="divide-y divide-border-gold/30">
              {categories.map((category) => {
                const Icon = iconOptions.find((option) => option.value === category.icon)?.Icon ?? Shapes;
                return (
                  <li key={category.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream text-deep"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm text-dark">{category.name}</b>
                      <span className="block truncate text-[11px] text-muted">/{category.slug}</span>
                    </span>
                    <button type="button" onClick={() => startEdit(category)} className="flex items-center gap-1.5 rounded-lg border border-border-gold px-3 py-2 text-xs font-semibold text-dark hover:bg-cream">
                      <Pencil className="size-3.5" /> Edit
                    </button>
                  </li>
                );
              })}
            </ul>}
      </div>
    </section>
  );
}
