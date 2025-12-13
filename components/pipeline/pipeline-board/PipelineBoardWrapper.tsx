"use client"

import dynamic from "next/dynamic"

const PipelineBoard = dynamic(() => import("./PipelineBoard"), {
  ssr: false,
})

export default function PipelineBoardWrapper() {
  return <PipelineBoard />
}
