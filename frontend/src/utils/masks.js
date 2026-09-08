export const onlyDigits = (value = "") => String(value).replace(/\D/g, "");

export function maskCPF(value = "") {
  return onlyDigits(value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskCNPJ(value = "") {
  return onlyDigits(value).slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export const maskCRM = (value = "") => onlyDigits(value).slice(0, 6);

export function maskPhone(value = "") {
  const v = onlyDigits(value).slice(0, 11);
  return v.length <= 10
    ? v.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    : v.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export const formatDateBr = (iso) => new Date(iso).toLocaleDateString("pt-BR");

export function maskDateBr(value = "") {
  return onlyDigits(value).slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

/**
 * Valida uma data DD/MM/AAAA usando o calendário real.
 * Evita datas como 99/99/2026, 31/02/2026 e 29/02 em ano não bissexto.
 */
export function isValidDateBr(value = "") {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return false;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return false;

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isPastOrTodayDateBr(value = "") {
  if (!isValidDateBr(value)) return false;
  const digits = onlyDigits(value);
  const date = new Date(Number(digits.slice(4, 8)), Number(digits.slice(2, 4)) - 1, Number(digits.slice(0, 2)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

export function brDateToIso(value = "") {
  if (!isValidDateBr(value)) return "";
  const digits = onlyDigits(value);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${year}-${month}-${day}`;
}
