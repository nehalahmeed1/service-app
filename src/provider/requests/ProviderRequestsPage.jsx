import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import RequestList from "./components/RequestList";

const ProviderRequestsPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // TEMP: replace with API later
    setRequests([
      {
        id: 1,
        customerName: "Rahul Sharma",
        serviceName: "AC Repair",
        date: "18 Jan 2026",
        time: "11:00 AM",
        address: "Indiranagar, Bangalore",
        status: "new",
      },
      {
        id: 2,
        customerName: "Priya Verma",
        serviceName: "Home Cleaning",
        date: "18 Jan 2026",
        time: "2:00 PM",
        address: "Whitefield, Bangalore",
        status: "new",
      },
    ]);
  }, []);

  const handleAccept = (id) => {
    const acceptedRequest = requests.find((r) => r.id === id);
    if (!acceptedRequest) return;

    // Remove from requests list
    setRequests((prev) => prev.filter((r) => r.id !== id));

    // Save as active job
    const existingJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];

    const newJob = {
      ...acceptedRequest,
      status: "active",
    };

    localStorage.setItem(
      "providerJobs",
      JSON.stringify([...existingJobs, newJob])
    );
  };

  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r
      )
    );
  };

  return (
    <>
      <Helmet>
        <title>Incoming Requests - Provider</title>
      </Helmet>

      {/* Width is controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Incoming Requests
            </h1>
            <p className="text-muted-foreground">
              Manage and respond to new service requests
            </p>
          </div>

          {/* Requests Grid */}
          <div className="max-w-6xl">
            <RequestList
              requests={requests}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderRequestsPage;
