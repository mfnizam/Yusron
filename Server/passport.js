const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const Module = require('./module');

module.exports = function(passport){
	let opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
	opts.secretOrKey = '21061996';
	passport.use(new JwtStrategy(opts, (jwt_payload, done) =>{
		Module.cariPenggunaId(jwt_payload._id, (err, user) => {
			if(err){
				return done(err, false);
			}

			if(user){
				return done(null , user);
			}else{
				return done(null, false);
			}
		});
	}));
};
