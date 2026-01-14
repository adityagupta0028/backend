const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
      case "string":
        return schema.replace(/\s+/, " ");
      default:
        return schema;
    }
  });
  
  Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");




module.exports.signup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(30).required(),
  role: Joi.string().valid('admin', 'super_admin').optional(),
  image: Joi.string().optional().allow(''),
});
module.exports.login = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().optional(),
  remember: Joi.boolean().optional(),
  })


  module.exports.cms = Joi.object({
    type: Joi.string().required(),
    title: Joi.string().required(),
    contents: Joi.string().required(),

})
module.exports.getCms = Joi.object({
    type: Joi.string().required(),
})
module.exports.createTeamMember = Joi.object({
  name: Joi.string().required(),
  post: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''),
});
 
module.exports.updateTeamMember = Joi.object({
  name: Joi.string().required(),
  post: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''),
});


//addUser
module.exports.addUser = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
  phone_number: Joi.string().optional().allow(''),
  password: Joi.string().min(8).optional(),
  isActive: Joi.boolean().optional(),
  image: Joi.string().optional().allow(''),
})

//updateUser
module.exports.updateUser = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email',
  }),
  phone_number: Joi.string().optional().allow(''),
  password: Joi.string().min(8).optional(),
  isActive: Joi.boolean().optional(),
  image: Joi.string().optional().allow(''),
})