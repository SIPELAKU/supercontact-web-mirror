"use client";

import { CheckCircle2, Download, MailIcon, PhoneIcon, Trash2, UploadCloud, X, ZoomIn, ZoomOut } from "lucide-react";
import { ChatUser, NewChatUser } from "@/lib/api/chat";
import { PIN_DURATIONS } from "@/lib/hooks/useChat";
import { RefObject } from "react";

interface ChatModalsProps {
    isUploadModalOpen: boolean;
    setIsUploadModalOpen: (open: boolean) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    handleFileUpload: (files: FileList | null) => void;
    showContactInfo: boolean;
    setShowContactInfo: (show: boolean) => void;
    activeChatUser: ChatUser | null;
    showPinModal: boolean;
    setShowPinModal: (show: boolean) => void;
    pinDuration: typeof PIN_DURATIONS[number] | null;
    setPinDuration: (duration: typeof PIN_DURATIONS[number]) => void;
    confirmPin: () => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    deleteType: "conversation" | "messages" | null;
    messagesToDelete: string[];
    executeDelete: () => void;
    previewImage: { url: string; id: string; sender: string; time: string; avatar: string | null; initial: string } | null;
    setPreviewImage: (preview: any) => void;
    zoomLevel: number;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handlePinFromPreview: () => void;
    handleDownloadImage: () => void;
}

export default function ChatModals({
    isUploadModalOpen,
    setIsUploadModalOpen,
    fileInputRef,
    handleFileUpload,
    showContactInfo,
    setShowContactInfo,
    activeChatUser,
    showPinModal,
    setShowPinModal,
    pinDuration,
    setPinDuration,
    confirmPin,
    showDeleteModal,
    setShowDeleteModal,
    deleteType,
    messagesToDelete,
    executeDelete,
    previewImage,
    setPreviewImage,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handlePinFromPreview,
    handleDownloadImage,
}: ChatModalsProps) {
    return (
        <>
            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#5479EE] flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                                    A
                                </div>
                                <h3 className="text-xl font-bold text-[#3F66E0]">Upload Files</h3>
                            </div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div
                            className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-indigo-50/30 group hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6 text-[#5479EE]" />
                            </div>
                            <h4 className="font-semibold text-gray-700 mb-1">Choose a file or drag & drop it here</h4>
                            <p className="text-xs text-gray-400 text-center mb-4">JPEG, PNG and PDF formats</p>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Info Modal */}
            {showContactInfo && activeChatUser && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="h-24 relative">
                            <button onClick={() => setShowContactInfo(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                                <X className="w-5 h-5 text-black" />
                            </button>
                        </div>
                        <div className="px-6 pb-8 -mt-12 text-center">
                            <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-50 flex items-center justify-center mb-3">
                                {activeChatUser.user_avatar ? (
                                    <img src={activeChatUser.user_avatar} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                    <span className="text-3xl font-bold text-[#5479EE]">{activeChatUser.user_avatar_initial}</span>
                                )}
                            </div>
                            <h3 className="text-[18px] font-normal text-[#262B43/90] mb-1">{activeChatUser.user_fullname}</h3>
                            <p className="text-[15px] font-normal text-[#262B43/70] mb-6">{activeChatUser.user_position}</p>
                            <div className="text-left space-y-6">
                                <div className="text-xs text-gray-400">
                                    <h3 className="text-[15px] font-normal text-gray-500 mb-3">ABOUT</h3>
                                    <p className="flex items-center gap-2 text-[15px] text-[#262B43/90]">
                                        {activeChatUser.about || "No information provided."}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    <h3 className="text-[15px] font-normal text-gray-500 mb-3">PERSONAL INFORMATION</h3>
                                    <p className="flex items-center gap-2 text-[15px] text-[#262B43/90]">
                                        <MailIcon className="w-5 h-5" /> {activeChatUser.email}
                                    </p>
                                    <p className="flex items-center gap-2 mt-2 text-[15px] text-[#262B43/90]">
                                        <PhoneIcon className="w-5 h-5" /> {activeChatUser.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pin Modal */}
            {showPinModal && (
                <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-[#3F66E0]">Choose how long your pin lasts</h3>
                            <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 mb-8">
                            {PIN_DURATIONS.map((duration) => (
                                <div
                                    key={duration}
                                    onClick={() => setPinDuration(duration)}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${pinDuration === duration ? "bg-[#5479EE] border-[#5479EE] text-white" : "border-gray-300"}`}>
                                        {pinDuration === duration && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{duration}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowPinModal(false)} className="px-6 py-2 text-[#5479EE] font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200">Cancel</button>
                            <button onClick={confirmPin} className="px-8 py-2 bg-[#5479EE] text-white font-medium rounded-lg hover:bg-[#3F66E0] shadow-md">Pin</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{deleteType === 'conversation' ? "Delete Conversation?" : "Delete Message?"}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {deleteType === 'conversation'
                                    ? "Are you sure you want to delete this conversation? This action cannot be undone."
                                    : `Are you sure you want to delete ${messagesToDelete.length > 1 ? `${messagesToDelete.length} messages` : "this message"}? This action cannot be undone.`}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">Cancel</button>
                                <button onClick={executeDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-100 bg-white flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold overflow-hidden">
                                {previewImage.avatar ? <img src={previewImage.avatar} className="w-full h-full object-cover" alt="avatar" /> : previewImage.initial}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{previewImage.sender}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">{new Date(previewImage.time).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[#5479EE]">
                            <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomIn className="w-5 h-5" /></button>
                            <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ZoomOut className="w-5 h-5" /></button>
                            <button onClick={handlePinFromPreview} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><CheckCircle2 className="w-5 h-5" /></button>
                            <button onClick={handleDownloadImage} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Download className="w-5 h-5" /></button>
                            <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ml-4">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
                        <img
                            src={previewImage.url}
                            className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200"
                            style={{ transform: `scale(${zoomLevel})` }}
                            alt="preview"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
