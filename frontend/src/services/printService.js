import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { formatDateBr, maskCPF } from "../utils/masks";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));

const displayCep = (value = "") => {
  const d = String(value).replace(/\D/g, "").slice(0, 8);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : value || "";
};

const displayBirthDate = (iso) => {
  if (!iso) return "-";
  const [year, month, day] = String(iso).split("-");
  return year && month && day ? `${day}/${month}/${year}` : iso;
};


function logoBlock(d) {
  const uri = d?.unitLogoUri;
  if (uri && /^(data:|https?:)/i.test(uri)) {
    return `<img class="unit-logo" src="${esc(uri)}" alt="Logo da unidade" />`;
  }
  return `<div class="logo-placeholder"><strong>${esc(d?.unitName || "Unidade de saúde")}</strong><span>LOGO DA UNIDADE</span></div>`;
}

export function diagnosisHtml(d) {
  const meds = (d.medications || []).map((m) => typeof m === "string" ? { name: m } : m);
  const unitAddressLine = `${d.unitCep ? `CEP ${displayCep(d.unitCep)} · ` : ""}${d.unitAddress || "Endereço não informado"}${d.unitNumber ? `, ${d.unitNumber}` : ""}`;
  const generatedAt = new Date();
  const generatedDate = generatedAt.toLocaleDateString("pt-BR");
  const generatedTime = generatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #171717; background: #fff; font-size: 11.5px; line-height: 1.35; }
  .sheet { min-height: 273mm; border: 1.4px solid #555; position: relative; padding-bottom: 18mm; overflow: hidden; }
  .watermark { position: absolute; inset: 33% 17% auto; height: 165mm; opacity: .035; border: 30px solid #2f7d59; border-radius: 50%; transform: rotate(-18deg); pointer-events: none; }
  .header { display: grid; grid-template-columns: 27% 73%; min-height: 43mm; border-bottom: 1.4px solid #555; }
  .header > div { padding: 8px 10px; display: flex; align-items: center; justify-content: center; }
  .header > div + div { border-left: 1.4px solid #555; }
  .unit-logo { display: block; width: auto; height: auto; max-width: 34mm; max-height: 24mm; object-fit: contain; margin: 0 auto; }
  .logo-placeholder { text-align: center; color: #222; }
  .logo-placeholder strong { display: block; font-size: 14px; margin-bottom: 6px; }
  .logo-placeholder span { color: #777; font-size: 9px; letter-spacing: .8px; }
  .unit-data { text-align: center; flex-direction: column; gap: 7px; padding-left: 18px !important; padding-right: 18px !important; }
  .unit-data strong { font-size: 14px; }
  .unit-data span { width: 100%; white-space: normal; overflow-wrap: anywhere; }
  .title { text-align: center; font-size: 17px; padding: 7px 10px; border-bottom: 1.4px solid #555; font-weight: 500; }
  .patient-grid { display: grid; grid-template-columns: 52% 48%; border-bottom: 1.4px solid #555; }
  .patient-grid > div { padding: 8px 10px; min-height: 28mm; }
  .patient-grid > div + div { border-left: 1px solid #aaa; }
  .line { margin: 4px 0; }
  .label { font-weight: 700; }
  .content { padding: 10px; min-height: 145mm; position: relative; }
  .section-title { font-size: 13px; font-weight: 700; margin: 0 0 12px; }
  .diagnosis-title { font-size: 14px; font-weight: 700; margin: 0 0 7px; }
  .description { white-space: pre-wrap; margin-bottom: 18px; }
  .meds-title { font-weight: 700; margin: 14px 0 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th, td { border: 1px solid #999; padding: 6px; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  .signature { width: 48%; margin-left: auto; margin-top: 24mm; text-align: center; }
  .signature-line { border-top: 1px solid #555; padding-top: 5px; }
  .generated { text-align: center; margin-top: 12px; }
  .footer { position: absolute; left: 0; right: 0; bottom: 0; min-height: 13mm; border-top: 1.4px solid #555; display: flex; align-items: center; justify-content: center; padding: 5px 10px; text-align: center; font-size: 9.5px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <main class="sheet">
    <div class="watermark"></div>
    <section class="header">
      <div>${logoBlock(d)}</div>
      <div class="unit-data">
        <strong>${esc(d.unitName || "Unidade de saúde")}</strong>
        <span>${esc(unitAddressLine)}</span>
        <span>${esc(d.unitPhone || "Telefone não informado")}</span>
      </div>
    </section>

    <div class="title">Laudo / Diagnóstico Médico</div>

    <section class="patient-grid">
      <div>
        <div class="line"><span class="label">Nome:</span> ${esc(d.patientName || "-")}</div>
        <div class="line"><span class="label">CPF:</span> ${esc(maskCPF(d.patientCpf || ""))}</div>
        <div class="line"><span class="label">Data de nascimento:</span> ${esc(displayBirthDate(d.patientBirthDate))}</div>
        <div class="line"><span class="label">Sexo:</span> ${esc(d.patientSex || "-")}</div>
      </div>
      <div>
        <div class="line"><span class="label">Diagnóstico:</span> ${esc(d.title || "-")}</div>
        <div class="line"><span class="label">CID-11:</span> ${esc(d.cid || "-")}</div>
        <div class="line"><span class="label">Data do diagnóstico:</span> ${esc(formatDateBr(d.createdAt))}</div>
        <div class="line"><span class="label">Médico(a):</span> ${esc(d.doctorName || "-")}</div>
        <div class="line"><span class="label">CRM:</span> ${esc(d.doctorCrm || "-")}</div>
      </div>
    </section>

    <section class="content">
      <div class="section-title">Conclusões:</div>
      <div class="diagnosis-title">${esc(d.title || "Diagnóstico")} — CID-11 ${esc(d.cid || "-")}</div>
      <div class="description">${esc(d.description || "Sem descrição clínica informada.")}</div>

      <div class="meds-title">Medicamentos prescritos:</div>
      ${meds.length ? `<table><thead><tr><th>Medicamento</th><th>Dose</th><th>Frequência</th><th>Duração</th><th>Observação</th></tr></thead><tbody>${meds.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.dosage || "-")}</td><td>${esc(m.frequency || "-")}</td><td>${esc(m.duration || "-")}</td><td>${esc(m.observation || "-")}</td></tr>`).join("")}</tbody></table>` : `<p>Nenhum medicamento prescrito.</p>`}

      <div class="generated">Documento gerado em ${esc(generatedDate)} às ${esc(generatedTime)}.</div>
      <div class="signature">
        <div class="signature-line">
          <strong>${esc(d.doctorName || "Médico(a)")}</strong><br />
          CRM ${esc(d.doctorCrm || "-")}<br />
          <span>Responsável pelo diagnóstico</span>
        </div>
      </div>
    </section>

    <footer class="footer">Documento clínico emitido pelo Saúde App.</footer>
  </main>
</body>
</html>`;
}

function baseHtml(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#26352F;padding:0}h1{color:#357257}h2{margin-top:24px;color:#305B49}.box{border:1px solid #C8EBD8;border-radius:12px;padding:16px;margin:12px 0}.muted{color:#66756f;font-size:13px}</style></head><body><h1>${esc(title)}</h1>${body}</body></html>`;
}

export function timelineHtml(timeline) {
  return baseHtml(`Linha do tempo: ${timeline.name}`, `
    <p class="muted">Histórico clínico agrupado em ordem cronológica.</p>
    ${(timeline.diagnoses || []).map((d) => `<div class="box"><strong>${esc(formatDateBr(d.createdAt))} — ${esc(d.title)}</strong><br>CID ${esc(d.cid)}<br><span class="muted">${esc(d.doctorName)} · ${esc(d.unitName)}</span><p>${esc(d.description)}</p></div>`).join("") || "<p>Nenhum diagnóstico vinculado.</p>"}
  `);
}

export async function printHtml(html) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) throw new Error("O navegador bloqueou a janela de impressão.");
    w.document.write(html); w.document.close(); w.focus(); w.print();
    return;
  }
  await Print.printAsync({ html });
}

export async function generatePdf(html, filename = "saude-app-documento.pdf") {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    // O HTML do laudo é um documento completo. Para o html2pdf renderizar o conteúdo
    // corretamente, extraímos os estilos e o BODY antes de montar o elemento temporário.
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "-100000px";
    host.style.top = "0";
    host.style.width = "794px";
    host.style.background = "#ffffff";

    parsed.head.querySelectorAll("style").forEach((styleNode) => {
      host.appendChild(styleNode.cloneNode(true));
    });

    const bodyWrapper = document.createElement("div");
    bodyWrapper.innerHTML = parsed.body.innerHTML;
    host.appendChild(bodyWrapper);
    document.body.appendChild(host);

    try {
      // Aguarda imagens (por exemplo, logo da unidade) antes de capturar o documento.
      const images = Array.from(host.querySelectorAll("img"));
      await Promise.all(images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 1500);
        });
      }));

      const printable = host.querySelector(".sheet") || bodyWrapper;
      if (!printable || !printable.textContent?.trim()) {
        throw new Error("Não foi possível montar o conteúdo do diagnóstico para o PDF.");
      }

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(printable)
        .save();
    } finally {
      host.remove();
    }
    return filename;
  }

  // Em Android/iOS o PDF é criado como arquivo real. O painel nativo permite salvá-lo
  // em Arquivos/Downloads, sem abrir a tela de impressão.
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Salvar PDF",
    });
  }
  return uri;
}
