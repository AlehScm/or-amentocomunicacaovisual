import { MaterialsTable } from "@/components/materials-table";
import { Suspense } from "react";

export default function MaterialsPage() {
    return (
        <Suspense fallback={<div>Loading materials...</div>}>
            <MaterialsTable />
        </Suspense>
    );
}
