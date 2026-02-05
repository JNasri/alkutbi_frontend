import React, { useState } from "react";
import { Printer } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const PurchaseOrderPrint = ({ purchaseOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    setIsLoading(true);
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const printContent = generatePrintContent(purchaseOrder);
    const iframeDoc = iframe.contentWindow.document;
    
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();
    
    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Hide spinner after print dialog opens
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  const generatePrintContent = (order) => {
    // Payment method translations
    const paymentMethodArabic = {
      cash: "نقدي",
      visa: "فيزا",
      bank_transfer: "تحويل بنكي",
      sadad: "سداد",
    };

    // Transaction type translations
    const transactionTypeArabic = {
      expenses: "مصروفات",
      receivables: "مستحقات",
      custody: "عهدة",
      advance: "سلفة",
    };

    // Convert Arabic/Hindi numerals to English numerals
    const toEnglishNumbers = (str) => {
      if (!str) return str;
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const hindiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      
      return String(str).split('').map(char => {
        const arabicIndex = arabicNumbers.indexOf(char);
        if (arabicIndex !== -1) return arabicIndex.toString();
        const hindiIndex = hindiNumbers.indexOf(char);
        if (hindiIndex !== -1) return hindiIndex.toString();
        return char;
      }).join('');
    };

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أمر شراء - ${order.purchasingId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Custom Font */
    @font-face {
      font-family: 'GE SS Two';
      src: url('/templates/GE-SS-Two-Light.otf') format('opentype');
      font-weight: 300;
      font-style: normal;
      font-display: swap;
    }
    
    @page {
      size: A4;
      margin: 0; /* Remove all margins to eliminate browser headers/footers */
    }
    
    @media print {
      /* Remove browser default headers and footers */
      @page {
        margin: 0;
      }
      
      body {
        margin: 0;
        padding: 0;
      }
      
      .page-container {
        padding: 0;
      }
    }
    
    body {
      font-family: 'GE SS Two', 'Segoe UI', 'Traditional Arabic', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      text-align: right;
      background: white;
      color: #000;
      line-height: 1.4;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }
    
    .page-container {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      position: relative;
    }
    
    /* Company Header Image - Full width, no margins */
    .company-header {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    
    .company-header img {
      width: 100%;
      height: auto;
      display: block;
      margin: 0;
      padding: 0;
    }
    
    /* Content Area */
    .content-area {
      padding: 10px 15px;
      padding-bottom: 50px; /* Space for footer */
    }
    
    /* Header Information */
    .header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 5px 50px;
      margin-bottom: 5px;
    }
    
    .header-info-right {
      text-align: right;
    }
    
    .header-info-left {
      text-align: left;
    }
    
    .header-info div {
      margin-bottom: 2px;
    }
    
    .header-info strong {
      font-weight: bold;
      display: inline-block;
      min-width: 100px;
    }
    
    .main-title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      margin: 8px 0;
      color: #1a1a1a;
    }
    
    
    .data-table {
      width: 80%;
      border-collapse: collapse;
      margin-bottom: 10px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .data-table td {
      border: 1px solid #333;
      padding: 8px 8px;
      font-size: 13px;
      line-height: 1.3;
      text-align: center;
    }
    
    .data-table td:first-child {
      font-weight: bolder;
      background-color: #f0f0f0;
      width: 25%;
    }
    
    .signatures {
      width: 80%;
      margin-left: auto;
      margin-right: auto;
      margin-top: 10px;
      line-height: 1.6;
      font-size: 14px;
    }
    
    .signature-line {
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1px solid #999;
    }
    
    .signature-line strong {
      font-weight: bold;
    }
    
    /* Company Footer Image - Absolute positioning at bottom */
    .company-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 0;
    }
    
    .company-footer img {
      width: 100%;
      height: auto;
      display: block;
      margin: 0;
      padding: 0;
    }

    .bottom-signatures {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 14px;
      padding: 0 15px;
    }
    .bottom-signatures div {
      width: 45%;
    }
    .bottom-signatures strong {
      display: block;
      margin-bottom: 5px;
    }

    .english-numbers {
      font-family: Arial, Tahoma, sans-serif !important;
      direction: ltr !important;
      unicode-bidi: embed;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Company Header Image -->
    <div class="company-header">
      <img src="/templates/header_alkutbi.png" alt="Company Header">
    </div>
    
    <!-- Content Area -->
    <div class="content-area">
      <!-- Header Information -->
      <div class="header-info">
        <div class="header-info-right">
          <div><strong>اليوم:</strong> ${order.dayName || "—"}</div>
          <div><strong>التاريخ الميلادي:</strong> <span class="english-numbers">${toEnglishNumbers(order.dateAD) || "—"}</span></div>
          <div><strong>التاريخ الهجري:</strong> <span class="english-numbers">${toEnglishNumbers(order.dateHijri) || "—"}</span></div>
        </div>
        <div class="header-info-left">
          <div><strong>رقم أمر الشراء:</strong> <span class="english-numbers">${toEnglishNumbers(order.purchasingId) || "—"}</span></div>
          ${order.issuer?.ar_name ? `<div><strong>منشئ أمر الشراء:</strong> ${order.issuer.ar_name}</div>` : ""}
        </div>
      </div>
    
    <!-- Main Title -->
    <h1 class="main-title">أمر شراء</h1>
    
    <!-- Data Table -->
    <table class="data-table">
      ${order.transactionType ? `
      <tr>
        <td><strong>نوع المعاملة</strong></td>
        <td>${transactionTypeArabic[order.transactionType] || order.transactionType}</td>
      </tr>
      ` : ""}
      <tr>
        <td>طريقة الدفع</td>
        <td>${paymentMethodArabic[order.paymentMethod] || order.paymentMethod || "—"}</td>
      </tr>
      ${(order.bankNameFrom || order.ibanNumberFrom) ? `
      <tr>
        <td>البنك / الآيبان (من)</td>
        <td>${[order.bankNameFrom, order.ibanNumberFrom].filter(Boolean).join(" - ")}</td>
      </tr>
      ` : ""}
      ${(order.bankNameTo || order.ibanNumberTo) ? `
      <tr>
        <td>البنك / الآيبان (إلى)</td>
        <td>${[order.bankNameTo, order.ibanNumberTo].filter(Boolean).join(" - ")}</td>
      </tr>
      ` : ""}
      ${order.managementName ? `
      <tr>
        <td>اسم الإدارة</td>
        <td>${order.managementName}</td>
      </tr>
      ` : ""}
      ${order.supplier ? `
      <tr>
        <td>المورد</td>
        <td>${order.supplier}</td>
      </tr>
      ` : ""}
      ${order.item ? `
      <tr>
        <td>الصنف</td>
        <td>${order.item}</td>
      </tr>
      ` : ""}
      ${order.totalAmount ? `
      <tr>
        <td>المبلغ الإجمالي</td>
        <td><span class="english-numbers">${toEnglishNumbers(order.totalAmount.toLocaleString())}</span> ريال سعودي</td>
      </tr>
      ` : ""}
      ${order.totalAmountText ? `
      <tr>
        <td>المبلغ كتابة</td>
        <td>${order.totalAmountText}</td>
      </tr>
      ` : ""}
      ${order.deductedFrom ? `
      <tr>
        <td>يخصم من</td>
        <td>${order.deductedFrom}</td>
      </tr>
      ` : ""}
      ${order.addedTo ? `
      <tr>
        <td>يضاف إلى</td>
        <td>${order.addedTo}</td>
      </tr>
      ` : ""}
    </table>
    
    <!-- Signatures Section -->
    <div class="signatures">
      <div class="signature-line">
        <strong>التدقيق/</strong> أقر بمراجعة بيانات هذا الطلب
      </div>
      <div class="signature-line">
        أمجاد با شماخ / ................................................
      </div>
      <div class="signature-line">
        <strong>التعميد/</strong> تم اعتماد أمر الشراء أعلاه
      </div>
      <div class="signature-line">
        بلال محمد/ ................................................
      </div>
      <div class="signature-line">
        <strong>التدقيق النهائي/</strong> تم إنهاء أمر الشراء وتدقيقه
      </div>
      <div class="signature-line">
        شيماء جاوي/ ................................................
      </div>
    </div>

    <!-- Bottom Management Signatures -->
    <div class="bottom-signatures">
      <div>
        <strong>نائب مدير الموارد البشرية والمالية</strong>
        أ. رزان الريس
      </div>
      <div>
        <strong>رئيس مجلس الإدارة</strong>
        م. عبدالرزاق بديع الكتبي
      </div>
    </div>
    </div>
    
    <!-- Company Footer Image -->
    <div class="company-footer">
      <img src="/templates/footer_alkutbi.png" alt="Company Footer">
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
        title="طباعة أمر الشراء"
        disabled={isLoading}
      >
        <Printer size={16} />
      </button>
    </>
  );
};

export default PurchaseOrderPrint;
