export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHours(hours: number) {
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainder = hours % 24;
  return remainder ? `${days}d ${remainder}h` : `${days}d`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export function formatEmissions(value: number) {
  return `${value.toLocaleString()} kg CO2`;
}
