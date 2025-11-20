// middlewares/validate.js
import { validationResult } from 'express-validator';

export default function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ ok:false, errors: errors.array() });
  }
  next();
}
