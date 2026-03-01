import React from "react";
import { useTranslation } from "react-i18next";
import RequestCard from "./RequestCard";

const RequestList = ({ requests, onAccept, onReject }) => {
  const { t } = useTranslation();
  if (!requests.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("no_requests_found")}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default RequestList;
