// Admin Panel Functions
let editingCourseId = null;

// Handle Course Form Submit
async function handleCourseSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const courseId = formData.get('courseId');

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        originalPrice: formData.get('originalPrice'),
        category: formData.get('category'),
        image: formData.get('image'),
        features: formData.get('features')
    };

    try {
        let response;
        if (courseId) {
            // Update existing course
            response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            // Create new course
            response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();

        if (result.success) {
            alert(courseId ? 'Course updated successfully!' : 'Course added successfully!');
            window.location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Edit Course
function editCourse(course) {
    editingCourseId = course.id;

    // Populate form
    document.getElementById('courseId').value = course.id;
    document.getElementById('title').value = course.title;
    document.getElementById('description').value = course.description;
    document.getElementById('price').value = course.price;
    document.getElementById('originalPrice').value = course.originalPrice || '';
    document.getElementById('category').value = course.category;
    document.getElementById('image').value = course.image;
    document.getElementById('features').value = course.features ? course.features.join(', ') : '';

    // Update form title and button
    document.getElementById('formTitle').textContent = 'Edit Course';
    document.getElementById('submitBtn').textContent = 'Update Course';

    // Scroll to form
    document.getElementById('courseForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete Course
async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('Course deleted successfully!');
            window.location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Reset Form
function resetForm() {
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Course';
    document.getElementById('submitBtn').textContent = 'Add Course';
    editingCourseId = null;
}
