import Link from "next/link";
import { WaRecipient } from "@/lib/types/whatsapp-marketing";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Divider } from "@mui/material";
import { X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, UserRound } from "lucide-react";

interface WaRecipientPreviewPopupProps {
    recipient: WaRecipient | null;
    onClose: () => void;
}

export const WaRecipientPreviewPopup = ({ recipient, onClose }: WaRecipientPreviewPopupProps) => {
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    return (
        <Dialog
            open={Boolean(recipient)}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' }
            }}
        >
            {recipient && (
                <>
                    {/* Header */}
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pb: 1,
                            pt: 3,
                            px: 3,
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#5479EE] flex items-center justify-center text-white text-lg font-bold">
                                {recipient.name?.charAt(0)?.toUpperCase() || recipient.email?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <Typography variant="h6" fontWeight={700}>{recipient.name || recipient.email}</Typography>
                                {recipient.position && (
                                    <Typography variant="body2" color="text.secondary">{recipient.position}</Typography>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <IconButton
                                component={Link}
                                href={`/contact/detail/${recipient.id}?tab=whatsapp`}
                                size="small"
                                title="View full contact profile"
                            >
                                <UserRound size={18} />
                            </IconButton>
                            <IconButton onClick={onClose} size="small">
                                <X size={20} />
                            </IconButton>
                        </div>
                    </DialogTitle>

                    <DialogContent sx={{ px: 3, pb: 3 }}>
                        <Divider sx={{ mb: 2.5 }} />

                        {/* Recipient Info */}
                        <div className="space-y-3">
                            {recipient.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Mail size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{recipient.email}</p>
                                    </div>
                                </div>
                            )}

                            {recipient.phone_number && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Phone size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{recipient.phone_number}</p>
                                    </div>
                                </div>
                            )}

                            {recipient.company && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Building2 size={16} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Company</p>
                                        <p className="text-sm font-medium text-gray-900">{recipient.company}</p>
                                    </div>
                                </div>
                            )}

                            {recipient.position && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Briefcase size={16} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Position</p>
                                        <p className="text-sm font-medium text-gray-900">{recipient.position}</p>
                                    </div>
                                </div>
                            )}

                            {recipient.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                        <MapPin size={16} className="text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm font-medium text-gray-900">{recipient.address}</p>
                                    </div>
                                </div>
                            )}

                            {recipient.created_at && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Calendar size={16} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Created</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(recipient.created_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Custom Fields */}
                        {recipient.custom_fields && Object.keys(recipient.custom_fields).length > 0 && (
                            <>
                                <Divider sx={{ my: 2.5 }} />
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Additional Info
                                </Typography>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(recipient.custom_fields).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                                            <p className="text-sm font-medium text-gray-900">{String(value) || "-"}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
};
