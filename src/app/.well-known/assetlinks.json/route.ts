import { NextResponse } from "next/server";

/**
 * Digital Asset Links — the file that makes an APK a *Trusted Web Activity*
 * rather than a browser window with a title bar.
 *
 * Android fetches https://<origin>/.well-known/assetlinks.json on first launch
 * and only hides the URL bar if the SHA-256 fingerprint below matches the
 * certificate the APK was signed with. A mismatch does not fail loudly — the
 * app simply opens showing Chrome's address bar, which is the usual reason a
 * TWA "looks wrong" after the first build.
 *
 * Served from a route handler so the fingerprint lives in an env var and can
 * differ per deployment (debug key locally, upload key on Play) without a
 * rebuild. Set TWA_SHA256_FINGERPRINT in the hosting environment to the
 * colon-separated fingerprint Bubblewrap prints, e.g.
 *   AA:BB:CC:…:FF
 */
/**
 * Must stay dynamic. Statically generating this route would bake whatever
 * TWA_SHA256_FINGERPRINT happened to be set at *build* time into the output,
 * so changing the signing key — or setting it for the first time — would
 * silently do nothing until the next rebuild. Reading it per request is what
 * makes the env var actually work as a deployment-time setting.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const fingerprint = process.env.TWA_SHA256_FINGERPRINT;
  const packageName =
    process.env.TWA_PACKAGE_NAME ?? "com.naghmatemuhaamid.twa";

  // Returning an empty array is the correct "no app is trusted yet" answer.
  // Emitting a placeholder fingerprint instead would silently claim a trust
  // relationship that does not exist.
  if (!fingerprint) {
    return NextResponse.json([], {
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: [fingerprint],
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } },
  );
}
