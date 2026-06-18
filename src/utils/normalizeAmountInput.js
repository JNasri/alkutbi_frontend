export const normalizeAmountInput = (value = "") => {
  const cleaned = String(value).replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [wholePart, ...decimalParts] = cleaned.split(".");

  return decimalParts.length
    ? `${wholePart}.${decimalParts.join("")}`
    : wholePart;
};
