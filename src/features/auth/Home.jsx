import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import { useGetIncomingsQuery } from "../incomings/incomingsApiSlice";
import { useGetOutgoingsQuery } from "../outgoings/outgoingsApiSlice";
import { useGetDeathcasesQuery } from "../deathCases/deathCasesApiSlice";
import { useGetPrisoncasesQuery } from "../prisonCases/prisonCasesApiSlice";
import { useGetAssetsQuery } from "../assets/assetsApiSlice";
import { useGetPurchaseOrdersQuery } from "../purchaseOrders/purchaseOrdersApiSlice";
import { useGetCollectionOrdersQuery } from "../collectionOrders/collectionOrdersApiSlice";
import { useGetLogsQuery } from "../logger/logsApiSlice";
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
  const { data: users, isSuccess: isUsersSuccess, isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: incomings, isSuccess: isIncomingsSuccess, isLoading: isIncomingsLoading } = useGetIncomingsQuery();
  const { data: outgoings, isSuccess: isOutgoingsSuccess, isLoading: isOutgoingsLoading } = useGetOutgoingsQuery();
  const { data: deathcases, isSuccess: isDeathcasesSuccess, isLoading: isDeathcasesLoading } = useGetDeathcasesQuery();
  const { data: prisoncases, isSuccess: isPrisoncasesSuccess, isLoading: isPrisoncasesLoading } = useGetPrisoncasesQuery();
  const { data: assets, isSuccess: isAssetsSuccess, isLoading: isAssetsLoading } = useGetAssetsQuery();
  const { data: purchaseOrders, isSuccess: isPOSuccess, isLoading: isPOLoading } = useGetPurchaseOrdersQuery();
  const { data: collectionOrders, isSuccess: isCOSuccess, isLoading: isCOLoading } = useGetCollectionOrdersQuery();
  const { data: logs, isSuccess: isLogsSuccess, isLoading: isLogsLoading } = useGetLogsQuery();

  const isLoading = isUsersLoading || isIncomingsLoading || isOutgoingsLoading || 
                    isDeathcasesLoading || isPrisoncasesLoading || isAssetsLoading ||
                    isPOLoading || isCOLoading || isLogsLoading;

  if (isLoading) return <LoadingSpinner />;

  // Financial Calculations
  const totalPurchaseAmount = isPOSuccess && purchaseOrders?.ids 
    ? purchaseOrders.ids.reduce((sum, id) => sum + (purchaseOrders.entities[id].totalAmount || 0), 0)
    : 0;

  // Total Purchase Amount but without the purchase orders that are made by visa
  const totalPurchaseAmountWithoutVisa = isPOSuccess && purchaseOrders?.ids 
    ? purchaseOrders.ids.reduce((sum, id) => {
        const order = purchaseOrders.entities[id];
        return order.paymentMethod !== 'visa' ? sum + (order.totalAmount || 0) : sum;
      }, 0)
    : 0;
  
  const totalCollectionAmount = isCOSuccess && collectionOrders?.ids
    ? collectionOrders.ids.reduce((sum, id) => sum + (collectionOrders.entities[id].totalAmount || 0), 0)
    : 0;

  const purchaseCashTotal = isPOSuccess && purchaseOrders?.ids
    ? purchaseOrders.ids.reduce((sum, id) => {
        const order = purchaseOrders.entities[id];
        return order.paymentMethod === 'cash' ? sum + (order.totalAmount || 0) : sum;
      }, 0)
    : 0;

  const purchaseNonCashTotal = isPOSuccess && purchaseOrders?.ids
    ? purchaseOrders.ids.reduce((sum, id) => {
        const order = purchaseOrders.entities[id];
        const isNonCash = ['visa', 'bank_transfer', 'sadad'].includes(order.paymentMethod);
        return isNonCash ? sum + (order.totalAmount || 0) : sum;
      }, 0)
    : 0;

  const collectionCashTotal = isCOSuccess && collectionOrders?.ids
    ? collectionOrders.ids.reduce((sum, id) => {
        const order = collectionOrders.entities[id];
        return order.collectMethod === 'cash' ? sum + (order.totalAmount || 0) : sum;
      }, 0)
    : 0;

  const collectionBankTotal = isCOSuccess && collectionOrders?.ids
    ? collectionOrders.ids.reduce((sum, id) => {
        const order = collectionOrders.entities[id];
        return order.collectMethod === 'bank_transfer' ? sum + (order.totalAmount || 0) : sum;
      }, 0)
    : 0;

  const balance = totalCollectionAmount - totalPurchaseAmount;

  // Section Config
  const managementCards = [
    { label: t("total_users"), value: isUsersSuccess ? users.ids.length : 0, icon: Users },
    { label: t("audit_logs"), value: isLogsSuccess && logs ? Object.keys(logs).length : 0, icon: Scroll },
    { label: t("total_assets"), value: isAssetsSuccess ? assets.ids.length : 0, icon: Package },
  ];

  const poCards = [
    { label: t("total_purchase_orders"), value: isPOSuccess ? purchaseOrders.ids.length : 0, icon: ShoppingCart },
    { label: t("purchase_orders_without_visa"), value: `${totalPurchaseAmountWithoutVisa.toLocaleString()} ${t("sar")}`, color: "text-red-600 dark:text-red-400", icon: TrendingDown },
    { label: t("purchase_cash_total"), value: `${purchaseCashTotal.toLocaleString()} ${t("sar")}`, color: "text-red-500", icon: Wallet },
    { label: t("purchase_non_cash_total"), value: `${purchaseNonCashTotal.toLocaleString()} ${t("sar")}`, color: "text-red-500", icon: CreditCard },
  ];

  const coCards = [
    { label: t("total_collection_orders"), value: isCOSuccess ? collectionOrders.ids.length : 0, icon: Coins },
    { label: t("collection_orders"), value: `${totalCollectionAmount.toLocaleString()} ${t("sar")}`, color: "text-green-600 dark:text-green-400", icon: TrendingUp },
    { label: t("collection_cash_total"), value: `${collectionCashTotal.toLocaleString()} ${t("sar")}`, color: "text-green-500", icon: CircleDollarSign },
    { label: t("collection_bank_total"), value: `${collectionBankTotal.toLocaleString()} ${t("sar")}`, color: "text-green-500", icon: Landmark },
  ];

  const specialPapersCards = [
    { label: t("total_incomings"), value: isIncomingsSuccess ? incomings.ids.length : 0, icon: FileText },
    { label: t("total_outgoings"), value: isOutgoingsSuccess ? outgoings.ids.length : 0, icon: FileText },
    { label: t("total_deathcases"), value: isDeathcasesSuccess ? deathcases.ids.length : 0, icon: Skull },
    { label: t("total_prisoncases"), value: isPrisoncasesSuccess ? prisoncases.ids.length : 0, icon: ShieldAlert },
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
