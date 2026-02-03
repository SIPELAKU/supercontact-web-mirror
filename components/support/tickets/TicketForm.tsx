import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useManagedUsers } from "@/lib/hooks/useManagedUser"; // For agent selection
import { useUsers } from "@/lib/hooks/useUsers"; // For agent selection
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
            status: initialData?.status || "",
            assigned_agent_id: initialData?.assigned_agent_id || "",
        }
    });

    // Fetch agents for assignment
    const { data: userData } = useUsers(1, 100);
    const agents = userData?.data?.users || [];

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="subject" className="font-bold text-gray-800 text-base">Subject</Label>
                <AppInput
                    id="subject"
                    placeholder="Enter a concise summary of the issue"
                    error={!!errors.subject}
                    helperText={errors.subject?.message as string}
                    isBgWhite={true}
                    {...register("subject", { required: "Subject is required" })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-gray-800 text-base">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Provide a detailed explanation of the support request"
                    className="min-h-[140px] !bg-white border-gray-200 focus-visible:ring-[#5479EE]/20 focus-visible:border-[#5479EE]"
                    {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="customer_name" className="font-bold text-gray-800 text-base">Customer Name</Label>
                    <AppInput
                        id="customer_name"
                        placeholder="Enter full name"
                        error={!!errors.customer_name}
                        helperText={errors.customer_name?.message as string}
                        isBgWhite={true}
                        {...register("customer_name", { required: "Customer name is required" })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer_email" className="font-bold text-gray-800 text-base">Customer Email</Label>
                    <AppInput
                        id="customer_email"
                        placeholder="Name@example.com"
                        type="email"
                        error={!!errors.customer_email}
                        helperText={errors.customer_email?.message as string}
                        isBgWhite={true}
                        {...register("customer_email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                        })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label className="font-bold text-gray-800 text-base">Priority</Label>
                    <Controller
                        name="priority"
                        control={control}
                        rules={{ required: "Priority is required" }}
                        render={({ field }) => (
                            <AppSelect
                                options={priorityOptions}
                                placeholder="Select Priority"
                                value={field.value}
                                isBgWhite={true}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                    {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-gray-800 text-base">Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <AppSelect
                                options={statusOptions}
                                placeholder="Select Status"
                                value={field.value}
                                isBgWhite={true}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="font-bold text-gray-800 text-base">Assigned Agent</Label>
                <Controller
                    name="assigned_agent_id"
                    control={control}
                    render={({ field }) => (
                        <AppSelect
                            options={agentOptions}
                            placeholder="Select Agent"
                            value={field.value}
                            isBgWhite={true}
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
