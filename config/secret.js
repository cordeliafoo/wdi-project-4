module.exports = {
  database: 'mongodb://shirongfoo:password@ds149511.mlab.com:49511/wdi-project-4-shopping-cart',
  port: process.env.PORT || 4000,
  secretKey: 'secret',
  facebook: {
    // process.ENV is a global object
    clientID: process.env.FACEBOOK_ID || '1882254075429114',
    clientSecret: process.env.FACEBOOK_SECRET || '8304a1718dfc43e097aa7e0d40beab33',
    profileFields: ['email', 'displayName'],
    callbackURL: 'http://localhost:4000/auth/facebook/callback'
  }
}
