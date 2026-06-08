import { LoaderCircle } from "lucide-react";

function loading() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-white dark:bg-neutral-950">
      <LoaderCircle className="animate-spin size-10" />
    </div>
  );
}

export default loading;
