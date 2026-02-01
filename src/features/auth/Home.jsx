import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import { useGetUsersQuery } from "../users/usersApiSlice";
import { useGetIncomingsQuery } from "../incomings/incomingsApiSlice";
import { useGetOutgoingsQuery } from "../outgoings/outgoingsApiSlice";
import { useGetDeathcasesQuery } from "../deathcases/deathcasesApiSlice";
import { useGetPrisoncasesQuery } from "../prisonCases/prisonCasesApiSlice";
import { useGetAssetsQuery } from "../assets/assetsApiSlice";
import { useGetPurchaseOrdersQuery } from "../purchaseOrders/purchaseOrdersApiSlice";
import { useGetCollectionOrdersQuery } from "../collectionOrders/collectionOrdersApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import LoadingSpinner from "../../components/LoadingSpinner";

const Home = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const currentLang = i18n.language;
  const userName = currentLang === "ar" ? user.ar_name : user.en_name;

  // Data queries with destructured results including loading states
  const { data: users, isSuccess: isUsersSuccess, isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: incomings, isSuccess: isIncomingsSuccess, isLoading: isIncomingsLoading } =
    useGetIncomingsQuery();
  const { data: outgoings, isSuccess: isOutgoingsSuccess, isLoading: isOutgoingsLoading } =
    useGetOutgoingsQuery();
  const { data: deathcases, isSuccess: isDeathcasesSuccess, isLoading: isDeathcasesLoading } =
    useGetDeathcasesQuery();
  const { data: prisoncases, isSuccess: isPrisoncasesSuccess, isLoading: isPrisoncasesLoading } =
    useGetPrisoncasesQuery();
  const { data: assets, isSuccess: isAssetsSuccess, isLoading: isAssetsLoading } = useGetAssetsQuery();
  const { data: purchaseOrders, isSuccess: isPOSuccess, isLoading: isPOLoading } = useGetPurchaseOrdersQuery();
  const { data: collectionOrders, isSuccess: isCOSuccess, isLoading: isCOLoading } = useGetCollectionOrdersQuery();

  // Check if any query is still loading
  const isLoading = isUsersLoading || isIncomingsLoading || isOutgoingsLoading || 
                    isDeathcasesLoading || isPrisoncasesLoading || isAssetsLoading ||
                    isPOLoading || isCOLoading;

  // Show loading spinner while any data is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Calculate totals for purchase and collection
  const totalPurchaseAmount = isPOSuccess && purchaseOrders?.ids 
    ? purchaseOrders.ids.reduce((sum, id) => sum + (purchaseOrders.entities[id].totalAmount || 0), 0)
    : 0;
  
  const totalCollectionAmount = isCOSuccess && collectionOrders?.ids
    ? collectionOrders.ids.reduce((sum, id) => sum + (collectionOrders.entities[id].totalAmount || 0), 0)
    : 0;

  const balance = totalCollectionAmount - totalPurchaseAmount;

  // Cards with safe data access
  const cards = [
    {
      label: "🙍🏻‍♂️ " + t("total_users"),
      value: isUsersSuccess && users?.ids ? users.ids.length : 0,
    },
    {
      label: "📩 " + t("total_incomings"),
      value: isIncomingsSuccess && incomings?.ids ? incomings.ids.length : 0,
    },
    {
      label: "📨 " + t("total_outgoings"),
      value: isOutgoingsSuccess && outgoings?.ids ? outgoings.ids.length : 0,
    },
    {
      label: "⚰️ " + t("total_deathcases"),
      value: isDeathcasesSuccess && deathcases?.ids ? deathcases.ids.length : 0,
    },
    {
      label: "⛓️ " + t("total_prisoncases"),
      value: isPrisoncasesSuccess && prisoncases?.ids ? prisoncases.ids.length : 0,
    },
    {
      label: "🗂️ " + t("total_assets"),
      value: isAssetsSuccess && assets?.ids ? assets.ids.length : 0,
    },
    {
      label: "🛒 " + t("total_purchase_orders"),
      value: isPOSuccess && purchaseOrders?.ids ? purchaseOrders.ids.length : 0,
    },
    {
      label: "💰 " + t("total_collection_orders"),
      value: isCOSuccess && collectionOrders?.ids ? collectionOrders.ids.length : 0,
    },
    {
      label: "📉 " + ` ${t("purchase_orders")}`,
      value: `${totalPurchaseAmount.toLocaleString()} ${t("sar")}`,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "📈 " + ` ${t("collection_orders")}`,
      value: `${totalCollectionAmount.toLocaleString()} ${t("sar")}`,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "⚖️ " + t("total_balance"),
      value: `${balance.toLocaleString()} ${t("sar")}`,
      large: true
    },
  ];

  const content = (
    <section>
      <div className="text-4xl font-bold mb-2 p-1">🏠 {t("home")}</div>
      <div className="text-2xl mb-6 p-1">
        👋 {t("login_welcome")} {userName}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg ${card.large ? "lg:col-span-2 xl:col-span-1" : ""}`}
          >
            <p className="text-md font-bold text-gray-600 dark:text-gray-400 mb-1">
              {card.label}
            </p>
            <h3 className={`text-2xl font-bold ${card.color || "text-gray-900 dark:text-white"}`}>
              {card.value}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );

  return content;
};

export default Home;
