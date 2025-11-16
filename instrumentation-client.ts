import * as Sentry from '@sentry/nextjs'
Sentry.init({
  dsn: 'https://9f0f613a0bbddc7cc72f6e1591abc863@o4510369082441728.ingest.us.sentry.io/4510369144242176',
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true
})
