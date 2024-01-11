import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {

  const token = req.headers.token;

  if (!token) {
    res.status(400).send({ message: "Token is missing." });
    return
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) { 
      res.status(403).send({ message: "Invalid token provided."});
      return
    } 
    req.user = user;
    next();
  });
}

export { validateToken }