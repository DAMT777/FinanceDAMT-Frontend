const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return COP_FORMATTER.format(amount);
}

export function formatCOPCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return COP_FORMATTER.format(amount);
}

/** Format as "+$1.000" or "-$1.000" with sign prefix */
export function formatCOPSigned(amount: number, type: "Income" | "Expense" | "Transfer"): string {
  const formatted = COP_FORMATTER.format(Math.abs(amount));
  return type === "Expense" ? `-${formatted}` : `+${formatted}`;
}

/** Parse a Colombian-formatted number string back to a number */
export function parseCOPInput(raw: string): number {
  // Remove all dots (thousands separators) and parse
  const cleaned = raw.replace(/\./g, "").replace(/[^0-9]/g, "");
  return Number(cleaned) || 0;
}

/** Format a raw numeric string with thousands dots as user types */
export function formatCOPInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}
