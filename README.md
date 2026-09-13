# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## CareVault account and SMS recovery setup

1. Copy `server/.env.example` to `server/.env`. Set `MONGO_URI` and a strong random `JWT_SECRET`.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` from your Twilio Verify service. Keep these values on the server only.
3. Run `npm run dev` to start the backend and frontend together. Open http://localhost:5173. The dev server forwards `/api` to the local backend on port 5000. Do not run a second backend at the same time.
4. For a hosted frontend, set `VITE_API_BASE_URL` to your backend's HTTPS `/api` URL before building.
5. Create an account with a real registered Indian mobile number. Choose Forgot password, enter the account ID, receive the SMS code, and enter the code plus your new password.

The backend and database are required for account creation and login. Existing browser-only demo accounts are not server accounts and cannot receive password recovery SMS; they need server registration. Existing server accounts without a stored mobile number need an administrator to add a verified recovery number. Browser records are preserved, but browser-stored passwords are no longer used by the login page.

The OTP uses Twilio Verify with a 60-second resend cooldown, a 10-minute reset window and five verification attempts. No OTP is generated or displayed in the browser. Live SMS delivery requires an active, configured provider account; automated tests mock the provider and database.

Aadhaar validation checks 12-digit format and the Verhoeff checksum; it does not establish UIDAI issuance or identity. DOB rejects impossible/future dates and dates before 1900; age is calculated rather than typed. Mobile numbers require ten digits starting with 6, 7, 8 or 9.

Run `npm test`, `npm run build` and `npm run lint` to check changes.
Provider documentation: https://www.twilio.com/docs/verify/api


## Patient record permissions

All `/api/patients` endpoints require a signed Bearer JWT. The server resolves the account role from the database, not request fields or client-side role claims. Signed-in doctors can list, read and update all registered patient records. Patients can list, read and update only their own patient ID.

Manual doctor grants are no longer required, and the former grant/revoke API is removed. Existing `allowedDoctorIds` data is retained but does not restrict doctor access. No patient records are deleted or reassigned by this policy change.

Patient search refreshes the permitted list from the backend. The frontend checks server permission before opening records. Visits/drafts remain a separate browser-storage workflow; this change covers existing patient database APIs.


## MongoDB connection unavailable

If `/api/health` reports `DEGRADED`, login needs the database connection restored. The server retries initial failures every five seconds; the MongoDB driver reconnects after temporary outages.

- In MongoDB Atlas, confirm the cluster is running and add the backend machine's current public IP to the project's Network Access / IP Access List. A changed public IP needs an updated entry; use a stable backend egress IP for deployment.
- Ensure the backend network permits outbound TCP port 27017 to the cluster hosts. A TCP timeout can mean network filtering or an Atlas access restriction; it does not establish that the password is wrong.
- For `querySrv` / DNS errors, check the machine's DNS configuration. The backend uses the configured system DNS instead of forcing public resolvers that may be blocked by the network.
- Run `npm run dev` and verify `/api/health` reports `OK` before trying login again. Never commit `server/.env`.

MongoDB troubleshooting: https://www.mongodb.com/docs/atlas/troubleshoot-connection/


## Sign-in / sign-up CAPTCHA and mobile OTP

Both doctor and patient forms require a server-checked, single-use CAPTCHA (5-minute expiry). The input is directly below the image. CAPTCHA is a basic visual challenge, not a substitute for deployment-level abuse protection.

OTP is implemented but disabled by default so unconfigured SMS does not lock out existing accounts. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` privately in `server/.env`, confirm SMS delivery with Twilio Verify, then set `AUTH_OTP_ENABLED=true` and restart the backend. Do not send these secrets in chat or commit them. When enabled, neither sign-in nor sign-up issues a token before a successful OTP check. Login sends to the stored account mobile; signup verifies the submitted number. Missing provider configuration fails closed once enabled.

OTP requests have a 60-second phone cooldown, 10-minute expiry, five attempts, and single-use completion. Challenges are bound to the action and submitted details, stored in MongoDB with TTL cleanup. Changing details requires restarting verification. The UI offers another request after the cooldown with a new CAPTCHA. Old accounts without a valid mobile need administrator-assisted recovery.

Doctor name, degree, hospital and optional specialty are saved on the account and displayed in the workspace. Existing doctors can use Edit profile to fill missing details. Qualifications are self-reported; the demo registration allowlist is not professional credential verification.

Patient account and profile creation use a MongoDB transaction; use Atlas or a local replica set. Standalone MongoDB does not support this transaction. This avoids a successful signup followed by a failed profile request.

Verify API reference: https://www.twilio.com/docs/verify/api/verification-check
