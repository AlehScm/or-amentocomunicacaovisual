import { QuotesTable } from "@/components/quotes-table";
import { Suspense } from "react";

export default function QuotesPage() {
    return (
        <Suspense fallback={<div>Loading quotes...</div>}>
            <QuotesTable />
        </Suspense>
    );
}
