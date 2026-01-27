import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const ProviderSchedulePage = () => {
  const { t } = useTranslation();

  const [workingDays, setWorkingDays] = useState([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("providerSchedule")) || null;

    if (stored) {
      setWorkingDays(stored.workingDays || []);
      setStartTime(stored.startTime || "09:00");
      setEndTime(stored.endTime || "18:00");
    }
  }, []);

  const toggleDay = (day) => {
    setWorkingDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const saveSchedule = () => {
    const schedule = { workingDays, startTime, endTime };
    localStorage.setItem(
      "providerSchedule",
      JSON.stringify(schedule)
    );
    alert(t("save_schedule"));
  };

  return (
    <>
      <Helmet>
        <title>{t("schedule_title")}</title>
      </Helmet>

      {/* Width controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("schedule_title")}
            </h1>
            <p className="text-muted-foreground">
              {t("schedule_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-6xl">

            {/* Working Days */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="font-semibold mb-4">
                {t("working_days")}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      workingDays.includes(day)
                        ? "bg-primary text-white border-primary"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {t(day)}
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="font-semibold mb-4">
                {t("working_hours")}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="max-w-6xl mt-8">
            <button
              onClick={saveSchedule}
              className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-lg font-semibold"
            >
              {t("save_schedule")}
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderSchedulePage;
