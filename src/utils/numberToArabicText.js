// Convert numbers to Arabic text in Saudi Riyals with Halalas
export const numberToArabicText = (num) => {
  if (!num || isNaN(num)) return "";
  
  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  
  const tens = [
    "",
    "عشرة",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  
  const hundreds = [
    "",
    "مائة",
    "مائتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];
  
  const teens = [
    "عشرة",
    "أحد عشر",
    "اثنا عشر",
    "ثلاثة عشر",
    "أربعة عشر",
    "خمسة عشر",
    "ستة عشر",
    "سبعة عشر",
    "ثمانية عشر",
    "تسعة عشر",
  ];

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    
    let result = "";
    
    // Hundreds
    const h = Math.floor(n / 100);
    if (h > 0) {
      result += hundreds[h];
      n %= 100;
      if (n > 0) result += " و";
    }
    
    // Tens and ones
    if (n >= 10 && n < 20) {
      result += teens[n - 10];
    } else {
      const t = Math.floor(n / 10);
      const o = n % 10;
      
      if (t > 0) {
        result += tens[t];
        if (o > 0) result += " و";
      }
      
      if (o > 0) {
        result += ones[o];
      }
    }
    
    return result;
  };

  // Split into riyals and halalas
  const riyals = Math.floor(num);
  const halalas = Math.round((num - riyals) * 100);
  
  let result = "";
  
  // Convert Riyals
  if (riyals === 0) {
    result = "صفر ريال سعودي";
  } else {
    // Millions
    const millions = Math.floor(riyals / 1000000);
    if (millions > 0) {
      if (millions === 1) {
        result += "مليون";
      } else if (millions === 2) {
        result += "مليونان";
      } else if (millions >= 3 && millions <= 10) {
        result += convertLessThanThousand(millions) + " ملايين";
      } else {
        result += convertLessThanThousand(millions) + " مليون";
      }
    }
    
    // Thousands
    const thousands = Math.floor((riyals % 1000000) / 1000);
    if (thousands > 0) {
      if (result) result += " و";
      
      if (thousands === 1) {
        result += "ألف";
      } else if (thousands === 2) {
        result += "ألفان";
      } else if (thousands >= 3 && thousands <= 10) {
        result += convertLessThanThousand(thousands) + " آلاف";
      } else {
        result += convertLessThanThousand(thousands) + " ألف";
      }
    }
    
    // Remaining hundreds, tens, ones
    const remainder = riyals % 1000;
    if (remainder > 0) {
      if (result) result += " و";
      result += convertLessThanThousand(remainder);
    }
    
    result += " ريال سعودي";
  }
  
  // Add Halalas if present
  if (halalas > 0) {
    result += " و";
    result += convertLessThanThousand(halalas);
    result += " هللة";
  }
  
  // Always add "فقط لا غير" at the end
  result += " فقط لا غير";
  
  return result;
};
