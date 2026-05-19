function formatValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function formatFields(fields = {}) {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(', ');
}

function info(event, fields = {}) {
  const details = formatFields(fields);
  console.log(details ? `[INFO] ${event}: ${details}` : `[INFO] ${event}`);
}

function warn(event, fields = {}) {
  const details = formatFields(fields);
  console.warn(details ? `[WARN] ${event}: ${details}` : `[WARN] ${event}`);
}

function error(event, fields = {}) {
  const details = formatFields(fields);
  console.error(details ? `[ERROR] ${event}: ${details}` : `[ERROR] ${event}`);
}

module.exports = {
  info,
  warn,
  error,
};