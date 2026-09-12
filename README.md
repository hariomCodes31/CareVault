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
