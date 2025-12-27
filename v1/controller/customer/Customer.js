const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const Auth = require("../../../common/authenticate");

module.exports.signup = async (req, res, next) => {
  try {
    await Validation.Customer.signup.validateAsync(req.body);
    let existingCustomer = await Model.Customer.findOne({
      email: req.body.email,
      isDeleted: false
    });
    if (existingCustomer) {
      throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
    }
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    
    // Handle firstName/lastName
    if (req.body.firstName && req.body.lastName) {
      req.body.name = `${req.body.firstName} ${req.body.lastName}`;
    }
    
    let customer = await Model.Customer.create(req.body);
    
    // Only set password if provided (not OAuth signup)
    if (req.body.password) {
      await customer.setPassword(req.body.password);
      await customer.save();
    }

    // Generate access token for auto-login
    customer.lastLogin = new Date();
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    await customer.save();

    customer = JSON.parse(JSON.stringify(customer));
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    delete customer.password;

    return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    await Validation.Customer.login.validateAsync(req.body);
    let customer = await Model.Customer.findOne({
      email: req.body.email,
      isDeleted: false
    });
    if (!customer) throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
    if (!customer.isActive) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
    
    await customer.authenticate(req.body.password);
    
    customer.lastLogin = new Date();
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    await customer.save();
    
    customer = JSON.parse(JSON.stringify(customer));
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    delete customer.password;
    
    return res.success(constants.MESSAGES.LOGIN_SUCCESS, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    if (req.customer) {
      await Model.Customer.findByIdAndUpdate(req.customer._id, {
        $unset: { accessToken: 1 }
      });
    }
    return res.success(constants.MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    let customer = await Model.Customer.findById(req.customer._id).select('-password');
    if (!customer) {
      throw new Error(constants.MESSAGES.USER_NOT_FOUND);
    }
    return res.success(constants.MESSAGES.DATA_FETCHED, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    let customer = await Model.Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!customer) {
      throw new Error(constants.MESSAGES.USER_NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, customer);
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login
module.exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error("Google token is required");
    }

    const axios = require('axios');
    let googleUser;

    // Check if token is a JWT (Google Identity Services credential) or access token
    if (token.includes('.')) {
      // It's a JWT credential from Google Identity Services
      // Decode the JWT (first part is header, second is payload)
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        googleUser = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          given_name: payload.given_name,
          family_name: payload.family_name,
          picture: payload.picture
        };
      } catch (err) {
        // If JWT decode fails, try to verify with Google
        try {
          const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
          googleUser = googleResponse.data;
        } catch (verifyErr) {
          throw new Error("Invalid Google token");
        }
      }
    } else {
      // It's an access token, get user info
      try {
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        googleUser = googleResponse.data;
      } catch (err) {
        throw new Error("Invalid Google access token");
      }
    }

    if (!googleUser.email) {
      throw new Error("Unable to get email from Google");
    }

    // Check if user exists
    let customer = await Model.Customer.findOne({
      $or: [
        { email: googleUser.email, isDeleted: false },
        { googleId: googleUser.sub }
      ]
    });

    if (customer) {
      // Update Google ID if not set
      if (!customer.googleId) {
        customer.googleId = googleUser.sub;
        if (googleUser.picture) {
          customer.image = googleUser.picture;
        }
      }
    } else {
      // Create new customer
      customer = await Model.Customer.create({
        name: googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim(),
        email: googleUser.email,
        googleId: googleUser.sub,
        image: googleUser.picture || '',
        password: 'oauth_user_' + Date.now() // Dummy password for OAuth users
      });
    }

    if (!customer.isActive) {
      throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
    }

    customer.lastLogin = new Date();
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    await customer.save();

    customer = JSON.parse(JSON.stringify(customer));
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    delete customer.password;

    return res.success(constants.MESSAGES.LOGIN_SUCCESS, customer);
  } catch (error) {
    next(error);
  }
};

// Facebook OAuth Login
module.exports.facebookLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error("Facebook token is required");
    }

    // Verify Facebook token
    const axios = require('axios');
    const facebookResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
    const facebookUser = facebookResponse.data;

    if (!facebookUser.email) {
      throw new Error("Unable to get email from Facebook");
    }

    // Check if user exists
    let customer = await Model.Customer.findOne({
      $or: [
        { email: facebookUser.email, isDeleted: false },
        { facebookId: facebookUser.id }
      ]
    });

    if (customer) {
      // Update Facebook ID if not set
      if (!customer.facebookId) {
        customer.facebookId = facebookUser.id;
        if (facebookUser.picture && facebookUser.picture.data && facebookUser.picture.data.url) {
          customer.image = facebookUser.picture.data.url;
        }
      }
    } else {
      // Create new customer
      customer = await Model.Customer.create({
        name: facebookUser.name || '',
        email: facebookUser.email,
        facebookId: facebookUser.id,
        image: (facebookUser.picture && facebookUser.picture.data && facebookUser.picture.data.url) || '',
        password: 'oauth_user_' + Date.now() // Dummy password for OAuth users
      });
    }

    if (!customer.isActive) {
      throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
    }

    customer.lastLogin = new Date();
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    await customer.save();

    customer = JSON.parse(JSON.stringify(customer));
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    delete customer.password;

    return res.success(constants.MESSAGES.LOGIN_SUCCESS, customer);
  } catch (error) {
    next(error);
  }
};

