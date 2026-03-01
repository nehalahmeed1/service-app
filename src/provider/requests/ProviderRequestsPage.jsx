import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import RequestList from "./components/RequestList";
import {
  fetchIncomingRequests,
  updateProviderBookingStatus,
  updateProviderBookingStatusWithNote,
} from "@/services/providerBookingService";

const ProviderRequestsPage = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchIncomingRequests();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        const message =
          err?.response?.data?.message || "Failed to load incoming requests";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await updateProviderBookingStatus(id, "ACCEPTED");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to accept request";
      alert(message);
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = window.prompt("Enter reject reason");
      if (reason === null) return;
      await updateProviderBookingStatusWithNote(id, "REJECTED", reason.trim());
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to reject request";
      alert(message);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("incoming_requests")} - {t("provider")}</title>
      </Helmet>

      {/* Width is controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("incoming_requests")}
            </h1>
            <p className="text-muted-foreground">
              {t("incoming_requests_subtitle")}
            </p>
          </div>

          {/* Requests Grid */}
          {error ? (
            <div className="max-w-6xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="max-w-6xl">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading incoming requests...
              </div>
            ) : (
            <RequestList
              requests={requests}
              onAccept={handleAccept}
              onReject={handleReject}
            />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderRequestsPage;
