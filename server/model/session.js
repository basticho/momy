var mongoose = require("mongoose");
var SessionSchema = new mongoose.Schema({
                                            user: String,
                                            device: String,
                                            up: String,
                                            down: String,
                                            ip: String
                                        });

var Session = mongoose.model('Session', SessionSchema);

exports.model = mongoose.model('Session');


exports.getAll = function(user, callback) {
    Session.find({user: user})
            .sort('-up')
            .select('ip device up down')
            .exec(function(err, data){
                if(err) console.log(err);
                callback(err, data);
            });
};
