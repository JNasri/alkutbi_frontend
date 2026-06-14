import { useState } from "react";
import { Printer } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const questionText = {
  q1: {
    ar: "هل يحقق الموظف الأهداف المطلوبة ضمن الفترة المحددة؟",
    en: "Does the employee achieve the required goals within the specified timeframe?",
  },
  q2: {
    ar: "هل يلتزم الموظف بالمواعيد المقررة؟",
    en: "Does the employee adhere to task schedules and timelines?",
  },
  q3: {
    ar: "ما مدى سرعة إنجاز المهام المقررة؟",
    en: "How quickly does the employee complete assigned tasks?",
  },
  q4: {
    ar: "هل ينهي الأعمال المطلوبة دون متابعة مستمرة؟",
    en: "Does the employee complete required work without continuous supervision?",
  },
  q5: {
    ar: "هل يتقن العمل بدقة عالية؟",
    en: "Does the employee perform work with a high level of accuracy?",
  },
  q6: {
    ar: "هل يقل معدل الأخطاء في عمله؟",
    en: "Does the employee maintain a low error rate in their work?",
  },
  q7: {
    ar: "هل يحافظ على جودة العمل تحت الضغط؟",
    en: "Does the employee maintain work quality under pressure?",
  },
  q8: {
    ar: "ما مدى اعتمادية العمل الذي يقدمه دون الحاجة إلى مراجعة متكررة؟",
    en: "How reliable is the employee's work without requiring frequent review?",
  },
  q9: {
    ar: "هل يتقبل التغييرات في بيئة العمل بشكل إيجابي؟",
    en: "Does the employee respond positively to changes in the work environment?",
  },
  q10: {
    ar: "هل يستطيع التعامل مع أكثر من مهمة عند الحاجة؟",
    en: "Can the employee handle multiple tasks when needed?",
  },
  q11: {
    ar: "ما مدى تعاونه مع الأقسام المختلفة؟",
    en: "How well does the employee collaborate with different departments?",
  },
  q12: {
    ar: "هل يبادر بتقديم حلول عند وجود تحديات؟",
    en: "Does the employee proactively suggest solutions when challenges arise?",
  },
  q13: {
    ar: "هل يسعى باستمرار لتطوير مهاراته؟",
    en: "Does the employee continuously seek to develop their skills?",
  },
  q14: {
    ar: "ما مدى استجابته لفرص التعلم والتطوير؟",
    en: "How responsive is the employee to learning and development opportunities?",
  },
  q15: {
    ar: "هل يشارك المعرفة والخبرات مع زملائه؟",
    en: "Does the employee share knowledge and experience with colleagues?",
  },
  q16: {
    ar: "ما مدى تقبله للتوجيه المهني؟",
    en: "How receptive is the employee to professional guidance and feedback?",
  },
  q17: {
    ar: "هل يلتزم بالحضور والانصراف الرسمي؟",
    en: "Does the employee adhere to official working hours?",
  },
  q18: {
    ar: "هل يلتزم بأنظمة ولوائح الشركة؟",
    en: "Does the employee comply with company policies and regulations?",
  },
  q19: {
    ar: "هل يلتزم بإبلاغ الإدارة عن التأخير أو الغياب؟",
    en: "How consistently does the employee inform management of delays or absences?",
  },
  q20: {
    ar: "هل يلتزم بالمظهر المهني المطلوب؟",
    en: "Does the employee maintain the required professional appearance or dress code?",
  },
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getArabicName = (user, fallback = "—") =>
  user?.ar_name || user?.en_name || user?.username || fallback;

const formatDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
};

const renderQuestions = (questions, answers, startIndex = 0) =>
  questions
    .map((question, index) => {
      const text = questionText[question.key] || {};
      return `
        <tr>
          <td class="question-number"><span>${startIndex + index + 1}</span></td>
          <td class="question-text">
            <div class="question-copy">
              <div class="question-ar">${escapeHtml(text.ar || question.key)}</div>
              <div class="question-en">${escapeHtml(text.en || question.key)}</div>
            </div>
          </td>
          <td class="score"><span class="score-badge">${escapeHtml(answers?.[question.key] || "—")}</span></td>
        </tr>
      `;
    })
    .join("");

const MonthlyReviewPrint = ({
  review,
  questions,
  signatureUsers,
  buttonLabel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    if (!review) return;
    setIsLoading(true);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(generatePrintContent(review, questions, signatureUsers));
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => setIsLoading(false), 500);
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    };
  };

  const generatePrintContent = (monthlyReview, reviewQuestions, signatures) => {
    const firstPageQuestions = reviewQuestions.slice(0, 10);
    const secondPageQuestions = reviewQuestions.slice(10, 20);
    const employeeName = getArabicName(monthlyReview.employee);
    const managerName = getArabicName(monthlyReview.reviewer);
    const belalName = getArabicName(signatures?.belal, "بلال");
    const chairmanName = getArabicName(signatures?.chairman);
    const department = monthlyReview.departmentName || monthlyReview.departmentKey || "—";
    const printDate = formatDate(monthlyReview.updatedAt || monthlyReview.createdAt);

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقييم الشهري - ${escapeHtml(employeeName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @font-face {
      font-family: 'GE SS Two';
      src: url('/templates/GE-SS-Two-Light.otf') format('opentype');
      font-weight: 300;
      font-style: normal;
      font-display: swap;
    }
    @page { size: A4; margin: 0; }
    @media print {
      @page { margin: 0; }
      body { margin: 0; padding: 0; }
      .page-container { page-break-after: always; }
      .page-container:last-child { page-break-after: auto; }
    }
    body {
      font-family: 'GE SS Two', 'Segoe UI', 'Traditional Arabic', Tahoma, sans-serif;
      direction: rtl;
      background: #fff;
      color: #000;
      font-size: 12px;
      line-height: 1.35;
    }
    .page-container {
      width: 210mm;
      height: 297mm;
      position: relative;
      overflow: hidden;
      background: white;
    }
    .company-header img,
    .company-footer img {
      width: 100%;
      height: auto;
      display: block;
    }
    .company-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }
    .content-area {
      padding: 8px 18px 62px;
    }
    .main-title {
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      margin: 4px 0 8px;
    }
    .meta-table {
      width: 92%;
      margin: 0 auto 8px;
      border-collapse: collapse;
    }
    .meta-table td {
      border: 1px solid #333;
      padding: 5px 6px;
      vertical-align: middle;
    }
    .meta-table td:nth-child(odd) {
      background: #f0f0f0;
      font-weight: 700;
      text-align: center;
    }
    .questions-table {
      width: 92%;
      margin: 0 auto 8px;
      border-collapse: separate;
      border-spacing: 0 4px;
      table-layout: fixed;
    }
    .questions-table th {
      border: 0;
      background: #132945;
      color: #fff;
      font-weight: 700;
      text-align: center;
      padding: 6px 7px;
      vertical-align: middle;
    }
    .questions-table th:first-child {
      border-radius: 0 8px 8px 0;
    }
    .questions-table th:last-child {
      border-radius: 8px 0 0 8px;
    }
    .questions-table td {
      border-top: 1px solid #d4dbe6;
      border-bottom: 1px solid #d4dbe6;
      background: #fff;
      padding: 5px 7px;
      vertical-align: middle;
    }
    .questions-table tbody tr:nth-child(odd) td {
      background: #f7f9fc;
    }
    .questions-table tbody tr td:first-child {
      border-right: 1px solid #d4dbe6;
      border-radius: 0 8px 8px 0;
    }
    .questions-table tbody tr td:last-child {
      border-left: 1px solid #d4dbe6;
      border-radius: 8px 0 0 8px;
    }
    .question-number {
      width: 44px;
      text-align: center;
      font-family: Arial, Tahoma, sans-serif;
    }
    .question-number span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 25px;
      height: 25px;
      border: 1px solid #8a98aa;
      border-radius: 50%;
      background: #fff;
      color: #132945;
      font-size: 11px;
      font-weight: 700;
    }
    .question-text {
      width: auto;
      text-align: right;
    }
    .question-copy {
      border-right: 3px solid #b9975b;
      padding: 1px 8px 2px 0;
    }
    .question-ar {
      font-weight: 700;
      color: #111827;
      font-size: 12px;
      line-height: 1.25;
      margin-bottom: 2px;
    }
    .question-en {
      direction: ltr;
      text-align: left;
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-size: 10.5px;
      line-height: 1.18;
      color: #374151;
    }
    .score {
      width: 58px;
      text-align: center;
      font-family: Arial, Tahoma, sans-serif;
      font-weight: 700;
    }
    .score-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #132945;
      background: #132945;
      color: #fff;
      font-size: 14px;
      line-height: 1;
    }
    .summary-row {
      width: 92%;
      margin: 8px auto;
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .summary-box {
      min-width: 145px;
      border: 1px solid #333;
      padding: 6px 10px;
      text-align: center;
      font-weight: 700;
      background: #f7f7f7;
    }
    .notes-box {
      width: 92%;
      min-height: 62px;
      margin: 8px auto;
      border: 1px solid #333;
      padding: 7px 9px;
    }
    .notes-title {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .signatures {
      width: 92%;
      margin: 12px auto 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      text-align: center;
      font-size: 12px;
    }
    .signature-box {
      border-top: 1px solid #333;
      padding-top: 7px;
      min-height: 52px;
    }
    .signature-title {
      font-weight: 700;
      margin-bottom: 5px;
    }
    .english-numbers {
      font-family: Arial, Tahoma, sans-serif;
      direction: ltr;
      unicode-bidi: embed;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="company-header"><img src="/templates/header_alkutbi.png" alt="Company Header"></div>
    <div class="content-area">
      <h1 class="main-title">التقييم الشهري للموظف</h1>
      <table class="meta-table">
        <tr>
          <td>التاريخ</td>
          <td><span class="english-numbers">${escapeHtml(printDate)}</span></td>
          <td>الشهر</td>
          <td><span class="english-numbers">${escapeHtml(monthlyReview.month || "—")}</span></td>
        </tr>
        <tr>
          <td>الإدارة</td>
          <td>${escapeHtml(department)}</td>
          <td>اسم الموظف</td>
          <td>${escapeHtml(employeeName)}</td>
        </tr>
      </table>
      <table class="questions-table">
        <thead>
          <tr>
            <th>م</th>
            <th>السؤال</th>
            <th>النقاط</th>
          </tr>
        </thead>
        <tbody>
          ${renderQuestions(firstPageQuestions, monthlyReview.answers)}
        </tbody>
      </table>
    </div>
    <div class="company-footer"><img src="/templates/footer_alkutbi.png" alt="Company Footer"></div>
  </div>

  <div class="page-container">
    <div class="company-header"><img src="/templates/header_alkutbi.png" alt="Company Header"></div>
    <div class="content-area">
      <h1 class="main-title">التقييم الشهري للموظف</h1>
      <table class="questions-table">
        <thead>
          <tr>
            <th>م</th>
            <th>السؤال</th>
            <th>النقاط</th>
          </tr>
        </thead>
        <tbody>
          ${renderQuestions(secondPageQuestions, monthlyReview.answers, 10)}
        </tbody>
      </table>
      <div class="summary-row">
        <div class="summary-box">الإجمالي: <span class="english-numbers">${escapeHtml(monthlyReview.totalScore || 0)}</span> / 100</div>
        <div class="summary-box">المتوسط: <span class="english-numbers">${escapeHtml(monthlyReview.averageScore || 0)}</span> / 5</div>
      </div>
      <div class="notes-box">
        <div class="notes-title">ملاحظات</div>
        <div>${escapeHtml(monthlyReview.notes || "—")}</div>
      </div>
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">مدير القسم</div>
          <div>${escapeHtml(managerName)}</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">المراجعة</div>
          <div>${escapeHtml(belalName)}</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">رئيس مجلس الإدارة</div>
          <div>${escapeHtml(chairmanName)}</div>
        </div>
      </div>
    </div>
    <div class="company-footer"><img src="/templates/footer_alkutbi.png" alt="Company Footer"></div>
  </div>
</body>
</html>
    `;
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <button
        type="button"
        onClick={handlePrint}
        disabled={!review || isLoading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
      >
        <Printer size={18} />
        {buttonLabel}
      </button>
    </>
  );
};

export default MonthlyReviewPrint;
