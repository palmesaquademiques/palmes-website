import { NotionAPI } from 'notion-client'

const maxRetryAttempts = 5

const backoffDelayForRemainingRetries = ({
  options
}: {
  options: { retry?: number | false }
}) => (maxRetryAttempts - Number(options.retry) + 1) * 2000

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  ofetchOptions: {
    timeout: 30_000,
    retry: maxRetryAttempts,
    retryDelay: backoffDelayForRemainingRetries
  }
})
