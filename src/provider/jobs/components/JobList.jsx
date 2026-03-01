import React from "react";
import { useTranslation } from "react-i18next";
import JobCard from "./JobCard";

const JobList = ({
  jobs,
  onArriving,
  onStart,
  onComplete,
  onCancel,
  onUploadProof,
}) => {
  const { t } = useTranslation();
  if (!jobs.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("no_jobs_yet")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onArriving={onArriving}
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
          onUploadProof={onUploadProof}
        />
      ))}
    </div>
  );
};

export default JobList;
