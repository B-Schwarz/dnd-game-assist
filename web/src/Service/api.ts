import axios from "axios";

// Every API call must carry the session cookie (dnd.sid) for the server-side
// session to be recognised, so credentials are sent on all requests.
axios.defaults.withCredentials = true

// Base prefix for the API: the dev server URL in development and an empty
// (same-origin) string in production. The CRA env files inject the value;
// callers concatenate it onto each request path.
export const API_PREFIX = process.env.REACT_APP_API_PREFIX || ''
