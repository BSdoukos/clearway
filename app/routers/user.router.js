const express = require('express');
const multer = require('multer');
const UserController = require('../controllers/user.controller.js');

const router = express.Router();
const userController = new UserController();
const auth = userController.auth;

const profilePhotoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-photos')
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-unresized.jpg')
    },
});
const upload = multer({
    storage: profilePhotoStorage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('The profile photo file must be an image.'))
        }
        cb(null, true)
    }
});

router.post('/signup', (req, res) => {
    userController.signUpUser(req, res);
});

router.get('/logout', auth, (req, res) => {
    userController.logUserOut(req, res);
});

router.post('/login', (req, res) => {
    userController.logUserIn(req, res);
});

router.get('/profile/photo', auth, function (req, res) {
    res.sendFile(process.cwd() + '/uploads/profile-photos/' + req.user._id + '.jpg', (err) => {
        if (!err) return;
        if (err.message.includes('no such file or directory')) {
            res.statusMessage = 'The user doesn\'t have a profile photo. A default profile photo fallback was sent.'
            res.status(404).sendFile(process.cwd() + '/public/images/default-profile-photo.jpg');
        } else {
            res.status(500).send({ error: err.message })
        }
    });
});

router.post('/profile/photo', auth, upload.single('profile-photo'), async (req, res) => {
    userController.updateUserProfilePhoto(req, res);
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.patch('/profile', auth, async (req, res) => {
    userController.updateUserProfileData(req, res);
});

router.post('/passwordrecovery', async (req, res) => {
    userController.sendPasswordRecoveryEmail(req, res);
})

router.get('/passwordreset', (req, res) => {
    userController.authPasswordReset(req, res);
});

router.post('/passwordreset', (req, res) => {
    userController.resetUserPassword(req, res);
});

module.exports = router;