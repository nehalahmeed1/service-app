import React from "react";
import RequestCard from "./RequestCard";

const RequestList = ({ requests, onAccept, onReject }) => {
  if (!requests.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No requests found
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
