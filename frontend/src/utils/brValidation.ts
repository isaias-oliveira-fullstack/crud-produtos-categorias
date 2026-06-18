/** Apenas dígitos */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Máscara CPF: 000.000.000-00 */
export function maskCpfInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Máscara celular BR: (00) 00000-0000 */
export function maskPhoneBrInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Validação básica de e-mail */
export function isValidEmail(email: string): boolean {
  const t = email.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** CPF válido (dígitos verificadores) */
export function isValidCpf(cpf: string): boolean {
  const d = digitsOnly(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]!, 10) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9]!, 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]!, 10) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]!, 10);
}

/** Telefone BR: pelo menos 10 dígitos (fixo ou celular) */
export function isValidBrazilPhone(phone: string): boolean {
  const n = digitsOnly(phone).length;
  return n >= 10 && n <= 11;
}
