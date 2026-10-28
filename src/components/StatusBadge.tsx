import type { ApprovalStatus, DocType } from "../types";

const statusLabels: Record<ApprovalStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  superseded: "Superseded",
  archived: "Archived",
  unverified: "Unverified",
  unknown: "Unknown",
};

const statusClasses: Record<ApprovalStatus, string> = {
  approved: "badge-approved",
  draft: "badge-draft",
  superseded: "badge-superseded",
  archived: "badge-archived",
  unverified: "badge-unverified",
  unknown: "badge-unknown",
};

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`badge ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export const docTypes: { value: DocType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "guideline", label: "Guideline" },
  { value: "protocol", label: "Protocol" },
  { value: "research", label: "Research" },
  { value: "manual", label: "Manual" },
  { value: "policy", label: "Policy" },
  { value: "training", label: "Training" },
  { value: "report", label: "Report" },
  { value: "other", label: "Other" },
];
