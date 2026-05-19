function pad(value) {
  return String(value).padStart(2, '0');
}

function toParts(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }

  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return null;

  return { year, month, day };
}

function createLocalNoonDate(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toDateOnlyString(value) {
  const parts = toParts(value);
  if (!parts) return null;

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function toDateOnlyDate(value) {
  const parts = toParts(value);
  if (!parts) return null;

  return createLocalNoonDate(parts.year, parts.month, parts.day);
}

module.exports = {
  toDateOnlyDate,
  toDateOnlyString,
};