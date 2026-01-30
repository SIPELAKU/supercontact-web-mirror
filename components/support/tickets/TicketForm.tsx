import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useManageUsers } from "@/lib/hooks/useManageUsers"; // For agent selection
import { Ticket } from "@/lib/types/Ticket";

interface TicketFormProps {
    initialData?: Ticket | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function TicketForm({ initialData, onSubmit, onCancel, isLoading }: TicketFormProps) {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            subject: initialData?.subject || "",
            description: initialData?.description || "",
            customer_name: initialData?.customer_name || "",
            customer_email: initialData?.customer_email || "",
            priority: initialData?.priority || "",
            status: initialData?.status || "Open",
            assigned_agent_id: initialData?.assigned_agent_id || "",
        }
    });

    // Fetch agents for assignment
    const { users: agents } = useManageUsers(1, 100);

    const agentOptions = agents.map((agent: any) => ({
        label: agent.name,
        value: agent.user_id
    }));

    const priorityOptions = [
        { label: "High", value: "High" },
        { label: "Medium", value: "Medium" },
        { label: "Low", value: "Low" },
    ];

    const statusOptions = [
        { label: "Open", value: "Open" },
        { label: "In Progress", value: "In Progress" },
        { label: "Closed", value: "Closed" },
    ];

    useEffect(() => {
        if (initialData) {
            setValue("subject", initialData.subject);
            setValue("description", initialData.description);
            setValue("customer_name", initialData.customer_name);
            setValue("customer_email", initialData.customer_email);
            setValue("priority", initialData.priority);
            setValue("status", initialData.status);
            setValue("assigned_agent_id", initialData.assigned_agent_id || "");
        }
    }, [initialData, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="subject">Subject</Label>
                <AppInput
                    id="subject"
                    placeholder="Enter a concise summary of the issue"
                    error={errors.subject?.message as string}
                    {...register("subject", { required: "Subject is required" })}
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Provide a detailed explanation of the support request"
                    className="min-h-[100px] bg-gray-50 border-gray-200"
                    {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <AppInput
                        id="customer_name"
                        placeholder="Enter full name"
                        error={errors.customer_name?.message as string}
                        {...register("customer_name", { required: "Customer name is required" })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="customer_email">Customer Email</Label>
                    <AppInput
                        id="customer_email"
                        placeholder="NameCustomer@example.com"
                        type="email"
                        error={errors.customer_email?.message as string}
                        {...register("customer_email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                        })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Priority</Label>
                    <AppSelect
                        options={priorityOptions}
                        placeholder="Select Priority"
                        value={initialData?.priority} // This might need controlled state if AppSelect doesn't handle hook-form
                        onChange={(val) => setValue("priority", val as any)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Status</Label>
                    <AppSelect
                        options={statusOptions}
                        placeholder="Select Status"
                        value={initialData?.status || "Open"}
                        onChange={(val) => setValue("status", val as any)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label>Assigned Agent</Label>
                <AppSelect
                    options={agentOptions}
                    placeholder="Select Agent"
                    value={initialData?.assigned_agent_id}
                    onChange={(val) => setValue("assigned_agent_id", val)}
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={onCancel} className="border-blue-500 text-blue-500 hover:bg-blue-50">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? "Saving..." : initialData ? "Save Changes" : "Submit Ticket"}
                </Button>
            </div>
        </form>
    );
}
