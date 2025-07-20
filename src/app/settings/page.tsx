import { DataManagement } from "@/components/data-management";
import { Suspense } from "react";

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Loading settings...</div>}>
            <DataManagement />
        </Suspense>
    )
}
