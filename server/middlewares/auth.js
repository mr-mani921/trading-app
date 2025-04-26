import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

const getTokenFromRequest = (req) => {
  // Check cookies first
  const cookieToken = req.cookies.userToken || req.cookies.adminToken;
  if (cookieToken) return cookieToken;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new ErrorHandler("You need to Sign In First", 503));
  }

  try {
    const decodedTokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedTokenData.id);

    if (!user) {
      return next(new ErrorHandler("You Need To Register As Admin First", 403));
    }

    req.user = user;
    if (!user.role === "Admin") {
      return next(new ErrorHandler(`${req.user.role} Is Not Authorized`, 403));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

export const isUserAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new ErrorHandler("You need to Sign In First", 503));
  }

  try {
    const decodedTokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedTokenData.id);

    if (!user) {
      return next(new ErrorHandler("You Need To Register As User First", 403));
    }

    req.user = user;
    if (!user.role === "user") {
      return next(new ErrorHandler(`${req.user.role} Is Not Authorized`, 403));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});
