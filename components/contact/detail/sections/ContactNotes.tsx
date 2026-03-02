import { useState } from "react";
import { Note } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";
import { Box, Tab, Tabs } from "@mui/material";
import { Loader2 } from "lucide-react";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

interface ContactNotesProps {
    contactName: string;
    notes: Note[];
    onSaveNote: (note: string) => void;
    isSaving: boolean;
}

export const ContactNotes = ({ contactName, notes, onSaveNote, isSaving }: ContactNotesProps) => {
    const [value, setValue] = useState(0);
    const [newNote, setNewNote] = useState("");

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleSave = () => {
        if (!newNote.trim()) return;
        onSaveNote(newNote);
        setNewNote("");
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Add Note */}
            <div className="flex flex-col gap-2">
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                    >
                        <Tab label="Notes" {...a11yProps(0)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder={`Add a note about ${contactName}...`}
                        className="w-full min-h-[100px] bg-[#F6F6F8] p-3 rounded-lg border border-gray-200 focus:border-primary resize-none placeholder-gray-400 focus:outline-none"
                    />
                    <div className="flex justify-end mt-2">
                        <AppButton
                            onClick={handleSave}
                            variantStyle="primary"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                "Save Note"
                            )}
                        </AppButton>
                    </div>
                </CustomTabPanel>
            </div>

            {/* Activity Timeline */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Activity</h3>

                <div className="relative space-y-8 max-h-[200px] overflow-y-auto">
                    {notes.length === 0 && (
                        <p className="text-sm text-gray-400">No activity history.</p>
                    )}

                    {notes.map((note, index) => (
                        <div key={note.id} className="relative flex gap-4">
                            {/* Timeline line */}
                            {index !== notes.length - 1 && (
                                <span className="absolute left-5 top-12 h-full w-px bg-gray-200" />
                            )}

                            {/* Avatar */}
                            <div className="relative z-10 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0">
                                {getInitials(note.user_fullname)}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {note.user_fullname}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(note.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                                    <p className="text-sm text-gray-700 leading-relaxed word-break whitespace-pre-wrap">
                                        {note.note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
