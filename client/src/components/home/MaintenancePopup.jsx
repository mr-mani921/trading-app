import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";

const MaintenancePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="dialog-overlay fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative z-10 w-full max-w-md md:max-w-lg bg-tertiary2 border border-primary rounded-xl p-6 animate-up-down animation-delay-75 shadow-lg">
        <button
          className="absolute top-3 right-3 text-tertiary3 hover:text-primary transition-colors"
          onClick={handleClose}
        >
          <IoMdClose size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            🔴 {t("Scheduled Maintenance Notice")}
          </h2>

          <p className="mb-4 text-tertiary3">
            {t(
              "To ensure a faster, more reliable experience for all our users, our website will undergo essential maintenance from"
            )}{" "}
            <span className="font-semibold">
              6 {t("May")} 2025 {t("at")} 12:00 UTC
            </span>{" "}
            {t("to")}{" "}
            <span className="font-semibold">
              13 {t("May")} 2025 {t("at")} 05:00 UTC
            </span>
            .
          </p>

          <div className="bg-tertiary2/50 border border-primary/30 rounded-lg p-4 mb-4">
            <p className="text-tertiary3 font-medium">
              🚨{" "}
              {t(
                "We're currently experiencing exceptionally high traffic volumes, which may result in temporary access limitations."
              )}
            </p>
          </div>

          <p className="text-tertiary3 mb-4">
            {t("In some cases, you may need to use a")}{" "}
            <span className="text-primary font-bold">
              {t("VPN (Virtual Private Network)")}
            </span>{" "}
            {t("to access the site during this period.")}
          </p>

          <p className="text-tertiary3 italic">
            {t(
              "We're working hard behind the scenes to improve performance and truly appreciate your patience and understanding."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePopup;
