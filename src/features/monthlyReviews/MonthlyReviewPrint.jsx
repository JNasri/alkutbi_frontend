import { useState } from "react";
import { Printer } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const questionText = {
  q1: {
    ar: "هل يحقق الموظف الأهداف المطلوبة ضمن الفترة المحددة؟",
  },
  q2: {
    ar: "هل يلتزم الموظف بالمواعيد المقررة؟",
  },
  q3: {
    ar: "ما مدى سرعة إنجاز المهام المقررة؟",
  },
  q4: {
    ar: "هل ينهي الأعمال المطلوبة دون متابعة مستمرة؟",
  },
  q5: {
    ar: "هل يتقن العمل بدقة عالية؟",
  },
  q6: {
    ar: "هل يقل معدل الأخطاء في عمله؟",
  },
  q7: {
    ar: "هل يحافظ على جودة العمل تحت الضغط؟",
  },
  q8: {
    ar: "ما مدى اعتمادية العمل الذي يقدمه دون الحاجة إلى مراجعة متكررة؟",
  },
  q9: {
    ar: "هل يتقبل التغييرات في بيئة العمل بشكل إيجابي؟",
  },
  q10: {
    ar: "هل يستطيع التعامل مع أكثر من مهمة عند الحاجة؟",
  },
  q11: {
    ar: "ما مدى تعاونه مع الأقسام المختلفة؟",
  },
  q12: {
    ar: "هل يبادر بتقديم حلول عند وجود تحديات؟",
  },
  q13: {
    ar: "هل يسعى باستمرار لتطوير مهاراته؟",
  },
  q14: {
    ar: "ما مدى استجابته لفرص التعلم والتطوير؟",
  },
  q15: {
    ar: "هل يشارك المعرفة والخبرات مع زملائه؟",
  },
  q16: {
    ar: "ما مدى تقبله للتوجيه المهني؟",
  },
  q17: {
    ar: "هل يلتزم بالحضور والانصراف الرسمي؟",
  },
  q18: {
    ar: "هل يلتزم بأنظمة ولوائح الشركة؟",
  },
  q19: {
    ar: "هل يلتزم بإبلاغ الإدارة عن التأخير أو الغياب؟",
  },
  q20: {
    ar: "هل يلتزم بالمظهر المهني المطلوب؟",
  },
};

const arabicMonthNameFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  month: "long",
});

const departmentArabicLabels = {
  chairman: "مجلس الإدارة",
  finance: "المالية",
  operation: "التشغيل",
  special_papers: "الاتصالات الإدارية",
  marketing: "التسويق",
  quality: "الجودة",
  transport: "النقل",
  makkah: "مكة",
  airport: "المطار",
  madinah: "المدينة",
  hotel: "الفنادق",
};

const toEnglishDigits = (value) =>
  String(value ?? "")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));

const escapeHtml = (value) =>
  toEnglishDigits(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderEnglishNumber = (value, extraClass = "") =>
  `<span class="english-numbers ${extraClass}" dir="ltr" lang="en">${escapeHtml(value)}</span>`;

const renderEnglishNumberExpression = (value, total) =>
  `<span class="english-numbers number-expression" dir="ltr" lang="en">${escapeHtml(value)} / ${escapeHtml(total)}</span>`;

const getArabicName = (user, fallback = "—") =>
  user?.ar_name || user?.en_name || user?.username || fallback;

const formatDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
};

const renderArabicMonth = (monthValue) => {
  const value = toEnglishDigits(monthValue || "");
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) return escapeHtml(value || "—");

  const monthDate = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  if (Number.isNaN(monthDate.getTime())) return escapeHtml(value);

  return `${escapeHtml(arabicMonthNameFormatter.format(monthDate))} ${renderEnglishNumber(
    match[1],
    "month-year",
  )}`;
};

const getArabicDepartmentName = (monthlyReview) => {
  const departmentKey = monthlyReview.departmentKey;
  const normalizedDepartmentName = String(monthlyReview.departmentName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return (
    departmentArabicLabels[departmentKey] ||
    departmentArabicLabels[normalizedDepartmentName] ||
    monthlyReview.departmentName ||
    monthlyReview.departmentKey ||
    "—"
  );
};

const renderScoreScale = (value) => {
  const selectedScore = Number(value);

  return `
    <div class="score-scale" aria-label="Score ${escapeHtml(value || "—")} out of 5">
      ${[1, 2, 3, 4, 5]
        .map(
          (score) => `
            <span class="score-option english-numbers ${
              score === selectedScore ? "score-option-selected" : ""
            }" dir="ltr" lang="en">${escapeHtml(score)}</span>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderQuestionCards = (questions, answers, startIndex = 0) =>
  questions
    .map((question, index) => {
      const text = questionText[question.key] || {};
      return `
        <div class="question-card">
          <div class="question-row">
            <span class="question-number english-numbers" dir="ltr" lang="en">${escapeHtml(
              startIndex + index + 1,
            )}</span>
            <div class="question-copy">
              <div class="question-ar">${escapeHtml(text.ar || question.key)}</div>
            </div>
          </div>
          <div class="score">${renderScoreScale(answers?.[question.key])}</div>
        </div>
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
    const printableQuestions = reviewQuestions.slice(0, 20);
    const employeeName = getArabicName(monthlyReview.employee);
    const managerName = getArabicName(monthlyReview.reviewer);
    const belalName = getArabicName(signatures?.belal, "بلال");
    const chairmanName = getArabicName(signatures?.chairman);
    const department = getArabicDepartmentName(monthlyReview);
    const monthHtml = renderArabicMonth(monthlyReview.month);
    const printDate = formatDate(
      monthlyReview.updatedAt || monthlyReview.createdAt,
    );

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
      .page-container { page-break-after: auto; }
    }
    body {
      font-family: 'GE SS Two', 'Segoe UI', 'Traditional Arabic', Tahoma, sans-serif;
      direction: rtl;
      background: #fff;
      color: #000;
      font-size: 12px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
      padding: 4px 14px 50px;
    }
    .main-title {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      margin: 1px 0 4px;
    }
    .meta-table {
      width: 94%;
      margin: 0 auto 5px;
      border-collapse: collapse;
    }
    .meta-table td {
      border: 1px solid #333;
      padding: 3px 5px;
      vertical-align: middle;
      font-size: 10.5px;
    }
    .meta-table td:nth-child(odd) {
      background: #f0f0f0;
      font-weight: 700;
      text-align: center;
    }
    .questions-grid {
      width: 94%;
      margin: 0 auto 4px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px;
    }
    .question-card {
      min-height: 44px;
      border: 1px solid #d4dbe6;
      border-radius: 8px;
      background: #fff;
      padding: 3px 5px;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .question-card:nth-child(4n + 1),
    .question-card:nth-child(4n + 2) {
      background: #f7f9fc;
    }
    .question-row {
      display: flex;
      align-items: flex-start;
      gap: 4px;
    }
    .question-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 14px;
      width: 14px;
      height: 14px;
      border: 1px solid #8a98aa;
      border-radius: 50%;
      background: #fff;
      color: #132945;
      font-family: Arial, Tahoma, sans-serif;
      font-size: 10px;
      font-weight: 700;
    }
    .question-copy {
      flex: 1;
      border-right: 2px solid #b9975b;
      padding: 0 5px 0 0;
    }
    .question-ar {
      font-weight: 700;
      color: #111827;
      font-size: 16px;
      line-height: 1.13;
    }
    .score {
      text-align: center;
      font-family: Arial, Tahoma, sans-serif;
      font-weight: 700;
      margin-top: 2px;
    }
    .score-scale {
      direction: ltr;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      white-space: nowrap;
    }
    .score-option {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      border: 1px solid #c8d0db;
      border-radius: 50%;
      background: #fff;
      color: #132945;
      font-size: 7px;
      line-height: 1;
    }
    .score-option-selected {
      width: 16px;
      height: 16px;
      border: 2px solid #132945;
      background: #b9975b;
      color: #fff;
      font-size: 8.8px;
      box-shadow: 0 0 0 1px rgba(185, 151, 91, 0.2);
    }
    .summary-row {
      width: 94%;
      margin: 4px auto;
      display: flex;
      gap: 6px;
      justify-content: center;
    }
    .summary-box {
      min-width: 135px;
      border: 1px solid #333;
      padding: 3px 8px;
      text-align: center;
      font-weight: 700;
      background: #f7f7f7;
      font-size: 10.5px;
    }
    .notes-box {
      width: 94%;
      min-height: 34px;
      margin: 4px auto;
      border: 1px solid #333;
      padding: 4px 7px;
      font-size: 10px;
    }
    .notes-title {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .signatures {
      width: 94%;
      margin: 5px auto 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      text-align: center;
      font-size: 10px;
    }
    .signature-box {
      border: 1px solid #333;
      border-radius: 8px;
      min-height: 56px;
      padding: 5px 7px 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .signature-title {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .signature-name {
      min-height: 13px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 5px;
      padding-top: 2px;
      font-size: 9px;
      color: #333;
    }
    .english-numbers {
      font-family: Arial, Tahoma, sans-serif !important;
      direction: ltr;
      unicode-bidi: isolate;
      font-variant-numeric: lining-nums tabular-nums;
      font-feature-settings: "lnum" 1, "tnum" 1;
    }
    .number-expression {
      display: inline-block;
      min-width: 48px;
      text-align: center;
      white-space: nowrap;
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
          <td>${renderEnglishNumber(printDate)}</td>
          <td>الشهر</td>
          <td>${monthHtml}</td>
        </tr>
        <tr>
          <td>الإدارة</td>
          <td>${escapeHtml(department)}</td>
          <td>اسم الموظف</td>
          <td>${escapeHtml(employeeName)}</td>
        </tr>
      </table>
      <div class="questions-grid">
        ${renderQuestionCards(printableQuestions, monthlyReview.answers)}
      </div>
      <div class="summary-row">
        <div class="summary-box">الإجمالي: ${renderEnglishNumberExpression(monthlyReview.totalScore || 0, 100)}</div>
        <div class="summary-box">المتوسط: ${renderEnglishNumberExpression(monthlyReview.averageScore || 0, 5)}</div>
      </div>
      <div class="notes-box">
        <div class="notes-title">ملاحظات</div>
        <div>${escapeHtml(monthlyReview.notes || "—")}</div>
      </div>
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">مدير القسم</div>
          <div class="signature-name">${escapeHtml(managerName)}</div>
          <div class="signature-line">التوقيع</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">المراجعة</div>
          <div class="signature-name">${escapeHtml(belalName)}</div>
          <div class="signature-line">التوقيع</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">رئيس مجلس الإدارة</div>
          <div class="signature-name">${escapeHtml(chairmanName)}</div>
          <div class="signature-line">التوقيع</div>
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
