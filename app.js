const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'magic-of-arya-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory course storage
let courses = [
    {
        id: 1,
        title: 'Mind-Reading Course',
        description: 'Learn amazing and impressive mind-reading techniques. Perform professional-level mind-reading with confidence and style!',
        price: 899,
        originalPrice: null,
        category: 'mentalism',
        image: '/images/mind-reading.jpg',
        features: ['Practice Exercises', 'Step-by-Step Training', 'Mental Illusions', 'Performance Tips']
    },
    {
        id: 2,
        title: 'Professional Mind-Reading Course',
        description: 'Step into Arya\'s world of modern mentalism, where hidden thoughts are unveiled with absolute clarity.',
        price: 13999,
        originalPrice: null,
        category: 'mentalism',
        image: '/images/professional-mind-reading.jpg',
        features: ['Kit included For Free', 'Predict Impossible Outcomes', 'Mental Illusions', 'Performance tips']
    },
    {
        id: 3,
        title: 'Hypnosis Course',
        description: 'Welcome to the fascinating world of hypnosis! Create exceptional experiences through the power of words & Hypnosis.',
        price: 899,
        originalPrice: null,
        category: 'hypnosis',
        image: '/images/hypnosis.jpg',
        features: ['Step-by-Step Guide', 'Powerful Inductions', 'Creating a Sense of Trapped Feelings', 'Safety Protocols']
    },
    {
        id: 4,
        title: 'Professional Hypnosis Course',
        description: 'Perfect for stage, street, or personal growth, this course empowers you with the skills needed to hypnotize.',
        price: 4999,
        originalPrice: null,
        category: 'hypnosis',
        image: '/images/professional-hypnosis.jpg',
        features: ['Rapid & Instant Inductions', 'Advanced Deepening Methods', 'Hallucinations, Stuck states', 'Safety Protocols']
    },
    {
        id: 5,
        title: 'Magic Course',
        description: 'Unlock the secrets of MAGIC! Learn card and coin miracles and mind-blowing tricks with everyday objects.',
        price: 699,
        originalPrice: null,
        category: 'magic',
        image: '/images/magic.jpg',
        features: ['Step-by-Step Tutorials', 'Card Tricks', 'Amazing Effects', 'Anytime-Anywhere']
    },
    {
        id: 6,
        title: 'Professional Magic Course',
        description: 'Become a true master of magic, intended for those who aspire to go beyond tricks and enter the realm of real performance artistry.',
        price: 9999,
        originalPrice: null,
        category: 'magic',
        image: '/images/professional-magic.jpg',
        features: ['Advanced Tricks', 'Complete Guide', 'Step-by-Step training', 'Kit included For Free']
    },
    {
        id: 7,
        title: 'LIVE Online Classes',
        description: 'Become a Master Mentalist and Hypnotist in just 8 weeks! Learn powerful techniques in mind reading, influence, and stage hypnosis.',
        price: 19999,
        originalPrice: null,
        category: 'live',
        image: '/images/live-classes.jpg',
        features: ['Once a Week for 1 Hour', 'Recording Available After the Class', 'Practice Exercises', '36 Months Access']
    },
    {
        id: 8,
        title: 'Webinar Workshop',
        description: 'Unleash the power of your mind and explore the captivating art of illusion in our exclusive workshop.',
        price: 99,
        originalPrice: null,
        category: 'workshop',
        image: '/images/workshop.jpg',
        features: ['Feel The Hypnosis', '2-Day Workshop', '2-Hour Session', 'Learn To Hypnotize in 4 Hours']
    },
    {
        id: 9,
        title: 'Professional Bundle',
        description: 'A comprehensive certification program that provides everything you need to kickstart your career.',
        price: 44999,
        originalPrice: null,
        category: 'bundle',
        image: '/images/bundle.jpg',
        features: ['All 7 courses included', 'Professional certification', 'Live mentoring sessions', 'Performance guidance', 'Lifetime community access']
    }
];

let nextId = 10;

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        user: req.session.user,
        courses: courses
    });
});

app.get('/store', (req, res) => {
    res.render('store', {
        user: req.session.user,
        courses: courses
    });
});

app.get('/admin', (req, res) => {
    res.render('admin', {
        courses: courses
    });
});

// Login API
app.post('/api/login', (req, res) => {
    const { name, email, password } = req.body;

    // Hardcoded credentials
    if (name === 'omkar' && email === 'rohan@gmail.com' && password === 'Rohan@123') {
        req.session.user = { name, email };
        res.json({ success: true, message: 'Login successful! Welcome back.' });
    } else {
        res.json({ success: false, message: 'Invalid credentials. Please try again.' });
    }
});

// Logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Course CRUD APIs
app.get('/api/courses', (req, res) => {
    res.json(courses);
});

app.post('/api/courses', (req, res) => {
    const { title, description, price, originalPrice, category, image, features } = req.body;

    const newCourse = {
        id: nextId++,
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        image,
        features: features ? features.split(',').map(f => f.trim()) : []
    };

    courses.push(newCourse);
    res.json({ success: true, course: newCourse });
});

app.put('/api/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const { title, description, price, originalPrice, category, image, features } = req.body;

    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex !== -1) {
        courses[courseIndex] = {
            ...courses[courseIndex],
            title,
            description,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            category,
            image,
            features: features ? features.split(',').map(f => f.trim()) : courses[courseIndex].features
        };
        res.json({ success: true, course: courses[courseIndex] });
    } else {
        res.status(404).json({ success: false, message: 'Course not found' });
    }
});

app.delete('/api/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex !== -1) {
        courses.splice(courseIndex, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Course not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎩 Magic of Arya server running on http://localhost:${PORT}`);
});
