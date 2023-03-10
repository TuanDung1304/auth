import Joi from 'joi';

const registerValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const changePassValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    // confirmPassword: Joi.ref('password'),
  });
  return schema.validate(data);
};

export { changePassValidation, loginValidation, registerValidation };
