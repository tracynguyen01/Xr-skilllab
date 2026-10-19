import { handleCoachRequest, type CoachEnv } from './handler'

export default {
  fetch(request: Request, env: CoachEnv): Promise<Response> {
    return handleCoachRequest(request, env)
  },
}
