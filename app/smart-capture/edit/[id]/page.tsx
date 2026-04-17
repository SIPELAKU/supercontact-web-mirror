import EditSmartCaptureClient from '@/components/smart-capture/edit/EditSmartCaptureClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditSmartCapturePage({ params }: PageProps) {
  const { id } = params;
  
  return <EditSmartCaptureClient id={id} />;
}
