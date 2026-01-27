import React from "react";
import JobCard from "./JobCard";

const JobList = ({ jobs, onComplete }) => {
  if (!jobs.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No jobs yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};

export default JobList;
