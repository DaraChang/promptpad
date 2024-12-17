const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const filePath = './userData.json';
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to save user data
app.post('/save-data', (req, res) => {
	const { time_stamp, user_name, email, task, attempt, notes} = req.body;

	// Validate required fields
	if (!time_stamp || !user_name || !email || !task || !attempt || !notes) {
		return res.status(400).send("Missing required fields");
	}

	// Define the directory and file paths for saving user data
	const userDir = path.join(__dirname, 'metacognitive_prompts_study_data', `${user_name}`);
	const filePath = path.join(userDir, `${task}_${attempt}.json`);

	try {
		if (!fs.existsSync(userDir)) {
			// Create the directory if it doesn't exist
			try {
				fs.mkdirSync(userDir, { recursive: true }); // Create the directory (including any necessary parent directories)
				console.log("Directory created:", userDir);
			} catch (error) {
				console.error("Error creating directory:", error);
				return res.status(500).json({ message: 'Failed to create directory' });
			}
		} else {
			console.log("Directory already exists:", userDir);
		}
		
		// Prepare the data object to save
		const data = {
			user_name: user_name,
			email: email,
			time_stamp: time_stamp,
			task: task,
			notes: notes
		};
		
		// Write the data to the specified file
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
		console.log("Data written to file:", filePath);
		res.status(200).json({ message: 'Data saved successfully' });

	} catch (error) {
		console.error("Error saving data:", error);
		res.status(500).json({ message: 'Failed to save data' });
	}
	res.status(200).send("Data saved successfully");
});

// Serve HTML files based on mode query parameter
app.get('/', (req, res) => {
	const mode = req.query.mode;

	// Dynamically serve different HTML files based on the mode
	if (mode === 'task1_pretask') {
		res.sendFile(join(__dirname, 'index_task1_pretask.html'));
	} else if (mode === 'task1_prompt_pretask') {
		res.sendFile(join(__dirname, 'index_task1_prompt_pretask.html'));
	} else if (mode === 'task1') {
		res.sendFile(join(__dirname, 'index_task1.html'));
	} else if (mode === 'task1_prompt') {
		res.sendFile(join(__dirname, 'index_task1_prompt.html'));
	} else if (mode === 'task2_pretask') {
		res.sendFile(join(__dirname, 'index_task2_pretask.html'));
	} else if (mode === 'task2_prompt_pretask') {
		res.sendFile(join(__dirname, 'index_task2_prompt_pretask.html'));
	} else if (mode === 'task2') {
		res.sendFile(join(__dirname, 'index_task2.html'));
	} else if (mode === 'task2_prompt') {
		res.sendFile(join(__dirname, 'index_task2_prompt.html'));
	} else if (mode === 'test') {
		res.sendFile(join(__dirname, 'index.html'));
	} else {
		res.sendFile(join(__dirname, 'index_send.html'));
	}
});

// Socket.IO connection event for real-time communication
io.on('connection', (socket) => {
	// Listen for 'chat message' event from clients
	socket.on('chat message', (msg, num) => {
		// Broadcast the message and sender ID to all connected clients
		io.emit('chat message', { text: msg, senderId: socket.id }, num);
	});
});

// Start the server on port 3000
server.listen(3000, '0.0.0.0', () => {
	console.log('server running at http://localhost:3000');
});
