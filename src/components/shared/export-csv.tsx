"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Məlumatı client tərəfdə CSV-ə çevirib yükləyir (API route lazım deyil). */
export function ExportCsv({
  filename,
  headers,
  rows,
  label = "CSV",
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  label?: string;
}) {
  const download = () => {
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers, ...rows].map((r) => r.map(esc).join(";"));
    // BOM — Excel-də AZ hərfləri düzgün göstərmək üçün
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" size="sm" onClick={download}>
      <Download className="h-4 w-4" /> {label}
    </Button>
  );
}
