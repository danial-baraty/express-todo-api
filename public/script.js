const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

// Fetch and display tasks
async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `${task.title} - ${task.description || ''} (${task.status}) 
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>`;
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

// Add a task
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    taskForm.reset();
    loadTasks();
  } catch (error) {
    console.error('Failed to add task:', error);
  }
});

// Delete a task
async function deleteTask(id) {
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
}

// Load tasks on page load
loadTasks();