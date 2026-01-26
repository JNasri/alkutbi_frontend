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
      font-family: 'Segoe UI', 'Traditional Arabic', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      text-align: right;
      background: white;
      color: #000;
      line-height: 1.4;
      font-size: 11px;
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
      text-align: right;
      font-size: 11px;
      line-height: 1.5;
      margin-bottom: 10px;
      background-color: #f9f9f9;
      padding: 8px 10px;
      border-radius: 3px;
    }
    
    .header-info div {
      margin-bottom: 3px;
    }
    
    .header-info strong {
      font-weight: bold;
      display: inline-block;
      min-width: 110px;
    }
    
    .main-title {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 8px 0;
      text-decoration: underline;
      color: #1a1a1a;
    }
    
    .subtitle {
      text-align: center;
      font-size: 11px;
      margin-bottom: 10px;
      line-height: 1.4;
      color: #333;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    
    .data-table td {
      border: 1px solid #333;
      padding: 5px 8px;
      font-size: 10px;
      line-height: 1.3;
    }
    
    .data-table td:first-child {
      font-weight: bold;
      background-color: #f0f0f0;
      width: 32%;
    }
    
    .signatures {
      margin-top: 10px;
      line-height: 1.6;
      font-size: 10px;
    }
    
    .signature-line {
      margin-bottom: 6px;
      padding-bottom: 3px;
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
      <div><strong>اليوم:</strong> ${order.dayName || "—"}</div>
      <div><strong>التاريخ الميلادي:</strong> ${order.dateAD || "—"}</div>
      <div><strong>التاريخ الهجري:</strong> ${order.dateHijri || "—"}</div>
      <div><strong>رقم أمر الشراء:</strong> ${order.purchasingId || "—"}</div>
    </div>
    
    <!-- Main Title -->
    <h1 class="main-title">أمر شراء</h1>
    
    <!-- Subtitle -->
    <p class="subtitle">
      نأمل منكم التكرم بالموافقة على إصدار أمر شراء وفق البيانات التالية
    </p>
    
    <!-- Data Table -->
    <table class="data-table">
      <tr>
        <td>طريقة الدفع</td>
        <td>${paymentMethodArabic[order.paymentMethod] || order.paymentMethod || "—"}</td>
      </tr>
      ${order.bankName ? `
      <tr>
        <td>اسم البنك</td>
        <td>${order.bankName}</td>
      </tr>
      ` : ""}
      ${order.ibanNumber ? `
      <tr>
        <td>رقم الآيبان</td>
        <td>${order.ibanNumber}</td>
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
        <td>${order.totalAmount.toLocaleString()} ريال سعودي</td>
      </tr>
      ` : ""}
      ${order.totalAmountText ? `
      <tr>
        <td>المبلغ بالحروف</td>
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
        أمجاد با شماخ / .............
      </div>
      <div class="signature-line">
        <strong>التعميد/</strong> أعتمد تنفيذ أمر الشراء أعلاه
      </div>
      <div class="signature-line">
        بلال محمد/ ................
      </div>
      <div class="signature-line">
        <strong>التدقيق النهائي/</strong> تم إنهاء أمر الشراء وتدقيقه
      </div>
      <div class="signature-line">
        شيماء جاوي/ ..................
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
