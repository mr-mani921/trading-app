export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJWTToken();

  let cookieName = user.role === "admin" ? "adminToken" : "userToken";

  // Get the domain from environment variable or default to localhost
  const domain =
    process.env.NODE_ENV === "production"
      ? ".cryptonexus.live" // Include subdomain support with leading dot
      : "localhost";

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // Required for cross-origin cookies
    domain: domain,
    path: "/",
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
  });

  res.status(statusCode).json({
    success: true,
    message,
    user,
    token,
  });
};
