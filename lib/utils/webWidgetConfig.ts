// lib/utils/webWidgetConfig.ts
//
// The body for PUT /accounts/{id}/web-widget-config.
//
// The endpoint replaces the WHOLE config: a field the body leaves out is
// written back as its schema default (BE `payload.model_dump()`). So a body
// built from one screen's form alone switches off whatever that form does not
// show - Save in the Settings panel turned Shadow mode (Bot Playground) and
// `allow_native_apps` (no UI yet) off. Every writer therefore starts from the
// stored config and changes only its own fields.

import type { UpdateWebWidgetConfigRequest, WebWidgetConfig } from "@/lib/types/omnichannel";

export function widgetConfigPayload(
  stored: WebWidgetConfig | undefined,
  changes: Partial<UpdateWebWidgetConfigRequest>
): UpdateWebWidgetConfigRequest {
  // default_texts is read-only server output (what blank fields fall back to).
  const { id: _id, account_id: _accountId, default_texts: _defaults, ...rest } =
    stored ?? ({} as Partial<WebWidgetConfig>);
  return { ...rest, ...changes } as UpdateWebWidgetConfigRequest;
}
