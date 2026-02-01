import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useManagedUsers } from "@/lib/hooks/useManagedUser"; // For agent selection
import { Ticket } from "@/lib/types/Ticket";

interface TicketFormProps {
    initialData?: Ticket | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function TicketForm({ initialData, onSubmit, onCancel, isLoading }: TicketFormProps) {
    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
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
    const { data: userData } = useManagedUsers(1, 100);
    const agents = userData?.data?.manage_users || [];

    const agentOptions = agents.map((agent: any) => ({
        label: agent.fullname,
        value: agent.id
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
                    error={!!errors.subject}
                    helperText={errors.subject?.message as string}
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
                        error={!!errors.customer_name}
                        helperText={errors.customer_name?.message as string}
                        {...register("customer_name", { required: "Customer name is required" })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="customer_email">Customer Email</Label>
                    <AppInput
                        id="customer_email"
                        placeholder="NameCustomer@example.com"
                        type="email"
                        error={!!errors.customer_email}
                        helperText={errors.customer_email?.message as string}
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
                    <Controller
                        name="priority"
                        control={control}
                        rules={{ required: "Priority is required" }}
                        render={({ field }) => (
                            <AppSelect
                                options={priorityOptions}
                                placeholder="Select Priority"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                    {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message as string}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <AppSelect
                                options={statusOptions}
                                placeholder="Select Status"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label>Assigned Agent</Label>
                <Controller
                    name="assigned_agent_id"
                    control={control}
                    render={({ field }) => (
                        <AppSelect
                            options={agentOptions}
                            placeholder="Select Agent"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={onCancel} className="border-[#5479EE] text-[#5479EE] hover:bg-blue-50">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#5479EE] hover:bg-[#4a6cd9] text-white">
                    {isLoading ? "Saving..." : initialData ? "Save Changes" : "Submit Ticket"}
                </Button>
            </div>
        </form>
    );
}
