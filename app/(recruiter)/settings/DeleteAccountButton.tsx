"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account and all associated data. This cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
    >
      {loading ? "Deleting…" : "Delete all my data"}
    </button>
  );
}
