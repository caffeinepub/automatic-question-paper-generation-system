import { QuestionCategory } from '../backend';

interface PaperData {
  subjectName: string;
  examDuration: number;
  totalMarks: number;
}

interface Question {
  questionText: string;
  category: QuestionCategory;
  options?: string[];
}

interface Sections {
  sectionA: Question[];
  sectionB: Question[];
  sectionC: Question[];
}

export function generatePDF(paper: PaperData, variant: string, sections: Sections) {
  // Validate input data
  if (!paper || !variant || !sections) {
    console.error('Missing required data for PDF generation', { paper, variant, sections });
    throw new Error('Missing required data for PDF generation');
  }

  const { sectionA, sectionB, sectionC } = sections;

  // Validate sections
  if (!Array.isArray(sectionA) || !Array.isArray(sectionB) || !Array.isArray(sectionC)) {
    console.error('Invalid sections data', sections);
    throw new Error('Invalid sections data');
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Please allow pop-ups to download the PDF');
  }

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(paper.subjectName)} - Set ${escapeHtml(variant)}</title>
        <style>
          @media print {
            @page {
              margin: 2cm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
            .no-break {
              page-break-inside: avoid;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            color: #000;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
            font-weight: bold;
          }
          
          .header h2 {
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: normal;
          }
          
          .paper-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .section {
            margin-top: 25px;
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          
          .question {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .question-text {
            margin-bottom: 8px;
          }
          
          .question-number {
            font-weight: bold;
            margin-right: 8px;
          }
          
          .options {
            margin-left: 30px;
            margin-top: 8px;
          }
          
          .option {
            margin-bottom: 5px;
          }
          
          .option-label {
            font-weight: bold;
            margin-right: 8px;
          }
          
          @media screen {
            body {
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Engineering College</h1>
          <h2>${escapeHtml(paper.subjectName)}</h2>
          <div class="paper-info">
            <span>Time: ${paper.examDuration} minutes</span>
            <span>Total Marks: ${paper.totalMarks}</span>
            <span>Set: ${escapeHtml(variant)}</span>
          </div>
        </div>

        ${sectionA.length > 0 ? `
          <div class="section">
            <div class="section-title">Section A - Multiple Choice Questions (1 mark each)</div>
            ${sectionA.map((question: Question, index: number) => `
              <div class="question">
                <div class="question-text">
                  <span class="question-number">${index + 1}.</span>
                  ${escapeHtml(question.questionText)}
                </div>
                ${question.options && question.options.length > 0 ? `
                  <div class="options">
                    ${question.options.map((option: string, idx: number) => `
                      <div class="option">
                        <span class="option-label">${String.fromCharCode(65 + idx)})</span>
                        ${escapeHtml(option)}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${sectionB.length > 0 ? `
          <div class="section">
            <div class="section-title">Section B - Short Answer Questions (2 Marks & 4 Marks)</div>
            ${sectionB.map((question: Question, index: number) => `
              <div class="question">
                <div class="question-text">
                  <span class="question-number">${sectionA.length + index + 1}.</span>
                  ${escapeHtml(question.questionText)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${sectionC.length > 0 ? `
          <div class="section">
            <div class="section-title">Section C - Long Answer Questions (6 Marks & 8 Marks)</div>
            ${sectionC.map((question: Question, index: number) => `
              <div class="question">
                <div class="question-text">
                  <span class="question-number">${sectionA.length + sectionB.length + index + 1}.</span>
                  ${escapeHtml(question.questionText)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <script>
          // Wait for content to be fully loaded before printing
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 250);
          });
          
          // Close window after printing (optional)
          window.addEventListener('afterprint', function() {
            // Uncomment the line below if you want to auto-close after printing
            // window.close();
          });
        </script>
      </body>
    </html>
  `;

  try {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error('Error writing to print window:', error);
    printWindow.close();
    throw new Error('Failed to generate PDF content');
  }
}

function escapeHtml(text: string | number): string {
  if (typeof text === 'number') {
    return text.toString();
  }
  if (!text) {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
