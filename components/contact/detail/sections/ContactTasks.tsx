import { Task } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";
import { Divider } from "@mui/material";
import { CheckCircle2, Circle } from "lucide-react";

interface ContactTasksProps {
    tasks: Task[];
    onAddTask: () => void;
}

export const ContactTasks = ({ tasks, onAddTask }: ContactTasksProps) => {
    return (
        <div className="p-6 wrap-break-word">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Task</h3>
                <AppButton onClick={onAddTask} variantStyle="primary">
                    Add Task
                </AppButton>
            </div>
            <Divider />

            <div className="flex flex-col relative mt-5 max-h-[150px] overflow-y-auto w-full overflow-x-hidden">
                {tasks.length === 0 && (
                    <p className="text-sm text-gray-400">No tasks yet.</p>
                )}
                {tasks.map((task, index) => (
                    <div key={task.id} className="relative flex gap-4 pb-10 last:pb-0">
                        {/* Status Icon */}
                        <div className="shrink-0 z-10 bg-white">
                            {task.status === "done" ? (
                                <div className="w-7 h-7 rounded-full bg-[#6739EC] text-white flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <Circle className="w-7 h-7 text-[#6739EC] stroke-[2.5]" />
                                    {/* Connecting Line */}
                                    {index !== tasks.length - 1 && (
                                        <div className="absolute left-[13px] top-9 bottom-6 w-[2px] h-[40px] bg-[#CFD7E7]" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 justify-between items-start pt-0.5 min-w-0 gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                                <span
                                    className={`text-base font-semibold break-all ${task.status === "done" ? "text-[#0D121B]" : "text-[#000804/50]"}`}
                                >
                                    {task.task_name}
                                </span>
                                {task.description && (
                                    <p
                                        className={`text-sm wrap-break-word whitespace-pre-wrap ${task.status === "done" ? "text-[#0D121B]" : "text-[#000804/50]"}`}
                                    >
                                        {task.description ||
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                                    </p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex flex-col items-end shrink-0 gap-1">
                                {task.due_date && (
                                    <span className="text-sm font-medium text-[#4C669A]/60">
                                        {new Date(task.due_date).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                                <span className="text-sm font-medium text-[#4C669A]/60">
                                    {new Date(task.created_at).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
