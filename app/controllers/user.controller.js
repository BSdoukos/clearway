const path = require('path')
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const User = require('../models/User.js');
const Email = require('../helpers/Email.js')

class UserController {
    constructor() { }

    async signUpUser(req, res) {
        try {
            const { name, email, password } = req.body;
            const emailIsRegistered = !!(await User.findOne({ email }));

            if (emailIsRegistered) {
                throw new Error('This e-mail is already registered.')
            }

            const user = new User({ name, email, password });
            await user.save();
            
            const token = await user.generateAuthToken();

            res.cookie('clearway_accesstoken', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 15 });
            res.sendStatus(200);

        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }

    async auth(req, res, next) {
        res.header('Cache-Control', 'no-store, must-revalidate');

        try {
            const token = req.cookies['clearway_accesstoken'];
            const decoded = jwt.verify(token, '@S^rz4ttaXC4');
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

            if (!user) {
                throw new Error();
            }
            
            if (user && req.originalUrl === '/login') {
                res.redirect('dashboard');
            } else {
                req.user = user;
                next();
            }

        } catch (e) {
            if (req.originalUrl === '/login') {
                next();
            } else {
                res.redirect('login');
            }
        }
    }

    async logUserOut(req, res) {
        try {
            req.user.tokens = req.user.tokens.filter(token => token.token !== req.cookies['clearway_accesstoken']);
            await req.user.save();
            res.clearCookie('clearway_accesstoken');
            res.redirect('login');

        } catch {
            res.status(500).send({ error: e.message });
        }
    }

    async logUserIn(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
    
            if (!user) {
                throw new Error('This e-mail is not registered.')
            }

            const passwordIsCorrect = await user.checkPassword(password);
    
            if (!passwordIsCorrect) {
                throw new Error('The password is not correct.')
            }
    
            const token = await user.generateAuthToken();

            req.user = user;
            res.cookie('clearway_accesstoken', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 15 });
            res.sendStatus(200);

        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }

    async updateUserProfilePhoto(req, res) {
        try {
            await sharp(req.file.path)
            .resize(200, 200)
            .toFile(path.resolve(req.file.path.replace('-unresized', '')));

            fs.unlink(req.file.path, (error) => {
                if (error) throw error;
            });
        
            res.sendStatus(200);
        
        } catch (e) {
            res.status(500).send({error: e.message});
        }
    }

    async updateUserProfileData(req, res) {
        try {
            if (req.body.password) {
                const isPasswordCorrect = await req.user.checkPassword(req.body.currentpassword);
                if (!isPasswordCorrect) {
                    res.status(401).send({error: 'The current password you typed is not correct.'});
                    return;
                }
            }

            delete req.body.currentpassword;
            
            Object.entries(req.body).forEach((entry) => req.user[entry[0]] = entry[1]);
            await req.user.save();

            res.sendStatus(200);

        } catch (e) {
            res.status(500).send({error: e.message});
        }
    }

    async sendPasswordRecoveryEmail(req, res) {
        try {
            const user = await User.findOne({ email: req.body.email });

            if (user) {
                user.recoveryToken = crypto.randomBytes(48).toString('hex');
                const email = new Email(
                    {
                        email: req.body.email,
                        name: user.name.split(' ')[0]
                    },
                    'Password recovery',
                    'Click on the link below to reset your password. If you\'ve not requested that link, please ignore this e-mail.\n\nhttp://localhost:3000/passwordreset?token=' + user.recoveryToken,
                );
                
                email.send();
                
                await user.save();

                res.sendStatus(200);
            }  else {
                throw new Error('The provided e-mail is not registered in our database.')
            }

        } catch (e) {
            res.status(400).send({error: e.message});
        }
    }

    async authPasswordReset(req, res) {
        try {
            const user = await User.findOne({ recoveryToken: req.query.token });
            if (user) {
                res.render('passwordreset', { user });
            } else {
                res.render('login');
            }

        } catch (e) {
            res.status(500).send({error: e.message});
        }
    }

    async resetUserPassword(req, res) {
        try {
            const user = await User.findOne({ recoveryToken: req.body.token });

            user.password = req.body.password
            user.recoveryToken = '';
            await user.save();

            res.sendStatus(200);

        } catch (e) {
            res.status(500).send({error: e.message});
        }
    }
}

module.exports = UserController;