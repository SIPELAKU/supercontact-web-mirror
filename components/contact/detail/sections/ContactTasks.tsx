import { Task } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";
import { Divider } from "@mui/material";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";

interface ContactTasksProps {
    tasks: Task[];
    onAddTask: () => void;
}

export const ContactTasks = ({ tasks, onAddTask }: ContactTasksProps) => {
    return (
        // md and up: as tall as the column; the task list takes the rest.
        <div className="p-6 wrap-break-word md:flex md:h-full md:min-h-0 md:flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Task</h3>
                <AppButton onClick={onAddTask} variantStyle="primary">
                    Add Task
                </AppButton>
            </div>
            <Divider />

            <div className="flex flex-col relative mt-5 max-h-[150px] overflow-y-auto w-full overflow-x-hidden md:max-h-none md:min-h-0 md:flex-1">
                {tasks.length === 0 && (
                    <p className="text-sm text-gray-400">No tasks yet.</p>
                )}
                {tasks.map((task, index) => (
                    <div key={task.id} className="relative flex gap-4 pb-10 last:pb-0">
                        {/* Status icon, and the line down to the next task. The column is
                            as tall as the task, so the line ends 8px above the next icon
                            however long the description is (it used to be a fixed 75px).
                            No backgrounds here: nothing needs covering, and a white one
                            showed as a grey strip in dark mode. */}
                        <div className="relative shrink-0">
                            {task.status === "done" ? (
                                <div className="w-7 h-7 rounded-full bg-[#5479EE] text-white flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            ) : task.status === "in_progress" ? (
                                <div className="relative w-7 h-7 flex items-center justify-center text-[#5479EE]">
                                    <Circle className="absolute inset-0 w-7 h-7 stroke-[2.5]" />
                                    <MoreHorizontal className="w-4 h-4 stroke-3" />
                                </div>
                            ) : (
                                <Circle className="w-7 h-7 text-[#5479EE] stroke-[2.5]" />
                            )}
                            {index !== tasks.length - 1 && (
                                <div className="absolute left-[13px] top-9 -bottom-8 w-[2px] bg-[#CFD7E7] dark:bg-[var(--dk-line)]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 justify-between items-start pt-0.5 min-w-0 gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                                <span
                                    className={`text-base font-semibold break-all ${task.status === "done" ? "text-[#0D121B] dark:text-[var(--dk-text)]" : "text-[#000804/50]"}`}
                                >
                                    {task.task_name}
                                </span>
                                {task.description && (
                                    <p
                                        className={`text-sm wrap-break-word whitespace-pre-wrap ${task.status === "done" ? "text-[#0D121B] dark:text-[var(--dk-text)]" : "text-[#000804/50]"}`}
                                    >
                                        {task.description ||
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                                    </p>
                                )}
                                {task.priority && (
                                    <div className="mt-1">
                                        <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${task.priority.toLowerCase() === 'high' ? 'bg-[#FFEBEB] text-[#FF5252] dark:bg-[#FF5252]/15' :
                                            task.priority.toLowerCase() === 'medium' ? 'bg-[#FFF4E5] text-[#FFB020] dark:bg-[#FFB020]/15' :
                                                'bg-[#EAF9E6] text-[#71D860] dark:bg-[#71D860]/15'
                                            }`}>
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex flex-col items-end shrink-0 gap-1">
                                {task.due_date && (
                                    <span className="text-sm font-medium text-[#4C669A]/60 dark:text-[var(--dk-muted)]">
                                        {new Date(task.due_date).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                                <span className="text-sm font-medium text-[#4C669A]/60 dark:text-[var(--dk-muted)]">
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
