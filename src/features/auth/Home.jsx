import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);

  const content = (
    <section>
      <div className="text-4xl mb-2 p-1">{t("home")}</div>
      <p>{today}</p>
      <h1>Welcome!</h1>
    </section>
  );

  return content;
};

export default Home;
