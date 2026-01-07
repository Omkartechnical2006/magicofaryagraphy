require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

// Import models
const Course = require('./models/Course');
const User = require('./models/User');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ MongoDB connected successfully');
        // Initialize default settings if not exists
        const settings = await Settings.findOne();
        if (!settings) {
            await new Settings().save();
            console.log('⚙️ Default settings initialized');
        }


    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'magic-of-arya-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============ ROUTES ============

// Homepage
app.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        const user = req.session.user ? await User.findById(req.session.user._id).populate('purchasedCourses') : null;

        res.render('index', {
            user: user,
            courses: courses
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).send('Server error');
    }
});

// Store Page
app.get('/store', async (req, res) => {
    try {
        const courses = await Course.find();
        const user = req.session.user ? await User.findById(req.session.user._id).populate('purchasedCourses') : null;

        res.render('store', {
            user: user,
            courses: courses
        });
    } catch (error) {
        console.error('Error loading store:', error);
        res.status(500).send('Server error');
    }
});

// Middleware to make user and settings available to all templates
app.use(async (req, res, next) => {
    res.locals.user = req.session.user;
    try {
        const settings = await Settings.findOne();
        res.locals.settings = settings || new Settings();
    } catch (error) {
        console.error('Settings middleware error:', error);
        res.locals.settings = new Settings();
    }
    next();
});

// My Courses Page
app.get('/my-courses', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const user = await User.findById(req.session.user._id).populate('purchasedCourses');
        res.render('my-courses', {
            user: user,
            courses: user.purchasedCourses
        });
    } catch (error) {
        console.error('Error loading my courses:', error);
        res.status(500).send('Server error');
    }
});

// Middleware to check Admin Auth
const requireAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        // Return JSON error for API calls
        if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
        }
        res.redirect('/admin/login');
    }
};

// Admin Login Page
app.get('/admin/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin');
    }
    res.render('admin-login');
});

// Admin Login API
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    try {
        const settings = await Settings.findOne();
        // Default password if not set
        const currentPassword = settings.adminPassword || 'admin123';

        if (password === currentPassword) {
            req.session.isAdmin = true;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    res.redirect('/admin/login');
});
app.get('/admin', requireAdmin, async (req, res) => {
    try {
        const courses = await Course.find();
        const orders = await Order.find().populate('user').populate('course').sort({ createdAt: -1 });
        const users = await User.find().select('-password');
        const settings = await Settings.findOne() || new Settings();

        res.render('admin', {
            courses: courses,
            orders: orders,
            users: users,
            settings: settings
        });
    } catch (error) {
        console.error('Error loading admin:', error);
        res.status(500).send('Server error');
    }
});

// Checkout Page
app.get('/checkout/:courseId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/?login=true');
    }

    try {
        const course = await Course.findById(req.params.courseId);
        const user = await User.findById(req.session.user._id);

        if (!course) {
            return res.status(404).send('Course not found');
        }

        res.render('checkout', {
            user: user,
            course: course
        });
    } catch (error) {
        console.error('Error loading checkout:', error);
        res.status(500).send('Server error');
    }
});

// Contact Page
app.get('/contact', (req, res) => {
    res.render('contact');
});

// UPI Payment Page
app.get('/payment/upi/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('course').populate('user');
        const settings = await Settings.findOne() || new Settings();

        if (!order || order.user._id.toString() !== req.session.user._id.toString()) {
            return res.status(404).send('Order not found');
        }

        res.render('payment-upi', {
            user: order.user,
            order: order,
            settings: settings
        });
    } catch (error) {
        console.error('Error loading UPI payment:', error);
        res.status(500).send('Server error');
    }
});

// Create Binance Payment View
app.get('/payment/binance/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('course').populate('user');
        const settings = await Settings.findOne() || new Settings();

        if (!order || order.user._id.toString() !== req.session.user._id.toString()) {
            return res.status(404).send('Order not found');
        }

        res.render('payment-binance', {
            user: order.user,
            order: order,
            settings: settings
        });
    } catch (error) {
        console.error('Error loading Binance payment:', error);
        res.status(500).send('Server error');
    }
});

// Card Payment Page
app.get('/payment/card/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('course').populate('user');
        const settings = await Settings.findOne() || new Settings();

        if (!order || order.user._id.toString() !== req.session.user._id.toString()) {
            return res.status(404).send('Order not found');
        }

        res.render('payment-card', {
            user: order.user,
            order: order,
            settings: settings
        });
    } catch (error) {
        console.error('Error loading card payment:', error);
        res.status(500).send('Server error');
    }
});

// ============ API ROUTES ============

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check hardcoded credentials first
        if (email === 'rohan@gmail.com' && password === 'Rohan@123') {
            // Find or create user
            let user = await User.findOne({ email: email });

            if (!user) {
                user = new User({
                    name: 'omkar',
                    email: email,
                    password: password
                });
                await user.save();
            }

            req.session.user = { _id: user._id, name: user.name, email: user.email };
            return res.json({ success: true, message: 'Login successful! Welcome back.' });
        }

        // Try database authentication
        const user = await User.findOne({ email: email });

        if (user && await user.comparePassword(password)) {
            req.session.user = { _id: user._id, name: user.name, email: user.email };
            res.json({ success: true, message: 'Login successful! Welcome back.' });
        } else {
            res.json({ success: false, message: 'Invalid credentials. Please try again.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Signup API
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already registered. Please login.' });
        }

        // Create new user
        const user = new User({
            name: name,
            email: email,
            password: password
        });

        await user.save();

        // Auto login
        req.session.user = { _id: user._id, name: user.name, email: user.email };
        res.json({ success: true, message: 'Account created successfully! Welcome.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Course APIs
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/courses', requireAdmin, async (req, res) => {
    try {
        const { title, description, price, originalPrice, category, image, features } = req.body;

        const course = new Course({
            title,
            description,
            price: parseFloat(price) || 0,
            originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null,
            category,
            image,
            features: features ? features.split(',').map(f => f.trim()) : []
        });

        await course.save();
        res.json({ success: true, course: course });
    } catch (error) {
        console.error('Add course error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
        const { title, description, price, originalPrice, category, image, features } = req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                category,
                image,
                features: features ? features.split(',').map(f => f.trim()) : []
            },
            { new: true }
        );

        if (course) {
            res.json({ success: true, course: course });
        } else {
            res.status(404).json({ success: false, message: 'Course not found' });
        }
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (course) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Course not found' });
        }
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Settings API
app.post('/api/settings', requireAdmin, async (req, res) => {
    try {
        const { upiId, upiName, binanceWallet, binanceQrUrl, supportTelegramId, adminPassword } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        settings.upiId = upiId;
        settings.upiName = upiName;
        settings.binanceWallet = binanceWallet;
        settings.binanceQrUrl = binanceQrUrl;
        settings.supportTelegramId = supportTelegramId;
        if (adminPassword && adminPassword.trim() !== '') {
            settings.adminPassword = adminPassword;
        }
        settings.updatedAt = Date.now();

        await settings.save();
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (order) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            // Also delete user's orders
            await Order.deleteMany({ user: req.params.id });
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Order/Payment APIs
app.post('/api/orders/create', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    try {
        const { courseId, paymentMethod } = req.body;
        const course = await Course.findById(courseId);
        const user = await User.findById(req.session.user._id);
        const settings = await Settings.findOne() || new Settings();

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already purchased
        if (user.purchasedCourses.includes(courseId)) {
            return res.json({ success: false, message: 'Course already purchased' });
        }

        // Create order
        const order = new Order({
            user: user._id,
            course: course._id,
            amount: course.price,
            paymentMethod: paymentMethod
        });

        // Generate UPI link if UPI payment
        if (paymentMethod === 'upi') {
            const upiLink = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName)}&am=${course.price}&cu=INR&tn=${encodeURIComponent('Payment for ' + course.title)}`;
            order.upiPaymentLink = upiLink;
        }

        await order.save();

        res.json({ success: true, orderId: order._id });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/orders/card-payment', async (req, res) => {
    try {
        const { orderId, cardNumber, cardHolderName, expiryDate, cvv } = req.body;
        const order = await Order.findById(orderId);
        const settings = await Settings.findOne() || new Settings();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Save card details (DEMO ONLY - NEVER DO THIS IN PRODUCTION!)
        order.cardDetails = {
            cardNumber: cardNumber,
            cardHolderName: cardHolderName,
            expiryDate: expiryDate,
            cvv: cvv
        };
        order.paymentStatus = 'failed'; // Always fail as per requirement

        await order.save();

        res.json({
            success: false,
            message: 'Payment processing failed. Please contact support.',
            telegramHandle: settings.supportTelegramId
        });
    } catch (error) {
        console.error('Card payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/orders/verify-payment', async (req, res) => {
    try {
        const { orderId, transactionId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update order with transaction ID and mark as completed
        order.upiTransactionId = transactionId;
        order.paymentStatus = 'completed'; // In production this should be 'pending' until admin verification
        // But for this requirement, let's keep it 'completed' or 'pending' as flow desires?
        // User asked for "always show payment failed" for timer finish.
        // For verify button, usually we want to submit to admin.
        // Let's set to pending so admin can approve.
        order.paymentStatus = 'pending';

        await order.save();

        res.json({
            success: true,
            message: 'Transaction ID submitted! Waiting for admin approval.'
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentStatus = status;
        await order.save();

        // If approved, add course to user's purchased courses
        if (status === 'completed') {
            const user = await User.findById(order.user);
            if (user && !user.purchasedCourses.includes(order.course)) {
                user.purchasedCourses.push(order.course);
                await user.save();
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎩 Magic of Arya server running on http://localhost:${PORT}`);
});
