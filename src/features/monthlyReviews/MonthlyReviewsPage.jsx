import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Save, Star, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import {
  useGetMonthlyReviewWorkspaceQuery,
  useDeleteMonthlyReviewMutation,
  useSaveMonthlyReviewMutation,
} from "./monthlyReviewsApiSlice";
import MonthlyReviewPrint from "./MonthlyReviewPrint";
import { normalizeRoles, ROLE_GROUPS } from "../../config/roles";

const currentMonth = () => new Date().toISOString().slice(0, 7);
const annualReviewYearOption = "2025";

const buildMonthOptions = (language) => {
  const year = new Date().getFullYear();
  const locale = language?.startsWith("ar") ? "ar" : "en";
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });

  const currentYearMonths = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const date = new Date(year, index, 1);
    return {
      value: `${year}-${month}`,
      label: formatter.format(date),
    };
  });

  return [
    {
      value: annualReviewYearOption,
      label: annualReviewYearOption,
    },
    ...currentYearMonths,
  ];
};

const fallbackQuestions = Array.from({ length: 20 }, (_, index) => ({
  key: `q${index + 1}`,
  labelKey: `monthly_review_q${index + 1}`,
  maxScore: 5,
}));

const departmentLabelKeys = {
  chairman: "role_group_chairman",
  finance: "role_group_finance",
  operation: "role_group_operation",
  special_papers: "role_group_special_papers",
  marketing: "role_group_marketing",
  quality: "role_group_quality",
  transport: "role_group_transport",
  makkah: "role_group_makkah",
  airport: "role_group_airport",
  madinah: "role_group_madinah",
  hotel: "role_group_hotel",
};

// Frontend-only monthly review visibility exclusions.
// Add usernames exactly as they appear in User.username under the department label key.
// Matching is case-insensitive.
const hiddenMonthlyReviewUsernamesByDepartmentLabelKey = {
  role_group_finance: ["Ameer", "Rahili", "Tasnim"],
};

const normalizeUsername = (username = "") =>
  String(username).trim().toLowerCase();

const getDepartmentLabelKeysForUser = (user) => {
  const userRoles = normalizeRoles(user?.roles);

  return ROLE_GROUPS.filter((group) =>
    group.roles.some((role) => userRoles.includes(role)),
  ).map((group) => group.labelKey);
};

const shouldHideMonthlyReviewUser = (
  user,
  departmentLabelKeyFallback = null,
) => {
  const username = normalizeUsername(user?.username);
  if (!username) return false;

  const labelKeys = departmentLabelKeyFallback
    ? [departmentLabelKeyFallback]
    : getDepartmentLabelKeysForUser(user);

  return labelKeys.some((labelKey) =>
    (hiddenMonthlyReviewUsernamesByDepartmentLabelKey[labelKey] || [])
      .map(normalizeUsername)
      .includes(username),
  );
};

const getDisplayName = (user, language) =>
  language?.startsWith("ar")
    ? user?.ar_name || user?.en_name || user?.username || "-"
    : user?.en_name || user?.ar_name || user?.username || "-";

const calculateTotal = (questions, answers) =>
  questions.reduce(
    (total, question) => total + Number(answers[question.key] || 0),
    0,
  );

const MonthlyReviewsPage = () => {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(currentMonth());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSavedReview, setLastSavedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMonthlyReviewWorkspaceQuery(month);

  const [saveMonthlyReview, { isLoading: isSaving }] =
    useSaveMonthlyReviewMutation();
  const [deleteMonthlyReview, { isLoading: isDeleting }] =
    useDeleteMonthlyReviewMutation();

  const questions = data?.questions?.length
    ? data.questions
    : fallbackQuestions;
  const employees = useMemo(
    () =>
      (data?.eligibleEmployees || []).filter(
        (employee) => !shouldHideMonthlyReviewUser(employee),
      ),
    [data?.eligibleEmployees],
  );
  const visibleReviews = useMemo(
    () =>
      (data?.reviews || []).filter(
        (review) =>
          !shouldHideMonthlyReviewUser(
            review.employee,
            departmentLabelKeys[review.departmentKey],
          ),
      ),
    [data?.reviews],
  );
  const monthOptions = useMemo(
    () => buildMonthOptions(i18n.language),
    [i18n.language],
  );

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  );

  useEffect(() => {
    if (!employees.length) {
      setSelectedEmployeeId("");
      return;
    }

    setSelectedEmployeeId((currentId) =>
      employees.some((employee) => employee.id === currentId)
        ? currentId
        : employees[0].id,
    );
  }, [employees]);

  useEffect(() => {
    if (!selectedEmployee) {
      setAnswers({});
      setNotes("");
      return;
    }

    setAnswers(selectedEmployee.currentReview?.answers || {});
    setNotes(selectedEmployee.currentReview?.notes || "");
  }, [selectedEmployee]);

  useEffect(() => {
    setLastSavedReview(null);
  }, [month, selectedEmployeeId]);

  const answeredCount = questions.filter(
    (question) => answers[question.key],
  ).length;
  const totalScore = calculateTotal(questions, answers);
  const averageScore = answeredCount
    ? Math.round((totalScore / answeredCount) * 100) / 100
    : 0;
  const canSave =
    selectedEmployee && answeredCount === questions.length && !isSaving;

  const onAnswerChanged = (questionKey, score) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionKey]: score,
    }));
  };

  const onSaveClicked = async () => {
    if (!canSave) return;
    setShowConfirmModal(true);
  };

  const onConfirmSaveClicked = async () => {
    if (!canSave) return;
    try {
      const result = await saveMonthlyReview({
        month,
        employee: selectedEmployee.id,
        answers,
        notes,
      }).unwrap();
      setShowConfirmModal(false);
      setLastSavedReview(result.review);
      toast.success(t("monthly_review_saved"));
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("monthly_review_save_error"));
    }
  };

  const onConfirmDeleteClicked = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteMonthlyReview({ id: reviewToDelete.id, month }).unwrap();
      setLastSavedReview((currentReview) =>
        currentReview?.id === reviewToDelete.id ? null : currentReview,
      );
      setReviewToDelete(null);
      toast.success(t("monthly_review_deleted"));
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("monthly_review_delete_error"));
    }
  };

  if (isLoading && !data) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-gray-800 dark:text-red-300">
        {error?.data?.message || t("monthly_review_load_error")}
      </div>
    );
  }

  return (
    <>
      {(isFetching || isSaving || isDeleting) && <LoadingSpinner />}
      <div className="space-y-5">
        <div className="flex flex-col gap-3 p-1 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              {t("monthly_reviews")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {t("monthly_reviews_subtitle")}
            </p>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {monthOptions.map((monthOption) => (
                <option key={monthOption.value} value={monthOption.value}>
                  {monthOption.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title={t("refresh")}
            >
              <RefreshCw
                size={18}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {t("employees_to_review")}
            </h2>

            {!employees.length ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                {t("no_employees_to_review")}
              </p>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => {
                  const isSelected = selectedEmployeeId === employee.id;
                  const isReviewed =
                    Boolean(employee.currentReview) ||
                    lastSavedReview?.employee?.id === employee.id;
                  const reviewStateClass = isReviewed
                    ? "border-green-300 bg-green-50 text-green-950 hover:bg-green-100 dark:border-green-700 dark:bg-green-950/40 dark:text-green-100 dark:hover:bg-green-900/50"
                    : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-700";
                  const selectedClass = isSelected
                    ? "ring-2 ring-cyan-500 ring-offset-1 ring-offset-white dark:ring-cyan-300 dark:ring-offset-gray-800"
                    : "";
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => setSelectedEmployeeId(employee.id)}
                      className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-start transition ${reviewStateClass} ${selectedClass}`}
                    >
                      <span className="block text-sm font-semibold">
                        {getDisplayName(employee, i18n.language)}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          isReviewed
                            ? "font-semibold text-green-700 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {isReviewed ? t("reviewed") : t("not_reviewed")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedEmployee
                    ? getDisplayName(selectedEmployee, i18n.language)
                    : t("choose_employee")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {t("answered_questions", {
                    answered: answeredCount,
                    total: questions.length,
                  })}
                </p>
              </div>
              <div className="ms-auto flex flex-wrap items-center gap-2">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                  {t("total_score")}: {totalScore}/100
                </div>
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                  {t("average_score")}: {averageScore}/5
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-10">
              {questions.map((question, index) => (
                <div
                  key={question.key}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(question.labelKey)}
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const active = Number(answers[question.key]) === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          disabled={!selectedEmployee}
                          onClick={() => onAnswerChanged(question.key, score)}
                          className={`inline-flex cursor-pointer items-center justify-center rounded-md border px-2 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                              ? "border-yellow-500 bg-yellow-100 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-950 dark:text-yellow-100"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Star
                            size={14}
                            className={active ? "fill-current" : ""}
                          />
                          <span className="ms-1">{score}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <label className="mt-4 block text-sm font-medium text-gray-900 dark:text-white">
              {t("notes")}
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={!selectedEmployee}
                rows={3}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={!canSave}
                onClick={onSaveClicked}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <Save size={18} />
                {t("save_review")}
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t("monthly_reviews_list")}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                <tr>
                  <th className="px-3 py-2 text-start">{t("employee_name")}</th>
                  <th className="px-3 py-2 text-start">{t("reviewer")}</th>
                  <th className="px-3 py-2 text-start">{t("department")}</th>
                  <th className="px-3 py-2 text-start">{t("total_score")}</th>
                  <th className="px-3 py-2 text-start">{t("average_score")}</th>
                  <th className="px-3 py-2 text-start">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {visibleReviews.map((review) => (
                  <tr key={review.id} className="dark:text-gray-100">
                    <td className="px-3 py-2">
                      {getDisplayName(review.employee, i18n.language)}
                    </td>
                    <td className="px-3 py-2">
                      {getDisplayName(review.reviewer, i18n.language)}
                    </td>
                    <td className="px-3 py-2">
                      {t(
                        departmentLabelKeys[review.departmentKey] ||
                          review.departmentName,
                      )}
                    </td>
                    <td className="px-3 py-2">{review.totalScore}/100</td>
                    <td className="px-3 py-2">{review.averageScore}/5</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <MonthlyReviewPrint
                          review={review}
                          questions={questions}
                          signatureUsers={data?.signatureUsers}
                          buttonLabel={t("print")}
                        />
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(review)}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                          title={t("remove_review")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleReviews.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      {t("no_monthly_reviews_found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showConfirmModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
              <div className="mb-4 flex items-start gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("confirm_monthly_review")}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    {t("confirm_monthly_review_subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="ms-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{t("employee_name")}</span>
                  <span>{getDisplayName(selectedEmployee, i18n.language)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{t("select_date")}</span>
                  <span>
                    {monthOptions.find((item) => item.value === month)?.label ||
                      month}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">
                    {t("answered_questions_label")}
                  </span>
                  <span>
                    {answeredCount}/{questions.length}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{t("total_score")}</span>
                  <span>{totalScore}/100</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{t("average_score")}</span>
                  <span>{averageScore}/5</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="cursor-pointer rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={onConfirmSaveClicked}
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {t("confirm_and_send")}
                </button>
              </div>
            </div>
          </div>
        )}
        <DeleteConfirmModal
          isOpen={!!reviewToDelete}
          onCancel={() => setReviewToDelete(null)}
          onConfirm={onConfirmDeleteClicked}
          title={t("confirm_delete_monthly_review")}
          confirmLabel={t("remove_review")}
        />
      </div>
    </>
  );
};

export default MonthlyReviewsPage;
