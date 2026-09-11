/* WORKNEO — controles de impressão A4 retrato/paisagem.
   Este módulo é aditivo: não altera a Aba 1 nem a lógica de cálculo do relatório. */
(function () {
  const STYLE_ID = 'workneo-print-orientation-style';
  const BODY_CLASS_PORTRAIT = 'workneo-print-portrait';
  const BODY_CLASS_LANDSCAPE = 'workneo-print-landscape';

  function addPrintStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Preferências de página para impressão */
      @page workneoPortrait { size: A4 portrait; margin: 7mm; }
      @page workneoLandscape { size: A4 landscape; margin: 5mm; }

      .print-orientation {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px;
        border: 1px solid #d0d5dd;
        border-radius: 11px;
        background: #f8fafc;
      }
      .print-orientation-label {
        padding: 0 5px 0 7px;
        font-size: 12px;
        font-weight: 800;
        color: #475467;
      }
      .print-orientation button {
        border: 0;
        border-radius: 8px;
        padding: 8px 10px;
        background: transparent;
        color: #344054;
        font-weight: 800;
        cursor: pointer;
      }
      .print-orientation button.active {
        background: #1769e0;
        color: #fff;
      }
      .report-onepage.preview-portrait {
        max-width: 820px;
        margin: 0 auto;
      }
      .report-onepage.preview-landscape {
        max-width: 1100px;
        margin: 0 auto;
      }

      /* Retrato: mais espaço para o nome do material e melhor leitura vertical. */
      @media screen {
        body.workneo-print-portrait .report-onepage .matrix th:first-child,
        body.workneo-print-portrait .report-onepage .matrix td:first-child {
          width: 36%;
        }
        body.workneo-print-portrait .report-onepage .matrix th,
        body.workneo-print-portrait .report-onepage .matrix td {
          padding: 4px 3px;
          font-size: 8.6px;
        }
      }

      @media print {
        /* O relatório recebe uma página nomeada; isso permite escolher a orientação. */
        .report-onepage { page: workneoPortrait; }
        body.workneo-print-landscape .report-onepage { page: workneoLandscape; }

        body.workneo-print-portrait .report-onepage {
          width: 100%;
          max-height: 270mm;
          font-size: 8.8px;
        }
        body.workneo-print-portrait .report-onepage .report-title h1 {
          font-size: 14px;
        }
        body.workneo-print-portrait .report-onepage .report-section {
          font-size: 9px;
          padding: 3px 4px;
        }
        body.workneo-print-portrait .report-onepage th,
        body.workneo-print-portrait .report-onepage td {
          padding: 2.8px 3px;
        }
        body.workneo-print-portrait .report-onepage .products th:nth-child(1),
        body.workneo-print-portrait .report-onepage .products td:nth-child(1) { width: 46%; }
        body.workneo-print-portrait .report-onepage .products th:nth-child(2),
        body.workneo-print-portrait .report-onepage .products td:nth-child(2) { width: 11%; }
        body.workneo-print-portrait .report-onepage .products th:nth-child(3),
        body.workneo-print-portrait .report-onepage .products td:nth-child(3) { width: 19%; }
        body.workneo-print-portrait .report-onepage .products th:nth-child(4),
        body.workneo-print-portrait .report-onepage .products td:nth-child(4) { width: 24%; }
        body.workneo-print-portrait .report-onepage .matrix th:first-child,
        body.workneo-print-portrait .report-onepage .matrix td:first-child { width: 36%; }
        body.workneo-print-portrait .report-onepage .matrix th,
        body.workneo-print-portrait .report-onepage .matrix td { font-size: 7.8px; }
        body.workneo-print-portrait .report-onepage .two-col { grid-template-columns: 1fr 1fr; gap: 5mm; }
        body.workneo-print-portrait .report-onepage .foot { font-size: 6.8px; }

        body.workneo-print-landscape .report-onepage {
          width: 100%;
          max-height: 190mm;
          font-size: 8.4px;
        }
        body.workneo-print-landscape .report-onepage .matrix th,
        body.workneo-print-landscape .report-onepage .matrix td { font-size: 8px; }
      }

      @media (max-width: 700px) {
        .print-orientation { width: 100%; justify-content: space-between; }
        .print-orientation-label { flex: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  function setOrientation(orientation) {
    const isLandscape = orientation === 'landscape';
    document.body.classList.toggle(BODY_CLASS_LANDSCAPE, isLandscape);
    document.body.classList.toggle(BODY_CLASS_PORTRAIT, !isLandscape);
    try { localStorage.setItem('workneo-print-orientation', isLandscape ? 'landscape' : 'portrait'); } catch (_) {}

    const report = document.querySelector('.report-onepage');
    if (report) {
      report.classList.toggle('preview-landscape', isLandscape);
      report.classList.toggle('preview-portrait', !isLandscape);
    }
    document.querySelectorAll('.print-orientation button').forEach((button) => {
      button.classList.toggle('active', button.dataset.orientation === (isLandscape ? 'landscape' : 'portrait'));
    });
  }

  function getSavedOrientation() {
    try {
      return localStorage.getItem('workneo-print-orientation') === 'landscape' ? 'landscape' : 'portrait';
    } catch (_) {
      return 'portrait';
    }
  }

  function installControls() {
    const filter = document.querySelector('.report-filter');
    const printButton = document.getElementById('prod-print');
    if (!filter || !printButton) return;

    let controls = filter.querySelector('.print-orientation');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'print-orientation';
      controls.innerHTML = `
        <span class="print-orientation-label">A4:</span>
        <button type="button" data-orientation="portrait" title="Imprimir em A4 retrato">↕ Retrato</button>
        <button type="button" data-orientation="landscape" title="Imprimir em A4 paisagem">↔ Paisagem</button>
      `;
      filter.insertBefore(controls, printButton);
      controls.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => setOrientation(button.dataset.orientation));
      });
    }

    const saved = getSavedOrientation();
    setOrientation(saved);

    /* O botão existente continua sendo o responsável pela impressão. */
    printButton.textContent = saved === 'landscape' ? '🖨️ IMPRIMIR A4 · PAISAGEM' : '🖨️ IMPRIMIR A4 · RETRATO';
    printButton.onclick = () => {
      const active = document.body.classList.contains(BODY_CLASS_LANDSCAPE) ? 'landscape' : 'portrait';
      setOrientation(active);
      window.print();
    };
  }

  function boot() {
    addPrintStyle();
    installControls();
    const observer = new MutationObserver(() => installControls());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
