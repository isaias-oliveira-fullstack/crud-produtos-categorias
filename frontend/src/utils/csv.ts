function escapeCell(value: string): string {
  const needsQuote = /[",\n\r]/.test(value);
  const inner = value.replace(/"/g, '""');
  return needsQuote ? `"${inner}"` : inner;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers.map(escapeCell).join(",")];
  rows.forEach((row) => {
    lines.push(row.map(escapeCell).join(","));
  });
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
