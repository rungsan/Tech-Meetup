# Component catalog

> Single source of truth for component names. Every screen's `## Components` must use names from here.
> `/ai-design ui --review` flags off-catalog synonyms.

| Component | Purpose | Key props | States |
|-----------|---------|-----------|--------|
| PageHeader | title + subtitle + one primary action | title, subtitle, action | default |
| DataTable | tabular list of records (sortable, paginated) | columns, rows, sortable, pagination | default · empty · loading · error |
| StatCard | single KPI / status count (clickable) | label, value, href | default · loading |
| FilterBar | search + filter controls above a table | fields, onSearch, onClear | default |
| FormField | labeled input + validation | label, type, required, error | default · focus · error · disabled |
| AutoCompleteField | typeahead select (Source/Agent/Brand/Model) | label, options, onSearch | default · loading · error |
| StatusPill | record status badge (8-state job / billing / survey) | status | per status |
| Modal | confirm / dialog overlay | title, body, confirm, cancel | default (focus-trap) |
| Tabs | in-content tab nav (รายละเอียด/Job History/ข้อความ/Image) | tabs, active | default |
| ImageUploader | browse/preview/delete images | files, onUpload, onDelete | default · uploading · error |
| ImageCompare | before/after revise comparison | before, after | default |
| ChartBar | 3-year comparison bar chart | series, labels | default · loading · empty |
| ChartPie | Top-5 / distribution pie | data | default · loading · empty |
| EmptyState | no-data placeholder + CTA | title, message, action | default |
| Stepper | fleet count +/- control | min, max, value | default |
| ExportButton | export current view (Excel/PDF) | format, onExport | default · loading |
| NotificationBell | new-message indicator | count | default · has-new |
