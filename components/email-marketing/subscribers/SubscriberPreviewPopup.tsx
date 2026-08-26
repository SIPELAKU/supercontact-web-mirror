import Link from "next/link";
import { Subscriber } from "@/lib/types/email-marketing";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Chip, Divider } from "@mui/material";
import { X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, UserRound } from "lucide-react";
import { format } from "date-fns";

interface SubscriberPreviewPopupProps {
    subscriber: Subscriber | null;
    onClose: () => void;
}

export const SubscriberPreviewPopup = ({ subscriber, onClose }: SubscriberPreviewPopupProps) => {
    // House format: dd MMM yyyy, and English like the rest of the
    // authenticated app — this was the one place still rendering an
    // Indonesian ("id-ID") date.
    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd MMM yyyy");
        } catch {
            return "-";
        }
    };

    return (
        <Dialog
            open={Boolean(subscriber)}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' }
            }}
        >
            {subscriber && (
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
                            <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white text-lg font-bold">
                                {subscriber.name?.charAt(0)?.toUpperCase() || subscriber.email?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <Typography variant="h6" fontWeight={700}>{subscriber.name || subscriber.email}</Typography>
                                {subscriber.position && (
                                    <Typography variant="body2" color="text.secondary">{subscriber.position}</Typography>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <IconButton
                                component={Link}
                                href={`/contact/detail/${subscriber.id}?tab=email`}
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

                        {/* Subscriber Info */}
                        <div className="space-y-3">
                            {subscriber.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Mail size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{subscriber.email}</p>
                                    </div>
                                </div>
                            )}

                            {subscriber.phone_number && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Phone size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{subscriber.phone_number}</p>
                                    </div>
                                </div>
                            )}

                            {subscriber.company && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Building2 size={16} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Company</p>
                                        <p className="text-sm font-medium text-gray-900">{subscriber.company}</p>
                                    </div>
                                </div>
                            )}

                            {subscriber.position && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Briefcase size={16} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Position</p>
                                        <p className="text-sm font-medium text-gray-900">{subscriber.position}</p>
                                    </div>
                                </div>
                            )}

                            {subscriber.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                        <MapPin size={16} className="text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm font-medium text-gray-900">{subscriber.address}</p>
                                    </div>
                                </div>
                            )}

                            {subscriber.created_at && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Calendar size={16} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Created</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(subscriber.created_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subscription Status */}
                        <div className="mt-4 flex items-center gap-2">
                            <Chip
                                label={subscriber.is_subscribed ? "Subscribed" : "Not Subscribed"}
                                size="small"
                                color={subscriber.is_subscribed ? "success" : "default"}
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                        </div>

                        {/* Custom Fields */}
                        {subscriber.custom_fields && Object.keys(subscriber.custom_fields).length > 0 && (
                            <>
                                <Divider sx={{ my: 2.5 }} />
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Additional Info
                                </Typography>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(subscriber.custom_fields).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                                            <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
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
