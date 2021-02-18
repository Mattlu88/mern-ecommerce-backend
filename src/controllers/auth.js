const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const validateSignUp = async (data, next) => {
  const { email, password } = data;

  if (email.length === 0) {
    throw new Error("Email is required.");
  }

  if (password.length === 0) {
    throw new Error("Password is required.");
  }

  try {
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      throw new Error("Email already exists.");
    }
  } catch (error) {
    next(error);
  }
};

const generateHashPassword = async (password, next) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    next(error);
  }
};

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await validateSignUp({ email, password }, next);
    const hashPassword = await generateHashPassword(password, next);
    const newUser = new User({
      ...req.body,
      hashPassword,
    });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    next(error);
  }
};

const authenticate = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};

const signIn = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist." });
    }

    const correctPassword = await authenticate(
      req.body.password,
      user.hashPassword
    );
    if (!correctPassword) {
      return res.status(401).json({ message: "Password is not correct." });
    }

    const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
      expiresIn: "2h",
    });
    const { firstName, lastName, username, email, role } = user;
    res.status(200).json({
      token,
      user: {
        firstName,
        lastName,
        username,
        email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminSignUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await validateSignUp({ email, password }, next);
    const hashPassword = await generateHashPassword(password, next);
    const newUser = new User({
      ...req.body,
      hashPassword,
      role: "admin",
    });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = await jwt.verify(token, config.JWT_SECRET);
    req.userToken = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
  adminSignUp,
  verifyToken,
};
