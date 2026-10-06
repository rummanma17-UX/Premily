import { apiFetch } from "@/lib/api";
import type { Category } from "@/types";

export default async function Home() {
  const categories = await apiFetch<Category[]>("/api/categories");

  return (
    <main className="flex flex-1 flex-col item-center px-6 py-16">
      <h1 className="text-3xl font-semibold mb-8">Premily</h1>

      <ul className="flex flex-col gap-2 w-full max-w-md">
        {categories.map((category) => (
          <li key={category.id} className="rounded border px-4 py-3 text-lg">
            {category.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
