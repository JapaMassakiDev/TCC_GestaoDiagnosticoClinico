export const somenteDigitos = (valor = "") => String(valor).replace(/\D/g, "");

export function mascararCpf(valor = "") {
  return somenteDigitos(valor).slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function mascararCnpj(valor = "") {
  return somenteDigitos(valor).slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export const mascararCrm = (valor = "") => somenteDigitos(valor).slice(0, 6);

export function mascararTelefone(valor = "") {
  const digitos = somenteDigitos(valor).slice(0, 11);
  return digitos.length <= 10
    ? digitos.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    : digitos.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export const formatarDataBr = (dataIso) => dataIso ? new Date(dataIso).toLocaleDateString("pt-BR") : "";

export function mascararDataBr(valor = "") {
  return somenteDigitos(valor).slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

export function dataBrValida(valor = "") {
  const digitos = somenteDigitos(valor);
  if (digitos.length !== 8) return false;

  const dia = Number(digitos.slice(0, 2));
  const mes = Number(digitos.slice(2, 4));
  const ano = Number(digitos.slice(4, 8));
  if (ano < 1900 || ano > 2100 || mes < 1 || mes > 12 || dia < 1) return false;

  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

export function dataBrPassadaOuHoje(valor = "") {
  if (!dataBrValida(valor)) return false;
  const digitos = somenteDigitos(valor);
  const data = new Date(Number(digitos.slice(4, 8)), Number(digitos.slice(2, 4)) - 1, Number(digitos.slice(0, 2)));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return data <= hoje;
}

export function dataBrParaIso(valor = "") {
  if (!dataBrValida(valor)) return "";
  const digitos = somenteDigitos(valor);
  const dia = digitos.slice(0, 2);
  const mes = digitos.slice(2, 4);
  const ano = digitos.slice(4, 8);
  return `${ano}-${mes}-${dia}`;
}
