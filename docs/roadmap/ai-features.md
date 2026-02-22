# AI Features — Future Plan

## 1. AI Suggestions for Users

### In-App AI Assistant

- **Contextual help**: Floating or sidebar assistant that knows the current screen and suggests next actions (e.g. "You have 5 draft invoices—complete them?")
- **Smart autocomplete / search**: Search that understands intent (e.g. "unpaid December invoices for customer X") instead of exact keyword matching
- **Behaviour-based suggestions**: Learn from user patterns and suggest follow-ups (e.g. "You usually create a receipt after this invoice—create one now?")

### Data-Driven Suggestions

- **Anomaly detection**: Flag unusual values (amounts, dates, quantities) or missing required data before save
- **Recommendations**: Suggest next actions (e.g. "Payment due in 3 days") or related documents (e.g. "Similar invoices for this customer…")
- **Natural-language queries**: Let users ask questions in plain language ("Show overdue invoices for last month") and return results or summaries

### Suggested Priority

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Anomaly / validation warnings before save | Low |
| 2 | Contextual help (tooltips, suggested actions) | Low–Medium |
| 3 | Smart search across entities (invoice, customer) | Medium |
| 4 | AI assistant with screen context | Medium–High |
| 5 | Natural-language queries ("Show me…") | High |

## 2. Implementation Notes

### AI Stack Options

- **Hosted**: OpenAI, Anthropic — fast to integrate, pay-per-use
- **Self-hosted**: Llama, Mistral — more control, data stays on-premise

### Measuring Success

- Track acceptance vs dismissal of suggestions
- A/B test suggestion wording and placement
- Iterate based on usage and feedback
