import { PostHog } from "posthog-node";

export type AnalyticsEnv = {
  POSTHOG_PROJECT_TOKEN: string;
  POSTHOG_HOST: string;
};

export function createPostHogClient(env: AnalyticsEnv): PostHog {
  return new PostHog(env.POSTHOG_PROJECT_TOKEN, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

/** Official PostHog web snippet for browser HTML responses. */
export function posthogSnippet(env: AnalyticsEnv): string {
  const token = JSON.stringify(env.POSTHOG_PROJECT_TOKEN);
  const host = JSON.stringify(env.POSTHOG_HOST);
  return `<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(${token}, {
      api_host: ${host},
      defaults: '2026-05-30'
    })
  </script>`;
}

export function captureWorkerEvent(
  env: AnalyticsEnv,
  ctx: ExecutionContext,
  event: string,
  properties: Record<string, unknown>,
): void {
  const posthog = createPostHogClient(env);
  ctx.waitUntil(
    (async () => {
      try {
        await posthog.captureImmediate({
          distinctId: crypto.randomUUID(),
          event,
          properties: {
            $process_person_profile: false,
            ...properties,
          },
        });
      } finally {
        await posthog.shutdown();
      }
    })(),
  );
}
