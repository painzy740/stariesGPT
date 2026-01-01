import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>GitHub Login</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'github-oauth-error', error: 'No code received' }, '*');
            window.close();
          </script>
          <p>Login gagal. Menutup window...</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>GitHub Login</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            border: 4px solid black;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid black;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          h2 { font-weight: 900; margin-bottom: 10px; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Login Berhasil!</h2>
          <p>Mengalihkan ke stariesGPT...</p>
        </div>
        <script>
          const mockUser = {
            email: 'github_user_${Date.now()}@github.com',
            name: 'GitHub User'
          };
          
          window.opener?.postMessage({ 
            type: 'github-oauth-success', 
            user: mockUser 
          }, '*');
          
          setTimeout(() => window.close(), 1500);
        </script>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } },
  )
}
