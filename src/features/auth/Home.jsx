import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";

const Home = () => {
  const { t } = useTranslation();
  const { username, status } = useAuth();

  const content = (
    <section>
      <div className="text-4xl mb-2 p-1">{t("home")}</div>
      <div className="text-2xl mb-2 p-1">
        {t("welcome_user")} {username}
        <br />
        {t("roles")} : {status}
      </div>
      <div className="flex flex-col lg:flex-row gap-8 my-4">
        <img
          src="alkutbi_bg.jpg"
          className="w-full lg:w-1/2 rounded-lg shadow-md object-cover"
        />
        <div className="w-full lg:w-1/2 px-2">
          <p className="text-gray-700 dark:text-gray-300 text-3xl leading-15">
            {t("home_description")}
            <br />
            <br />
            {t("home_description_2")}
            <br />
            <br />
            {t("home_description_3")}
          </p>
        </div>
      </div>
    </section>
  );

  return content;
};

export default Home;
