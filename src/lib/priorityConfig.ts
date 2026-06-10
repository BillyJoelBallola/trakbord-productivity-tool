export const priorityConfig: Record<string, { dot: string; label: string }> = {
  LOW: {
    dot: "bg-neutral-300 dark:bg-neutral-600",
    label: "text-neutral-400 dark:text-neutral-500",
  },
  MEDIUM: { dot: "bg-blue-400", label: "text-blue-500 dark:text-blue-400" },
  HIGH: { dot: "bg-orange-400", label: "text-orange-500 dark:text-orange-400" },
  URGENT: { dot: "bg-red-500", label: "text-red-500 dark:text-red-400" },
};

export const priorityColor: Record<string, string> = {
  LOW: "bg-neutral-100 text-neutral-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};
