import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLangSwitch from "../components/PageLangSwitch";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Detect if language is RTL (like Arabic)
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="alkutbi_bg.jpg"
          alt="Modern business office"
          className="w-full h-full object-cover"
        />
        {/* Overlay with blur + transparency */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs"></div>
      </div>

      {/* Language Switcher */}
      <div className={`absolute top-6 z-30 ${isRTL ? "right-6" : "left-6"}`}>
        <PageLangSwitch />
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-2xl w-full px-6 py-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight space-y-5">
          {t("welcome")} <br />
          <span className="text-7xl font-bold bg-gradient-to-r from-green-400 to-yellow-300 bg-clip-text text-transparent">
            {t("alkutbi")}
          </span>
        </h1>

        <p className="text-xl font-bold text-gray-200 mb-8">
          {t("welcome_info")}
        </p>

        {/* Login Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowNotice(true)}
            className="cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200"
          >
            <span className="relative px-6 py-3 transition-all ease-in duration-50 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              {t("login")}
            </span>
          </button>
        </div>
      </div>

      {/* Notice Modal */}
      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            dir="rtl"
            className="bg-gray-900 border border-yellow-400/30 rounded-2xl p-8 max-w-lg mx-4 text-center shadow-2xl"
          >
            <div className="text-4xl mb-4">&#9888;&#65039;</div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              تنبيه هام
            </h3>
            <p className="text-gray-200 leading-relaxed mb-3">
              بسبب الأحداث الأخيرة، تعرّض مركز البيانات الذي يستضيف نظام مجموعة الكتبي  لهجوم، مما أدى إلى توقف الموقع مؤقتا.
            </p>
            <p className="text-gray-200 leading-relaxed mb-3">
              تم نقل النظام إلى مركز بيانات جديد ويعمل الآن بشكل طبيعي.
            </p>
            <p className="text-gray-200 leading-relaxed mb-6">
               حالياً أعمل على استعادة البيانات السابقة. يرجى الاستمرار في العمل
              كالمعتاد، وعند استعادة البيانات سيتم دمجها مع البيانات الجديدة.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              ملاحظة: في حال وجود مشاكل في تسجيل الدخول الرجاء الضغط على "استعادة كلمة المرور" وادخال بريدكم الالكتروني المضاف لدى الموارد البشرية، أو الرجاء التواصل معي عبر الواتساب (0537820352)            </p>
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2.5 px-10 rounded-lg transition-colors"
            >
              فهمت، متابعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
