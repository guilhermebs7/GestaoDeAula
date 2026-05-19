function pad(value) {
  return String(value).padStart(2, '0');
}

function toParts(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    };
  }

  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return null;

  return { year, month, day };
}

export function toDateInputValue(value) {
  const parts = toParts(value);
  if (!parts) return '';

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function getTomorrowDateInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return toDateInputValue(tomorrow);
}

export function formatDateOnlyPtBr(value, options = {}) {
  const parts = toParts(value);
  if (!parts) return '';

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: options.month || 'short',
    ...(options.year ? { year: options.year } : {}),
  }).format(date);
}