import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlignLeft,
  Languages,
  Lightbulb,
  Lock,
  Mail,
  Phone,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { selectCurrentUser } from "../auth/authSlice";
import {
  useRequestFeatureMutation,
  useRequestUserMutation,
} from "./userRequestsApiSlice";

const REQUEST_TYPES = {
  USER: "user",
  FEATURE: "feature",
};

const initialUserForm = {
  fullNameArabic: "",
  fullNameEnglish: "",
  email: "",
  phoneNumber: "",
  roleExplanation: "",
};

const initialFeatureForm = {
  featureExplanation: "",
};

const userFieldOrder = [
  "fullNameArabic",
  "fullNameEnglish",
  "email",
  "phoneNumber",
  "roleExplanation",
];

const featureFieldOrder = ["requesterName", "featureExplanation"];

const getTrimmedValues = (source, fields) =>
  fields.reduce((acc, field) => {
    acc[field] = String(source[field] || "").trim();
    return acc;
  }, {});

const RequestUserForm = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const requesterName = [
    currentUser?.ar_name,
    currentUser?.en_name,
  ].filter(Boolean).join(" - ");

  const [activeRequestType, setActiveRequestType] = useState(REQUEST_TYPES.USER);
  const [userFormData, setUserFormData] = useState(initialUserForm);
  const [featureFormData, setFeatureFormData] = useState(initialFeatureForm);
  const [pendingRequestType, setPendingRequestType] = useState(null);

  const [requestUser, { isLoading: isUserRequestLoading }] =
    useRequestUserMutation();
  const [requestFeature, { isLoading: isFeatureRequestLoading }] =
    useRequestFeatureMutation();

  const isLoading = isUserRequestLoading || isFeatureRequestLoading;
  const showConfirmModal = Boolean(pendingRequestType);

  const userFields = useMemo(
    () => [
      {
        name: "fullNameArabic",
        label: t("full_name_arabic"),
        icon: Languages,
        dir: "rtl",
        autoComplete: "name",
      },
      {
        name: "fullNameEnglish",
        label: t("full_name_english"),
        icon: Languages,
        dir: "ltr",
        autoComplete: "name",
      },
      {
        name: "email",
        label: t("email"),
        icon: Mail,
        type: "email",
        dir: "ltr",
        autoComplete: "email",
      },
      {
        name: "phoneNumber",
        label: t("phone_number"),
        icon: Phone,
        type: "tel",
        dir: "ltr",
        autoComplete: "tel",
      },
      {
        name: "roleExplanation",
        label: t("role_explanation"),
        icon: AlignLeft,
        multiline: true,
      },
    ],
    [t]
  );

  const featureFields = useMemo(
    () => [
      {
        name: "requesterName",
        label: t("requester_name"),
        icon: Lock,
        locked: true,
      },
      {
        name: "featureExplanation",
        label: t("feature_explanation"),
        icon: AlignLeft,
        multiline: true,
      },
    ],
    [t]
  );

  const userTrimmedData = useMemo(
    () => getTrimmedValues(userFormData, userFieldOrder),
    [userFormData]
  );

  const featureTrimmedData = useMemo(
    () =>
      getTrimmedValues(
        { requesterName, ...featureFormData },
        featureFieldOrder
      ),
    [featureFormData, requesterName]
  );

  const tabs = [
    {
      type: REQUEST_TYPES.USER,
      label: t("add_user_request"),
      icon: UserPlus,
    },
    {
      type: REQUEST_TYPES.FEATURE,
      label: t("add_feature_request"),
      icon: Lightbulb,
    },
  ];

  const confirmConfig =
    pendingRequestType === REQUEST_TYPES.FEATURE
      ? {
          title: t("confirm_feature_request"),
          subtitle: t("confirm_feature_request_subtitle"),
          fields: featureFields,
          data: featureTrimmedData,
        }
      : {
          title: t("confirm_user_request"),
          subtitle: t("confirm_user_request_subtitle"),
          fields: userFields,
          data: userTrimmedData,
        };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:bg-gray-900";

  const handleUserChange = (field, value) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (field, value) => {
    setFeatureFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserReview = (e) => {
    e.preventDefault();

    if (!userFieldOrder.every((field) => userTrimmedData[field])) {
      toast.error(t("all_fields_required"));
      return;
    }

    setPendingRequestType(REQUEST_TYPES.USER);
  };

  const handleFeatureReview = (e) => {
    e.preventDefault();

    if (!featureTrimmedData.requesterName || !featureTrimmedData.featureExplanation) {
      toast.error(t("all_fields_required"));
      return;
    }

    setPendingRequestType(REQUEST_TYPES.FEATURE);
  };

  const handleConfirmSend = async () => {
    try {
      if (pendingRequestType === REQUEST_TYPES.FEATURE) {
        await requestFeature({
          featureExplanation: featureTrimmedData.featureExplanation,
        }).unwrap();
        toast.success(t("feature_request_sent"));
        setFeatureFormData(initialFeatureForm);
      } else {
        await requestUser(userTrimmedData).unwrap();
        toast.success(t("user_request_sent"));
        setUserFormData(initialUserForm);
      }

      setPendingRequestType(null);
    } catch (err) {
      toast.error(err?.data?.message || t("request_error"));
    }
  };

  const renderField = (field, value, onChange) => {
    const Icon = field.icon;

    return (
      <label
        key={field.name}
        className={field.multiline ? "md:col-span-2" : ""}
      >
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          <Icon size={16} className="text-gray-400" />
          {field.label}
        </span>
        {field.multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={6}
            className={`${inputClass} resize-y`}
          />
        ) : (
          <input
            type={field.type || "text"}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            dir={field.dir}
            autoComplete={field.autoComplete}
            disabled={field.locked}
            readOnly={field.locked}
            className={`${inputClass} ${
              field.locked
                ? "cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                : ""
            }`}
          />
        )}
      </label>
    );
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <section className="p-2 animate-in fade-in duration-500">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <Send size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("requests")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("requests_subtitle")}
            </p>
          </div>
        </div>

        <div className="mb-5 flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRequestType === tab.type;

            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveRequestType(tab.type)}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeRequestType === REQUEST_TYPES.USER ? (
          <form
            onSubmit={handleUserReview}
            className="max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {userFields.map((field) =>
                renderField(field, userFormData[field.name], handleUserChange)
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <Send size={17} />
                {t("send_request")}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleFeatureReview}
            className="max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {featureFields.map((field) =>
                renderField(
                  field,
                  field.name === "requesterName"
                    ? requesterName
                    : featureFormData[field.name],
                  handleFeatureChange
                )
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <Send size={17} />
                {t("send_request")}
              </button>
            </div>
          </form>
        )}
      </section>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
          onClick={() => !isLoading && setPendingRequestType(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {confirmConfig.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {confirmConfig.subtitle}
                </p>
              </div>
              <button
                onClick={() => setPendingRequestType(null)}
                disabled={isLoading}
                className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {confirmConfig.fields.map((field) => (
                <div
                  key={field.name}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60"
                >
                  <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    {field.label}
                  </div>
                  <div
                    dir={field.dir}
                    className="mt-1 whitespace-pre-wrap break-words text-center text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {confirmConfig.data[field.name]}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setPendingRequestType(null)}
                disabled={isLoading}
                className="cursor-pointer rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={isLoading}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <Send size={16} />
                {isLoading ? t("sending") : t("confirm_and_send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestUserForm;
