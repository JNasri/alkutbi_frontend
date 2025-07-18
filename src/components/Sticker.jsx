// routes/StickerPage.jsx
import moment from "moment-hijri";
import { useSearchParams } from "react-router-dom";

const Sticker = () => {
  const [params] = useSearchParams();
  const identifier = params.get("identifier");
  const date = params.get("date");
  const hijriDate = moment(date).format("iYYYY/iM/iD");

  return (
    <div
      style={{
        width: "5cm",
        height: "3cm",
        padding: "0.2cm",
        fontSize: "10px",
        fontWeight: "bold",
        direction: "rtl",
        backgroundColor: "#fff",
        border: "2px solid #000",
        margin: "1cm auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.3cm",
        boxSizing: "border-box",
      }}
      onLoad={() => window.print()}
    >
      {/* Text Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "right",
          flexShrink: 1, // allow shrinking
          minWidth: 0, // allow flexbox to shrink below content width
          overflowWrap: "break-word", // break long words/numbers
          maxWidth: "calc(5cm - 1.8cm - 0.6cm)", // max width = total width - image width - gaps/padding
        }}
      >
        <div>التاريخ : {hijriDate}هـ</div>
        <div>الموافق: {date}مـ</div>
        <div>رقــــــم : {identifier}</div>
      </div>

      {/* Image Section */}
      <img
        src="/stickerlogo.png"
        alt="stamp"
        style={{
          width: "1.6cm",
          height: "3cm",
          objectFit: "contain",
          flexShrink: 0, // prevent image from shrinking
        }}
      />
    </div>
  );
};

export default Sticker;
