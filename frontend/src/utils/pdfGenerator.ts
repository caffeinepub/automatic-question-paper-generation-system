interface PDFQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  category: string;
}

interface PDFGeneratorOptions {
  subjectName: string;
  examDuration: number;
  totalMarks: number;
  variant: string;
  sections: Record<string, PDFQuestion[]>;
  categoryLabel: (cat: string) => string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSectionMeta(cat: string): { letter: string; title: string; marks: number; instruction: string } {
  const map: Record<string, { letter: string; title: string; marks: number; instruction: string }> = {
    mcqOneMark: {
      letter: 'A',
      title: 'Multiple Choice Questions',
      marks: 1,
      instruction: 'Choose the correct answer. Each question carries 1 mark.',
    },
    _2Marks: {
      letter: 'B',
      title: 'Short Answer Questions',
      marks: 2,
      instruction: 'Answer all questions. Each question carries 2 marks.',
    },
    _4Marks: {
      letter: 'C',
      title: 'Short Answer Questions',
      marks: 4,
      instruction: 'Answer all questions. Each question carries 4 marks.',
    },
    _6Marks: {
      letter: 'D',
      title: 'Long Answer Questions',
      marks: 6,
      instruction: 'Answer all questions. Each question carries 6 marks.',
    },
    _8Marks: {
      letter: 'E',
      title: 'Long Answer Questions',
      marks: 8,
      instruction: 'Answer all questions. Each question carries 8 marks.',
    },
  };
  return map[cat] ?? { letter: '?', title: cat, marks: 0, instruction: '' };
}

export function generatePDF(opts: PDFGeneratorOptions) {
  const { subjectName, examDuration, totalMarks, variant, sections, categoryLabel } = opts;

  // Determine section letter ordering based on category keys present
  const sectionLetters = ['A', 'B', 'C', 'D', 'E'];
  let usedLetterIdx = 0;

  let questionNumber = 1;
  let sectionsHTML = '';

  Object.entries(sections).forEach(([cat, questions]) => {
    if (questions.length === 0) return;

    const meta = getSectionMeta(cat);
    const sectionLetter = sectionLetters[usedLetterIdx] ?? meta.letter;
    usedLetterIdx++;

    const totalSectionMarks = meta.marks * questions.length;

    sectionsHTML += `
      <div class="section">
        <div class="section-header">
          <div class="section-title-row">
            <span class="section-label">SECTION ${sectionLetter}</span>
            <span class="section-name">${escapeHtml(meta.title)}</span>
            <span class="section-marks">[${totalSectionMarks} Marks]</span>
          </div>
          <p class="section-instruction">${escapeHtml(meta.instruction)}</p>
        </div>
        <ol start="${questionNumber}">
          ${questions.map((q) => {
            const qHTML = `
              <li>
                <div class="question-row">
                  <div class="question-body">
                    <p class="question-text">${escapeHtml(q.questionText)}</p>
                    ${q.options && q.options.length > 0 ? `
                      <div class="options">
                        ${q.options.map((opt, i) => `
                          <div class="option">
                            <span class="option-label">(${String.fromCharCode(65 + i)})</span>
                            <span class="option-text">${escapeHtml(opt)}</span>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                  <div class="question-marks">${meta.marks > 0 ? `[${meta.marks}]` : ''}</div>
                </div>
              </li>
            `;
            questionNumber++;
            return qHTML;
          }).join('')}
        </ol>
      </div>
    `;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(subjectName)} – Set ${variant}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000;
      background: #fff;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 18mm 20mm 18mm 20mm;
    }

    /* ── College Header ── */
    .college-header {
      text-align: center;
      margin-bottom: 6px;
    }
    .college-logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 6px;
    }
    .college-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .college-name {
      font-size: 17pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .college-tagline {
      font-size: 10pt;
      color: #444;
      margin-top: 2px;
    }
    .exam-title {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    /* ── Dividers ── */
    .double-rule {
      border: none;
      border-top: 3px double #000;
      margin: 8px 0;
    }
    .single-rule {
      border: none;
      border-top: 1px solid #000;
      margin: 6px 0;
    }

    /* ── Paper Info Table ── */
    .paper-info {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 11pt;
    }
    .paper-info td {
      padding: 3px 6px;
    }
    .paper-info .label {
      font-weight: bold;
      white-space: nowrap;
      width: 1%;
    }
    .paper-info .value {
      padding-right: 20px;
    }
    .set-badge {
      float: right;
      font-size: 14pt;
      font-weight: bold;
      border: 2px solid #000;
      padding: 4px 14px;
      letter-spacing: 2px;
    }

    /* ── Instructions ── */
    .instructions-box {
      border: 1px solid #000;
      padding: 8px 12px;
      margin-bottom: 16px;
      font-size: 10.5pt;
    }
    .instructions-box .inst-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 4px;
      font-size: 11pt;
    }
    .instructions-box ol {
      padding-left: 18px;
    }
    .instructions-box li {
      margin-bottom: 2px;
      line-height: 1.5;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .section-header {
      margin-bottom: 10px;
    }
    .section-title-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .section-label {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      white-space: nowrap;
    }
    .section-name {
      font-size: 11pt;
      font-weight: bold;
      flex: 1;
    }
    .section-marks {
      font-size: 11pt;
      font-weight: bold;
      white-space: nowrap;
    }
    .section-instruction {
      font-size: 10pt;
      font-style: italic;
      color: #333;
      margin-top: 2px;
    }

    /* ── Questions ── */
    ol {
      padding-left: 0;
      list-style: none;
      counter-reset: question-counter;
    }
    li {
      counter-increment: question-counter;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .question-row {
      display: flex;
      align-items: flex-start;
      gap: 0;
    }
    .question-number {
      font-weight: bold;
      min-width: 28px;
      flex-shrink: 0;
      padding-top: 1px;
    }
    .question-body {
      flex: 1;
    }
    .question-text {
      font-size: 12pt;
      line-height: 1.6;
    }
    .question-marks {
      font-size: 11pt;
      font-weight: bold;
      white-space: nowrap;
      padding-left: 10px;
      padding-top: 1px;
      min-width: 30px;
      text-align: right;
    }

    /* ── MCQ Options ── */
    .options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 20px;
      margin-top: 6px;
      padding-left: 4px;
    }
    .option {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      font-size: 11pt;
      line-height: 1.5;
    }
    .option-label {
      font-weight: bold;
      flex-shrink: 0;
    }
    .option-text {
      flex: 1;
    }

    /* ── Footer ── */
    .paper-footer {
      margin-top: 30px;
      border-top: 2px solid #000;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
    }
    .paper-footer .center {
      text-align: center;
      flex: 1;
      font-weight: bold;
      letter-spacing: 1px;
    }

    /* ── Print ── */
    @media print {
      body { background: #fff; }
      .page { padding: 15mm 18mm; }
      .no-print { display: none !important; }
      .section { page-break-inside: avoid; }
      li { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- College Header -->
  <div class="college-header">
    <div class="college-logo-row">
      <img class="college-logo" src="/assets/generated/college-logo.dim_200x200.png" alt="College Logo" onerror="this.style.display='none'" />
      <div>
        <div class="college-name">Examination Question Paper</div>
        <div class="college-tagline">Academic Excellence &amp; Knowledge Assessment</div>
      </div>
    </div>
  </div>

  <hr class="double-rule" />

  <!-- Paper Info -->
  <div style="position:relative;">
    <span class="set-badge">SET &nbsp;${variant}</span>
    <table class="paper-info">
      <tr>
        <td class="label">Subject&nbsp;:</td>
        <td class="value">${escapeHtml(subjectName)}</td>
        <td class="label">Duration&nbsp;:</td>
        <td class="value">${examDuration} Minutes</td>
      </tr>
      <tr>
        <td class="label">Date&nbsp;:</td>
        <td class="value">____________________</td>
        <td class="label">Max. Marks&nbsp;:</td>
        <td class="value">${totalMarks}</td>
      </tr>
    </table>
  </div>

  <hr class="single-rule" />

  <!-- Instructions -->
  <div class="instructions-box">
    <div class="inst-title">General Instructions:</div>
    <ol>
      <li>All questions are compulsory unless stated otherwise.</li>
      <li>Read each question carefully before answering.</li>
      <li>Write your answers clearly and legibly in the answer booklet.</li>
      <li>Marks for each question are indicated in brackets [ ] on the right.</li>
      <li>Do not write anything on the question paper except your roll number.</li>
    </ol>
  </div>

  <!-- Sections -->
  ${sectionsHTML}

  <!-- Footer -->
  <div class="paper-footer">
    <span>Roll No.: _______________</span>
    <span class="center">*** END OF QUESTION PAPER (SET ${variant}) ***</span>
    <span>Signature: _______________</span>
  </div>

</div>

<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 400);
  };
</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}
