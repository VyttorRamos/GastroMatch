// Utilitários de validação e máscara para E-mail e CNPJ (padrão Receita Federal)

export function formatCnpj(value = "") {
  const digits = String(value).replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function isValidCnpj(value = "") {
  const cnpj = String(value).replace(/\D/g, "");

  if (cnpj.length !== 14) return false;

  // Rejeita sequências de dígitos todos iguais (ex: 00.000.000/0000-00, 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Cálculo do 1º dígito verificador
  let length = 12;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  // Cálculo do 2º dígito verificador
  length = 13;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
}

export function generateValidCnpj() {
  const rand = () => Math.floor(Math.random() * 9);
  const n = [rand(), rand(), rand(), rand(), rand(), rand(), rand(), rand(), 0, 0, 0, 1];

  const calcDigit = (arr, weights) => {
    const sum = arr.reduce((acc, val, idx) => acc + val * weights[idx], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calcDigit(n, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  n.push(d1);
  const d2 = calcDigit(n, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  n.push(d2);

  return formatCnpj(n.join(""));
}

export function isValidEmail(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.length > 254) return false;
  // Formato padrão: usuario@dominio.tld (mínimo 2 letras no TLD, sem espaços ou pontos duplos)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;
  if (trimmed.includes("..")) return false;
  return true;
}
