import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import { useGetUsersQuery } from "../users/usersApiSlice";
import { useGetIncomingsQuery } from "../incomings/incomingsApiSlice";
import { useGetOutgoingsQuery } from "../outgoings/outgoingsApiSlice";
import { useGetDeathcasesQuery } from "../deathcases/deathcasesApiSlice";
import { useGetPrisoncasesQuery } from "../prisonCases/prisonCasesApiSlice";
import { useGetAssetsQuery } from "../assets/assetsApiSlice";
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

  // Check if any query is still loading
  const isLoading = isUsersLoading || isIncomingsLoading || isOutgoingsLoading || 
                    isDeathcasesLoading || isPrisoncasesLoading || isAssetsLoading;

  // Show loading spinner while any data is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

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
      value:
        isPrisoncasesSuccess && prisoncases?.ids ? prisoncases.ids.length : 0,
    },
    {
      label: "🗂️ " + t("total_assets"),
      value: isAssetsSuccess && assets?.ids ? assets.ids.length : 0,
    },
  ];

  const content = (
    <section>
      <div className="text-4xl font-bold mb-2 p-1">🏠 {t("home")}</div>
      <div className="text-2xl mb-6 p-1">
        👋 {t("login_welcome")} {userName}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg"
          >
            <p className="text-md font-bold text-gray-600 dark:text-gray-400">
              {card.label}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
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
