import { useState, useEffect, useCallback } from "react";
import { useUpdateVoucherMutation } from "./vouchersApiSlice";
import { useNavigate } from "react-router-dom";
import { nationalities } from "../../config/nationalities";
import { agents } from "../../config/agents";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

const EditVoucherForm = ({ voucher }) => {
  // edit voucher
  const [updateVoucher, { isLoading, isSuccess, isError, error }] =
    useUpdateVoucherMutation();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [operationNumber, setOperationNumber] = useState(
    voucher.operationNumber
  );
  const [voucherStatus, setVoucherStatus] = useState("modified");
  const [agentName, setAgentName] = useState(voucher.agentName);
  const [nationality, setNationality] = useState(voucher.nationality);
  const [numberOfPax, setNumberOfPax] = useState(voucher.numberOfPax);
  const [voucherNumber, setVoucherNumber] = useState(
    voucher.voucherNumber || ""
  );
  const [groupNumber, setGroupNumber] = useState(voucher.groupNumber);
  const [groupLeaderNumber, setGroupLeaderNumber] = useState(
    voucher.groupLeaderNumber || ""
  );
  const [numberOfMovements, setNumberOfMovements] = useState(
    voucher.numberOfMovements || 1
  );
  const createMovement = () => ({
    type: "", // Default movement type
    from: "", // From location
    to: "", // To location
    date: "", // Date of movement
    flightNumber: "", // Flight number (optional)
    hour: "", // Hour of movement (optional)
    gate: "", // Gate of movement (optional)
    bussArrivalTime: "",
    transportationCompany: "",
    driverName: "",
    driverNumber: "",
    caseTaker: "",
    caseGiver: "",
    notes: "",
  });
  const [movements, setMovements] = useState(voucher.movements);
  const [file, setFile] = useState(voucher.fileUrl || "");

  //
  //
  //
  //
  //

  // dropZone for the file upload
  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      maxFiles: 1,
    });

  //
  //
  //
  //
  //

  // useEffects for some functionalities
  useEffect(() => {
    if (isSuccess) {
      setAgentName("");
      setNationality("");
      setNumberOfPax("");
      setVoucherNumber("");
      setGroupNumber("");
      setGroupLeaderNumber("");
      setNumberOfMovements(5);
      setMovements([createMovement()]);
      setFile(null);
      navigate("/dash/vouchers");
      toast.success(`${t("Voucher.voucherUpdated")}`, {
        position: "top-center",
        type: "success",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "colored",
      });
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    // Expand or shrink the movements array based on numberOfMovements
    setMovements((prev) => {
      const diff = numberOfMovements - prev.length;

      if (diff > 0) {
        // Add new empty movements
        const newMovements = Array.from({ length: diff }, () =>
          createMovement()
        );
        return [...prev, ...newMovements];
      } else if (diff < 0) {
        // Remove extra movements
        return prev.slice(0, numberOfMovements);
      } else {
        return prev; // No change
      }
    });
  }, [numberOfMovements]);

  const onVoucherStatusChanged = (e) => setVoucherStatus(e.target.value);
  const onAgentNameChanged = (e) => setAgentName(e.target.value);
  const onNationalityChanged = (e) => {
    setNationality(e.target.value);
  };
  const onNumberOfPaxChanged = (e) => setNumberOfPax(e.target.value);
  const onVoucherNumberChanged = (e) => setVoucherNumber(e.target.value);
  const onGroupNumberChanged = (e) => setGroupNumber(e.target.value);
  const onGroupLeaderNumberChanged = (e) =>
    setGroupLeaderNumber(e.target.value);
  const onNumOfMovementsChanged = (e) => {
    setNumberOfMovements(e.target.value);
  };
  const onMovementDetailsChanged = (index, field, value) => {
    setMovements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const onSaveVoucherClicked = async (e) => {
    e.preventDefault();
    await updateVoucher({
      id: voucher.id,
      voucherStatus,
      agentName,
      nationality,
      numberOfPax,
      voucherNumber,
      groupNumber,
      groupLeaderNumber,
      numberOfMovements,
      movements,
      file,
    }).unwrap();
  };

  let canSave;
  canSave =
    [
      voucherStatus,
      agentName,
      nationality,
      numberOfPax,
      groupNumber,
      numberOfMovements,
    ].every(Boolean) && !isLoading;

  const errClass = isError ? "errmsg" : "offscreen";
  const validAgentNameClass =
    !agentName || agentName == "" ? "border-red-500" : "";
  const validNationalityClass =
    !nationality || nationality == "" ? "border-red-500" : "";
  const validNumberOfPaxClass = !numberOfPax ? "border-red-500" : "";
  const validGroupNumberClass = !groupNumber ? "border-red-500" : "";
  const validNumOfMovements = !numberOfMovements ? "border-red-500" : "";
  const validFileClass = !file ? "border-red-500" : "";

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>
      <div className="bg-gray-100border-2  rounded-3xl shadow relative m-10">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h3 className="text-2xl font-semibold">
            {t("Voucher.editVoucher")} {operationNumber})
          </h3>
        </div>
        {/* Form */}
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveVoucherClicked}>
            {/* Voucher Status (type of update) */}
            <div className="grid pb-15">
              <label className="text-sm font-medium text-gray-900 block mb-2">
                {t("Voucher.voucherStatus")}
              </label>
              <select
                name="voucherStatus"
                id="voucherStatus"
                value={voucherStatus}
                onChange={onVoucherStatusChanged}
                className={`cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-80 p-2.5`}
              >
                <option value="modified">{t("Voucher.modified")}</option>
                <option value="cancelled">{t("Voucher.cancelled")}</option>
                <option value="closed">{t("Voucher.closed")}</option>
              </select>
            </div>
            {/* general info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Agent Name */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  {t("Voucher.agentName")}
                </label>
                <select
                  name="agentName"
                  id="agentName"
                  value={agentName}
                  onChange={onAgentNameChanged}
                  className={`cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validAgentNameClass}`}
                >
                  <option value="">Agent - الوكيل</option>
                  {agents.map((agent, index) => (
                    <option key={index} value={agent.value}>
                      {agent.label}
                    </option>
                  ))}
                </select>

                {agentName === "Other" && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <input
                      type="text"
                      id="agentName"
                      name="agentName"
                      value={agentName}
                      onChange={onAgentNameChanged}
                      className="mt-1 block w-full px-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                )}
              </div>
              {/* Nationality */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  {t("Voucher.nationality")}
                </label>
                <select
                  name="nationality"
                  id="nationality"
                  value={nationality}
                  onChange={onNationalityChanged}
                  className={`cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validNationalityClass}`}
                >
                  <option value="">Nationality - الجنسية</option>
                  {nationalities.map((country, index) => (
                    <option key={index} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
                {nationality === "Other" && (
                  <div style={{ marginTop: "1rem" }}>
                    <label
                      htmlFor="customNationality"
                      className="text-sm font-medium text-gray-900 mb-2"
                    >
                      Please enter your nationality:
                    </label>
                    <input
                      type="text"
                      id="customNationality"
                      name="customNationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Type here..."
                      className="text-sm font-medium text-gray-900 block mb-2"
                    />
                  </div>
                )}
              </div>
              {/* Number Of Pax */}
              <div>
                <label
                  className={`text-sm font-medium text-gray-900 block mb-2`}
                >
                  {t("Voucher.numberOfPax")}
                </label>
                <input
                  type="number"
                  id="numberOfPax"
                  name="numberOfPax"
                  value={numberOfPax}
                  onChange={onNumberOfPaxChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  ${validNumberOfPaxClass}`}
                  placeholder="00"
                  required
                />
              </div>
              {/* voucher Number */}
              <div>
                <label
                  className={`text-sm font-medium text-gray-900 block mb-2`}
                >
                  {t("Voucher.voucherNumber")}
                </label>
                <input
                  type="text"
                  id="voucherNumber"
                  name="voucherNumber"
                  value={voucherNumber}
                  onChange={onVoucherNumberChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                />
              </div>
              {/* Group Number */}
              <div>
                <label
                  className={`text-sm font-medium text-gray-900 block mb-2`}
                >
                  {t("Voucher.groupNumber")}
                </label>
                <input
                  type="text"
                  id="groupNumber"
                  name="groupNumber"
                  value={groupNumber}
                  onChange={onGroupNumberChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  ${validGroupNumberClass}`}
                  required
                />
              </div>
              {/* Group Leader Number */}
              <div>
                <label
                  className={`text-sm font-medium text-gray-900 block mb-2`}
                >
                  {t("Voucher.groupLeaderNumber")}
                </label>
                <input
                  type="text"
                  id="groupLeaderNumber"
                  name="groupLeaderNumber"
                  value={groupLeaderNumber}
                  onChange={onGroupLeaderNumberChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                />
              </div>
              {/* Number Of Movements */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  {t("Voucher.numOfMovements")}
                </label>
                <select
                  id="NumOfMovements"
                  name="NumOfMovements"
                  value={numberOfMovements}
                  onChange={onNumOfMovementsChanged}
                  className={`cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  ${validNumOfMovements}`}
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* movements info */}
            <div className="grid grid-rows-1 sm:grid-rows-3 lg:grid-rows-1 gap-6">
              {/* Movements (Dynamically generate movement entry fields) */}
              {movements.map((movement, index) => (
                <div key={index} className="mb-6">
                  <div className="grid grid-cols-14 gap-4">
                    {/* Movement Type */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.movementType")} ({index + 1})
                      </label>
                      <select
                        value={movement.type} // Ensure the correct value is set here.
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "type",
                            e.target.value
                          )
                        } // Update specific movement type.
                        className={`${
                          !movement.type ? "border-red-500" : ""
                        } cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      >
                        <option value="">Select Type</option>
                        <option value="Arrival">{t("Voucher.arrival")}</option>
                        <option value="Tour">{t("Voucher.tour")}</option>
                        <option value="Move">{t("Voucher.move")}</option>
                        <option value="Departure">
                          {t("Voucher.departure")}
                        </option>
                        <option value="Return">{t("Voucher.return")}</option>
                      </select>
                    </div>
                    {/* From */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.from")}
                      </label>
                      <input
                        type="text"
                        value={movement.from}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "from",
                            e.target.value
                          )
                        }
                        className={`${
                          !movement.from ? "border-red-500" : ""
                        } shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                        placeholder="From"
                      />
                    </div>
                    {/* To */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.to")}
                      </label>
                      <input
                        type="text"
                        value={movement.to}
                        onChange={(e) =>
                          onMovementDetailsChanged(index, "to", e.target.value)
                        }
                        className={`${
                          !movement.to ? "border-red-500" : ""
                        } shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                        placeholder="To"
                      />
                    </div>
                    {/* Date */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.date")}
                      </label>
                      <input
                        type="date"
                        value={movement.date}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                        className={`${
                          !movement.date ? "border-red-500" : ""
                        } cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* Flight Number */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.flightNumber")}
                      </label>
                      <input
                        type="text"
                        value={movement.flightNumber}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "flightNumber",
                            e.target.value
                          )
                        }
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                        placeholder="Flight Number"
                      />
                    </div>
                    {/* Hour */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.hour")}
                      </label>
                      <input
                        type="text"
                        value={
                          movement.type == "Tour" &&
                          movement.from == "مكة" &&
                          movement.hour == ""
                            ? "07:00"
                            : movement.type == "Tour" &&
                              movement.from == "مدينة" &&
                              movement.hour == ""
                            ? "07:01"
                            : movement.hour
                        }
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "hour",
                            e.target.value
                          )
                        }
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                      />
                    </div>
                    {/* Gate */}
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-900 block mb-2">
                        {t("Voucher.gate")}
                      </label>
                      <input
                        type="text"
                        value={movement.gate}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "gate",
                            e.target.value
                          )
                        }
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                        placeholder="Gate"
                      />
                    </div>
                    {/* buss arrival time */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.bussArrivalTime")}
                      </label>
                      <input
                        type="text"
                        id="bussArrivalTime"
                        name="bussArrivalTime"
                        value={movement.bussArrivalTime}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "bussArrivalTime",
                            e.target.value
                          )
                        }
                        className={`${
                          !movement.bussArrivalTime ? "border-red-500" : ""
                        } shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* transportation company */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.transportationCompany")}
                      </label>
                      <select
                        name="transportationCompany"
                        id="transportationCompany"
                        value={movement.transportationCompany}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "transportationCompany",
                            e.target.value
                          )
                        }
                        className={`${
                          !movement.transportationCompany
                            ? "border-red-500"
                            : ""
                        } cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      >
                        <option value="">Transport - النقل</option>
                        <option value="Alkutbi">Alkutbi - الكتبي</option>
                        <option value="Private">Private - خاص</option>
                        <option value="Naqaba">Naqaba - نقابة</option>
                      </select>
                    </div>
                    {/* driver name */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.driverName")}
                      </label>
                      <input
                        type="text"
                        id="driverName"
                        name="driverName"
                        value={movement.driverName}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "driverName",
                            e.target.value
                          )
                        }
                        className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* driver number */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.driverNumber")}
                      </label>
                      <input
                        type="text"
                        id="driverNumber"
                        name="driverNumber"
                        value={movement.driverNumber}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "driverNumber",
                            e.target.value
                          )
                        }
                        className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* case taker */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.caseTaker")}
                      </label>
                      <input
                        type="text"
                        id="caseTaker"
                        name="caseTaker"
                        value={movement.caseTaker}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "caseTaker",
                            e.target.value
                          )
                        }
                        className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* case giver */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.caseGiver")}
                      </label>
                      <input
                        type="text"
                        id="caseGiver"
                        name="caseGiver"
                        value={movement.caseGiver}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "caseGiver",
                            e.target.value
                          )
                        }
                        className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                    {/* notes */}
                    <div className="col-span-1">
                      <label
                        className={`text-sm font-medium text-gray-900 block mb-2`}
                      >
                        {t("Voucher.notes")}
                      </label>
                      <input
                        type="text"
                        id="notes"
                        name="notes"
                        value={movement.notes}
                        onChange={(e) =>
                          onMovementDetailsChanged(
                            index,
                            "notes",
                            e.target.value
                          )
                        }
                        className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* voucher file uplaod */}
            <div {...getRootProps()} className="p-2">
              <label className={`text-sm font-medium text-gray-900 block mb-2`}>
                {t("Voucher.file")}
              </label>
              <label
                className={`flex cursor-pointer appearance-none justify-center rounded-md border border-dashed border-gray-300 bg-gray-100px-3 text-sm transition hover:border-gray-400 focus:border-solid focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75 h-25 ${validFileClass}`}
                tabIndex="0"
              >
                {isDragActive ? (
                  // 📁 SVG for drag state (no animation)
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 15a4 4 0 004 4h10a4 4 0 004-4m-7-3l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-blue-600 font-medium mt-2">
                      Drop it here...
                    </p>
                  </div>
                ) : file ? (
                  typeof file === "string" ? (
                    // 🎯 If file is just a URL (initial state from DB)
                    <div className="text-center">
                      <p className="text-gray-700">-- Existing File --</p>
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm underline"
                      >
                        {file.split("/").pop()}
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null); // Let user replace the file
                        }}
                        className="cursor-pointer mt-2 text-sm p-3 rounded-3xl border text-white hover:text-blue-700 hover:bg-gray-100bg-blue-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    // ✅ If it's a real File object
                    <div className="text-center">
                      <p className="text-gray-700">-- Uploaded file --</p>
                      <p className="text-blue-600 text-sm">{file.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="cursor-pointer mt-2 text-sm p-3 rounded-3xl border text-white hover:text-blue-700 hover:bg-gray-100bg-blue-700"
                      >
                        Remove file
                      </button>
                    </div>
                  )
                ) : (
                  // 📂 Default state before file is added
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-6 w-6 stroke-gray-400"
                      viewBox="0 0 256 256"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="24"
                    >
                      <path
                        d="M96,208H72A56,56,0,0,1,72,96a57.5,57.5,0,0,1,13.9,1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M80,128a80,80,0,1,1,144,48"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="118.1 161.9 152 128 185.9 161.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="152"
                        y1="208"
                        x2="152"
                        y2="128"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-md font-medium text-gray-600">
                      Drop a file to Attach, or{" "}
                      <span className="text-blue-600 underline">browse</span>
                    </span>
                  </div>
                )}

                <input
                  id="file"
                  name="file"
                  type="file"
                  className="sr-only"
                  {...getInputProps()}
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="border-gray-200 rounded-b p-4">
              <button
                type="submit"
                className="text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-lg text-lg px-5 py-2.5"
                title="Save"
                disabled={!canSave}
              >
                {t("Voucher.saveVoucher")} 💾
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return content;
};

export default EditVoucherForm;
