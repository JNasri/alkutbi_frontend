import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetDashboardSummaryQuery } from "../dashboard/dashboardApiSlice";
import LoadingSpinner from "../../components/LoadingSpinner";
import { 
  Users, 
  ShoppingCart, 
  HandCoins, 
  Scale, 
  Wallet, 
  CreditCard, 
  CircleDollarSign, 
  Landmark, 
  FileText, 
  Skull, 
  ShieldAlert, 
  Package,
  TrendingUp,
  TrendingDown,
  Scroll,
  Coins
} from "lucide-react";

const Home = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const currentLang = i18n.language;
  const userName = currentLang === "ar" ? user?.ar_name : user?.en_name;

  // Data queries
  const { data: dStat, isSuccess, isLoading } = useGetDashboardSummaryQuery();

  if (isLoading) return <LoadingSpinner />;

  // Financial Calculations mapped from DB Aggregation
  const balance = isSuccess ? dStat.balance : 0;
  const totalPurchaseAmount = isSuccess ? dStat.totalPurchaseAmount : 0;
  const totalPurchaseAmountWithoutVisa = isSuccess ? dStat.totalPurchaseAmountWithoutVisa : 0;
  const totalCollectionAmount = isSuccess ? dStat.totalCollectionAmount : 0;
  const purchaseCashTotal = isSuccess ? dStat.purchaseCashTotal : 0;
  const purchaseNonCashTotal = isSuccess ? dStat.purchaseNonCashTotal : 0;
  const collectionCashTotal = isSuccess ? dStat.collectionCashTotal : 0;
  const collectionBankTotal = isSuccess ? dStat.collectionBankTotal : 0;

  // Section Config
  const managementCards = [
    { label: t("total_users"), value: isSuccess ? dStat.usersCount : 0, icon: Users },
    { label: t("audit_logs"), value: isSuccess ? dStat.logsCount : 0, icon: Scroll },
    { label: t("total_assets"), value: isSuccess ? dStat.assetsCount : 0, icon: Package },
  ];

  const poCards = [
    { label: t("total_purchase_orders"), value: isSuccess ? dStat.purchaseOrdersCount : 0, icon: ShoppingCart },
    { label: t("purchase_orders_without_visa"), value: `${totalPurchaseAmountWithoutVisa.toLocaleString()} ${t("sar")}`, color: "text-red-600 dark:text-red-400", icon: TrendingDown },
    { label: t("purchase_cash_total"), value: `${purchaseCashTotal.toLocaleString()} ${t("sar")}`, color: "text-red-500", icon: Wallet },
    { label: t("purchase_non_cash_total"), value: `${purchaseNonCashTotal.toLocaleString()} ${t("sar")}`, color: "text-red-500", icon: CreditCard },
  ];

  const coCards = [
    { label: t("total_collection_orders"), value: isSuccess ? dStat.collectionOrdersCount : 0, icon: Coins },
    { label: t("collection_orders"), value: `${totalCollectionAmount.toLocaleString()} ${t("sar")}`, color: "text-green-600 dark:text-green-400", icon: TrendingUp },
    { label: t("collection_cash_total"), value: `${collectionCashTotal.toLocaleString()} ${t("sar")}`, color: "text-green-500", icon: CircleDollarSign },
    { label: t("collection_bank_total"), value: `${collectionBankTotal.toLocaleString()} ${t("sar")}`, color: "text-green-500", icon: Landmark },
  ];

  const specialPapersCards = [
    { label: t("total_incomings"), value: isSuccess ? dStat.incomingsCount : 0, icon: FileText },
    { label: t("total_outgoings"), value: isSuccess ? dStat.outgoingsCount : 0, icon: FileText },
    { label: t("total_deathcases"), value: isSuccess ? dStat.deathcasesCount : 0, icon: Skull },
    { label: t("total_prisoncases"), value: isSuccess ? dStat.prisoncasesCount : 0, icon: ShieldAlert },
  ];

  const CardGrid = ({ cards }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-2">
            {card.icon && <card.icon size={18} className="text-gray-400 dark:text-gray-500" />}
            <p className={`text-sm font-bold text-gray-500 dark:text-gray-400`}>
              {card.label}
            </p>
          </div>
          <h3 className={`text-xl font-bold ${card.color || "text-gray-900 dark:text-white"}`}>
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="mb-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
        {title}
      </h2>
      <hr className="border-gray-400 dark:border-gray-600 mt-3" />
    </div>
  );

  return (
    <section className="p-2 animate-in fade-in duration-500">
      <div className="text-4xl font-bold mb-2">🏠 {t("home")}</div>
      <div className={`text-2xl mb-10 text-gray-600 dark:text-gray-400 ${currentLang === 'en' ? 'uppercase tracking-tight' : ''}`}>
        👋 {t("login_welcome")} <span className={`text-gray-900 dark:text-white ${currentLang === 'ar' ? 'font-bold' : 'font-black'}`}>{userName}</span>
      </div>

      {/* Management Section */}
      <SectionHeader title={t("management_header")} />
      <CardGrid cards={managementCards} />

      {/* Finance Section */}
      <SectionHeader title={t("finance_header")} />
      
      {/* Row 1: Balance - Premium Card */}
      <div className="mb-10">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl shadow-sm inline-block min-w-[320px]">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="text-blue-500" size={20} />
            <p className={`text-sm font-bold text-blue-600 dark:text-blue-400 ${currentLang === 'en' ? 'uppercase tracking-widest' : ''}`}>
              {t("total_balance")}
            </p>
          </div>
          <h3 className={`text-2xl font-black text-blue-700 dark:text-blue-100`}>
            {`${balance.toLocaleString()} ${t("sar")}`}
          </h3>
        </div>
      </div>

      {/* Row 2: Purchase Orders */}
      <div className={`mb-2 text-md text-gray-800 dark:text-gray-100 ml-1 ${currentLang === 'en' ? 'uppercase tracking-widest' : ''}`}>{t("purchase_orders")}</div>
      <CardGrid cards={poCards} />
      
      {/* Row 3: Collection Orders */}
      <div className={`mb-2 text-md  text-gray-800 dark:text-gray-100 ml-1 ${currentLang === 'en' ? 'uppercase tracking-widest' : ''}`}>{t("collection_orders")}</div>
      <CardGrid cards={coCards} />

      {/* Special Papers Section */}
      <SectionHeader title={t("special_papers_header")} />
      <CardGrid cards={specialPapersCards} />
    </section>
  );
};

export default Home;
