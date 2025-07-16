export const getStatusRowColor = (status) => {
  switch (status) {
    case "new":
      return "bg-slate-700 ";
    case "modified":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-slate-600"; // fallback
  }
};
