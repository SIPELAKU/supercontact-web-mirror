"use client";
import PageHeader from '@/components/ui/page-header';


export default function PipelineHeader() {
  return (
    <>
      <PageHeader
        title="Opportunity Pipeline"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Opportunity Pipeline" },
        ]}
      />
    </>
  );
}
