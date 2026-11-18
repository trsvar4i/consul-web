import { Suspense } from "react";
import { Operations } from "@/components/app/Operations";

export default function OperationsPage() {
  return (
    <Suspense>
      <Operations />
    </Suspense>
  );
}
